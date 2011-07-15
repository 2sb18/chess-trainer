var board;
var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

var pieces = [{piece:"B", square:"a4"}];

var dark_color = 'black';
var light_color = 'gray';

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
  
  
function resize_and_move_board() {
  var result = {};
  var smaller_dimension = $(window).height() > $(window).width() ? $(window).width() : $(window).height();
  var board_width = Math.round(smaller_dimension * 0.8);
  var square_width = Math.round(board_width / 8);
  var board_top = Math.round($(window).height() / 2 - board_width / 2);
  var board_left = Math.round($(window).width() / 2 - board_width / 2);
  
  // takes something like 'g4' and returns an object with top and left
  function set_css_on_square (jQuerySquare) {
    var algebraic = jQuerySquare.attr('id');
    result.left = board_left + letters.indexOf(algebraic.charAt(0)) * square_width;
    result.top = board_top + (8 - Number(algebraic.charAt(1))) * square_width;
    result.width = square_width;
    result.height = square_width;
    jQuerySquare.css(result);
  }
  
  $('.square').each(function(index, element) {
    set_css_on_square($(this));
  });
  
  
}

build_board(); 

$(window).resize(resize_and_move_board);