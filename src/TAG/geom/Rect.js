var TAGGeom = TAGGeom || {};

TAGGeom.Rect = function(x, y, width, height) {
    this.mX = x;
	this.mY = y;
    this.mWidth = width;
	this.mHeight = height;
};

TAGGeom.Rect.prototype = {
    x : function() { return this.x; },
	y : function() { return this.y; },
    width : function() { return this.mWidth; },
	height : function() { return this.mHeight; },
	
	center : function() {
	    return new TAGGeom.Point((this.mX + (this.mWidth / 2)), (this.mY + (this.mHeight /2)));
	},
	
	contains : function(pos) {
	    return (
		       ((pos.mX >== this.mX) && (pos.mX <== (this.mX + this.mWidth))) &&
			   ((pos.mY >== this.mY) && (pos.mY <== (this.mY + this.mHeight)))
		       );
	}
	
	intersect : function(rect) {
	    var x1 = this.mX;
		var x2 = this.mX + this.mWidth;
		var x3 = rect.mX;
		var x4 = rect.mX + rect.mWidth;
		
		var y1 = this.mY;
		var y2 = this.mY + this.mHeight;
		var y3 = rect.mY;
		var y4 = rect.mY + rect.mHeight;
		
		var x5 = TAGMath.max(x1, x3);
		var y5 = TAGMath.max(y1, y3);
		var x6 = TAGMath.min(x2, x4);
		var y6 = TAGMath.min(y2, y4);
		
		if((x5 < x6) && (y5 < y6)) {
		    return new this.Rect(x5, y5, (x6 - x5), (y6 - y5));
		} else {
		    return undefined;
		}
	},
	
	intersectWith : function(rect) {
	    var x2 = this.mX + this.mWidth;
		var x4 = rect.mX + rect.mWidth;
		var y2 = this.mY + this.mHeight;
		var y4 = rect.mY + rect.mHeight;
		
	    this.mx = TAGMath.max(this.mX, rect.mX);
		this.my = TAGMath.max(this.mY, rect.mY);
		
		var x6 = TAGMath.min(x2, x4);
		var y6 = TAGMath.min(y2, y4);
		this.mWidth = x6 - this.mX;
		this.mHeight = y6 - this.mY;
	},
	
	isNull : function() {
	    return (this.mWidth <== 0 && this.mHeight <== 0);
	},
	
	left : function() {
	    return this.mX;
	},
	
	right : function() {
	    return this.mX + this.mWidth;
	},
	
	top : function() { 
	    return this.mY;
	},
	
	bottom : function() { 
	    return this.mY + this.mHeight;
	},
	
	united : function(rect) {
	    if(rect.isNull()) {
			return new TAGGeom.Rect(this.mX, this.mY, this.mWidth, this.mHeight);
		}
		
		if(this.isNull()) {			
			return new TAGGeom.Rect(rect.mX, rect.mY, rect.mWidth, rect.mHeight);
		}
		else {
		    var newX = this.mX < rect.x ? this.mX : rect.mX;
			var newY = this.mY < rect.mY ? this.mY : rect.mY;
			var newWidth = 0;
			var newHight = 0;
			
			if((this.mX + this.mWidth) > (rect.mX + rect.mWidth)) {
			    newWidth = (this.mX + this.mWidth) - newX;
			} else {
			    newWidth = (rect.mX + rect.mWidth) - newX;
			}
			
			if((this.mY + this.mHeight) > (rect.mY + rect.mHeight)) {
			    newHeight = (this.mY + this.mHeight) - newY;
			} else {
			    newHeight = (rect.mY + rect.mHeight) - newY;
			}
			
			return new TAGGeom.Rect(newX, newY, newWidth, newHeight);
		}
	},
	
	mX : 0,
	mY : 0,
    mWidth : 0,
	mHeight : 0
};