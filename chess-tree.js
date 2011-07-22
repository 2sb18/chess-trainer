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
  
  // an array of moves. a move looks like this {from:'a1', to:'e5'}
  function getNextMoves () {
    var result = [];
    for (var i in currentNode.childNodes) {
      result.push({from: currentNode.childNodes[i].move.from, to: currentNode.childNodes[i].move.to});
    }
    console.log(currentNode);
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
    headNode: headNode
  };
};