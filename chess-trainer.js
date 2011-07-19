// chess-trainer glues together the chess.js and chess-board.js

function sync_board_to_engine (chess_engine, chess_board) {
  chess_board.remove_piece()  // remove all the pieces
  for (var i in chess_engine.SQUARES) {
    var piece = chess_engine.get(chess_engine.SQUARES[i]);
    if (piece !== null) {
      chess_board.add_piece(piece.color + piece.type, chess_engine.SQUARES[i]);
    }
  }
}

var chess_engine = new Chess();

function move_function (move_object) {
  chess_engine.move(move_object);
  sync_board_to_engine (chess_engine, chess_board);
}
     
var chess_board = new ChessBoard(move_function);
chess_board.build_board();



sync_board_to_engine (chess_engine, chess_board);
