var GameLayer = cc.Layer.extend({
	ctor:function() {
		this._super();
		this.init();
	},

	init:function() {
	    // Create signals
		this.tileMapLoaded = new TAGUtil.Signal();
		
		//create a TMXTiledMap with file name
		this.tileMap = new cc.TMXTiledMap(res.NewMap_tmx);
		this.tileMap.x = 0;
		this.tileMap.y = 0;
		this.tileMap.setAnchorPoint(new cc.p(0.0, 0.0));
		this.addChild(this.tileMap);
		
		TR.levelMgr.populateGrid(this.tileMap);
		
		this.guiRearPromptLayer = new cc.Layer();
		this.guiRearPromptLayer.x = 0;
		this.guiRearPromptLayer.y = 0;
		this.guiRearPromptLayer.setAnchorPoint(new cc.p(0.0, 0.0));
		this.addChild(this.guiRearPromptLayer);
		
		this.spriteLayer = new cc.Layer();
		this.spriteLayer.x = 0;
		this.spriteLayer.y = 0;
		this.spriteLayer.setAnchorPoint(new cc.p(0.0, 0.0));
		this.addChild(this.spriteLayer);

		this.guiFrontPromptLayer = new cc.Layer();
		this.guiFrontPromptLayer.x = 0;
		this.guiFrontPromptLayer.y = 0;
		this.guiFrontPromptLayer.setAnchorPoint(new cc.p(0.0, 0.0));
		this.addChild(this.guiFrontPromptLayer);
		
		var layerListener = cc.EventListener.create({
			event:  cc.EventListener.TOUCH_ONE_BY_ONE,
			// When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
			swallowTouches: true,
			//onTouchBegan event callback function                      
			onTouchBegan: function (touch, event) { 
			    var target = event.getCurrentTarget();
				var location = target.tileMap.convertToNodeSpace(touch.getLocation());   
				var tileSize = target.tileMap.getTileSize();
				var mapSize = target.tileMap.getMapSize();
				
				var x = (location.x / tileSize.width) | 0;
				var y = (((mapSize.height * tileSize.height) - location.y) / tileSize.height) | 0;

				//cc.log("Tile layer touched: " + x + "," + y);
				
				//if(TR.levelMgr.tileExistsAt(x, y)) {
					return true;
				//}
				//return false;
			},
			onTouchEnded: function (touch, event) {
				//cc.log("Tile Found!");
				var target = event.getCurrentTarget();
				var location = target.tileMap.convertToNodeSpace(touch.getLocation());   
				var tileSize = target.tileMap.getTileSize();
				var mapSize = target.tileMap.getMapSize();
				
				var touchedAt = {
				    nodeX : location.x,
					nodeY : location.y,
					tileX : (location.x / tileSize.width) | 0,
					tileY : (((mapSize.height * tileSize.height) - location.y) / tileSize.height) | 0
				};
				
				TR.commandMgr.processCommandForTouchedTile(touchedAt);
			}
		});
		
		cc.eventManager.addListener(layerListener, this);
	},
    
    tileXtoScreenX : function(tx) {
    	var w = this.tileMap.getTileSize().width;
        return tx * w + (w/2);
    },
    
    tileYtoScreenY : function(ty) {
	    var tileHeight = TR.gameLayer.tileMap.getTileSize().height;	
		var mapHeight = TR.gameLayer.tileMap.getMapSize().height;

		return ((mapHeight * tileHeight) - (ty * tileHeight)) - tileHeight/2;
    },
	
	stepScrollMap : function(mx, my) {
		var tileSize = this.tileMap.getTileSize();
		
		var dx = mx * tileSize.width;
		var dy = my * tileSize.height;
		
		if(dx !== 0) {
			//this.x += dx;
			this.tileMap.x += dx;
			this.guiRearPromptLayer.x += dx;
			this.spriteLayer.x += dx;
			this.guiFrontPromptLayer.x += dx;
			var dx = this.tileMap.x % tileSize.width;
			//this.x -= dx;
			this.tileMap.x -= dx;
			this.guiRearPromptLayer.x -= dx;
			this.spriteLayer.x -= dx;
			this.guiFrontPromptLayer.x -= dx;
		}
		
		if(dy !== 0) {
			//this.y += dy;
			this.tileMap.y += dy;
			this.guiRearPromptLayer.y += dy;
			this.spriteLayer.y += dy;
			this.guiFrontPromptLayer.y += dy;
			var dy = this.tileMap.y % tileSize.height;
			//this.y -= dy;
			this.tileMap.y -= dy;
			this.guiRearPromptLayer.y -= dy;
			this.spriteLayer.y -= dy;
			this.guiFrontPromptLayer.y -= dy;
		}
	},
	
	tileMap : undefined,
	spriteLayer : undefined,
	guiRearPromptLayer : undefined,
	guiFrontPromptLayer : undefined,
	tileMapLoaded : undefined
});