;(function() {
	var fps = 60;
	var scale = 50;
	var playerSpeed = 2;
	var ghostSpeed = 1;
	var totalGhosts = 3;
	
	var requestAnimationID = null;
	
	var Game = function(canvasId) {
		
		var canvas = document.getElementById(canvasId);
		var screen = canvas.getContext('2d');
		
		
		this.maze = new Maze(canvas, scale);
		var gameSize = { x: canvas.width, y: canvas.height };	
		
		
		this.restart(screen, gameSize);
	};
	
	
	
	Game.prototype = {
		gameover: function() {
			for(var i = 0; i < this.bodies.length; ++i) {
				delete this.bodies[i];
			}
			for(var i = 0; i < this.candies.length; ++i) {
				delete this.candies[i];
			}
		},
		restart: function(screen, gameSize) {
			this.screen = screen;
			this.gameSize = gameSize;
			console.log("Restart");
			this.pacman = new Pacman(this, gameSize);
		
			// Create ghosts objects
			this.bodies = [];
			for(var i = 0; i < totalGhosts; ++i) {
				this.bodies.push(new Ghost(this, gameSize));
			}
			
			// Create candies
			this.candies = [];
			for(var y = 0; y < this.maze.rows; ++y) {
				for(var x = 0; x < this.maze.cols; ++x) {
					if(!this.maze.is_obstacle(x, y)) {
						this.candies.push(new Candy(this, {x: x, y: y}));
					}
				}
			}
			
			var self = this;
			var tick = function() {
				self.update();
				self.draw(screen, gameSize);
				
				// Win
				if(self.candies.length == 0) {
					window.cancelAnimationFrame(requestAnimationID);
					requestAnimationID = undefined;				
					window.alert('Congratulation You Win The Game !');	
					if(window.confirm('Do you want to play one more time ?Play again ?')) {
						self.gameover();
						self.restart(self.screen, self.gameSize);
					}				
				} else if(self.pacman.eatenByGhost) { // Loose
					window.cancelAnimationFrame(requestAnimationID);
					requestAnimationID = undefined;				
					window.alert('Sorry you lose the game !');
					if(window.confirm('Try again ?')) {
						self.gameover();
						self.restart(self.screen, self.gameSize);
					}
				} else { // Continue
					requestAnimationID = requestAnimationFrame(tick);
				}
			};
			
			tick();
		},
		update: function() {
			this.maze.update();
			this.pacman.update();
			
			for(var i = 0; i < this.bodies.length; ++i) {
				this.bodies[i].update();
			}
			
			
			for(var i = 0; i < this.candies.length; ++i) {
				if(this.pacman.collide(this.candies[i])) {
					console.log("[COLLIDE WITH CANDY]");
					// Remove candy
					this.candies.splice( i, 1 );
				}
			}

			
			for(var i = 0; i < this.bodies.length; ++i) {
				if(this.pacman.collide(this.bodies[i])) { // Game over
					console.log("[COLLIDE WITH GHOST]");
					this.pacman.eatenByGhost = true;
					break;					
				}
			}
		},
		
		draw: function(screen, gameSize) {
			screen.clearRect(0, 0, gameSize.x, gameSize.y);
			this.maze.draw(screen, gameSize);
			this.pacman.draw(screen, gameSize);
			
			// Draw candies
			for(var i = 0; i < this.candies.length; ++i) {
				this.candies[i].draw(screen, gameSize);
			}
			// Draw ghosts
			for(var i = 0; i < this.bodies.length; ++i) {
				this.bodies[i].draw(screen, gameSize);
			}			
			
		},
		getRealPos: function(x, y) {
			return [Math.round(x / scale), Math.round(y / scale)];
		}
	};
	
	
	
	var Pacman = function(game, gameSize) {
		this.game = game;
		// Initial direction
		this.dir = DIR.STOP;
		// Marker for game over (when pacman meet ghost)
		this.eatenByGhost = false;
		// Position and size
		this.size = { x: scale, y: scale };
		this.center = { x: 1 * scale, y: 1 * scale };
		// Create keyboard handler
		this.keyboarder = new Keyboarder();		
		// Load pacman image
		this.img = new Image();
		this.img.src = "img/HEAD.png";		
	};

	
	Pacman.prototype = {
		collide: function(ghost) {
			var [x1, y1] = this.game.getRealPos(this.center.x, this.center.y);
			var [x2, y2] = this.game.getRealPos(ghost.center.x, ghost.center.y);
			return (x1 == x2 && y1 == y2);
		},
		update: function() {
			// Calculate current position relative to grid indices
			var [curX, curY] = this.game.getRealPos(this.center.x , this.center.y );
			
			// Handle change direction
			if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
				this.dir = DIR.LEFT;
				if(this.center.y % scale != 0) this.center.y = curY * scale;				
			} else if(this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
				this.dir = DIR.UP;
				if(this.center.x % scale != 0) this.center.x = curX * scale;
			} else if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
				this.dir = DIR.RIGHT;
				if(this.center.y % scale != 0) this.center.y = curY * scale;				
			} else if(this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {				
				this.dir = DIR.DOWN;
				// Avoid to change direction 'on half' (when movement is not finished from grid cell 1 to grid cell 2)
				if(this.center.x % scale != 0) this.center.x = curX * scale;
			}
			
			
			var [x, y] = this.game.getRealPos(this.center.x + (this.size.x / 2 + playerSpeed) * this.dir.x, this.center.y + (this.size.y / 2 + playerSpeed) * this.dir.y);
			// Something bad happend -> stop movement
			if(x == NaN || y == NaN || x < 0 || y < 0 || x >= this.game.maze.cols || y >= this.game.maze.rows) this.dir = DIR.STOP;
			// Apply movement based on speed and direction
			if(!this.game.maze.is_obstacle(x, y))  {
				this.center.x += playerSpeed * this.dir.x;
				this.center.y += playerSpeed * this.dir.y;
			}
		},
		draw: function(screen, gameSize) {
			screen.drawImage(this.img, 
				this.center.x, this.center.y, 
				this.size.x, this.size.y );
		}
	};	

	var Candy = function(game, center) {
		this.game = game;
		this.size = { x: scale / 2, y: scale / 2 };
		this.center = { x: center.x * scale, y: center.y * scale };
		this.img = new Image();		
		this.img.src = "img/Candy.png";		
	};
	
	Candy.prototype = {
		update: function() {
		},
		draw: function(screen, gameSize) {
			screen.drawImage(this.img, 
				this.center.x + this.size.x / 2, this.center.y + this.size.y / 2, 
				this.size.x, this.size.y );
		}		
	};
	
	
	var Ghost = function(game, gameSize) {
		this.game = game;
		this.size = { x: scale, y: scale };
		var [x, y] = [0, 0];
		var validPos = false;
		do {
			x = Math.floor(Math.random() * this.game.maze.cols);
			y = Math.floor(Math.random() * this.game.maze.rows);
			
			var collideWithGhost = false;
			for(var i = 0; i < this.game.bodies.length; ++i) {
				if(this.game.bodies[i].center.x == x || this.game.bodies[i].center.y == y){
					collideWithGhost = true;
					break;
				}
			}
			validPos = (!this.game.maze.is_obstacle(x, y)) && x != this.game.pacman.center.x && y != this.game.pacman.center.y && !collideWithGhost;
			
		} while(!validPos);
		
		this.center = { x : x * scale, y: y * scale };		
		
		var [posX, posY] = this.game.getRealPos(this.center.x, this.center.y);
		var dirs = this.game.maze.available_dirs(posX, posY);
		this.dir = dirs[Math.floor(Math.random() * dirs.length)];
		this.img = new Image();
		this.img.onload=function(){
			console.log("OnLoad: " + this.width + " " + this.height);
		};
		var images = ["img/GHOST_BLUE.png", "img/GHOST_PINK.png"];
		this.img.src = images[Math.floor(Math.random() * 2)];
		
		this.prev_dir = dirs.length;
	};
	
	Ghost.prototype = {
		update: function() {
			var [x, y] = this.game.getRealPos(this.center.x + (this.size.x / 2 + ghostSpeed) * this.dir.x, this.center.y + (this.size.y / 2 + ghostSpeed) * this.dir.y);
			if(!this.game.maze.is_obstacle(x, y))  {
				this.center.x += ghostSpeed * this.dir.x;
				this.center.y += ghostSpeed * this.dir.y;
				var [x, y] = this.game.getRealPos(this.center.x, this.center.y);
				var dirs = this.game.maze.available_dirs(x, y);
				if(this.prev_dir < dirs.length) {
					console.log("Ghost decide to change direction. Avaliable dirs #", dirs.length);
					this.dir = dirs[Math.floor(Math.random() * dirs.length)];	
					this.prev_dir = dirs.length;
					if(this.center.x % scale != 0) this.center.x = x * scale;
					if(this.center.y % scale != 0) this.center.y = y * scale;
				}
				
				
			} else {
				console.log("Ghost stop. Calculate new direction...");
				this.dir = DIR.STOP;
				var [x, y] = this.game.getRealPos(this.center.x, this.center.y);
				var dirs = this.game.maze.available_dirs(x, y);
				// Save new number for 'total available movements'
				this.prev_dir = dirs.length;
				this.dir = dirs[Math.floor(Math.random() * dirs.length)];
				
			}
			
		},
		
		draw: function(screen, gameSize) {
			screen.drawImage(this.img, 
				this.center.x, this.center.y, 
				this.size.x, this.size.y );
		}
	};	
	
	// Keyboard handler
	var Keyboarder = function() {
		var keyState = {};
		
		window.onkeydown = function(e) {
			keyState[e.keyCode] = true;
		};
		
		window.onkeyup = function(e) {
			keyState[e.keyCode] = false;
		};
		
		this.isDown = function(keyCode) {
			return keyState[keyCode] === true;
		};
		
		this.KEYS = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
	};
	
	// When dom is ready -> run the game
	window.onload = function() {
		new Game("screen");
	};
	
})();