// chess-trainer glues together the chess.js and chess-board.js

var back_button_charCode = 116;   // t
var backspace_keyCode    = 8; 

var black_to_move_color = 'rgb(220,220,220)';
var white_to_move_color = 'rgb(242,242,242)';

var size_of_board = 0.95;



var shift_key_down = false;
var ctrl_key_down = false;
var typed_input = "";



//var pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8  10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6';

//var pgn = '1. e4 e5';

//var pgn = 'd4 d5 [ e5 dxe5 [ Nc3 ] ; f5 ] f4';

//var pgn = '1. d4 d5 ( 1... e5 )';

var pgn = '';

$('body').append("<textarea id='comments'></textarea>");
var comments = $('#comments');
comments.css("resize", "none");

$('body').append("<button id='save_comments' type='button'>save comments</button>");
var save_comments = $('#save_comments');

$('body').append("<button id='export_button' type='button'>export</button>");
var export_button = $('#export_button');

var tree = new ChessTree(pgn);
var board = new ChessBoard(move_function, move_back_function);
resize_chess_trainer();
check_move_and_sync_board(undefined);


// syncs the board to the engine
// the engine tells it where the pieces are
// the tree tells it where the arrows are.
function check_move_and_sync_board (move) {
  if (move === null) {  // move was not possible, so do nothing
    return;
  }
  
  // move is happening, so clear the typed_input
  typed_input = "";
  
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
  
  // update the comments box
  comments.val(tree.comments());
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

function resize_chess_trainer() {
  var info = {};
  var smaller_dimension = $(window).height() > $(window).width() ? $(window).width() : $(window).height();
  info.length = Math.round(smaller_dimension * size_of_board);
  info.top    = Math.round($(window).height() / 2 - info.length / 2);
  info.left   = Math.round($(window).width() / 2 - info.length / 2);

  // comment box and save button
  // comments is somehow changing the canvas
  comments.offset({top:300, left: info.left + info.length + 10}).width(300).height(300);
  save_comments.offset({top: 610, left: info.left + info.length + 20});
  export_button.offset({top: 610, left: info.left + info.length + 250});
  
  board.resize_and_move_board(info);  // this has to come last for some reason
}

save_comments.click (function (e) {
  tree.comments(comments.val());
});

export_button.click (function (e) {
  comments.val(tree.exportPGN());
});
  
$(document).keypress (function (e) {
  // only take in keypresses if the body has focus (if the user is typing in 
  // the comment box the board should try to make moves
  if ( $(document.activeElement).get(0) !== $('body').get(0) ) {
    return;
  }
  if (e.charCode === back_button_charCode) {
    check_move_and_sync_board(tree.moveBack());
	} else if (e.keyCode === backspace_keyCode) {
    typed_input = typed_input.substr(0, typed_input.length - 1);
  } else {  // add character to the typed_input and see if the move is possible
    typed_input += String.fromCharCode(e.charCode);
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

$(window).resize(resize_chess_trainer);
