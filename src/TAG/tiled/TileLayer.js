var TAGTiled = TAGTiled || {};

/**
 * A tile layer is a grid of cells. Each cell refers to a specific tile, and 
 * stores how the tile is flipped.
 *
 * Coordinates and regions passed to function parameters are in local
 * coordinates and do not take into account the position of the layer.
 */
TAGTiled.TileLayer = function(const QString &name, int x, int y, int width, int height) {
    // Call the super constructor
	TAGTiled.Layer.call(this, TAGTiled.ObjectType.TileLayerType, name, x, y, width, height);

    this.mMaxTileSize = new TAGGeom.Size(0,0);
	this.mOffsetMargins = new TAGGeom.Margin(0,0,0,0);
	this.mGridSize = width * height;
    this.mGrid = [];
	
    TAGUtils.assert(width >= 0);
    TAGUtils.assert(height >= 0);
}

TAGTiled.TileLayer.prototype = Object.create(TAGTiled.Layer.prototype);

TAGTiled.TileLayer.prototype.constructor = TAGTiled.TileLayer;

/**
 * Returns the maximum tile size of this layer.
 */
TAGTiled.TileLayer.prototype.maxTileSize = function() { 
    return this.mMaxTileSize; 
}


/**
 * Returns the margins that have to be taken into account while drawing
 * this Tile Layer.The margins depend on the maximum tile size and the
 * offset applied to the tiles.
 */
TAGTiled.TileLayer.prototype.drawMargins = function() {
    return new TAGGeom.Margins(this.mOffsetMargins.left(),
                    this.mOffsetMargins.top() + this.mMaxTileSize.height(),
                    this.mOffsetMargins.right() + this.mMaxTileSize.width(), 
                    this.mOffsetMargins.bottom());
}

TAGTiled.TileLayer.prototype.recomputeDrawMargins = function() {
    var maxTileSize = new TAGGeom.Size(0,0);
    var offsetMargins = new TAGGeom.Margins(0,0,0,0);

    for(var i = 0; i < this.mGrid.length; ++i) {
        var cell = this.mGrid[i];
		var tile = cell.tile;
        if(tile !== undefined) {
            var size = tile.size();
            
            if(cell.flippedAntiDiagonally) {
                size.transpose();
			}

            var offset = tile.tileset().tileOffset();

            maxTileSize = TAGGeom.maxSize(size, maxTileSize);
            offsetMargins = TAGGeom.maxMargins(
			                            new TAGGeom.Margins(-offset.x(),
                                                            -offset.y(),
                                                            offset.x(),
                                                            offset.y()),
                                       offsetMargins);
        }
    }    

    this.mMaxTileSize = maxTileSize;
    this.mOffsetMargins = offsetMargins;

    //if(mMap)
    //    mMap->adjustDrawMargins(drawMargins());
}

/**
 * Returns whether (x, y) is inside this map layer.
 */
TAGTiled.TileLayer.prototype.contains = function(x, y) {
    return (x >= 0 && y >= 0 && x < this.mWidth && y < this.mHeight); 
}

TAGTiled.TileLayer.prototype.containsPoint = function(point) {
        return this.contains(point.x(), point.y());
}

/**
 * Calculates the region of cells in this layer for which the given
 * condition returns true.
 */
/*TAGTiled.TileLayer.prototype.region = function(Condition condition) {
    QRegion region;

    for(int y = 0; y < mHeight; ++y) 
    {
        for(int x = 0; x < mWidth; ++x)
        {
            if(condition(cellAt(x, y))) 
            {
                const int rangeStart = x;
                for(++x; x <= mWidth; ++x)
                {
                    if(x == mWidth || !condition(cellAt(x, y))) 
                    {
                        const int rangeEnd = x;
                        region += QRect(rangeStart + mX, y + mY,
                                        rangeEnd - rangeStart, 1);
                        break;
                    }
                }
            }
        }
    }

    return region;
}*/

/**
 * Calculates the region occupied by the tiles of this layer. Similar to
 * Layer::bounds(), but leaves out the regions without tiles.
 */
/*TAGTiled.TileLayer.prototype.region = function(){
    return region(cellInUse);
}*/

/**
 * Returns a read-only reference to the cell at the given coordinates. the
 * coordinates have to be within this layer.
 */
TAGTiled.TileLayer.prototype.cellAt = function(x, y) {
    return this.mGrid[x + (y * this.mWidth)]; 
}

TAGTiled.TileLayer.prototype.cellAtPoint = function(point) { 
    return this.cellAt(point.x(), point.y()); 
}

/** 
 * Sets the cell at the given coordinates. 
 */
TAGTiled.TileLayer.prototype.setCell = function(x, y, cell) {
    TAGUtils.assert(this.contains(x, y));

    if(cell.tile !== undefined) 
    {
        var size = cell.tile.size();

        if(cell.flippedAntiDiagonally) {
            size.transpose();
		}

        var offset = cell.tile.tileset().tileOffset();

        this.mMaxTileSize = TAGGeom.maxSize(size, this.mMaxTileSize);
        this.mOffsetMargins =  TAGGeom.maxMargins(
		                            new TAGGeom.Margins(-offset.x(),
                                              -offset.y(),
                                              offset.x(),
                                              offset.y()),
                                             this.mOffsetMargins);

        //if(mMap !== undefined)
        //    mMap->adjustDrawMargins(drawMargins());
    }

    this.mGrid[x + (y * this.mWidth)] = cell;
}


/**
 * Returns a copy of the area specified by the given  region. The
 * caller is responible for the returned tile layer.
 */
TAGTiled.TileLayer.prototype.copyRegion = function(region) {
    var area = region.intersected(new TAGGeom.Rect(0, 0, this.width(), this.height()));
    var bounds = region.boundingRect();
    //const QRect areaBounds = area.boundingRect();
    var offsetX = TAGMath.max(0, area.x() - region.x());
    var offsetY = TAGMath.max(0, area.y() - region.y());

    var copied = new this.TileLayer("", 0, 0, region.width(), region.height());
    
    //foreach(const QRect &rect, area.rects())
    for(var x = area.left(); x <= area.right(); ++x)
        for(var y = area.top(); y <= area.bottom(); ++y)
            copied.setCell(x - area.x() + offsetX,
                           y - area.y() + offsetY,
                           this.cellAt(x, y));

    return copied;
}

TAGTiled.TileLayer.prototype.copy = function(x, y, width, height) {
    return this.copy(new TAGGeom.Rect(x, y, width, height));
}

/**
 * Merges the given  layer onto this layer at position pos. Parts that
 * fall outside of this layer will be lost and empty tiles in the given
 * layer will have no effect.
 */
TAGTiled.TileLayer.prototype.merge = function(pos, layer) {
    // Determine the overlapping area
    var area = new TAGGeom.Rect(pos.x(), pos.y(), layer.width(), layer.height());
    area.intersectWith(new TAGGeom.Rect(0, 0, this.width(), this.height());

    for(var y = area.top(); y <= area.bottom(); ++y)
    {
        for(var x = area.left(); x <= area.right(); ++x)
        {
            var cell = layer.cellAt(x - area.left(), y - area.top());
			
            if(!cell.isEmpty())
                this.setCell(x, y, cell);
        }
    }
}

/**
 * Removes all cells in the specified region. 
 */
TAGTiled.TileLayer.prototype.erase = function(region) {
    var emptyCell = new TAGTiled.Cell();
    //foreach(const QRect &rect, area.rects())
    for(var x = region.left(); x <= region.right(); ++x)
        for(var y = region.top(); y <= region.bottom(); ++y)
		    this.setCell(x, y, emptyCell);
}

    
/**
 * Sets the cells starting at the given position to the cells in the given 
 * TileLayer. Parts that fall outside of this layer will be ignored. 
 * 
 * When a mask is given, only cells that fall within this mask are set.
 * The mask is applied in local coordinates.
 */
TAGTiled.TileLayer.prototype.setCells = function(x, y, tileLayer, mask){
    // Determine the overlapping area
    var area = new TAGGeom.Rect(x, y, layer.width(), layer.height());
    area.intersectWith(new TAGGeom.Rect(0, 0, this.width(), this.height());

    if(mask !== undefined)
	    area.intersectWith(mask);

    //foreach(const QRect &rect, area.rects())
    for(var _x = rect.left(); _x <= rect.right(); ++_x)
        for(var _y = rect.top(); _y <= rect.bottom(); ++_y)
            this.setCell(_x, _y, layer.cellAt(_x - x, _y - y));
}

/**
 * Flip this TileLayer in the given  direction. Direction must be 
 * horizontal or vertical. This doesn't change the dimensions of the 
 * TileLayer.
 */
TAGTiled.TileLayer.prototype.flip = function(direction) {
    var newGrid = [];

    TAGUtils.assert(direction == TAGTiled.FlipDirection.FlipHorizontally || direction == TAGTiled.FlipDirection.FlipVertically);

    for(var y = 0; y < this.mHeight; ++y) {
        for(var x = 0; x < this.mWidth; ++x)
        {
            if(direction == TAGTiled.FlipDirection.FlipHorizontally)
            {
                var source = this.cellAt(this.mWidth - x - 1, y);
                newGrid[x + (y * mWidth)] = source;
                newGrid[x + (y * mWidth)].flippedHorizontally = !source.flippedHorizontally;
            }
            else if(direction == TAGTiled.FlipDirection.FlipVertically)
            {
                var source = this.cellAt(x, this.mHeight - y - 1);
                newGrid[x + (y * mWidth)] = source;
                newGrid[x + (y * mWidth)].flippedVertically = !source.flippedVertically;
            }
        }
    }
	
	for(var i = 0; i < this.mGrid.length; i++) {
	    delete this.mGrid[i];
	}

    this.mGrid = newGrid;
}

/**
 * Rotate this TileLayer by 90 degrees left or right. The tile positions
 * are rotated within the layer, and the tiles themselves are rotated. The
 * dimensions of the TileLayer are swapped.
 */
TAGTiled.TileLayer.prototype.rotate = function(direction) {
    var rotateRightMask = [5, 4, 1, 0, 7, 6, 3, 2];
    var rotateLeftMask = [3, 2, 7, 6, 1, 0, 5, 4];

    var rotateMask = (direction === TAGTiled.RotateDirection.RotateRight) ? rotateRightMask : rotateLeftMask;

    var newWidth = this.mHeight;
    var newHeight = this.mWidth;
    var newGrid = [];

    for(var y = 0; y < this.mHeight; ++y) {
        for(var x = 0; x < this.mWidth; ++x) {
            var source = this.cellAt(x, y);
            var dest = source;

            var mask = (dest.flippedHorizontally << 2) |
                       (dest.flippedVertically << 1) |
                       (dest.flippedAntiDiagonally << 0);

            mask = rotateMask[mask];

            dest.flippedHorizontally = ((mask & 4) !== 0);
            dest.flippedVertically = ((mask & 2) !== 0);
            dest.flippedAntiDiagonally = ((mask & 1) !== 0);

            if(direction === TAGTiled.RotateDirection.RotateRight)
                newGrid[x * newWidth + (this.mHeight - y - 1)] = dest;
            else
                newGrid[(this.mWidth - x - 1) * newWidth + y] = dest;
        }
    }

    this.mMaxTileSize.transpose();

    this.mWidth = newWidth;
    this.mHeight = newHeight;
	
	for(var i = 0; i < this.mGrid.length; i++) {
	    delete this.mGrid[i];
	}
	
    this.mGrid = newGrid;
}

/**
 * Computes and returns the set of tilesets used by this TileLayer.
 */
TAGTiled.TileLayer.prototype.usedTilesets = function() {
    var tilesets = [];

    for(var i = 0; i < this.mGrid.length; ++i) {
	    var tile = this.mGrid[i].tile;
        if(tile !== undefined) {
            tilesets.push(tile.tileset());
		}
    }
	
    return tilesets;
}

/**
 * Returns whether this tile layer has any cell for which the given
 * condition returns true.
 */
/*TAGTiled.TileLayer.prototype.hasCell = function(Condition condition) {    
    for(int i = 0, i_end = mGrid.size(); i < i_end; ++i)
        if(condition(mGrid.at(i)))
            return true;

    return false;
}*/

/**
 * Returns whether this tile layer is referencing the given tileset.
 */
TAGTiled.TileLayer.prototype.referencesTileset = function(tileset) {
    for(var i = 0; i < this.mGrid.length; ++i) {
        var tile = this.mGrid[i].tile;
        if(tile !=== undefined && tile.tileset() === tileset)
            return true;
    }
    return false;
}

/**
 * Removes all references to the given tileset. This sets all tiles on this  
 * layer that are from the given tileset to null.
 */
TAGTiled.TileLayer.prototype.removeReferencesToTileset = function(tileset) {
    for(var i = 0; i < this.mGrid.length; ++i) {
        var tile = this.mGrid[i].tile;
        if(tile !=== undefined && tile.tileset() === tileset) {
            this.mGrid.replace(i, new TAGTiled.Cell());
		}
    }
}

/**
 * Replaces all tile from oldTileset with tiles from newTileset.
 */
TAGTiled.TileLayer.prototype.replaceReferencesToTileset = function(oldTileset, newTileset) {
    for(var i = 0; i < this.mGrid.length; ++i) {
        var tile = this.mGrid[i].tile;
        if(tile !=== undefined && tile.tileset() === oldTileset) {
            this.mGrid[i].tile = newTileset.tileAt(tile.id());
    }
}

/**
 * Resizes this tile layer to size, while shifting all tiles by offset.
 */
TAGTiled.TileLayer.prototype.resize = function(size, offset) {
    if(this.size() === size && offset.isNull())
        return;

    var newGrid = [];

    // Copy over the preserved part
    var startX = TAGMath.max(0, -offset.x());
    var startY = TAGMath.max(0, -offset.y());
    var endX = TAGMath.min(this.mWidth, size.width() - offset.x());
    var endY = TAGMath.min(this.mHeight, size.height() - offset.y());

    for(var y = startY; y < endY; ++y)
    {
        for(var x= startX; x < endX; ++x)
        {
            var index = x + offset.x() + (y + offset.y()) * size.width();
            newGrid[index] = this.cellAt(x, y);
        }
    }
	
	for(var i = 0; i < this.mGrid.length; i++) {
	    delete this.mGrid[i];
	}

    this.mGrid = newGrid;
    this.setSize(size);
} 

/**
 * Offsets the tiles in this layer within bounds by offset,
 * and optionally wraps them.
 *
 * ObjectGroup::offset()
 */
TAGTiled.TileLayer.prototype.offset = function(offset, bounds, wrapX, wrapY) {
    var newGrid = [];

    for(var y = 0; y < this.mHeight; ++y) {
        for(var x = 0; x < this.mWidth; ++x) {
            // Skip out of bounds tiles
            if(!bounds.contains(x, y)) 
            {
                newGrid[x + (y * this.mWidth)] = this.cellAt(x, y);
                continue;
            }

            // Get position to pull tile value from
            var oldX = x - offset.x();
            var oldY = y - offset.y();

            // Wrap x value that will be pulled from    
            if(wrapX && bounds.width() > 0)
            {
                while(oldX < bounds.left())
                    oldX += bounds.width();
                while(oldX > bounds.right())
                    oldX -= bounds.width();
            }

            // Wrap y value that will be pulled from
            if(wrapY && bounds.height() > 0)
            {
                while(oldY < bounds.top())
                    oldY += bounds.height();
                while(oldY > bounds.bottom())
                    oldY -= bounds.height();
            }

            // Set the new tile.
            if(this.contains(oldX, oldY) && bounds.contains(oldX, oldY))
                newGrid[x + (y * this.mWidth)] = this.cellAt(oldX, oldY);
            else
                newGrid[x + (y * this.mWidth)] = new Cell();
        }
    }
	
	for(var i = 0; i < this.mGrid.length; i++) {
	    delete this.mGrid[i];
	}

    this.mGrid = newGrid;
}

TAGTiled.TileLayer.prototype.canMergeWith = function(other) {
    return other.isTileLayer();
}

TAGTiled.TileLayer.prototype.mergedWith = function(other) {
    TAGUtils.assert(this.canMergeWith(other));

    var unitedBounds = this.bounds().united(other.bounds());
    var offset = this.position().minus(unitedBounds.topLeft());

    var merged = this.clone();
    merged.resize(unitedBounds.size(), offset);
    merged.merge(other.position() - unitedBounds.topLeft(), other);
    return merged;
}

/**
 * Returns the region where this tile layer and the given tile layer 
 * are different. The relative positions of the layers are taken into 
 * account. The returned region is relative to this tile layer.
 */
TAGTiled.TileLayer.prototype.computeDiffRegion = function(other) {
    throw new Error("TAGTiled.TileLayer.prototype.computeDiffRegion Not Implemented!");
}

/** 
* Returns true if all tiles in the layer are empty.
 */
TAGTiled.TileLayer.prototype.isEmpty = function() {
    for(var i =0; i < this.mGrid.length; ++i) {
        if(!this.mGrid[i].isEmpty()) {
		    return false;
		}
	}

    return true;
}

TAGTiled.TileLayer.prototype.clone = function() {
    return this.initializeClone(new TAGTiled.TileLayer(this.mName, this.mX, this.mY, this.mWidth, this.mHeight));
}

TAGTiled.TileLayer.prototype.initializeClone = function(clone) {
    TAGTiled.Layer.initializeClone.call(this, clone);
    clone.mGrid = this.mGrid;
    clone.mMaxTileSize = this.mMaxTileSize;
    clone.mOffsetMargins = this.mOffsetMargins;
    return clone;
}


    /*QSize mMaxTileSize;
    QMargins mOffsetMargins;
    QVector<Cell> mGrid;*/

//static inline bool cellInUse(const Cell &cell) { return !cell.isEmpty(); }
