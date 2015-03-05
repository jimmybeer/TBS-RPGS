var TAGTiled = TAGTiled || {};

/** 
 * Enumerates the different object shapes. Rectangle is the default shape.
 * When a polygon is set, the shape determines whether it should be 
 * interpreted as a filled polygon or a line.
 */
TAGTiled.Shape = {
    Rectangle : 0,
	Polygon : 1,
	Polyline : 2,
	Ellipse : 3
}
/**
 * An object on a map. Objects are positioned and scaled using floating point
 * values, ensuring they are not limited to the tile grid. They are suitable 
 * for adding any kind of annotation to your maps, as well as free placement of 
 * images.
 * 
 * Common usage of objects include defining portals, monsters spawn area,
 * ambient effects, scripted areas, etc.
 */
 TAGTiled.MapObject = function(name, type, pos, size) {
    // Call the super constructor
	TAGTiled.TileObject.call(this, TAGTiled.ObjectType.MapObjectType);
    this.mName = name;
    this.mType = type;
    this.mPos = pos;
    this.mSize = size;
    this.mShape = TAGTiled.Shape.Rectangle;
    this.mPolygon = [];
    this.mCell = undefined;
    this.mObjectGroup = undefined;
    this.mRotation = 0.0;
    this.mVisible = true;
}

TAGTiled.MapObject.prototype = Object.create(TAGTiled.TileObject.prototype);

TAGTiled.MapObject.prototype.constructor = TAGTiled.MapObject;

/**
 * Returns the name of this object. The name is usually just used for
 * identification of the object in the editor.
 */
TAGTiled.MapObject.prototype.name = function() { 
    return this.mName; 
}

    /**
     * Sets the name of this object.
     */
TAGTiled.MapObject.prototype.setName = function(name) { 
    this.mName = name; 
}

/**
 * Returns the type of this object. The type usually says something about
 * how the object is meant to be interpreted by the engine.
 */
TAGTiled.MapObject.prototype.type = function() { 
    return this.mType; 
}

/**
 * Sets the type of this object.
 */
TAGTiled.MapObject.prototype.setType = function(type) { 
    this.mType = type; 
}

/** 
 * Returns the position of this object.
 */
TAGTiled.MapObject.prototype.position = function() { 
    return this.mPos; 
}

/**
 * Sets the position of this object.
 */
TAGTiled.MapObject.prototype.setPosition = function(pos) { 
    this.mPos = pos; 
}

/**
 * Returns the x position of this object.
 */
TAGTiled.MapObject.prototype.x = function() { 
    return this.mPos.x(); 
}

/**
 * Sets the x position of this object.
 */
TAGTiled.MapObject.prototype.setX = function(x) { 
    this.mPos.setX(x); 
}

/**
 * Returns the y position of this object.
 */
TAGTiled.MapObject.prototype.y = function() { 
    return this.mPos.y(); 
}

    /**
     * Sets the y position of this oject.
     */
TAGTiled.MapObject.prototype.setY = function(y) { 
    this.mPos.setY(y); 
}

/**
 * Returns the size of this object.
 */
TAGTiled.MapObject.prototype.size = function() { 
    return this.mSize; 
}

/**
 * Sets the size of this object.
 */
TAGTiled.MapObject.prototype.setSize = function(width, height) {
    // test if single size argument has been suplied.
    if(height === undefined) {
        this.mSize = width; 
	} 
	else {
        this.mSize.setWidth(width);
		this.mSize.setHeight(height);
	}
}

/** 
 * Returns the width of this object.
 */
TAGTiled.MapObject.prototype.width = function() { 
    return this.mSize.width(); 
}

/**
 * Sets the width of this object.
 */
TAGTiled.MapObject.prototype.setWidth = function(width) { 
    this.mSize.setWidth(width); 
}

/**
 * Returns the height of this object.
 */
TAGTiled.MapObject.prototype.height = function() { 
    return this.mSize.height(); 
}
    
/**
 * Sets the height of this object.
 */
TAGTiled.MapObject.prototype.setHeight = function(height) { 
    this.mSize.setHeight(height); 
}

/**
 * Sets the polygon associated with this object. The polygon is only used
 * when the object shape is set to either Polgon or Polyline.
 *
*  setShape()
 */
TAGTiled.MapObject.prototype.setPolygon = function(polygon) { 
    this.mPolygon = polygon; 
}

/**
 * Returns the polygoen associated with this object. Returns an empty
 * polygon when no polygon is associated with this object.
 */
TAGTiled.MapObject.prototype.polygon = function() const { 
    return this.mPolygon; 
}

/**
 * Sets the shape of the object.
 */
TAGTiled.MapObject.prototype.setShape = function(shape) { 
    this.mShape = shape; 
}

/**
 * Returns the shape of the object.
 */
TAGTiled.MapObject.prototype.shape = function() { 
    return this.mShape; 
}

    /**
     * Shortcut to getting a QRectF from position() and size().
     */
TAGTiled.MapObject.prototype.bounds = function() { 
    return new TAGGeom.Rect(this.mPos.x(), this.mPos.y(), this.mSize.width(), this.mPos.height()); 
}

/**
 * Sets the tile that is associated with this object. The object will
 * display as the tile image.
 *
 *  The object shape is ignored for tile objects!
 */
TAGTiled.MapObject.prototype.setCell = function(cell) { 
    this.mCell = cell; 
}

    /** 
     * Returns the tile associated with this object.
     */
TAGTiled.MapObject.prototype.cell = function() { 
    return this.mCell; 
}

/**
 * Returns the object group this object belongs to. 
 */
TAGTiled.MapObject.prototype.objectGroup = function() { 
    return this.mObjectGroup; 
}

/**
* Sets the object group this object belongs to. Should be called 
* from the ObjectGroup class.
 */
TAGTiled.MapObject.prototype.setObjectGroup = function(objectGroup) { 
    this.mObjectGroup = objectGroup; 
}

/**
 * Sets the rotation of the object.
 */
TAGTiled.MapObject.prototype.setRotation = function(rotation) { 
    this.mRotation = rotation; 
}

/**
 * Returns the rotation of the object.
 */
TAGTiled.MapObject.prototype.rotation = function() { 
    return this.mRotation; 
}

TAGTiled.MapObject.prototype.isVisible = function() { 
    return this.mVisible; 
}

TAGTiled.MapObject.prototype.setVisible = function(visible) { 
    this.mVisible = visible; 
}

    /** 
     * Flip this object in the given \a direction. This doesn't change the size
     * of the object.
     */
TAGTiled.MapObject.prototype.flip = function(direction) {
    if(!this.mCell === undefined)
    {
        if(direction === TAGTiled.FlipDirection.FlipHorizontally)
            this.mCell.flippedHorizontally = !this.mCell.flippedHorizontally;
        else if(direction === TAGTiled.FlipDirection.FlipVertically)
            this.mCell.flippedVertically = !this.mCell.flippedVertically;
    }

    if(!(!this.mPolygon || this.mPolygon.length === 0)) 
    {
       var center2 = this.mPolygon.boundingRect().center().mult(2);

        if(direction === TAGTiled.FlipDirection.FlipHorizontally)
        {
            for(int i = 0; i < this.mPolygon.length; ++i)
                this.mPolygon[i].setX(center2.x() - this.mPolygon[i].x());
        }
        else if(direction === TAGTiled.FlipDirection.FlipVertically)
        {
            for(int i = 0; i < this.mPolygon.length; ++i)
                this.mPolygon[i].setY(center2.y() - this.mPolygon[i].y());
        }
	}
}

/**
 * Returns a duplicate of this object. The caller is responsible for the 
 * ownership of this newly created object.
 */
TAGTiled.MapObject.prototype.clone = function() {
    var o = new TAGTiled.MapObject(this.mName, this.mType, this.mPos, this.mSize);
    o.setProperties(this.properties());
    o.setPolygon(this.mPolygon);
    o.setShape(this.mShape);
    o.setCell(this.mCell);
    o.setRotation(this.mRotation);
    return o;
}
