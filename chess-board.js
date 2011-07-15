//configuration
var dark_color = 'brown';
var light_color = 'rgb(230,220,230)';
var size_of_board = 0.95;
var speed_of_move = 400;

var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// selected_piece is a jQuery object with the selected piece in it.
var selected_piece;

var dimensions = {};

var board;

function build_board() {
  $('body').append("<div id='board'></div>");
  board = $('#board');
  for (var i in letters) {
    for (var j = 1; j <= 8; j++) {
      if ((Number(i) + j) % 2 === 1) {
        board.append("<div class='square' id='" + letters[i] + j + "' style='background-color:" + dark_color + ";position:absolute' />");
      } else {
        board.append("<div class='square' id='" + letters[i] + j + "' style='background-color:" + light_color + ";position:absolute' />");
      }
    }
  }
  
  resize_and_move_board();
}

// example input is square = 'a4'
function get_position_and_size_from_square (square) {
  result = {};
  result.left = dimensions.board_left + letters.indexOf(square.charAt(0)) * dimensions.square_width;
  result.top  = dimensions.board_top + (8 - Number(square.charAt(1))) * dimensions.square_width;
  result.width = dimensions.square_width;
  result.height = dimensions.square_width;
  return result;
}

// takes an event object e and returns the square like 'a4'
function get_square_from_mouse (e) {
  var file = Math.floor((e.pageX - dimensions.board_left) / dimensions.square_width);
  var rank = 8 - Math.floor((e.pageY - dimensions.board_top) / dimensions.square_width);
  if (file < 0 || file > 7 || rank < 1 || rank > 8) {
    return undefined;
  }
  return letters[file] + rank;
}
 
function resize_and_move_board() {
  var smaller_dimension = $(window).height() > $(window).width() ? $(window).width() : $(window).height();
  var board_width = Math.round(smaller_dimension * size_of_board);
  dimensions.square_width = Math.round(board_width / 8);
  dimensions.board_top = Math.round($(window).height() / 2 - board_width / 2);
  dimensions.board_left = Math.round($(window).width() / 2 - board_width / 2);
  
  $('.square, .piece').each(function(index, element) {
    var jQuerySquare = $(this);
    jQuerySquare.css(get_position_and_size_from_square(jQuerySquare.attr('id')));
  });
}

// example input is square = 'a4'
function remove_piece(square) {
  $('.piece#' + square).remove();
}

// example: {piece: "bb", square: "a4"}
function add_piece(piece, square) {
  // if there's a piece already there, remove it
  remove_piece(square);
  board.append("<img class='piece' id='" + square + "' src='./img/" + piece + ".png' style='position:absolute' " +
    "ondragstart='return false' onselectstart='return false'/>");
  var jQuerySquare = $('.piece#' + square);
  jQuerySquare.css(get_position_and_size_from_square(jQuerySquare.attr('id')));
}

function move_piece(from_square, to_square) {
  // get the piece that's being moved
  var piece = $(".piece#" + from_square);
  if (piece.length === 0) {
    return;
  }
  var piece_to_remove = $('.piece#' + to_square);
  piece.attr("id", to_square);
  piece.animate(get_position_and_size_from_square(to_square), {
    duration: speed_of_move, 
    complete: function() {
      piece_to_remove.remove(); // remove any pieces on the destination square 
    }
  });
}

// events

$(window).resize(resize_and_move_board);

$(window).mouseup(function(e) {
  drop_selected_piece(e);
});

// e is an event object
function selected_piece_to_mouse(e) {
  if (selected_piece === undefined) {
    return;
  }
  selected_piece.offset({top:(e.pageY - dimensions.square_width / 2), left:(e.pageX - dimensions.square_width / 2)});
}

function drop_selected_piece(e) {
  var selected_square;
  // find out what square mouse is on
  var dropped_square = get_square_from_mouse(e);
  if (dropped_square !== undefined) {
    // remove a piece that is on this square
    remove_piece(dropped_square);
    // set the position of the selected piece to the position of the square it's on
    selected_square = $(".square#" + dropped_square);
    // change the id of the selected_piece to match the square it's being dropped on.
    selected_piece.attr("id", dropped_square);
  } else {
    selected_square = $(".square#" + selected_piece.attr("id"));
  }
  selected_piece.offset(selected_square.offset());
  selected_piece.css("z-index", "1");
  selected_piece = undefined;
}
  
$('.piece').live("mousedown", function(e) {
  selected_piece = $(this);
  selected_piece.css("z-index", "2");
  selected_piece_to_mouse(e);
});

$('#board').live("mousemove", function(e) {
  selected_piece_to_mouse(e);
});

// actions

build_board(); 
add_piece("bb", "a1");
add_piece("wb", "e4");
add_piece("wk", "g8");
add_piece("bp", "a2");
move_piece("a1", "g8");
move_piece("e4", "a2");

