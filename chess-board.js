var ChessBoard = function() {

  //configuration
  var dark_color = 'brown';
  var light_color = 'rgb(230,220,230)';
  var selected_square_color = 'rgb(27, 119, 224)';
  var size_of_board = 0.95;
  var speed_of_move = 400;

  var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  var selected_square;

  var dimensions = {};

  var board;
  
  function build_board() {
    $('body').append("<div id='board'></div>");
    board = $('#board');
    for (var i in letters) {
      for (var j = 1; j <= 8; j++) {
        var square = letters[i] + j;
        board.append("<img class='square' id='" + square + "' src='./img/b.gif' />");
        set_background_color_to_default(square);
        $('.square#' + square).css("position", "absolute");
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
    piece.css("z-index", 2);
    piece.animate(get_position_and_size_from_square(to_square), {
      duration: speed_of_move, 
      complete: function() {
        piece_to_remove.remove(); // remove any pieces on the destination square
        piece.css("z-index", "");
      }
    });
  }
  
      // example input is square = 'a4'
  function remove_piece (square) {
    $('.piece#' + square).remove();
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

  // was the board clicked on?
  $(document).click(function (e) {
    var square = get_square_from_mouse (e);
    if (selected_square === undefined) {
      // check to see if there's any piece on the square
      if ($('.piece#' + square).length !== 0) {
        select_square(square);
      }
    } else {
      // move piece to new square
      if (square !== selected_square) {
        //drop_piece(selected_square, square);
        move_piece(selected_square, square);
      }
      deselect_square();
    }
  });

  // actions

  //build_board(); 
  //add_piece("bb", "a1");
  //add_piece("wb", "e4");
  //add_piece("wk", "g8");
  //add_piece("bp", "a2");
  //add_piece("bp", "d5");
  //move_piece("a1", "g8");
  //move_piece("e4", "a2");
  
  // PUBLIC API
  return {
    build_board: function() {
      build_board();
    },
    add_piece: function (piece, square) {
      add_piece (piece, square);
    },
    move_piece: function (from_square, to_square) {
      move_piece (from_square, to_square);
    },
    remove_piece: function (square) {
      remove_piece (square);
    }
  };
  
};

