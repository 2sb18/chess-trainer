var ChessTree = function() {

  var ChessNode = function (parentNode, move, candidate) {
    this.move = move;
    this.parentNode = parentNode;
    this.childNodes = [];
    this.candidate = candidate || false;  // candidate is true or false
    this.comments = "";
  }
  
  var currentNode = new ChessNode(null);
  
  var headNode = currentNode;
  
  // move to a descendant node
  // if that node does not exist, create it
  function moveTo (moveString) {
    // look for move in the childNodes
    for (var i in currentNode.childNodes) {
      if (currentNode.childNodes[i].move === moveString) {
        currentNode = currentNode.childNodes[i];
        return;
      }
    }
    // move doesn't exist in tree, so we must create it
    var newChildNode = new ChessNode(currentNode, moveString);
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
  
  // PUBLIC API
  return {
    moveTo: function (moveString) {
      return moveTo (moveString);
    },
    moveBack: function() {
      return moveBack ();
    },
    headNode: headNode
  };
};