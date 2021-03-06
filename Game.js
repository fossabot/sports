function Game(domNode) {
	this.engine = this.createEngine(domNode);
	this.players = [];
	this.changeGameTimer = null;
	
	this.gym = new Gymnasium(this);
	this.gym.createSportsObjects();
	
	this.reset();
	setTimeout(this.chooseAGame.bind(this), 1000);
};

Game.prototype.reset = function() {
	this.rounds = 0;
	this.scores = [{Total: 0, Bonus: 0}, {Total: 0, Bonus: 0}];
	this.timestamp = this.lastGameChangedAt = 0;

	gameTypes.forEach(function(gameType) {
		this.scores[0][gameType] = 0;
		this.scores[1][gameType] = 0;
	}, this);

	this.updateScoreboard();
}

Game.prototype.score = function(team, value) {
	if(this.players.length > 1 && this.gamepadListener && !this.gamepadListener.setupPlayer) {
		console.info("Team %s got a point in %s", team, this.gameType);
		this.scores[team][this.gameType]++;
		this.scores[team].Total += value;

		this.updateScoreboard();
	}
};

Game.prototype.updateScoreboard = function() {
	var str = "Blue: "+ this.scores[0].Total.toFixed(2)+ ", Red: "+this.scores[1].Total.toFixed(2);
	document.getElementById('scoreboard').innerHTML = str;
};

var gameTypes = ['Hockey', 'Ultimate Flying Disc', 'Dodgeball', 'Kill The Carrier'];

Game.prototype.attentionSpan = 25 * 1000;

Game.prototype.createEngine = function(domNode) {
	var gameWidth = 1366;
	var gameHeight = 768;

	var gameDimensions =  {
		min: { x: 0, y: 0},
		max: { x: gameWidth, y: gameHeight }
	};

	var engine = Matter.Engine.create(domNode, {
		world: { bounds: gameDimensions },
		render: {
			bounds: gameDimensions,
			options: {
				wireframes: false,
				width: gameWidth,
				height: gameHeight,
				showAngleIndicator: true
			}
		}
	});

	var canvas = engine.render.canvas;

	Matter.Render.setBackground(engine.render, "url(img/gymnasium.png)");

	//NOTE: this is gross.
	setTimeout(function() {
		canvas.style.backgroundImage = "url(img/gymnasium.png)";
		canvas.style.backgroundSize = gameWidth+"px "+gameHeight+"px";
	});

	canvas.addEventListener('click', function() {
		if (document.body.requestFullscreen) {
			document.body.requestFullscreen();
		} else if (document.body.msRequestFullscreen) {
			document.body.msRequestFullscreen();
		} else if (document.body.mozRequestFullScreen) {
			document.body.mozRequestFullScreen();
		} else if (document.body.webkitRequestFullscreen) {
			document.body.webkitRequestFullscreen();
		}
	});

	engine.render.options.showAngleIndicator = true;

	engine.world.gravity.x = engine.world.gravity.y = 0;

	Matter.Engine.run(engine);

	Matter.Events.on(engine, 'collisionStart', this.onCollisionActive.bind(this));
	Matter.Events.on(engine, 'tick', this.onTick.bind(this));
	Matter.Events.on(engine, 'afterRender', this.afterRender.bind(this));

	return engine;
};

Game.prototype.onTick = function(tickEvent) {
	this.timestamp = tickEvent.timestamp;
	this.getWorld().bodies.forEach(function(body) {
		if(body.pawn)
			body.pawn.tick(tickEvent);
	});

	this.getWorld().composites.forEach(function(composite) {
		if(composite.pawn)
			composite.pawn.tick(tickEvent);
	});

	if(this.timestamp - this.lastGameChangedAt > this.attentionSpan) {
		if(this.rounds >= 11)
			this.endGame();
		else
			this.chooseAGame();
	}

	this.gym.goals.forEach(function(g) {
		g.tick(tickEvent);
	});
};

Game.prototype.endGame = function() {
	var self = this;
	this.playSound("gameover");

	var str = ["Game Over!", printIndividualScore(0), printIndividualScore(1)].join('\n');

	alert(str);

	this.reset();

	function printIndividualScore(team) {
		var str = team ? "Red" : "Blue";
		str += " team";

		for(var game in self.scores[team]) {
			if(game != "Total")
				str += "\n" + game + ": " + self.scores[team][game];
		}

		str += "\n Total: " + self.scores[team].Total

		return str;
	}
};

Game.prototype.afterRender = function(renderEvent) {
	var context = this.engine.render.canvas.getContext("2d");
	for (playerCounter = 0; playerCounter < this.players.length; playerCounter++) {
		var player = this.players[playerCounter];
		if (player && player.gamepad.setupComplete()){
			var textColor = player.team ? "darkred" : "blue";

			context.font = "24px sans-serif";
			context.fillStyle = textColor;
			context.fillText(playerCounter,player.body.position.x,  player.body.position.y);
			context.textAlign = "center";
			context.textBaseline = "middle";

			if(player.equipment && player.equipment instanceof Flag) {
				context.strokeStyle = "lime";
				context.lineWidth = 4;
				context.beginPath();
				context.arc(player.body.position.x, player.body.position.y, 24, 0, 2 * Math.PI, false);
				context.stroke();
			}
		}
	}
};

Game.prototype.onCollisionActive = function(collisionEvent) {
	collisionEvent.pairs.filter(function(pair) {
		return pair.bodyA.pawn && pair.bodyB.pawn;
	}).forEach(function(pair) {
		pair.bodyA.pawn.handleCollision(pair.bodyB.pawn);
		pair.bodyB.pawn.handleCollision(pair.bodyA.pawn);
	});
};

Game.prototype.chooseAGame = function() {
	if(this.rounds < 10) {
		var i = Math.floor(Math.random() * gameTypes.length);
		this.gameType = gameTypes[i];
	}
	else
		this.gameType = 'Bonus';

	this.lastGameChangedAt = this.timestamp;
	document.getElementById('gametypeDisplay').innerHTML = (this.rounds + 1) + " - " + this.gameType;
	
	if(this.players.length > 1 && this.gamepadListener && !this.gamepadListener.setupPlayer) {
		this.playSound('whistle');
		
		var soundName = this.gameType.replace(/ /g,'').toLowerCase();
		setTimeout(this.playSound.bind(this, soundName), 1000);
		
		this.rounds++;
	}
};

Game.prototype.getWorld = function() {
	return this.engine.world;
};

Game.prototype.playSound = function(sound) {
	var audio = document.querySelector('audio[data-sound='+sound+']');
	if(audio)
		audio.play();
}
