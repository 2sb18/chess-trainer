
// move verification function is in the chess-trainer
// it gets called like this: move_verification_function({from: 'g2', to: 'g3'})
// and it returns null if the move is not allowed and something like
// { color: 'w', from: 'g2', to: 'g3', flags: 'n', piece: 'p', san: 'g3' } if it is. 

var ChessBoard = function(move_function) {

  //configuration
  var dark_color = 'brown';
  var light_color = 'rgb(230,220,230)';
  var selected_square_color = 'rgb(27, 119, 224)';
  var size_of_board = 0.95;
  var thicknes_of_arrow = 0.2;  // relative to the width of the squares
  var z_square = -2;
  var z_piece  = -1;
  var z_canvas = 1;

  var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  var selected_square;

  var dimensions = {};
  
  var canvas_context;

  var board;
  
  var stored_arrows = [];
  
  // body is a jQuery object containing the body.
  function build_board() {
    $('body').append("<div id='board'></div>");
    board = $('#board');
    for (var i in letters) {
      for (var j = 1; j <= 8; j++) {
        var square = letters[i] + j;
        board.append("<img class='square' id='" + square + "' src='./img/b.gif' />");
        set_background_color_to_default(square);
        $('.square#' + square).css("position", "absolute").css("z-index", z_square);
      }
    }
    resize_and_move_board();
  }

  function set_background_color_to_default(square) {
    if ((letters.indexOf(square.charAt(0)) + Number(square.charAt(1))) % 2 === 1) {
      $('.square#' + square).css("background-color", dark_color);
    } else {
      $('.square#' + square).css("background-color", light_color);
    }
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
    
    // remove old canvas, and create new one based on the new dimensions.
    $('canvas#arrow_canvas').remove();
    $('body').append("<canvas id='arrow_canvas' width='" + board_width + "' height='" + board_width + "'></div>");
    $('canvas#arrow_canvas').offset({left:dimensions.board_left, top:dimensions.board_top}).css("z-index", z_canvas);
    canvas_context = $('canvas#arrow_canvas').get(0).getContext('2d');
    
    // redraw the canvas
    draw_arrows(stored_arrows); 
  }

  // example: {piece: "bb", square: "a4"}
  function add_piece(piece, square) {
    // if there's a piece already there, remove it
    // if there's a piece and it's the same kind, do nothing
    var current_piece = $('.piece#' + square);
    if (current_piece.length !== 0) {
      // if it's the same kind of piece, do nothing
      if (current_piece.attr("src").indexOf(piece) !== -1) {
        return;
      } else {
        remove_piece(square);
      }
    }
    board.append("<img class='piece' id='" + square + "' src='./img/" + piece + ".png' style='position:absolute;z-index:" + z_piece + "' " +
      "ondragstart='return false' onselectstart='return false'/>");
    var jQuerySquare = $('.piece#' + square);
    jQuerySquare.css(get_position_and_size_from_square(jQuerySquare.attr('id')));
  }
  
  // if input is undefined, then remove all pieces
  // if input is a string, it should be a square, like 'a4'. Then we remove that square.
  function remove_piece (square) {
    if (square === undefined) {
      $('.piece').remove();
    } else if ("string" === typeof square) {
      $('.piece#' + square).remove();
    }
  }
  
  // arrows is an array of arrows
  // an arrow consists of an object, {from, to, color}
  function draw_arrows (arrows) {
  
  
    arrows = [{from:'e2', to:'e4'}, {from:'d2', to:'d4'}, {from:'b1', to:'c3'}, {from:'g1', to:'f3'}];
  
    stored_arrows = arrows;
  
  
    // this is with respect to the board
    function get_center_of_square (square) {
      var result = {};
      result.top = (8 - Number(square.charAt(1))) * dimensions.square_width + dimensions.square_width/2;
      result.left = letters.indexOf(square.charAt(0)) * dimensions.square_width + dimensions.square_width/2;
      return result;
    }
  
    // get rid of arrows already on screen
    // setting the width of a canvas erases everything on it
    var canvas_element = $('canvas#arrow_canvas').get(0);
    canvas_element.width--;
    canvas_element.width++;

  
    canvas_context.strokeStyle = "rgba(100,100,100,0.5)";
    canvas_context.lineWidth = Math.round(dimensions.square_width * thicknes_of_arrow);
    
    for (var k in arrows) {
      var from = get_center_of_square (arrows[k].from);
      var to   = get_center_of_square (arrows[k].to);
      canvas_context.moveTo(from.left, from.top);
      canvas_context.lineTo(to.left, to.top);
    }
    //canvas_context.moveTo(0, 0);
    //canvas_context.lineTo(65, 65);
    canvas_context.stroke();
    return canvas_context;
  }
 
  // events

  $(window).resize(resize_and_move_board);

  function deselect_square() {
    if (selected_square !== undefined) {
      set_background_color_to_default(selected_square);
      selected_square = undefined;
    }
  }

  function select_square(square) {
    deselect_square();
    selected_square = square;
    $('.square#' + selected_square).css("background-color", selected_square_color);
  }

  $(document).click(function (e) {
    var square = get_square_from_mouse (e);
    if (selected_square === undefined) {
      // check to see if there's any piece on the square
      if ($('.piece#' + square).length !== 0) {
        select_square(square);
      }
    } else {
      // move piece to new square
      move_function({from: selected_square, to: square});
      deselect_square();
    }
  });
  
  // PUBLIC API
  return {
    build_board: function () {
      return build_board ();
    },
    add_piece: function (piece, square) {
      return add_piece (piece, square);
    },
    remove_piece: function (square) {
      return remove_piece (square);
    },
    draw_arrows: function (arrows) {
      return draw_arrows (arrows);
    },
    get_dimensions: function () {
      return dimensions;
    }
  };
  
};

