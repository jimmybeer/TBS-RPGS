var TAGTiled = TAGTiled || {};

/**
 * A tileset, representing a set of tiles.
 *
 * This class is meant to be used by either loading tiles from a tileset image
 * (using LoadFromImage) or be adding/removing individual tiles(using
 * addTile, insertTiles and removeTiles). These two use-cases are not meant to be mixed.
 */

/**
  * Constructor
  * 
  * name        the name of the tileset
  *  tileWidth   the width of the tiles in the tileset
  *  tileHeight  the height of the tiles in the tileset
  *  tileSpacing the spacing between the tiles in the tileset image
  *  margin      the margin around the tiles in the tileset image
*/
TAGTiled.Tileset = function(name, tileWidth, tileHeight, tileSpacing, margin) {
    TAGTiled.TileObject.call(this, TAGTiled.ObjectType.TilesetType);
    
	this.mName = name;
    this.mTileWidth = tileWidth;
    this.mTileHeight = tileHeight;
    this.mTileSpacing = (typeof tileSpacing === "undefined") ? 0 : tileSpacing;
    this.mMargin = (typeof margin === "undefined") ? 0 : margin;
    this.mImageWidth = 0;
    this.mImageHeight = 0;
    this.mColumnCount = 0;

    this.mFileName = undefined;
    this.mImageSource = undefined;
    this.mTransparentColor = undefined;
    this.mTileOffset = new TAGGeom.Point(0,0);
    this.mImageWidth = undefined;
    this.mImageHeight = undefined;
    this.mTiles = [];
}

TAGTiled.Tileset.prototype = Object.create(TAGTiled.TileObject.prototype);

TAGTiled.Tileset.prototype.constructor = TAGTiled.Tileset;

/* 
 * Destructor
 */
TAGTiled.Tileset.prototype.destroy = function() {
    while(this.mTiles.length > 0) {
	    var t = this.mTiles.pop();
		t.destroy();
		delete t;
	}
}

/**
 * Returns the name of this tileset.
 */
TAGTiled.Tileset.prototype.name = function() { 
    return this.mName; 
}

/**
 * Sets the name of this tileset.
 */
TAGTiled.Tileset.prototype.setName = function(name) { 
    this.mName = name;
}

/**
 * Returns the file name of this tileset. When the tileset isn't an
 * external tileset, the file name is empty.
 */
TAGTiled.Tileset.prototype.filename = function() { 
    return this.mFileName; 
}

/**
 * Sets the filename of this tileset.
 */
TAGTiled.Tileset.prototype.setFileName = function(fileName) { 
    this.mFileName = fileName; 
}

/** 
 * Returns whether this tileset is external.
 */
TAGTiled.Tileset.prototype.isExternal = function() { 
    // test if string is empty.
    return (!this.mFileName || 0 === this.mFileName.length); 
}

/**
 * Returns the maximum width of the tiles in this tileset.
 */
TAGTiled.Tileset.prototype.tileWidth = function() {
    return this.mTileWidth; 
}

/**
 * Returns the maximum height of the tile in this tileset.
 */
TAGTiled.Tileset.prototype.tileHeight = function() { 
    return this.mTileHeight;
}

/**
 * Returns the maximum size of the tiles in this tileset.
 */
TAGTiled.Tileset.prototype.tileSize = function() { 
    return new TAGGeom.Size(this.mTileWidth, this.mTileHeight); 
}

/** 
 * Returns the spacing between the tiles in the tileset image.
 */
TAGTiled.Tileset.prototype.tileSpacing = function() {
    return this.mTileSpacing; 
}

/** 
 * Returns the margin around the tiles in the tileset image.
 */
TAGTiled.Tileset.prototype.margin = function() { 
    return this.mMargin; 
}

/**
 * Returns the offset that is applied when drawing the tiles in this
 * tileset.
 */
TAGTiled.Tileset.prototype.tileOffset = function() { 
    return this.mTileOffset; 
}

/**
 * @see tileOffset
 */
TAGTiled.Tileset.prototype.setTileOffset(offset) { this.mTileOffset = offset; }

/**
 * Returns a const reference to the list of tiles in this tileset.
 */
TAGTiled.Tileset.prototype.tiles = function() { 
    return this.mTiles; 
}

/**
 * Returns the tile for the given tile ID.
 * The tile ID is local to this tileset, which means the IDs are in range
 * [0, tileCount() - 1].
 */
TAGTiled.Tileset.prototype.tileAt = function(id) {
    return (id < this.mTiles.length) ? this.mTiles[id] : undefined;
}

/**
 * Returns the number of tiles in the tileset.
 */
TAGTiled.Tileset.prototype.tileCount = function() { 
    return this.mTiles.length; 
}

/**
 * Returns the number of tile columns in the tileset image.
 */
TAGTiled.Tileset.prototype.columnCount = function() { 
    return this.mColumnCount; 
}

/**
 * Returns the width of the tileset image.
 */
TAGTiled.Tileset.prototype.imageWidth = function() { 
    return this.mImageWidth; 
}

/**
 * Returns the height of the tileset image.
 */
TAGTiled.Tileset.prototype.imageHeight = function() { 
    return this.mImageHeight; 
}

/**
 * Returns the transparent color, or an invalid color if no transparent
 * color is used.
 */
TAGTiled.Tileset.prototype.transparentColor = function() { 
    return this.mTransparentColor; 
}

/**
 * Sets the transparent color. Pixels with this color will be masked out
 * when LoadFromImage() is called.
 */
TAGTiled.Tileset.prototype.setTransparentColor = function(c) { 
    this.mTransparentColor = c; 
}

/**
 * Load this tileset from the given tileset image. This will replace
 * existing tile images in this tileset with new ones. If the new image
 * contains more tiles than exist in the tileset new tiles will be 
 * appended, if there are fewer the exist images will be blanked.
 *
 * The tile width and height of this tileset must be heigher than 0.
 *
 *  image    the image to Load the tiles from
 * filename the file name of the image, which will be remembered
 *                 as the image source of this tileset.
 * <code>true</code> if loading was successful, otherwise
 *         returns <code>false</code>
 */
TAGTiled.Tileset.prototype.loadFromImage = function(image, filename) {
    throw new Error("TAGTiled.Tileset.prototype.loadFromImage(2) Not Implemented!");
//    (const QImage &image, const QString &filename);
}

/**
 * Convenience override that loads the image using the QImage constructor.
 */
TAGTiled.Tileset.prototype.loadFromImage = function(filename) {
    throw new Error("TAGTiled.Tileset.prototype.loadFromImage(1) Not Implemented!");
//(const QString &filename);
}

/**
 * This checks if there is a similar tileset in the given list.
 * It is needed for replacing this tileset by its similar copy.
 */
TAGTiled.Tileset.prototype.findSimilarTileset = function(tilesets) {
    var candidate;
	for(var i = 0; i < tilesets.length; i++) {
	    candidate = tilesets[i];
		
        if(candidate !== this
           && candidate.imageSource() === this.imageSource()
           && candidate.tileWidth() === this.tileWidth()
           && candidate.tileHeight() === this.tileHeight()
           && candidate.tileSpacing() === this.tileSpacing()
           && candidate.margin() === this.margin())
        {
            return candidate;
        }
    }
    return null;
}

/**
 * Returns the file name of the external image that contains the tiles in
 * this tileset. Is an empty string when this tileset doesn't have a 
 * tileset image.
 */
TAGTiled.Tileset.prototype.imageSource = function() { 
    return this.mImageSource; 
}

/**
 * Returns the column count that this tileset would have if the tileset
 * image would have the given width. this takes into account the tile
 * size, margin, and spacing.
 */
TAGTiled.Tileset.prototype.columnCountForWidth = function(width) {
    return (width - this.mMargin + this.mTileSpacing) / (this.mTileWidth + this.mTileSpacing);
}

/**
 * Adds a new tile to the end of the tileset.
 */
TAGTiled.Tileset.prototype.addTile = function(image, source) {
    throw new Error("TAGTiled.Tileset.prototype.addTile(2) Not Implemented!");
// (const QPixmap &image, const QString &source = QString());
}

TAGTiled.Tileset.prototype.insertTiles = function(index, tiles) {
    var count = tiles.length;
    for(var i = 0; i < count; ++i) {
	    this.mTiles.splice(index + i, tiles[i]);
	}

    // Adjust the tile IDs of the remaining tiles
    for(var i = index + count; i < this.mTiles.length; ++i) {
	    this.mTiles[i].mId += count;
	}

    this.updateTileSize();
}

TAGTiled.Tileset.prototype.removeTiles = function(index, count) {
    this.mTiles.splice(index, count);

    // Adjust the tile IDs of the remaining tiles
    for(var i = index; i < this.mTiles.length; ++i)
        this.mTiles[i].mId -= count;

    this.updateTileSize();
}

/** 
 * Sets the image to be used for the tile with the given id.
 */
TAGTiled.Tileset.prototype.setTileImage = function(id, image, source) {
    throw new Error("TAGTiled.Tileset.prototype.setTileImage(3) Not Implemented!");
//(int id, const QPixmap &image, const QString &source = QString());
}

/**
 * Sets the tile size to the maximum size.
 */
TAGTiled.Tileset.prototype.updateTileSize = function() {
    var maxWidth = 0;
    var maxHeight = 0;
	for(var i = 0; i < this.mTiles.length; i++) {
        var tile = this.mTiles[i];
		
	    var size = tile.size();
        if(maxWidth < size.width())
            maxWidth = size.width();
        if(maxHeight < size.height())
            maxHeight = size.height();
    }
    this.mTileWidth = maxWidth;
    this.mTileHeight = maxHeight;
}

 /*   QString mName;
    QString mFileName;
    QString mImageSource;
    QColor mTransparentColor;
    int mTileWidth;
    int mTileHeight;
    int mTileSpacing;
    int mMargin;
    QPoint mTileOffset;
    int mImageWidth;
    int mImageHeight;
    int mColumnCount;
    QList<Tile*> mTiles;*/
