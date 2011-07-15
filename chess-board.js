//configuration
var dark_color = 'rgb(110, 110, 110)';
var light_color = 'rgb(200, 230, 230)';
var size_of_board = 0.95;

var board;
var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

var pieces = [  {piece:"wb", square:"a4"},
                {piece:"bb", square:"a5"}
];



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
  for (var i in pieces) {
    board.append("<img class='piece' id='" + pieces[i].square + "' src='./img/" + pieces[i].piece + ".png' style='position:absolute' />");
  }
  
  resize_and_move_board();
}
  
  
function resize_and_move_board() {
  var smaller_dimension = $(window).height() > $(window).width() ? $(window).width() : $(window).height();
  var board_width = Math.round(smaller_dimension * size_of_board);
  var square_width = Math.round(board_width / 8);
  var board_top = Math.round($(window).height() / 2 - board_width / 2);
  var board_left = Math.round($(window).width() / 2 - board_width / 2);
  
  
  function get_position_and_size_from_algebraic (algebraic) {
    result = {};
    result.left = board_left + letters.indexOf(algebraic.charAt(0)) * square_width;
    result.top = board_top + (8 - Number(algebraic.charAt(1))) * square_width;
    result.width = square_width;
    result.height = square_width;
    return result;
  }
  
  $('.square, .piece').each(function(index, element) {
    var jQuerySquare = $(this);
    jQuerySquare.css(get_position_and_size_from_algebraic(jQuerySquare.attr('id')));
  });
}

build_board(); 

$(window).resize(resize_and_move_board);