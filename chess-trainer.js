// chess-trainer glues together the chess.js and chess-board.js

var back_button_charCode = 116;   // t

var black_to_move_color = 'rgb(220,220,220)';
var white_to_move_color = 'rgb(242,242,242)';

var engine = new Chess();
var tree = new ChessTree();
var board = new ChessBoard(move_function);
board.build_board();
sync_board (engine, board);

// syncs the board to the engine and the tree
// the engine tells it where the pieces are
// the tree tells it where the arrows are.
function sync_board () {
  // put the pieces in the right spots
  for (var i in engine.SQUARES) {
    var piece = engine.get(engine.SQUARES[i]);
    if (piece === null) {
      board.remove_piece(engine.SQUARES[i]);
    } else {
      board.add_piece(piece.color + piece.type, engine.SQUARES[i]);
    }
  }
  //put the arrows in the right spots
  board.draw_arrows(tree.getNextMoves());
}

function move_function (move_object) {
  var move = engine.move(move_object);
  if (move !== null) {
    tree.moveTo(move);
    $('body').css("background-color", move.color === "w" ? black_to_move_color : white_to_move_color);
    sync_board (engine, board);
  }
}
     
$(document).keypress (function (e) {
  if (e.charCode === back_button_charCode) {
    var move = engine.undo();
    if (move !== null) {
      $('body').css("background-color", move.color === "b" ? black_to_move_color : white_to_move_color);
    }
    tree.moveBack();
    sync_board (engine, board);
  }
});
