var GameScreen = cc.LayerColor.extend({
	ctor:function() {
		this._super();
		this.init();
	},

	init:function() {
		TR.gameLayer = new GameLayer();
		this.addChild(TR.gameLayer);
		
		if(TR.DEBUG) {
    		this.debugLayer = new DebugLayer();
	    	this.addChild(this.debugLayer, 10);
		}
		
		TR.cesWorld = new TAGCes.World();

		TR.cesWorld.addSystem(new ActionListController());
		TR.cesWorld.addSystem(new PositionController());
		TR.cesWorld.addSystem(new SelectionTrackerController());
		TR.cesWorld.addSystem(new ViewController());
		
		this.schedule(this.update);
		
		// Add key listener
		if(cc.sys.capabilities.hasOwnProperty('keyboard')) {
			cc.eventManager.addListener({
				event : cc.EventListener.KEYBOARD,
				onKeyPressed:function(key, event) {
					event.getCurrentTarget().onKeyPressed(event.getCurrentTarget(), key);
				}
			}, this);
		}
	},
	update : function(dt) {
		TR.cesWorld.update(dt);
	},
	onKeyPressed : function(sender, key) {
		if((key === cc.KEY.left) || (key === cc.KEY.right) ||
		   (key === cc.KEY.up) || (key === cc.KEY.down)) {
			var dx = 0;
			var dy = 0;
			
			if(key === cc.KEY.left) dx -= 1;
			if(key === cc.KEY.right) dx += 1;
			if(key === cc.KEY.up) dy -= 1;
			if(key === cc.KEY.down) dy += 1;
			
			TR.commandMgr.processMoveCommand(dx, dy);
		}
	},
	
	debugLayer : undefined
});

GameScreen.scene = function() {
	var scene = new cc.Scene();
	var layer = new GameScreen();
	scene.addChild(layer);
	return scene;
};