var PositionController = TAGCes.System.extend({
    init : function() {
	    this.usesComponents(['WorldPosition', 'TilePosition', 'View']);
	},
	
    addedToWorld : function(world) {
	    this._super(world);
		
		// Add entity added listener
		this.family.entityAdded.add(this, this.entityAddedToFamily);
	},
	
	entityAddedToFamily : function(ent) {
	    var wPos = ent.getComponent('WorldPosition');
	    var tPos = ent.getComponent('TilePosition');
		var view = ent.getComponent('View');
	    
	    var tileSize = TR.gameLayer.tileMap.getTileSize();	
		var mapSize = TR.gameLayer.tileMap.getMapSize();

		wPos.x = (tPos.targetX * tileSize.width) + (tileSize.width/2);
		wPos.y = ((mapSize.height * tileSize.height) - (tPos.targetY * tileSize.height)) - (tileSize.height/2);

		tPos.dirty = false;
	},
	
	update : function(dt) {
	    var list = this.family.getEntityList();
	    if(list.length === 0) {
	    	return;
	    }
		var wPos, tPos, view;
		
	    var tileSize = null;
        var tileWidth;
        var tileHeight;
        var halfTileWidth;
        var halfTileHeight;
		var mapSize = null;
		var mapHeight = 0;	
		
		for(var ent = list.start(); ent !== null; ent = list.next()) {
	        tPos = ent.getComponent('TilePosition');
			if(tPos.dirty) {
			    if(tileSize === null) {
	                tileSize = TR.gameLayer.tileMap.getTileSize();	
                    tileWidth = tileSize.width;
                    halfTileWidth = (tileWidth / 2) | 0;
                    tileHeight = tileSize.height;
                    halfTileHeight = (tileHeight / 2) | 0;
		            mapSize = TR.gameLayer.tileMap.getMapSize();
					mapHeight = (mapSize.height * tileSize.height);
				}
				
			    wPos = ent.getComponent('WorldPosition');
			    view = ent.getComponent('View');
			    
			    cc.log("Moving from (" + wPos.x + "," + wPos.y + ")");
		
	    	    wPos.x = (tPos.targetX * tileWidth) + halfTileWidth;
		        wPos.y = (mapHeight - (tPos.targetY * tileHeight)) - halfTileHeight;

		        cc.log("Moving to (" + wPos.x + "," + wPos.y + ")");
		        
				tPos.dirty = false;
				tPos.x = tPos.targetX;
				tPos.y = tPos.targetY;
				
				TR.levelMgr.updateFOV();
			}
		}
	}
});