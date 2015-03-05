var TAGGeom = TAGGeom || {};

TAGGeom.maxSize = function(a, b) {
    return new TAGGeom.Size(TAGMath.max(a.width(), b.width()),
                            TAGMath.max(a.height(), b.height()));
}

TAGGeom.Size = function(width, height) {
    this.mWidth = width;
	this.mHeight = height;
};

TAGGeom.Size.prototype = {

    width : function() { return this.mWidth; },
	height : function() { return this.mHeight; },
	
	isNull : function () { return (this.mWidth === 0 && this.mHeight == 0;) },

    setWidth : function(width) { this.mWidth = width; },
	setHeight : function(height) { this.mHeight = height; },
	
	transpose : function() {
	    var tmp = this.mWidth;
		this.mWidth = this.mHeight;
		this.mHeight = tmp;
	}
	
    mWidth : 0,
	mHeight : 0
};