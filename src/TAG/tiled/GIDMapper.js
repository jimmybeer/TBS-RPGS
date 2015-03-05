var TAGTiled = TAGTiled || {};

TAGTiled.GID = {
    FlippedHorizontallyFlag : 0x80000000,
	FlippedVerticallyFlag : 0x40000000,
	FlippedAntiDiagonallyFlag : 0x20000000
};

TAGTiled.GIDMapper = function() {
};

TAGTiled.GIDMapper.prototype = {	
    mFirstGidToTileset : {},
	mTilesetColumnCounts : {},
	
    create:function(tilesets) {
        var firstGid = 1;
        for(var ts in tilesets)
        {
            this.insert(firstGid, ts);
            firstGid += ts.tileCount();
        }
    },
	
	insert:function(firstGid, tileset) { 
	    this.mFirstGidToTileset[firstGid] = tileset; 
	},
	
	clear:function() { 
	    Object.keys(this.mFirstGidToTileset).forEach(function(k) {
		    delete this.mFirstGidToTileset[k];
        });			
	},
	
	isEmpty:function() {
	    for(var ts in this.mFirstGidToTileset) {
		    return false;
		}
		return true;
	}
	
	gidToCell:function(gid, ok) {
        var result = new Cell();

        // Read out the flags.
        result.flippedHorizontally = (gid & TAGTiled.GID.FlippedHorizontallyFlag);
        result.flippedVertically = (gid & TAGTiled.GID.FlippedVerticallyFlag);
        result.flippedAntiDiagonally = (gid & TAGTiled.GID.FlippedAntiDiagonallyFlag);

        // Clear the flags
        gid &= ~(TAGTiled.GID.FlippedHorizontallyFlag |
                 TAGTiled.GID.FlippedVerticallyFlag |
                 TAGTiled.GID.FlippedAntiDiagonallyFlag);

        if(gid == 0) 
        {
            ok = true;
        }
        else if(isEmpty())
        {
            ok = false;
        }
        else
        {
            // Find the tileset containing this tile
	    	var keys = Object.keys(this.mFirstGidToTileset);
	    	var tileId;
		    var tileset;
		    for(var i = keys.length - 1; i >= 0; i--) {
		        if(i <= gid) {
			        tileId = gid - i;
			        tileset = this.mFirstGidToTileset[i];
			    	break;
			    }
		    }

            if(tileset !== undefined) 
            {
                var columnCount = this.mTilesetColumnCounts[tileset];
                if(columnCount > 0 && columnCount != tileset.columnCount())
                {
                    // Correct tile index for changes in image width.
                    var row = tileId / columnCount;
                    var column = tileId % columnCount;
                    tileId = row * tileset.columnCount() + column;
                }  

                result.tile = tileset.tileAt(tileId);
            }
            else
            {
                 result.tile = 0;
            }
    
            ok = true;
        } 

        return result;
    },
	
	cellToGid:function(cell) {
        if(cell.isEmpty())
            return 0;

        var tileset = cell.tile.tileset(); 
	    	

        // Find the first GID for the tileset.
	    var keys = Object.keys(this.mFirstGidToTileset);
	    var key;
	    for(var k in keys) {
	        if(tilset === this.mFirstGidToTileset(key)) {
		        key = k
    		    break;
		    }
	    }

        if(key === undefined) { // tileset not found
            return 0;
		}

        var gid = key + cell.tile.id();
        if(cell.flippedHorizontally)
        {
            gid |= TAGTiled.GID.FlippedHorizontallyFlag;
        }
        if(cell.flippedVertically)
        {
            gid |= TAGTiled.GID.FlippedVerticallyFlag;
        }
        if(cell.flippedAntiDiagonally)
        {
            gid |= TAGTiled.GID.FlippedAntiDiagonallyFlag;
        }

        return gid;
    },
	
	setTilesetWidth:function(tileset, width) {
        if(tileset.tileWidth() == 0)
            return;

        this.mTilesetColumnCounts[tileset] = tileset.columnCountForWidth(width);
    }
};