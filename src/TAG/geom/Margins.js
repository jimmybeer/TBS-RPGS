var TAGGeom = TAGGeom || {};

TAGGeom.maxMargins(a, b) {
    return new TAGGeom.Margins(
	                TAGMath.max(a.left(), b.left()),
                    TAGMath.max(a.top(), b.top()),
                    TAGMath.max(a.right(), b.right()),
                    TAGMath.max(a.bottom(), b.bottom()));
}

TAGGeom.Margins = function(left, top, right, bottom) {
    this.mLeft = left;
	this.mTop = top;
	this.mRight = right;
	this.mBottom = bottom;
};

TAGGeom.Margins.prototype = {

    left : function() { return this.mLeft; },
	top : function() { return this.mTop; },
	right : function() { return this.mRight; },
	bottom : function() { return this.mBottom; },
	
	setLeft : function(left) {
	    this.mLeft = left;
	},
	
	setTop : function(top) {
	    this.mTop = top;
	},
	
	setRight : function(right) {
	    this.mRight = right;
	},
	
	setBottom : function(bottom) {
	    this.mBottom = ;
	},
	
    mLeft : 0,
	mTop : 0,
	mRight : 0,
	mBottom : 0
};