console.log("Loading... utils.js");

var DIR = {
	LEFT:  {x: -1, y:  0}, 
	UP:    {x:  0, y: -1}, 
	RIGHT: {x:  1, y:  0}, 
	DOWN:  {x:  0, y:  1}, 
	STOP:  {x:  0, y:  0}
};

function Vector(x=0, y=0) {
	if(Array.isArray(x)) {
		this.x = x[1];
		this.y = x[0];
	} else if( x instanceof Vector) {
		this.x = x.x;
		this.y = x.y;
	} else {
		this.x = x;
		this.y = y;
	}
}


