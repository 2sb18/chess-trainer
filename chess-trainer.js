// chess-trainer glues together the chess.js and chess-board.js

function sync_board_to_engine (engine, board) {
  for (var i in engine.SQUARES) {
    var piece = engine.get(engine.SQUARES[i]);
    if (piece === null) {
      board.remove_piece(engine.SQUARES[i]);
    } else {
      board.add_piece(piece.color + piece.type, engine.SQUARES[i]);
    }
  }
}

var engine = new Chess();

var tree = new ChessTree();

function move_function (move_object) {
  var move = engine.move(move_object);
  if (move !== null) {
    tree.moveTo(move.san);
    sync_board_to_engine (engine, board);
  }
}
     
var board = new ChessBoard(move_function);
board.build_board();
board.draw_arrows();

sync_board_to_engine (engine, board);

$(document).keypress (function (e) {
  if (e.keyCode === 37) {   // left arrow button
    engine.undo();
    tree.moveBack();
    sync_board_to_engine (engine, board);
  }
});
