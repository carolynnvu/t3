/* 
 * Client side socket work 
 */

var socket = io(),
	turn;

function play(room, username) {
	console.log(username, 'joined the match!');
	socket.emit('joinRoom', {'room': room, 'username':username });

	socket.on('registerPlayer', registerPlayer);
	socket.on('displayBoard', displayBoardHandler);
	socket.on('layDownPiece', layDownPiece);
	socket.on('tie', tie);
	socket.on('winner', winner);
}

function createBoard() {
	var board = document.getElementById("board"),
		numberOfBlocks = 9,
		blockSize = 100,
		row = -1, 
		col = 0;

	for(var i = 0; i < numberOfBlocks; i++) {
		var div = document.createElement("div");
		div.classList.add("blocks");
		div.id = "block" + i;
		div.setAttribute('data-occupied', "false");
		if(i % 3 === 0) {
			row++;
			col = 0;
		} 
		div.setAttribute('data-row', row);
		div.setAttribute('data-col', col++);
		div.addEventListener('click', click);
		board.appendChild(div);
	}
}

function registerPlayer(data) {
	turn = data.turn; //Set respective turn indicators. 
	mssg = document.getElementById('waitingMessage');
	if(data.turn === 1) {
		socket.emit('bothPlayersInRoom');
	} else {
		mssg.innerHTML = '<h4>The enemy has not arrived yet.</h4>';
	}
}

function displayBoardHandler(data) {
	var progress = document.getElementById('progressIndicator'),
		bar = document.getElementById('progressBar'),
		mssg = document.getElementById('waitingMessage'), 
		gameRoomTitle = document.getElementById('waitingRoomTitle');
	bar.classList.remove('progress-bar-warning');
	bar.classList.add('progress-bar-success');
	mssg.innerHTML = '<h4>Let the bloodshed begin.</h4>';
	gameRoomTitle.textContent = 'Battlefield';
	setTimeout(function() {
		progress.style.display = "none";
		mssg.style.display = "none";
		createBoard();
	}, 2000);
}

function click() {
	var piece, 
		occupied = this.getAttribute('data-occupied'),
		row = this.getAttribute('data-row'),
		col = this.getAttribute('data-col'),
		id = this.id;

	if(occupied === 'false') {
		piece = {'turn' : turn, 
				 'row' : row, 
				 'col' : col,
				 'blockId' : id };
		socket.emit('click', { 'piece' : piece }); 
	}
}

function layDownPiece(data) {
	var thing = data;
	console.log('in lay down piece', data);
	var block = document.getElementById(data.blockId),
		piece = document.createElement("div");
		piece.id = "piece"+data.turn;
		block.appendChild(piece);
		block.setAttribute('data-occupied', true);

	socket.emit('checkForWinner', thing);
}

function tie(data) {
	document.getElementById('winner').textContent = 'TIE';
	setTimeout(function() {
		window.location.href = '/play';
	}, 1500);
}

function winner(data) {
	document.getElementById('winner').textContent = data.winner + ' WINS!';
	setTimeout(function() {
		window.location.href = '/play';
	}, 1500);
}



