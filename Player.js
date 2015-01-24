function Player(world) {
	this._super.apply(this, arguments);

	this.body = this.createBody(world);

	Matter.World.add(world, this.body); 
}

Player.extends(Pawn);

Player.prototype.walkSpeed = 0.0015;

Player.prototype.xAxis = 0;
Player.prototype.yAxis = 1;

Player.prototype.deadZone = 0.1;

Player.prototype.createBody = function(world) {
	var x = 200;
	var y = 200;
	return Matter.Bodies.circle(x, y, 10, {frictionAir: 0.2});
}

Player.prototype.handleInput = function(gamepad) {

	var joyX = gamepad.axes[this.xAxis];
	if(Math.abs(joyX) < this.deadZone)
		joyX = 0;

	var joyY = gamepad.axes[this.yAxis];
	if(Math.abs(joyY) < this.deadZone)
		joyY = 0;


	var x = joyX * this.walkSpeed;
	var y = joyY * this.walkSpeed;

	Matter.Body.applyForce(this.body, this.body.position, {x: x, y: y});
};