// chess-trainer glues together the chess.js and chess-board.js

var move_back_button = 't';
var move_back_button_charCode = 116;   // t

var black_to_move_color = 'rgb(220,220,220)';
var white_to_move_color = 'rgb(242,242,242)';

var size_of_board = 0.95;

var shift_key_down = false;
var ctrl_key_down = false;

var pgn = '';

$('body').append("<input type='text' id='move_text'></input>");
var move_text = $('#move_text');

$('body').append("<textarea id='comments'></textarea>");
var comments = $('#comments');
comments.css("resize", "none");

$('body').append("<button id='save_comments' type='button'>save comments</button>");
var save_comments = $('#save_comments');

$('body').append("<button id='import_button' type='button'>import</button>");
var import_button = $('#import_button');

$('body').append("<button id='export_button' type='button'>export</button>");
var export_button = $('#export_button');

$('body').append("<button id='export_pgn_button' type='button'>export pgn</button>");
var export_pgn_button = $('#export_pgn_button');

$('body').append("<p id='moves'></p>");
var moves = $('#moves');

$('body').append("<select id='mode_selector'><option value='editing'>editing</option><option value='training'>training</option></select>");
var mode_selector = $('#mode_selector');

$('body').append("<p id='score_text'></p>");
var score_text = $('#score_text');

var tree = new ChessTree(pgn);
var board = new ChessBoard(move_function, move_back_function);

resize_chess_trainer();

check_move_and_sync_board(undefined);

resize_chess_trainer();     // !!!! don't know why I have to do this twice


function sync_board() {
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
  
  // update the comments box and disable saving, since nothing has changed
  comments.val(tree.comments());
  save_comments.attr("disabled", "true");
  save_comments.css("background-color", "");
  score_text.html("score: " + Math.round(tree.score()*100)/100);
  moves.html(tree.movesString());
}  
  
// syncs the board to the engine
// the engine tells it where the pieces are
// the tree tells it where the arrows are.
function check_move_and_sync_board (move) {
  if (move === null) {  // move was not possible, so do nothing
    return;
  }
  

  
  if (move === undefined) { // this is the first move, so background color should be white
    $('body').css('background-color', white_to_move_color);
    board.update_move ('b');
  } else {
    $('body').css("background-color", move.color === "w" ? black_to_move_color : white_to_move_color);
    board.update_move (move.color);
  }
  sync_board();
  
  // move is happening, so clear the text in move_text
  move_text.val("");
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
  move_text.offset({top: info.top, left: info.left + info.length + 10}).width(100).height(20);
  mode_selector.offset({top: info.top, left: info.left + info.length + 230}).width(80);
  
  comments.offset({top:info.top + 50, left: info.left + info.length + 10}).width(300).height(300);
  save_comments.offset({top: info.top + 360, left: info.left + info.length + 20});
  import_button.offset({top: info.top + 360, left: info.left + info.length + 180});
  export_button.offset({top: info.top + 360, left: info.left + info.length + 250});
  score_text.offset({top: info.top + 390, left: info.left + info.length + 20});
  export_pgn_button.offset({top: info.top + 390, left: info.left + info.length + 180 });
  moves.offset({top: info.top + 420, left: info.left + info.length + 10}).width(300). height(600);
  
  board.resize_and_move_board(info);  // this has to come last for some reason
}



function importRepertoire (repertoire_string) {
  tree.importRepertoire (repertoire_string);
  $('body').css('background-color', white_to_move_color);
  board.update_move ('b');
  sync_board();
}
  

save_comments.click (function (e) {
  tree.comments(comments.val());
  save_comments.attr("disabled", "true");
  save_comments.css("background-color", "");
});

export_button.click (function (e) {
  comments.val(tree.exportRepertoire());
});

export_pgn_button.click (function (e) {
  comments.val(tree.exportPGN());
});

import_button.click (function (e) {
  importRepertoire (comments.val());
});

// if we type anything in the comments box, enable button
comments.keypress (function (e) {
  save_comments.removeAttr("disabled");
  save_comments.css("background-color", "red");
});

move_text.keyup (function (e) {
  if (move_text.val().indexOf(move_back_button) !== -1) {
    check_move_and_sync_board(tree.moveBack());
	} else {
    check_move_and_sync_board (tree.moveTo(move_text.val()));
  }
});
  
$(document).keypress (function (e) {
  // only take in keypresses if the body has focus (if the user is typing in 
  // the comment box the board should try to make moves
  if ( $(document.activeElement).get(0) !== $('body').get(0) ) {
    return;
  }
  if (e.charCode === move_back_button_charCode) {
    check_move_and_sync_board(tree.moveBack());
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
