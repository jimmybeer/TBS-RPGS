var TAGTiled = TAGTiled || {};

TAGTiled.TypeFlag = {
    TileLayerType   : 0x01,
    ObjectGroupType : 0x02
};

TAGTiled.AnyLayerType = 0xFF;
/**
 * A map layer.
 */
 /**
 * Constructor
 */
 TAGTiled.Layer = function(type, name, x, y, width, height) {
    // Call the super constructor
	TAGTiled.ObjectType.call(this, TAGTiled.ObjectType.LayerType);
    this.mName = name;
    this.mLayerType = type;
    this.mX = x;
    this.mY = y;
    this.mWidth = width;
    this.mHeight = height;
    this.mOpacity = 1.0;
	this.mVisible = true;
    this.mMap = undefined;
}

TAGTiled.Layer.prototype = Object.create(TAGTiled.TileObject.prototype);

TAGTiled.Layer.prototype.constructor = TAGTiled.Layer;

/**
 * Returns the type of this layer.
 */
TAGTiled.Layer.prototype.layerType = function() { 
    return this.mLayerType; 
}

/**
 * Returns the name of this layer.
 */
TAGTiled.Layer.prototype.name = function() { 
    return this.mName; 
}

/**
 * Sets the name of this layer.
 */
TAGTiled.Layer.prototype.setName = function(name) { 
    this.mName = name; 
}

/**
 * Returns the opacity of this layer.
 */
TAGTiled.Layer.prototype.opacity = function() { 
    return this.mOpacity; 
}

/**
 * Sets the opacity of this layer.
 */
TAGTiled.Layer.prototype.setOpacity = function(opacity) { 
    this.mOpacity = opacity; 
}

/**
 * Returns the visibility of this layer.
 */
TAGTiled.Layer.prototype.isVisible = function() { 
    return this.mVisible; 
}

/**
 * Sets the visibility of this layer.
 */
TAGTiled.Layer.prototype.setVisible = function(visible) { 
    this.mVisible = visible; 
}

/**
 * Returns the map this layer is part of.
 */
TAGTiled.Layer.prototype.map = function() { 
    return this.mMap; 
}

/**
 * Sets the map this layer is part of. Should only be called from the Map class.
 */
TAGTiled.Layer.prototype.setMap = function(map) { 
    this.mMap = map; 
}

/**
 * Returns the x position of this layer (in tiles).
*/
TAGTiled.Layer.prototype.x = function() const { 
    return this.mX; 
}

/**
 * Sets the x position of this layer (in tiles).
 */
TAGTiled.Layer.prototype.setX = function(x) { 
    this.mX = x; 
}

/**
 * Returns the y position of this layer (in tiles).
 */
TAGTiled.Layer.prototype.y = function() const { 
    return this.mY; 
}

/**
 * Sets the y position of this layer (in Tiles).
 */
TAGTiled.Layer.prototype.setY = function(y) { 
    this.mY = y; 
}

/**
 * Returns the position of this layer (in Tiles).
 */
TAGTiled.Layer.prototype.position = function() { 
    return new TAGGeom.Point(this.mX, this.mY); 
}

/**
 * Sets thw position of this layer (in Tiles).
 */
TAGTiled.Layer.prototype.setPositionToPoint = function(pos) { 
    this.setPosition(pos.x(), pos.y()); 
}
TAGTiled.Layer.prototype.setPosition = function(x, y) { 
    this.mX = x; this.mY = y; 
}

/**
 * Returns the width of this layer
 */
TAGTiled.Layer.prototype.width = function() { 
    return this.mWidth; 
}

/**
 * Returns the height of this layer.
 */
TAGTiled.Layer.prototype.height = function() { 
    return this.mHeight; 
}

/**
 * Returns the size of this layer.
 */
TAGTiled.Layer.prototype.size = function() { 
    return new TAGGeom.Size(this.mWidth, this.mHeight); 
}

TAGTiled.Layer.prototype.setSize = function(size) {
    this.mWidth = size.width();
    this.mHeight = size.height();
}

/**
 * Returns the bounds of this layer.
 */
TAGTiled.Layer.prototype.bounds = function() const { 
    return new TAGGeom.Rect(this.mX, this.mY, this.mWidth, this.mHeight); }

TAGTiled.Layer.prototype.isEmpty = function() { // Override.
 };

/**
 * Computes and returns the set of tilesets used by this layer.
 */
TAGTiled.Layer.prototype.usedTilesets = function() { // Override.
 };

/**
 * Returns whether this layer is referencing the given tileset.
 */
TAGTiled.Layer.prototype.referencesTileset = function(tileset) { // Override.
 };

/**
 * Replaces all references to tiles from \a oldTileset with tiles from \a newTileset.
 */
TAGTiled.Layer.prototype.replaceReferencesToTileset = function(oldTileset, newTileset) { // Override.
 };

/**
 * Returns whether this layer can merge together with the \a other layer.
 */
TAGTiled.Layer.prototype.canMergeWith = function(other) { // Override.
 };

/**
 * Returns a newly allocated layer that is the result of merging this layer
 * with the \a other layer. Where relevant, the other layer is considered 
 * to be on top of this one.
 *
 * Should only be called when canMergeWith returns true.
 */
TAGTiled.Layer.prototype.mergedWith = function(other) { // Override.
 };

/**
 * Returns a duplicate of this Layer. The caller is responsible for the 
 * ownershup of this newly created layer.
 */
TAGTiled.Layer.prototype.clone = function() { // Override.    
 };

/**
 * These functions allow checking whether this Layer is an instance of the
 * given subclass without relying on a dynamic_cast.
 */
TAGTiled.Layer.prototype.isTileLayer = function()  { 
    return this.mLayerType === TAGTiled.TypeFlag.TileLayerType; 
}

TAGTiled.Layer.prototype.isObjectGroup = function() { 
    return this.mLayerType === TAGTiled.TypeFlag.ObjectGroupType; 
}

// These actually return this layer cast to one of its subclasses.
TAGTiled.Layer.prototype.asTileLayer = function() {
    return this.isTileLayer ? this : undefined;
}

TAGTiled.Layer.prototype.asObjectGroup = function() {
    return this.isObjectGroup ? this : undefined;
}

TAGTiled.Layer.prototype.initializeClone = function(clone) {
    clone.mOpacity = this.mOpacity;
    clone.mVisible = this.mVisible;
    clone.setProperties(this.properties());
    return clone;
}