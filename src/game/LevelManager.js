var LevelManager = function() {
	this.tileCache = [];
}

LevelManager.prototype = {
	LightingEnabled : false,
	grid : undefined,
	
	updateFOV : function() {        
        // reset FOV for next calculation
        TAGAlg.FOV.ShadowFOV.reset();
		
        var playerLen = TR.stores.players.length;
        for(var i = 0; i < playerLen; ++i) {
		    var player = TR.stores.players[i];
		    var tilePos = player.getComponent('TilePosition');

		    TAGAlg.FOV.ShadowFOV.calculateFOV(tilePos.x, tilePos.y);
        }
        
        // If enabled update the lighting
        if(this.LightingEnabled) {
            TR.lightMgr.updateLighting(this.tileCache["base"]);
        }
    },
	
	switchLighting : function() {
		this.LightingEnabled = !this.LightingEnabled;
		
		if(this.LightingEnabled) {
            TR.lightMgr.updateLighting(this.tileCache["base"]);
		} else {
            TR.lightMgr.disableLighting(this.tileCache["base"]);
		}
		return this.LightingEnabled;
	},
	
	tileExistsAt : function(x, y) {
		return this.grid.existsAt(x,y); 
	},
	
	populateGrid : function(tilemap) {
		var base = tilemap.getLayer("base");

		this.grid = new TAGAlg.Grid(base.layerWidth, base.layerHeight, base);

		// generate cache of base layer tile sprites
		var cache = []
		for(var i = 0; i < base.layerHeight; ++i) {
			for(var j = 0; j < base.layerWidth; j++) {
				var node = this.grid.getNodeAt(j, i);
				if(node.exists) {
					cache.push(node);
				}
			}
		}
		this.tileCache["base"] = cache;
        
        // After grid has been generated initialise systems that operate on grid.
		TAGAlg.FOV.ShadowFOV.init(this.grid, 10, 1);
		TAGAlg.AStarSimple.init(this.grid);
        TR.lightMgr.init(this.tileCache["base"]);
        
        if(this.LightingEnabled === false) {
            TR.lightMgr.disableLighting(this.tileCache["base"]);
        }
	},
	
	testForEntityAtTile : function(tileX, tileY, setSelected) {
	    var selectedEnt = undefined;
		var i = TR.stores.plyrCount;
		
		// loop through entities testing if one exists on selected tile.
		while(i--) {
		    var ent = TR.stores.players[i];
			var tilePos = ent.getComponent('TilePosition');
			if((tileX === tilePos.x) && (tileY === tilePos.y)) {
			    // entity found.
				selectedEnt = ent;
				break;
			}
		}
		
		// Does the selection entity need updating?
		if(setSelected === true) {
            this.selectEntity(selectedEnt);
        }
        
        // Return the selected entity.
        return selectedEnt;		
	},

    selectEntity : function(selectedEnt) {	
        // Check if selection entity has been created yet.
        if(TR.selected === undefined) {
            // Create selection entity and track selected entity.
            TR.selected = createSelectionEntity(new cc.Sprite(res.selection_png),
            		                            TR.gameLayer.guiFrontPromptLayer,
                                                selectedEnt, true);
            TR.entSeleted = true;
            TR.cesWorld.addEntity(TR.selected);
        } else {
            // Get tracking component of selection entity and disable tracking
            var tracker = TR.selected.getComponent('Tracker');
        
            // If an entity has been selected start tracking it
            if(selectedEnt !== tracker.trackedEnt) {
                tracker.trackEntity(selectedEnt);
                TR.entSeleted = true;
                tracker.tracking = true;
            } else {
                tracker.clear();
                TR.entSeleted = false;
                tracker.tracking = false;
            }
        }

        // Return the selected entity.
        return selectedEnt;		
	},
	
	addPlayer : function(tileX, tileY) {
		var ent = createPlayerEntity(tileX, tileY,
				                     new cc.Sprite(res.debugPlayer_png),
				                     TR.gameLayer.spriteLayer);
		TR.cesWorld.addEntity(ent);
		TR.stores.players[TR.stores.plyrCount++] = ent;
        
        this.updateFOV();
	},
	
	debugTileInfo : function(x, y) {
	    var node = this.grid.getNodeAt(x,y);
		cc.log("Tile (" + x + "," + y + "):");
		cc.log("    Exists   = " + node.exists);
		cc.log("    Walkable = " + node.walkable);
	}
}
