// chess-trainer glues together the chess.js and chess-board.js

function sync_board_to_engine (chess_engine, chess_board) {
  for (var i in chess_engine.SQUARES) {
    var piece = chess_engine.get(chess_engine.SQUARES[i]);
    if (piece === null) {
      chess_board.remove_piece(chess_engine.SQUARES[i]);
    } else {
      chess_board.add_piece(piece.color + piece.type, chess_engine.SQUARES[i]);
    }
  }
}

var chess_engine = new Chess();

var chess_tree = new ChessTree();

function move_function (move_object) {
  var move = chess_engine.move(move_object);
  if (move !== null) {
    chess_tree.moveTo(move.san);
    sync_board_to_engine (chess_engine, chess_board);
  }
}
     
var chess_board = new ChessBoard(move_function);
chess_board.build_board();

sync_board_to_engine (chess_engine, chess_board);

$(document).keypress (function (e) {
  if (e.keyCode === 37) {   // left arrow button
    chess_engine.undo();
    chess_tree.moveBack();
    sync_board_to_engine (chess_engine, chess_board);
  }
});
