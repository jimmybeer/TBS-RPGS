var TR = TR || {};

// version
TR.VERSION = "Prototype v0.1";
TR.DEBUG = true;

TR.levelMgr = new LevelManager();
TR.commandMgr = new CommandManager();
TR.pathMgr = new PathManager();
TR.lightMgr = new LightingManager();

TR.gameLayer = undefined;

TR.cesWorld = undefined;

// game state
TR.GAME_STATE = {
    HOME:0,
	PLAY:1,
	OVER:2
};

// keys
TR.KEYS = [];

// sound
TR.SOUND = false;

// containers
TR.stores = {
    players : [],
	plyrCount : 0,
	ENEMIES : [],
	NPCs : [],
};

TR.selected = undefined;
TR.entSeleted = false;
TR.manualMoving = true;
