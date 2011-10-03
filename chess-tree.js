

var ChessTree = function(pgn_string) {

  var NEW_NODE_SCORE     = 0.75;   // the higher this is, the less new nodes will be introduced
  

  // the first node has a parentNode = 'undefined'
  var ChessNode = function (parentNode, move) {
    this.move = move;     // this is the chess.js definition of a move. It has lots of good stuff
    this.parentNode = parentNode;
    this.childNodes = [];
    this.comments = "";
    this.score    = 0;      // score will be between 0 and 1
  }

  var engine;
  var currentNode;
  var headNode;
  var trainingNode;
  var failedNode = undefined;
  var trainingColor;
	importRepertoire(pgn_string);

  // sets the currentNode, headNode, and engine
  // status_function should have one parameter, a text input
  // we use this to tell the chess-trainer how far the import has come.
  function importRepertoire ( pgn_string ) {
  
    engine = new Chess();
    headNode = new ChessNode(undefined, {color:"b"}); // since this is the first move, it's like
                                                      // black just moved
		currentNode = headNode;		// need to use currentNode because moveTo
															// uses it.
    
    if (pgn_string === undefined || pgn_string === "") {
      return;
    }
    
    var position = 0;    // position in string
		var next_space;
    
    // this gets called for every new [
		// everything gets added onto the node
		function pgn_string_to_node (node) {
			while ( 1 ) {
        // look for the next space
				next_space = pgn_string.indexOf(" ", position);
				if (next_space === -1) {
					next_space = pgn_string.length;
				}
				var token = pgn_string.substring(position, next_space);
				// check to see if potential_move looks like 3. or 3... or is nothing
				if (token === "" || token.charAt(0).search(/[1-9]/) !== -1) {
					// move on to the next token
				} else if (token === '(') {
					if (moveBack() === false) {
						throw "couldn't move back!";
					}
					position = next_space + 1;
					pgn_string_to_node (currentNode);
				} else if (token === ";") {
					// keep undoing until node === currentNode
					while (node !== currentNode) {
						if (moveBack() === false) {
							throw "trying to get back but we can't";
						}
					}
				} else if (token === ")") {
					while (node !== currentNode) {
						if (moveBack() === false) {
							throw "trying to get back but we can't (2)";
						}
          }
					moveTo (currentNode.childNodes[0].move);
					return;
				} else if (token === "{") {
          // look for " }"
          var start_of_meta_data = next_space + 1;
          var end_of_meta_data = pgn_string.indexOf(" }", next_space);
          if (end_of_meta_data === -1) {
            throw "can't find the end of the meta data";
          }
          var meta_data = pgn_string.slice(start_of_meta_data, end_of_meta_data).split("%");
          currentNode.comments = meta_data[0] || "";
          currentNode.score = Number(meta_data[1]) || 0;
          next_space = end_of_meta_data + 2;
        } else {
					// okay, now we see if it's a real move
					var the_move = moveTo(token);
					if (the_move === null) {
						throw token + " is not a move we can import!";
					}
				}
				position = next_space + 1;
				if (position >= pgn_string.length) {
					break;
				}
			}
		}
		
		pgn_string_to_node (headNode);
		
		currentNode = headNode;
    engine = new Chess();   // reset the chess engine
		
	}
	
	function exportRepertoire() {
	
		var result = [];
    
    function push_node (node) {
      if (node.move !== undefined) {
        result.push(node.move.san);
      }
      result.push("{");
      // get rid of }
      var comments = node.comments.replace(/}/g, '');
      // get rid of %
      comments = comments.replace(/%/g, '');
      result.push(comments + "%" + node.score);
      result.push("}");
    }
		
		function node_to_pgn_array (node) {
      push_node (node);
			while (1) {
				if (node.childNodes.length === 0) {
					return;
				} else if (node.childNodes.length === 1) {
					push_node (node.childNodes[0]);
				} else {	//there are multiple childNodes, so we need variations
					push_node (node.childNodes[0]);
					result.push("(");
					for (var i = 1; i < node.childNodes.length; i++) {
						node_to_pgn_array (node.childNodes[i]);
						if (i < node.childNodes.length - 1) {
							result.push(";");
						}
					}
					result.push(")");
				}
				node = node.childNodes[0];
			}
		}
		node_to_pgn_array(headNode);
		
		return result.join(" ");
			
	}
  
  function exportPGN () {
    return engine.pgn();
  }
			
		
 
  // move to a descendant node
  // if that node does not exist, create it
  // move just has a 'from' and 'to'
  // returns a full move object if move happened, returns null if it didn't.
  function moveTo (move) {
    // now move will be a full move object
    var move = engine.move(move);
    if (move === null) {
      return null;  // move didn't work
    }
    // look for move in the childNodes
    for (var i in currentNode.childNodes) {
      if (currentNode.childNodes[i].move.san === move.san) {
        currentNode = currentNode.childNodes[i];
        return move;
      }
    }
    // move doesn't exist in tree, so we must create it
    var newChildNode = new ChessNode(currentNode, move);
    currentNode.childNodes.push(newChildNode);
    currentNode = newChildNode;
    return move;
  }
  
  // return true if possible, return false if unsuccessful
  function moveBack () {
    if (currentNode.parentNode === undefined) {
      return null;
    }
    currentNode = currentNode.parentNode;
    engine.undo();
    return currentNode.move;
  }
  
  // recursive function that allows you to perform a function on the elements of 
  // every node in a branch
  function searchBranch (node, func) {
    for (var i in node.childNodes) {
      var child = node.childNodes[i];
      searchBranch (child, func);
    }
    func (node);
  }
  
  function numberOfNodes (headNode) {
    var number_of_nodes = 0;
    searchBranch (headNode, function (node) {
      number_of_nodes++;
    });
    return number_of_nodes;
  }
  

      
  // move is an object that requires a from and a to
  // if it deletes the branch, it returns the currentNode move.
  // if it can't find a branch to delete, it returns null.
  function deleteBranch (move) {
    for (var i in currentNode.childNodes) {
      if (currentNode.childNodes[i].move.from === move.from && currentNode.childNodes[i].move.to === move.to) {
        // we've found the node to delete
        // let's see how many nodes there are in total that will be deleted
        var number_of_nodes = numberOfNodes(currentNode.childNodes[i]);
        if (number_of_nodes > 1) {
          if (confirm("You are about to delete " + number_of_nodes + " nodes. Bad ass.")) {
            currentNode.childNodes.splice(i, 1);
          }
        } else {
          currentNode.childNodes.splice(i, 1);
        }
        return currentNode.move;
      }
    }
    return null;
  }
  
  //move is a chess.js move
  function makeCandidate (move) {
    // is the move legitimate?
    move = engine.move(move);
    if (move === null) {
      return null;
    }
    engine.undo();
    // try to find the move
    for (var i in currentNode.childNodes) {
      var child = currentNode.childNodes[i];
      if (child.move.from === move.from && child.move.to === move.to) {
				// we've found the move
				if (i === "0") {
					// it's alread the candidate move, do nothing
					return;
				}
				currentNode.childNodes[i] = currentNode.childNodes[0];
				currentNode.childNodes[0] = child;
				return;
      }
    }
    // move wasn't found, so create a new node, and make it the first in the array
		var candidate = new ChessNode(currentNode, move);
		currentNode.childNodes.push(currentNode.childNodes[0]);
		currentNode.childNodes[0] = candidate;
  }
  
  // an array of moves. a move looks like this {from:'a1', to:'e5'}
  function getNextMoves () {
    var result = [];
    for (var i in currentNode.childNodes) {
      var childNode = currentNode.childNodes[i];
      result.push({from: childNode.move.from, to: childNode.move.to});
    }
    return result;
  }
  
  function getPieces () {
    var pieces = [];
    for (var i in engine.SQUARES) {
      var square = engine.SQUARES[i];
      pieces[square] = engine.get(square);
    }
    return pieces;
  }
  
  // this is like how jQuery does get/set. If you provide a comment_string,
  // the comment for the currentNode is set, if you don't, the comment for 
  // the currentNode is returned.
  function comments (comments_string) {
    if (comments_string === undefined) {
      return currentNode.comments;
    } else {
      currentNode.comments = comments_string;
    }
  }
  
  function movesString () {
    return engine.pgn();
  }
  
  // training stuff
  
  function setTrainingNode (trainingC) {
    trainingNode = currentNode;
    trainingColor = trainingC;
  }
  
  // returns 'w' or 'b'
  function turn () {
    return engine.turn();
  }
  
  function getScoreAndNumberOfNodes(node) {
    var cumulative_score = 0,
        number_of_nodes = 0;
    
    searchBranch(node, function (n) {
                        if (n.move.color !== trainingColor && n.childNodes.length !== 0) {
                          cumulative_score += n.score;
                          number_of_nodes++;
                        }
                        });
    if ( number_of_nodes === 0 ) {
      throw "number_of_nodes is zero!";
    }
    return {"cumulative_score": cumulative_score, "number_of_nodes": number_of_nodes};
  }
  
  function getWeightedAverageBranchScore(node) {
    var score_and_nodes = getScoreAndNumberOfNodes(node);
    return score_and_nodes.cumulative_score / score_and_nodes.number_of_nodes / Math.sqrt(score_and_nodes.number_of_nodes);
  }
  
  function getScore() {
    var score_and_nodes = getScoreAndNumberOfNodes(headNode);
    return {"nodes":score_and_nodes.number_of_nodes, "sum":score_and_nodes.cumulative_score};
  }
  
  // returns null if there's no next move
  // lets make calcuating the next move easy. 
  // lowest number wins
  // score = random_number * node_score / number_of_nodes in this branch
  function calculateNextMove () {
    // return null if there's no next move
    if (currentNode.childNodes.length === 0) {
      return null;
    }
    var best_weighted_score;
    var childNodeFrontrunner = undefined;
    // calculate the score for each of the childNodes
    for (var i in currentNode.childNodes) {
      var childNode = currentNode.childNodes[i];
      
      if (childNode.childNodes.length === 0) {
        current_weighted_score = 1; // if childNode doesn't have any children, treat node as completely known.
      } else {
        var current_weighted_score = getWeightedAverageBranchScore(childNode);
        current_weighted_score *= Math.random();
      }
      
      // we want to choose the node that is less memorized
      if (childNodeFrontrunner === undefined || current_weighted_score < best_weighted_score) {
        childNodeFrontrunner = childNode;
        best_weighted_score = current_weighted_score;
      }
    }
    
    if(childNodeFrontrunner === undefined) {
      throw "no childNode was found!";
    }
    
    var move = engine.move(childNodeFrontrunner.move);
    if (move === null) {
      throw "can't find the childNode that's suppose to be here";
    }
    currentNode = childNodeFrontrunner;
    return move;
  }
  
	// and update score!
  function tryMove (move) {
    var move = engine.move(move);
    if (move === null) {
      return "illegal";  // move isn't even legal
    }
    // see if the move is the candidate move
    if (currentNode.childNodes[0].move.san === move.san) {
			currentNode.score = (currentNode.score + 1) / 2;				// update the score
			currentNode.score = Math.round(currentNode.score*100)/100;
			currentNode = currentNode.childNodes[0];
			return move;
		}
    engine.undo();  // move is not a child, so undo it.
		currentNode.score /= 2;
		currentNode.score = Math.round(currentNode.score*100)/100;
    return null;
  }
  
  // this function assumes we are past training node
  function gotoTrainingNode () {
    while ( 1 ) {
      if (currentNode === trainingNode) {
        return;
      }
      var back = moveBack();
      if (back === null) {
        throw "couldn't find training node";
      }
    }
  }
    
  // PUBLIC API
  return {
    moveTo: function (move) {
      return moveTo (move);
    },
    moveBack: function() {
      return moveBack ();
    },
    getNextMoves: function () {
      return getNextMoves ();
    },
    deleteBranch: function (move) {
      return deleteBranch (move);
    },
    makeCandidate: function (move) {
      return makeCandidate (move);
    },
    getPieces: function () {
      return getPieces ();
    },
    comments: function (comments_string) {
      return comments (comments_string);
    },
    exportRepertoire: function () {
      return exportRepertoire ();
    },
    exportPGN: function () {
      return exportPGN ();
    },
    importRepertoire: function (repertoire_string) {
      return importRepertoire (repertoire_string);
    },
    movesString: function () {
      return movesString ();
    },
    // training mode stuff
    turn: function () {
      return turn ();
    },
    setTrainingNode: function (trainingColor) {
      return setTrainingNode (trainingColor);
    },
    calculateNextMove: function () {
      return calculateNextMove ();
    },
    tryMove: function (move) {
      return tryMove (move);
    },
    gotoTrainingNode: function () {
      return gotoTrainingNode ();
    },
    getScore: function () {
      return getScore();
    }
  };
};