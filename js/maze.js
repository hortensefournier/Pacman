console.log("Loading... maze.js");
function Maze(cvs, scale) {
	if(cvs == null) {
		console.log("Canvas not found (obj == null)");
		return;
	}
	this.ctx = cvs.getContext("2d");
	this.grid = [
		[[0,  0], [0,  1], [0,  2], [0,  3], [0,  4], [0,  5], [0,  6], [0,  7], [0,  8], [0,  9], [0,  10], [0,  11], [0,  12], [0,  13], [0,  14], [0,  15], [0,  16], [0,  17], [0,  18], [0,  19],],
		[[1,  0],                                     [1,  5],                                                                             [1,  14],                                         [1,  19],],
		[[2,  0],          [2,  2], [2,  3],          [2,  5],          [2,  7], [2,  8], [2,  9], [2,  10], [2,  11], [2,  12],           [2,  14],           [2,  16], [2,  17],           [2,  19],],
		[[3,  0],          [3,  2],                                                                                                                                      [3,  17],           [3,  19],],
		[[4,  0],          [4,  2],          [4,  4], [4,  5],          [4,  7],          [4,  9], [4,  10], [4,  11], [4,  12],           [4,  14], [4,  15],           [4,  17],           [4,  19],],
		[[5,  0],                                                       [5,  7],                                       [5,  12],                                                             [5,  19],],
		[[6,  0],          [6,  2],          [6,  4], [6,  5],          [6,  7], [6,  8], [6,  9], [6,  10],           [6,  12],           [6,  14], [6,  15],           [6,  17],           [6,  19],],
		[[7,  0],          [7,  2],                                                                                                                                      [7,  17],           [7,  19],],
		[[8,  0],          [8,  2], [8,  3],          [8,  5],          [8,  7], [8,  8], [8,  9], [8,  10], [8,  11], [8,  12],           [8,  14],           [8,  16], [8,  17],           [8,  19],],
		[[9 , 0],                                     [9 , 5],                                                                             [9,  14],                                         [9,  19],],
		[[10, 0], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9], [10, 10], [10, 11], [10, 12], [10, 13], [10, 14], [10, 15], [10, 16], [10, 17], [10, 18], [10, 19],],
	];
	
	// For 'rows' everything simple -> total number of rows,
	// but for 'cols' we must find maximum array length (number of columns)
	this.rows = this.grid.length;
	this.cols = 0;
	for(var i = 0; i < this.grid.length; ++i) {
		if(this.cols  < this.grid[i].length) {
			this.cols  = this.grid[i].length;
		}
	}
	// Resize canvas according to specified scale and number of rows/columns in maze
	cvs.width = scale * this.cols ;
	cvs.height = scale * this.rows;
	
	// Return true if maze contains obstacle at specified coords, otherwise false
	this.is_obstacle = function (x, y) {
		if(x < 0 || y < 0 || x >= this.cols || y >= this.rows) return true;
		
		for(var i = 0; i < this.grid.length; ++i) {
			for(var j = 0; j < this.grid[i].length; ++j) {
				var wall = new Vector(this.grid[i][j]);
				if(wall.x == x && wall.y == y) return true;
			}
		}
		return false;
	}
	
	
	// Return available moves
	this.available_dirs = function (x, y) {
		var dirs = [];
		if(!this.is_obstacle(x - 1, y)) {
			dirs.push(DIR.LEFT);
		}
		if(!this.is_obstacle(x, y - 1)) {
			dirs.push(DIR.UP);
		}
		if(!this.is_obstacle(x + 1, y)) {
			dirs.push(DIR.RIGHT);
		}
		if(!this.is_obstacle(x, y + 1)) {
			dirs.push(DIR.DOWN);
		}
		return dirs;
	}
	
	
	
	this.get_empty_cell = function() {
		for(var y = 0; y < this.rows; ++y) {
			for(var x = 0; x < this.cols; ++x) {
				if(!this.is_obstacle(x, y)) return new Vector(x, y);
			}
		}
		alert("Invalid maze data grid. Found zero empty cells.");
		throw new Error("Invalid maze data grid. Found zero empty cells.");
	}
	
	this.draw = function() {
		// Change stroke style
		var oldStyle = this.ctx.strokeStyle;
		var oldWidth = this.ctx.lineWidth;
		this.ctx.strokeStyle = "#0000FF";
		this.ctx.lineWidth = 2;
		// Draw maze
		for(var i = 0; i < this.grid.length; ++i) {
			for(var j = 0; j < this.grid[i].length; ++j) {
				var coord = new Vector(this.grid[i][j]);
				this.ctx.strokeRect(coord.x * scale, coord.y * scale, scale, scale);
				this.ctx.fillRect(coord.x * scale, coord.y * scale, scale, scale);
			}
		}
		// Restore stroke style
		this.ctx.strokeStyle = oldStyle;
		this.ctx.lineWidth = oldWidth;
	}
	
	this.update = function() { 
		// Do nothing 
	}
}