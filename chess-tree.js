

var ChessTree = function(pgn_string) {

  // the first node has a parentNode = 'undefined'
  var ChessNode = function (parentNode, move, candidate) {
    this.move = move;     // this is the chess.js definition of a move. It has lots of good stuff
    this.parentNode = parentNode;
    this.childNodes = [];
    this.candidate = candidate || false;  // candidate is true or false
    this.comments = "";
  }

  var engine;
  var currentNode;
  var headNode;
	importPGN(pgn_string);

  // sets the currentNode, headNode, and engine
  function importPGN (pgn_string) {
  
    engine = new Chess();
    headNode = new ChessNode(undefined);
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
          var start_of_comment = next_space + 1;
          var end_of_comment = pgn_string.indexOf(" }", next_space);
          if (end_of_comment === -1) {
            throw "can't find the end of the comment";
          }
          currentNode.comments = pgn_string.slice(start_of_comment, end_of_comment);
          next_space = end_of_comment + 2;
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
		
		console.log(exportPGN());
  }
	
	function exportPGN() {
	
		var result = [];
    
    function push_node (node) {
      if (node.move !== undefined) {
        result.push(node.move.san);
      }
      if (node.comments !== "") {
        result.push("{");
        // escape the } with \
        var comments = node.comments.replace(/}/g, '\\}');
        result.push(comments);
        result.push("}");
      }
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
		// if this is the only childNode, make candidate move true
    var newChildNode = new ChessNode(currentNode, move);
    currentNode.childNodes.push(newChildNode);
		if (currentNode.childNodes.length === 1) {
			newChildNode.candidate = true;
		}
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
  function searchBranch (headNode, func) {
    for (var i in headNode.childNodes) {
      var child = headNode.childNodes[i];
      searchBranch (child, func);
    }
    func (headNode);
  }
      
  // move is an object that requires a from and a to
  // if it deletes the branch, it returns the currentNode move.
  // if it can't find a branch to delete, it returns null.
  function deleteBranch (move) {
    for (var i in currentNode.childNodes) {
      if (currentNode.childNodes[i].move.from === move.from && currentNode.childNodes[i].move.to === move.to) {
        // we've found the node to delete
        // let's see how many nodes there are in total that will be deleted
        var number_of_nodes = 0;
        searchBranch (currentNode.childNodes[i], function (node) {
          number_of_nodes++;
        });
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
  function toggleCandidate (move) {
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
        child.candidate = child.candidate ? false : true;
        return {color:move.color === "w" ? "b" : "w"};
      }
    }
    
    // move wasn't found, so create a new move with candidate set to true
    currentNode.childNodes.push(new ChessNode(currentNode, move, true));
		return {color:move.color === "w" ? "b" : "w"};
  }
  
  // an array of moves. a move looks like this {from:'a1', to:'e5'}
  function getNextMoves () {
    var result = [];
    for (var i in currentNode.childNodes) {
      var childNode = currentNode.childNodes[i];
      result.push({from: childNode.move.from, to: childNode.move.to, candidate: childNode.candidate});
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
    toggleCandidate: function (move) {
      return toggleCandidate (move);
    },
    getPieces: function () {
      return getPieces ();
    },
    comments: function (comments_string) {
      return comments (comments_string);
    },
    exportPGN: function () {
      return exportPGN ();
    },
    importPGN: function (repertoire_string) {
      return importPGN (repertoire_string);
    },
    movesString: function () {
      return movesString ();
    }
  };
};