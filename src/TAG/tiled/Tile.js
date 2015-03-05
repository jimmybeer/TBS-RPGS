var TAGTiled = TAGTiled || {};

/** 
 * A single frame of an animated tile.
 */
TAGTiled.Frame = function() {
    this.tileId = 0;
    this.duration = 0;
};

TAGTiled.Tile = function(id, tileset, width, height) {
    // Call the super constructor
	TAGTiled.ObjectType.call(this, TAGTiled.ObjectType.TileType);
	this.mId = id;
	this.mTileset = tileset;
	this.mWidth = width;
	this.mHeight = height;
	this.mObjectGroup = undefined;
	this.mCurrentFrameIndex = 0;
	this.mUnusedTime = 0;
}

TAGTiled.Tile.prototype = Object.create(TAGTiled.TileObject.prototype);

TAGTiled.Tile.prototype.constructor = TAGTiled.Tile;

TAGTiled.Tile.prototype.destroy = function() {
    if(this.mObjectGroup !== undefined) {
    	this.mObjectGroup.destroy();
	    delete this.mObjectGroup;
	}
};

/**
 * Returns ID of this tile within its tileset.
 */
TAGTiled.Tile.prototype.id = function() { 
	return this.mId; 
};

/**
 * Return the tileset that this tile is part of.
 */
TAGTiled.Tile.prototype.tileset = function() { 
	return this.mTileset;
};
    
/**
 * Returns the file name of the external image that represents this tile.
 * When this tile doesn't refer to an external image, an empty string is 
 * returned.
 */
TAGTiled.Tile.prototype.imageSource = function() { 
	return this.mImageSource;
};

TAGTiled.Tile.prototype.setImageSource = function(imageSource) {
    this.mImageSource = imageSource;
};

/**
 * Returns the width of this tile.
  */
TAGTiled.Tile.prototype.width = function() { 
	return this.mWidth; 
};
   
/**
 * Returns the height of this tile.
 */
TAGTiled.Tile.prototype.height = function() { 
	return this.mHeight; 
};

/**
 *Returns the size of this tile.
 */
TAGTiled.Tile.prototype.size = function() { 
    return new TAGGeom.Size(this.mWidth, this.mHeight); 
};

/**
 * return The group of objects associated with this tile. This is generally
 *         expected to be used for editing collision shapes.
 */
TAGTiled.Tile.prototype.objectGroup = function() {
    return this.mObjectGroup;
};

/**
 * Sets  objectGroup to be the group associated with this tile.
 * The Tile takes ownership over the ObjectGroup and it can't also be part of
 * a map.
 */
TAGTiled.Tile.prototype.setObjectGroup = function(objectGroup) {
    TAGUtils.assert(objectGroup !== undefined && objectGroup.map() === undefined);

    if(this.mObjectGroup === objectGroup) {
        return;
    }

	if(this.ObjectGroup !== undefined) {
    	this.mObjectGroup.destroy();
	    delete this.mObjectGroup;
	}
    this.mObjectGroup = objectGroup;
};

/** 
 *Swaps the object group of this tile with objectGroup. The tile releases
 * ownership over its existing object group and takes ownership over the new one.
 *
 * return The previous object group referenced by this tile.
 */
TAGTiled.Tile.prototype.swapObjectGroup = function(objectGroup) {
    var previousObjectGroup = this.mObjectGroup;
    this.mObjectGroup = objectGroup;
    return previousObjectGroup;
};

TAGTiled.Tile.prototype.frames = function() {
    return this.mFrames;
};
	
/**
 * Sets the animation frames to be used by this tile. Resets any currently 
 * running animation.
 */
TAGTiled.Tile.prototype.setFrames = function(frames) {
    this.mFrames = frames;
    this.mCurrentFrameIndex = 0;
    this.mUnusedTime = 0;
};
    
TAGTiled.Tile.prototype.isAnimated = function() {
    return (this.mFrames !== undefined && this.mFrames.length > 0);
};
	
TAGTiled.Tile.prototype.currentFrameIndex = function() {
    return this.mCurrentFrameIndex;
};
	
/**
 * Advances this tile animation by the given amount of milliseconds. Returns
 * whether this caused the current tileId to change.
 */
TAGTiled.Tile.prototype.advanceAnimation = function(ms) {
    if(!this.isAnimated()) {
        return false;
    }
    this.mUnusedTime += ms;

    var frame = this.mFrames[mCurrentFrameIndex];
    var previousTileId = frame.tileId;
 
    while(frame.duration > 0 && this.mUnusedTime > frame.duration) 
    {
        this.mUnusedTime -= frame.duration;
        this.mCurrentFrameIndex = (this.mCurrentFrameIndex + 1) % this.mFrames.length();

        frame = this.mFrames[mCurrentFrameIndex];
    }
  
    return (previousTileId !== frame.tileId);
};

    /*mId = undefined;
    mTileset : undefined,
    mWidth : undefined,
	mHeight : undefined,
    mImageSource : undefined,
    mObjectGroup : undefined,

    mFrames : undefined,
    mCurrentFrameIndex : undefined,
    mUnusedTime : undefined*/