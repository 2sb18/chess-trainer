var ChessTree = function() {

  // the first node has a move = 'undefined'
  var ChessNode = function (parentNode, move, candidate) {
    this.move = move;     // this is the chess.js definition of a move. It has lots of good stuff
    this.parentNode = parentNode;
    this.childNodes = [];
    this.candidate = candidate || false;  // candidate is true or false
    this.comments = "";
  }

  var engine = new Chess();
  var currentNode = new ChessNode(undefined);
  var headNode = currentNode;


  
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
  
  // move is an object that requires a from and a to
  // if it deletes the branch, it returns the currentNode move.
  // if it can't find a branch to delete, it returns null.
  function deleteBranch (move) {
    for (var i in currentNode.childNodes) {
      if (currentNode.childNodes[i].move.from === move.from && currentNode.childNodes[i].move.to === move.to) {
        currentNode.childNodes.splice(i, 1);
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
        return;
      }
    }
    
    // move wasn't found, so create a new move with candidate set to true
    currentNode.childNodes.push(new ChessNode(currentNode, move, true));
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
    }
  };
};