// chess-trainer glues together the chess.js and chess-board.js

var back_button_charCode = 116;   // t
var backspace_keyCode    = 8; 

var black_to_move_color = 'rgb(220,220,220)';
var white_to_move_color = 'rgb(242,242,242)';

var shift_key_down = false;
var ctrl_key_down = false;
var typed_input = "";

var tree = new ChessTree();
var board = new ChessBoard(move_function, move_back_function);
board.build_board();
check_move_and_sync_board(undefined);

// syncs the board to the engine
// the engine tells it where the pieces are
// the tree tells it where the arrows are.
function check_move_and_sync_board (move) {
  if (move === null) {  // move was not possible, so do nothing
    return;
  }
  
  // move is happening, so clear the typed_input
  typed_input = "";t
  
  if (move === undefined) { // this is the first move, so background color should be white
    $('body').css('background-color', white_to_move_color);
    board.update_move ('b');
  } else {
    $('body').css("background-color", move.color === "w" ? black_to_move_color : white_to_move_color);
    board.update_move (move.color);
  }
  
  // put the pieces in the right spots
  // pieces is an array of pieces on the board
  // there's an element for every square on the board
  // if an element is null, no piece is on that square.
  var pieces = tree.getPieces();
  for (var i in pieces) {
    if (pieces[i] === null) {
      board.remove_piece(i);
    } else {
      board.add_piece(pieces[i].color + pieces[i].type, i);
    }
  }
  // put the arrows in the right spots
  board.draw_arrows(tree.getNextMoves());
}

// move is just 'from' and 'to'
function move_function (move) {

  // these functions send back a full move object if the move happened.
  // we use that to determine who's turn it is.
  if (ctrl_key_down) {
    move = tree.deleteBranch(move);
    ctrl_key_down = false;    // with tree.deleteBranch(), an alert pops up that makes 
                              // chess-trainer.js lose focus.
                              // !!! may get rid of this at some point
  } else if (shift_key_down) {
    move = tree.toggleCandidate(move);
  } else {
    move = tree.moveTo(move);
  }
  check_move_and_sync_board (move);
}

function move_back_function () {
  check_move_and_sync_board(tree.moveBack());
}
     
$(document).keypress (function (e) {
  console.log
  if (e.charCode === back_button_charCode) {
    check_move_and_sync_board(tree.moveBack());
  } else if (e.keyCode === backspace_keyCode) {
    typed_input = typed_input.substr(0, typed_input.length - 1);
  } else {  // add character to the typed_input and see if the move is possible
    typed_input += String.fromCharCode(e.charCode);
    console.log(typed_input);
    check_move_and_sync_board (tree.moveTo(typed_input));
  }
}).keydown (function (e) {
  if (e.keyCode === 16) { // shift
    shift_key_down = true;
  } else if (e.keyCode === 17) {  // ctrl
    ctrl_key_down = true;
  }
}).keyup (function (e) {
  if (e.keyCode === 16) { // shift
    shift_key_down = false;
  } else if (e.keyCode === 17) {
    ctrl_key_down = false;
  }
});
