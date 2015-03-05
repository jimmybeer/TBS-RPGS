var TAGTiled = TAGTiled || {};
/**
 * Objects within an object group can either be drawn top down (sorted
 * by their y-coordinate) or by index (manual stacking order).
 *
 * The default is top down.
 */
TAGTiled.DrawOrder = {
    UnknownOrder : -1,
    TopDownOrder : 0,
    IndexOrder : 1,

/**
 * Helper function that converts a drawing order to its string value. Useful
 * for map writers.
 *
 * eeturn The draw order as a lowercase string.
 */
	ToString : function(drawOrder) {
        switch(drawOrder)
        {
            default:
		    case this.UnknownOrder:
                return 'unknown';
            break;
            case this.TopDownOrder:
                return 'topdown';
            break;
            case this.IndexOrder:
                return 'index';
            break;
        }
	},
	
/**
 * Helper function that converts a string to a drawing order enumerator.
 * useful for map readers.
 *
 * return The draw order matching the give string, or
 *         ObjectGroup::UnknownOrder if the string is unrecognised.
 *
 */
	FromString : function(order) {
        var drawOrder = this.UnknownOrder;

        if(order === 'topdown')
            drawOrder = this.TopDownOrder;
        else if(order === 'index')
            drawOrder = this.IndexOrder;

        return drawOrder;
	}
};
	
/**
 * A Object Group[layer.
 */
 /**
 * Constructor
 */
 TAGTiled.ObjectGroup = function(name, x, y, width, height) {
    // Call the super constructor
	TAGTiled.Layer.call(this, TAGTiled.ObjectType.ObjectGroupType, name, x, y, width, height);
    this.mDrawOrder =  TAGTiled.DrawOrder.TopDownOrder;
	this.mObjects = [];
    this.mColor = undefined;
}

TAGTiled.ObjectGroup.prototype = Object.create(TAGTiled.Layer.prototype);

TAGTiled.ObjectGroup.prototype.constructor = TAGTiled.ObjectGroup;

/**
 * Destructor.
 */
TAGTiled.ObjectGroup.prototype.destroy = function() {
    while(this.mObjects.length > 0) {
	    var o = this.mObjects.pop());
		o.destroy();
		delete o;
	}
}

/**
 * Returns a pointer to the List of objects in this object group.
 */
TAGTiled.ObjectGroup.prototype.objects = function()  { 
    return this.mObjects; 
}

/** 
 * Returns the number of objects in this object group.
 */
TAGTiled.ObjectGroup.prototype.objectCount = function()  { 
    return this.mObjects.length; 
}

/**
 * Returns the object at the specific index.
 */
TAGTiled.ObjectGroup.prototype.objectAt = function(index) { 
    return this.mObjects[index]; 
}

/**
 * Adds an object to this object group.    
 */
TAGTiled.ObjectGroup.prototype.addObject = function(object) {
    this.mObjects.push(object);
	object.setObjectGroup(this);
}

/**
 * Inserts an object at the specified index. This is only used for undoing
 * the removal of an object at the moment, to make sure not to change the 
 * saved order of the objects.
 */
TAGTiled.ObjectGroup.prototype.insertObject = function(index, object) {
    this.mObjects.splice(index, 0, object);
	object.setObjectGroup(this);
}
  
/**
 * Removes an object from this object group. Ownership of the object is
 * transferred to the caller.
 *
 * return the index at which the specified object was removed
 */
TAGTiled.ObjectGroup.prototype.removeObject = function(object) {
    for(var i = 0; i < this.mObjects.length; ++i) {
	    if(this.mObjects[i] === object) {
		    this.mObjects[i].setObjectGroup(undefined);
		    this.mObjects.splice(i,1);
			return i;
		}
	}
	return -1;
}

/**
 * Removes an object at the given index. Ownership of the object is
 * transferred to the caller.
 *
 * This is faster than removeObject when you've already got the index.
 *
 * param index the index at which to remove an object
 */
TAGTiled.ObjectGroup.prototype.removeObjectAt = function(index) {
    this.mObjects[index].setObjectGroup(undefined);
    this.mObjects.splice(index,1);
}
    

/** 
 * Moves count objects starting at from to the index given by to.
 *
 * The to index may not lie within the range of objects that is 
 * being moved.
 */
TAGTiled.ObjectGroup.prototype.moveObjects = function(from, to, count) {
    // It's an error when 'to' lies within the moving range of objects.
    TAGUtils.assert(count >= 0);
    TAGUtils.assert(to <= from || to >= from + count);

    // Nothing to be done when 'to' is the start or the end of the range, or 
    // when the number of objects to be moved is 0.
    if(to === from || to === (from + count) || count === 0)
        return;

    var moved = this.mObjects.splice(from, count);
	
	if(to > from) to -= count;
	
	for(var i = 0; i < moved.length; ++i) {
	    this.mObjects.splice(to + i, 0, moved[i]);
	}
}

/** 
 * Returns the bounding rect around all objects in this group.
 */
TAGTiled.ObjectGroup.prototype.objectsBoundingRect = function() {
    var boundingRect = new TAGGeom.Rect(0,0,0,0);
	
    for(var i = 0, i < this.mObjects.length; ++i) {
        boundingRect = boundingRect.united(this.mObjects[i].bounds());
	}
    return boundingRect;
}

/**
 * Return whether this object group contains any objects.
 */
TAGTiled.ObjectGroup.prototype.isEmpty = function() {
    return (this.mObjects.length === 0);
}

/**
  * Computes and returns the set of tilesets used by this object group.
  */
TAGTiled.ObjectGroup.prototype.usedTilesets = function() {
    var tilesets = [];

    for(var i = 0; i < this.mObjects.length; ++i) {
	    var tile = this.mObjects[i].cell().tile;
		
        if(tile !== undefined) {
            tilesets.push(tile.tileset());
		}
	}

    return tilesets;

/**
 * Returns whether any tile objects in this group reference tiles
 * in the given tileset.
 */
TAGTiled.ObjectGroup.prototype.referencesTileset = function(tileset) {
    for(var i = 0; i < this.mObjects.length; ++i) {
	    var tile = this.mObjects[i].cell().tile;
		
        if(tile !== undefined && tile.tileset() === tileset) {
            return true;
		}
    }

    return false;
}

/**
 * Replaces all references to tiles from oldTileset with tiles from
 * newTileset.
 */
TAGTiled.ObjectGroup.prototype.replaceReferencesToTileset = function(oldTileset, newTileset) {
    for(var i = 0; i < this.mObjects.length; i++) {
	    var cell = this.mObjects[i].cell();
		var tile = cell.tile;
		
		if(tile !== undefined && tile.tileset() === oldTileset) {
            cell.tile = newTileset.tileAt(tile.id());
            this.mObjects[i].setCell(cell);
        }
    }
}

/**
 * Offsets all object within the group by the offset given in pixel
 * coordinates, and optionally wraps them. the object's center must be
 * within bounds, and wrapping occurs if the displaced center is out of
* the bounds.
*
* TileLayer::offset()
 */
TAGTiled.ObjectGroup.prototype.offset = function(offset, bounds, wrapX, wrapY) {
    for(var i = 0; i < this.mObjects.length; ++i) {
	    var object = this.mObjects[i];
        var objectCenter = object.bounds().center();
		
        if(!bounds.contains(objectCenter))
            continue;

        var newCenter = objectCenter.plus(offset);

        if(wrapX && bounds.width() > 0)
        {
		    var nx = (newCenter.x() - bounds.left()) % bounds.width();
			newCenter.setX(bounds.left() + (nx < 0 : bounds.width() + nx : nx));
        }

        if(wrapY && bounds.height() > 0)
        {
            var ny = (newCenter.y() - bounds.top()) % bounds.height();
            newCenter.setY(bounds.top() + (ny < 0 ? bounds.height() + ny : ny));
        }

        object.setPosition(object.position().plus(newCenter.minus(objectCenter)));
    }
}

TAGTiled.ObjectGroup.prototype.canMergeWith = function(other) {
    return other.isObjectLayer();
}
	
TAGTiled.ObjectGroup.prototype.mergedWith = function(other) {
    TAGUtils.assert(this.canMergeWith(other));

    var merged = this.clone();
	var otherObjs = other.objects();
		
	for(var i = 0; i < otherObjs.length; ++i) {
        merged.addObject(otherObjs[i].clone());
	}
    return merged;
}

/**
 * Returns the color of the object group, or an invalid color if no color
 * is set.
 */
TAGTiled.ObjectGroup.prototype.color = function() {
    return this.mColor;
}

/**
 * Sets the display color of the object group.
 */
TAGTiled.ObjectGroup.prototype.setColor = function(color) {
    this.mColor = Color;
}

/**
 * Returns the draw order for the objects in this group.
 *
 * ObjectGroup::DrawOrder
 */
TAGTiled.ObjectGroup.prototype.drawOrder = function(color) {
    return this.mDrawOrder;
}

TAGTiled.ObjectGroup.prototype.setDrawOrder = function(drawOrder) {
    this.mDrawOrder = drawOrder;
}
/**

 * Returns a duplicate of this ObjectGroup.
 *
 *  Layer::clone()
 */
TAGTiled.ObjectGroup.prototype.clone = function() {
    return this.initializeClone(new ObjectGroup(this.mName, this.mX, this.mY, this.mWidth, this.mHeight));
}

TAGTiled.ObjectGroup.prototype.initializeClone = function(clone) {
    TAGTiled.Layer.initializeClone.call(this, clone);
	
	for(var i = 0; i < this.mObjects.length; ++i) {
	    clone.addObject(this.mObjects[i].clone());
	}
    clone.setColor(this.mColor);
    clone.setDrawOrder(this.mDrawOrder);
    return clone;
}