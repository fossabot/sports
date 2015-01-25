function Gymnasium(game) {
	this.game = game;
};

Gymnasium.prototype.createSportsObjects = function() {
	this.walls = this.createWalls();
	this.goals = this.createGoals();
	this.createDodgeballs();
	this.createFlyingDisc();
	//this.createTennisNet();
};

Gymnasium.prototype.wallThickness = 25;

Gymnasium.prototype.goalWidth = 30;
Gymnasium.prototype.goalHeight = 150;
Gymnasium.prototype.goalBuffer = 65;

Gymnasium.prototype.totalDodgeBalls = 5;
Gymnasium.prototype.dodgeBallSize = 7;

Gymnasium.prototype.hockeyPuckSize = 5;
Gymnasium.prototype.tennisBallSize = 5;
Gymnasium.prototype.frisbeeSize = 7;

Gymnasium.prototype.getEndZone = function(pawn) {
	if(pawn.body.position.x < this.goalWidth + this.goalBuffer + this.wallThickness)
		return 0;
	if(pawn.body.position.x > this.game.getWorld().bounds.max.x - this.goalBuffer - this.goalWidth - this.wallThickness)
		return 1;

	return null;
}
Gymnasium.prototype.isInLeftEndZone = function(pawn) {
	return pawn.body.position.x < this.goalWidth + this.goalBuffer + this.wallThickness;
}

Gymnasium.prototype.isInRightEndZone = function(pawn) {
	 pawn.body.position.x > this.game.world.bounds.max.x - this.goalBuffer - this.goalWidth - this.wallThickness;
}

Gymnasium.prototype.createWalls = function() {
	var world = this.game.getWorld();

	var gymWidth = world.bounds.max.x - world.bounds.min.x;
	var gymHeight = world.bounds.max.y - world.bounds.min.y;

	var centerX = (world.bounds.max.x + world.bounds.min.x)/2;
	var centerY = (world.bounds.max.y + world.bounds.min.y)/2;

	return [
		new Wall(this.game, centerX, - 100 + this.wallThickness, gymWidth, 200), //top,
		new Wall(this.game, world.bounds.max.x + 100 - this.wallThickness, centerY, 200, gymHeight), //right
		new Wall(this.game, centerX, world.bounds.max.y + 100 - this.wallThickness, gymWidth, 200), //bottom,
		new Wall(this.game, - 100 + this.wallThickness, centerY, 200, gymHeight) //left
	];
};

Gymnasium.prototype.tick = function(tickEvent) {
	if(this.game.gameType == 'Tennis') {
		var nets = this.game.getWorld().composites.filter(function(b) {
			return b.pawn && b.pawn instanceof TennisNet;
		});

		if(nets.length == 0) {
			console.log("NO NETS! MAKE ONE");
			this.createTennisNet();
		}
	}
};

Gymnasium.prototype.createGoals = function() {
	var world = this.game.getWorld();

	var gymWidth = world.bounds.max.x - world.bounds.min.x;
	var gymHeight = world.bounds.max.y - world.bounds.min.y;
	
	var centerY = (world.bounds.max.y + world.bounds.min.y)/2;
	
	return [
		new Wall(this.game, world.bounds.min.x + this.goalBuffer + this.wallThickness, centerY, this.goalWidth, this.goalHeight),  //left
		new Wall(this.game, world.bounds.max.x - this.goalBuffer - this.wallThickness, centerY, this.goalWidth, this.goalHeight)  //right
	];
};

Gymnasium.prototype.createDodgeballs = function() {
	var world = this.game.getWorld();

	var gymWidth = world.bounds.max.x - world.bounds.min.x;
	var gymHeight = world.bounds.max.y - world.bounds.min.y;

	var centerX = (world.bounds.max.x + world.bounds.min.x)/2;
	var centerY = (world.bounds.max.y + world.bounds.min.y)/2;
	
	//Dodgeballs
	for (ballCounter = 0; ballCounter < this.totalDodgeBalls; ballCounter++) {
		new Dodgeball(this.game, (world.bounds.min.x + this.wallThickness + Dodgeball.prototype.radius) * (ballCounter + 1), world.bounds.min.y + this.wallThickness);
	}
};

Gymnasium.prototype.createFlyingDisc = function() {
	var world = this.game.getWorld();
	var gymHeight = world.bounds.max.y - world.bounds.min.y;
	var centerX = (world.bounds.max.x + world.bounds.min.x)/2;
	new FlyingDisc(this.game, centerX, gymHeight - this.wallThickness - FlyingDisc.prototype.radius);
};

Gymnasium.prototype.createTennisNet = function() {
	new TennisNet(this.game);
};
