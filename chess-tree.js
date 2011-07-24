var ChessTree = function() {

  var ChessNode = function (parentNode, move, candidate) {
    this.move = move;     // this is the chess.js definition of a move. It has lots of good stuff
    this.parentNode = parentNode;
    this.childNodes = [];
    this.candidate = candidate || false;  // candidate is true or false
    this.comments = "";
  }
  
  var currentNode = new ChessNode(null);
  
  var headNode = currentNode;
  
  // move to a descendant node
  // if that node does not exist, create it
  function moveTo (move) {
    // look for move in the childNodes
    for (var i in currentNode.childNodes) {
      if (currentNode.childNodes[i].move.san === move.san) {
        currentNode = currentNode.childNodes[i];
        return;
      }
    }
    // move doesn't exist in tree, so we must create it
    var newChildNode = new ChessNode(currentNode, move);
    currentNode.childNodes.push(newChildNode);
    currentNode = newChildNode;
  }
  
  // return true if possible, return false if unsuccessful
  function moveBack () {
    if (currentNode.parentNode === null) {
      return false;
    }
    currentNode = currentNode.parentNode;
    return true;
  }
  
  // move is an object that requires a from and a to
  function deleteBranch (move) {
    for (var i in currentNode.childNodes) {
      if (currentNode.childNodes[i].move.from === move.from && currentNode.childNodes[i].move.to === move.to) {
        currentNode.childNodes.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  
  //move is a chess.js move
  function toggleCandidate (move) {
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
    headNode: headNode
  };
};