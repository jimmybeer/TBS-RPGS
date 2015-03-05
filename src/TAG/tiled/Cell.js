var TAGTiled = TAGTiled || {};

/**
 * A cell on a tile layer grid.
 */
TAGTiled.Cell = function(tile) {
    if(tile !== undefined) {
        this.tile = tile;
	} else {
	    this.tile = undefined;
	}
    this.flippedHorizontally = false;
    this.flippedVertically = false;
    this.flippedAntiDiagonally = false;
}

TAGTiled.Cell.prototype = {
{   
    isEmpty:function() { 
	    return this.tile === undefined; 
	},

    equals:function(other) {
        return (this.tile === other.tile)
                && (this.flippedHorizontally === other.flippedHorizontally)
                && (this.flippedVertically === other.flippedVertically)
                && (this.flippedAntiDiagonally === other.flippedAntiDiagonally);
    },

    notEqual:function(other) {
        return (this.tile != other.tile)
                || (this.flippedHorizontally !== other.flippedHorizontally)
                || (this.flippedVertically !== other.flippedVertically)
                || (this.flippedAntiDiagonally !== other.flippedAntiDiagonally);
    },
        
    var tile;
    var flippedHorizontally;
    var flippedVertically ;
    var flippedAntiDiagonally ;
};