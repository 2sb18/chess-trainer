// chess-trainer glues together the chess.js and chess-board.js

function add_pieces_from_game_to_board (chess_engine, chess_board) {
  chess_board.remove_piece()  // remove all the pieces
  for (var i in chess_engine.SQUARES) {
    var piece = chess_engine.get(chess_engine.SQUARES[i]);
    if (piece !== null) {
      chess_board.add_piece(piece.color + piece.type, chess_engine.SQUARES[i]);
    }
  }
}

var chess_engine = new Chess();
     
var chess_board = new ChessBoard(chess_engine.move);
chess_board.build_board();



add_pieces_from_game_to_board (chess_engine, chess_board);
