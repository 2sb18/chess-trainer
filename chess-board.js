
// move verification function is in the chess-trainer
// it gets called like this: move_verification_function({from: 'g2', to: 'g3'})
// and it returns null if the move is not allowed and something like
// { color: 'w', from: 'g2', to: 'g3', flags: 'n', piece: 'p', san: 'g3' } if it is. 

var ChessBoard = function(move_function, move_back_function) {

  //configuration
  var dark_color = 'brown';
  var light_color = 'rgb(230,220,230)';
  var candidate_color = "rgb(92, 242, 162)";        // kindo of a green
  var non_candidate_color = "rgb(255, 235, 105)";
  var arrow_transparency = 0.7;
  var selected_square_color = 'rgb(27, 119, 224)';
  var thickness_of_arrow = 0.15;  // relative to the width of the squares
  var length_of_arrow_head = 0.4; // relative to width of squares
  var arrow_head_angle = 0.78          // in radians
  var z_square = -2;
  var z_piece  = 1;
  var z_canvas = 2;

  var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  
  var selected_square;
  var touch_down_square;
  var dimensions = {};
  var canvas_context;
  var board;
  var whose_move = 'w';
  
  var stored_arrows = [];
  
  // body is a jQuery object containing the body.
  // build_board gets called automatically when
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
  }
  build_board();  // call build_board when chess-board is created

  function set_background_color_to_default(square) {
    if ((letters.indexOf(square.charAt(0)) + Number(square.charAt(1))) % 2 === 1) {
      $('.square#' + square).css("background-color", dark_color);
    } else {
      $('.square#' + square).css("background-color", light_color);
    }
  }
  
  function update_move(just_moved) {
    if (just_moved === 'b') {
      whose_move = 'w';
    } else {
      whose_move = 'b';
    }
  }

  // example input is square = 'a4'
  function get_position_and_size_from_square (square) {
    var result = {};
    result.left = dimensions.board_left + letters.indexOf(square.charAt(0)) * dimensions.square_width;
    result.top  = dimensions.board_top + (8 - Number(square.charAt(1))) * dimensions.square_width;
    result.width = dimensions.square_width;
    result.height = dimensions.square_width;
    return result;
  }

  // takes an event object e and returns the square like 'a4'
  function get_square_from_position (x, y) {
    var file = Math.floor((x - dimensions.board_left) / dimensions.square_width);
    var rank = 8 - Math.floor((y - dimensions.board_top) / dimensions.square_width);
    if (file < 0 || file > 7 || rank < 1 || rank > 8) {
      return undefined;
    }
    return letters[file] + rank;
  }
  
  // info is an object with top, left, length
  function resize_and_move_board(info) {
    dimensions.square_width = Math.round(info.length / 8);
    dimensions.board_top = info.top;
    dimensions.board_left = info.left;
    
    $('.square, .piece').each(function(index, element) {
      var jQuerySquare = $(this);
      jQuerySquare.css(get_position_and_size_from_square(jQuerySquare.attr('id')));
    });
    
    // remove old canvas, and create new one based on the new dimensions.
    $('canvas#arrow_canvas').remove();
    $('body').append("<canvas id='arrow_canvas' width='" + info.length + "' height='" + info.length + "'></div>");
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
  // an arrow consists of an object, {from, to, candidate}
  function draw_arrows (arrows) {
  
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

    canvas_context.lineWidth = Math.round(dimensions.square_width * thickness_of_arrow);
    canvas_context.globalAlpha = arrow_transparency;
    
    
    //alert("canvas top is " + $('#arrow_canvas').position().top + " and left is " + $('#arrow_canvas').position().left);
    
    for (var k in arrows) {
      var from = get_center_of_square (arrows[k].from);
      var to   = get_center_of_square (arrows[k].to);
      canvas_context.beginPath();
      canvas_context.strokeStyle = arrows[k].candidate ? candidate_color : non_candidate_color;
      canvas_context.moveTo(from.left, from.top);
      canvas_context.lineTo(to.left, to.top);
      // now drawing the head of the arrow
      // angle is like standard co-ordinates
      var angle = Math.atan2(from.top - to.top, from.left - to.left);
      canvas_context.moveTo(to.left, to.top);
      canvas_context.lineTo(to.left + length_of_arrow_head * dimensions.square_width * Math.cos(angle - arrow_head_angle), 
                            to.top + length_of_arrow_head * dimensions.square_width * Math.sin(angle - arrow_head_angle));
      canvas_context.moveTo(to.left, to.top);
      canvas_context.lineTo(to.left + length_of_arrow_head * dimensions.square_width * Math.cos(angle + arrow_head_angle), 
                            to.top + length_of_arrow_head * dimensions.square_width * Math.sin(angle + arrow_head_angle));
      canvas_context.stroke();
    }
    return canvas_context;
  }
 
  // events

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
  
  // example of square is 'a4'
  function board_pushed (square) {
    if (selected_square === undefined) {
      // check to see if there's any piece on the square
      // and that the piece selected is the right color
      if ($('.piece#' + square).length !== 0 && $('.piece#' + square).attr("src").charAt(6) === whose_move) {
        select_square(square);
      }
    } else {
      // move piece to new square
      move_function({from: selected_square, to: square});
      deselect_square();
    }
  }

  $(document).click(function (e) {
    board_pushed(get_square_from_position (e.pageX, e.pageY));
  });
  
  $(document).bind("touchstart", function(e) {
    var target = window.event.targetTouches[0];
    touch_down_square = get_square_from_position(target.pageX, target.pageY);
    return false;
  });
  
  $(document).bind("touchend", function(e) {
    var target = window.event.changedTouches[0];
    var touch_up_square = get_square_from_position(target.pageX, target.pageY);
    if (touch_down_square === touch_up_square) {
      board_pushed (touch_up_square);
    } else {
      move_back_function();   // any dragging motion causes moving back right now.
    }
  });
  
  // PUBLIC API
  return {
    resize_and_move_board: function (info) {
      return resize_and_move_board (info);
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
    update_move: function (just_moved) {
      return update_move (just_moved);
    }
  };
  
};

