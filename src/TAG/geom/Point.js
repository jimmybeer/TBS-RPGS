var TAGGeom = TAGGeom || {};

TAGGeom.Point = function(x, y) {
    this.mX = x;
	this.mY = y;
};

TAGGeom.Point.prototype = {

    x : function() { return this.mX; },
	y : function() { return this.mY; },
	
	add : function(point) {
	    return new TAGGeom.Point( (this.mX + point.mX), (this.mY + point.mY) );
	},
	
	isNull : function() {
	    return ((this.mX === 0) && (this.mY === 0));
	},
	
	minus : function(point) {
	    return new TAGGeom.Point( (this.mX - point.mX), this.mY - point.mY) );
	},
	
	mult : function(factor) {
	    return new TAGGeom.Point((this.mX * factor), this.mY * factor) );
	},
	
	plus : function(point) {
	    return new TAGGeom.Point( (this.mX + point.mX), (this.mY + point.mY) );
	},
	
	setX : function(x) {
	    mX = x;
	},
	
	setY : function (y) {
	    mY = y;
	},
	
    mX : 0,
	mY : 0
};