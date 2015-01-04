require('../models/match.js');

var uuidGenerator = require('node-uuid');
var mongoose = require('mongoose');
var Match = mongoose.model('Match');

module.exports = function(io) {
  var board,
      numTurns,
      player, 
      room, 
      turn;
  io.on('connection', function (socket) {
         board = [[-1, -1, -1],
                  [-1, -1, -1],
                  [-1, -1, -1]],
         turn = 0,
         numTurns = 0;                                                  
  	 socket.on('joinRoom', function(data) { 
        console.log(data.username, 'joined the room!');
    	 	var allRooms = io.sockets.adapter.rooms;
    	 	room = data.room;
        player = data.username;
    	 	//All joined rooms are added to the io.sockets.adapter.rooms object.
  	 	  if(!(room in allRooms)) { 
    	 		socket.join(room); 
    	 		console.log('Player 1 joined room: ' + room);
    	 		socket.emit('registerPlayer', { 'turn' : 0 });
  	    } else { 
	    	  socket.join(room);
  	    	console.log('Player 2 joined room ' + room);
  	 		  socket.emit('registerPlayer', { 'turn' : 1});
  	    }
     }); 

    	socket.on('bothPlayersInRoom', function(data) {
    		io.sockets.in(room).emit('displayBoard'); 
    	});

    	socket.on('click', function(data) {
    		var piece = data.piece;
        if(piece.turn === turn) {
          board[piece.row][piece.col] = piece.turn;
          console.log(board);
          changeTurn();
          io.sockets.in(room).emit('layDownPiece', piece); 
        } 
    	});

      socket.on('checkForWinner', function(data) {
        numTurns++;
        var winner, 
            result,
            piece = data, 
            isThereAWin = checkForWin(parseInt(piece.row), parseInt(piece.col), piece.turn);

        if(isThereAWin) { //Check for win before tie. 9th move could be a win.
            winner = (piece.turn === 0 ? 0 : 1);
            Match.findOne({roomId: room}, function(err, match, count) {
              match.winner = match.players[winner];
              match.status = false;
              match.markModified('winner');
              match.save();
              io.sockets.in(room).emit('winner', { 'winner' : match.winner });
            });
        } else if(numTurns >= 18) { //Double counts moves...
          Match.findOne({roomId: room}, function(err, match, count) {
              match.winner = 'tie';
              match.status = false;
              match.markModified('winner');
              match.save();
              io.sockets.in(room).emit('tie');
          });
        }         
      });

      socket.on('disconnect', function(data) {
        console.log(player, 'disconnected!'); 
        data.id = socket.id;
        Match.findOne({roomId: room}, function(err, match, count) {
              //If any user disconnects before a winner is determined, then match is marked inactive.
              if(match.winner === "TBD") {
                match.winner = "N/A"
                match.status = false;
                match.markModified('winner');
                match.save();
              }
              io.sockets.in(room).emit('User disconnected', data);
          });
      });
   }); 

  function changeTurn() {
    turn = (turn + 1) % 2;
  }

  function checkForWin(row, col, player) {
  	var left = checkForMatches(player, row, col, 0, -1, 0),
        right = checkForMatches(player, row, col, 0, +1, 0);
    if(left + right + 1 >= 3) {
      return true;
    }
    
    var up = checkForMatches(player, row, col, -1, 0, 0),
        down = checkForMatches(player, row, col, +1, 0, 0);
    if(up + down + 1 >= 3) {
      return true;
    }
    
    var diagonalUpLeft = checkForMatches(player, row, col, -1, -1, 0),
        diagonalDownRight = checkForMatches(player, row, col, +1, +1, 0);
    if(diagonalUpLeft + diagonalDownRight + 1 >= 3) {
      return true;
    }
    
    var diagonalDownLeft = checkForMatches(player, row, col, +1, -1, 0),
        diagonalUpRight = checkForMatches(player, row, col, -1, +1, 0);
    if(diagonalDownLeft + diagonalUpRight + 1 >= 3) {
      return true;
    }
    return false;
  }

  function checkForMatches(player, row, col, tildeRow, tildeCol, numMatches) {
    if((row + tildeRow < 0) || (row + tildeRow >= board.length)) { 
      return numMatches;
    }
    if((col + tildeCol < 0) || (col + tildeCol >= board[row + tildeRow].length)) {
      return numMatches;
    }
    if(board[row + tildeRow][col + tildeCol] === player){
        return checkForMatches(player, row + tildeRow , col + tildeCol, 
                               tildeRow, tildeCol, numMatches+1);
    }
    return numMatches;
  }
};
