// chess-trainer glues together the chess.js and chess-board.js

var MOVE_BACK_BUTTON = 't';
var MOVE_BACK_BUTTON_CHARCODE = 116;   // t

var BLACK_TO_MOVE_COLOR = 'rgb(220,220,220)';
var WHITE_TO_MOVE_COLOR = 'rgb(242,242,242)';

var COLOR_WRONG = 'rgb(255, 135, 135)';
var COLOR_RIGHT = 'rgb(103, 224, 90)';

var FLASH_TIME = 100;
var WAIT_TIME  = 1000;

var SIZE_OF_BOARD = 0.95;

var shift_key_down = false;
var ctrl_key_down = false;

var pgn = '';

var mode = 'editing';

var wrong_moves = 0;

var score = 0;

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

$('body').append("<select id='orientation'><option value='w'>normal</option><option value='b'>flipped</option></select>");
var orientation = $('#orientation');

$('body').append("<select id='mode_selector'><option value='editing'>editing</option><option value='training'>training</option></select>");
var mode_selector = $('#mode_selector');

$('body').append("<p id='score_text'></p>");
var score_text = $('#score_text');

var tree = new ChessTree(pgn);
var board = new ChessBoard(move_function, move_back_function, 'normal');

resize_chess_trainer();

board.set_orientation(orientation.val());

sync_board();

resize_chess_trainer();     // !!!! don't know why I have to do this twice

function sync_board() {
	board.remove_piece(); 	// remove all the pieces
  var pieces = tree.getPieces();
  for (var i in pieces) {
    if (pieces[i] !== null) {
      board.add_piece(pieces[i].color + pieces[i].type, i);
    }
  }
  board.draw_arrows(tree.getNextMoves());

  // update the comments box and disable saving, since nothing has changed
  comments.val(tree.comments());
  save_comments.attr("disabled", "true");
  save_comments.css("background-color", "");
  score_text.html("nodes: " + score.nodes + "\nscore: " + Math.round(100*score.sum)/100);
  moves.html(tree.movesString());
  $('body').css("background-color", tree.turn() === "w" ? WHITE_TO_MOVE_COLOR : BLACK_TO_MOVE_COLOR);
  board.update_turn(tree.turn());
	// move is happening, so clear the text in move_text
  move_text.val("");
}

// move is just 'from' and 'to'
// this gets called by the chess-board if a new move is tried.
function move_function (move) {

  if (move.from === move.to) {
    return;
  }

  if (mode === 'training') {
    train(move);
    return;
  }

  // these functions send back a full move object if the move happened.
  // we use that to determine who's turn it is.
  if (ctrl_key_down) {
    tree.deleteBranch(move);
    ctrl_key_down = false;    // with tree.deleteBranch(), an alert pops up that makes 
                              // chess-trainer.js lose focus.
                              // !!! may get rid of this at some point
  } else if (shift_key_down) {
    tree.makeCandidate(move);
  } else {
    tree.moveTo(move);
  }
  sync_board();
}

function move_back_function () {
	tree.moveBack();
	sync_board();
}

function resize_chess_trainer() {
  var info = {};
  var smaller_dimension = $(window).height() > $(window).width() ? $(window).width() : $(window).height();
  info.length = Math.round(smaller_dimension * SIZE_OF_BOARD);
  info.top    = Math.round($(window).height() / 2 - info.length / 2);
  info.left   = Math.round($(window).width() / 2 - info.length / 2);

  // comment box and save button
  // comments is somehow changing the canvas
  move_text.offset({top: info.top, left: info.left + info.length + 10}).width(100).height(20);
  orientation.offset({top: info.top, left: info.left + info.length + 130}).width(80);
  mode_selector.offset({top: info.top, left: info.left + info.length + 230}).width(80);
  comments.offset({top:info.top + 50, left: info.left + info.length + 10}).width(300).height(300);
  save_comments.offset({top: info.top + 360, left: info.left + info.length + 20});
  import_button.offset({top: info.top + 360, left: info.left + info.length + 180});
  export_button.offset({top: info.top + 360, left: info.left + info.length + 250});
  score_text.offset({top: info.top + 390, left: info.left + info.length + 20}).width(100);
  export_pgn_button.offset({top: info.top + 390, left: info.left + info.length + 180 });
  moves.offset({top: info.top + 450, left: info.left + info.length + 10}).width(300). height(600);
  
  board.resize_and_move_board(info);  // this has to come last for some reason
}

function reset_training_board() {
  tree.gotoTrainingNode();
  score = tree.getScore(orientation.val());
  sync_board();
}

function wrong_move() {
	wrong_moves++;
	if(wrong_moves >= 3) {
		wrong_moves = 0;
		// show correct move and reset
		$('body').css('background-color', COLOR_WRONG);
		var correct_move = (tree.getNextMoves ())[0];
		board.slide_piece(correct_move, function () {
																			setTimeout(reset_training_board, WAIT_TIME);
																		});
	} else {
		$('body').css('background-color', COLOR_WRONG);
		setTimeout(sync_board, FLASH_TIME);
	}
}

function right_move() {
	wrong_moves = 0;
	sync_board();
	setTimeout(train, 250);
}

// this is for the trainer to make a move
function make_move() {
	next_move = tree.calculateNextMove();
	if (next_move === null) {
		$('body').css('background-color', COLOR_RIGHT);
		setTimeout(reset_training_board, WAIT_TIME);
		return;
	}
	board.slide_piece(next_move,  function () {
																	sync_board();
																	if(tree.getNextMoves().length === 0) {
																		$('body').css('background-color', COLOR_RIGHT);
																		setTimeout(reset_training_board, WAIT_TIME);
																	}
																});
}
	

function train(move) {

  var next_move;
  var background_color;
  
  // first let's figure out whose move it is
  //if ( (orientation.val() === 'w' && tree.turn() === 'w') || (orientation.val() === 'b' && tree.turn() === 'b') ) {
  if(orientation.val() === tree.turn()) {
    // trainee's turn
    if (move === undefined) {
      return;
    }
    next_move = tree.tryMove(move);
    if (next_move !== null) {
			right_move();
    } else {
			wrong_move();
    }
  } else {
    // trainer's turn
    make_move();
	}
}

save_comments.click (function (e) {
  tree.comments(comments.val());
  save_comments.attr("disabled", "true");
  save_comments.css("background-color", "");
});

import_button.click (function (e) {
  if (confirm("Are you sure you want to import? You'll overwrite any existing data.")) {
    tree.importRepertoire (comments.val());
    sync_board();
  }
});

export_button.click (function (e) {
  comments.val(tree.exportRepertoire());
  comments.select();
});

export_pgn_button.click (function (e) {
  comments.val(tree.exportPGN());
  comments.select();
});

orientation.change (function (e) {
  board.set_orientation(orientation.val());
  resize_chess_trainer();
});

mode_selector.change (function (e) {
  mode = mode_selector.val();
  if (mode === 'training') {
    tree.setTrainingNode(orientation.val());
    board.arrows_active(false);
    sync_board();
    train();
  } else if (mode === 'editing') {
    board.arrows_active(true);
    sync_board();
  }

});

// if we type anything in the comments box, enable button
comments.keypress (function (e) {
  save_comments.removeAttr("disabled");
  save_comments.css("background-color", "red");
});

move_text.keyup (function (e) {
	if(mode === 'editing') {
		if (move_text.val().indexOf(MOVE_BACK_BUTTON) !== -1) {
			tree.moveBack();
			sync_board();
		} else {
			var move = tree.moveTo(move_text.val());
			if(move !== null) {
				sync_board();
			}
		}
	} else {
		var move = tree.tryMove(move_text.val());
		if(move === "illegal") {
			return;
		} else if(move !== null) {
			right_move();
		} else {
			wrong_move();
		}
	}
});
  
$(document).keypress (function (e) {
  // only take in keypresses if the body has focus (if the user is typing in 
  // the comment box the board should try to make moves
  if ( $(document.activeElement).get(0) !== $('body').get(0) ) {
    return;
  }
  if (e.charCode === MOVE_BACK_BUTTON_CHARCODE) {
    sync_board(tree.moveBack());
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
