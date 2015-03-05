var mapgen = mapgen || {};

mapgen.LEFTBOUNDS = 0;
mapgen.RIGHTBOUNDS = 1000;
mapgen.TOPBOUNDS = 0;
mapgen.BOTTOMBOUNDS = 1000;

mapgen.Room = function(x, y, width, height, clip) {
    var clipRoom = (clip === undefined) ? true : clip;

    this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
	this._calcDims();
	this._calcBounds();
	
	if(clipRoom) {
	    this.clipRoom(mapgen.LEFTBOUNDS, mapgen.TOPBOUNDS, mapgen.RIGHTBOUNDS, mapgen.BOTTOMBOUNDS);
	}
}

mapgen.Room.prototype = {
    intersects : function(left, top, right, bottom) {
	    if(((this.left > right) || (this.right < left)) || 
		   ((this.top > bottom) ||(this.bottom < top))) {
		    return false;
		} else {
		    return true;
		}
	},
	
	intersectsRoom : function(room) {
	    return this.intersects(room.left, room.top, room.right, room.bottom);
	},
	
	calcPenetration : function(room) {
	    var x1 = Math.max(this.left, room.left);
		var y1 = Math.max(this.top, room.top);
		var x2 = Math.min(this.right, room.right);
		var y2 = Math.min(this.bottom, room.bottom);
		
		if((x1 < x2) && (y1 < y2)) {
		    var xDiff = x2 - x1;
			var yDiff = y2 - y1;
			
			if(this.x < room.x) {
			    xDiff *= -1;
			}
			if(this.y < room.y) {
			    yDiff *= -1;
			}
		    return { x : xDiff, y : yDiff };
		} else {
		    return { x : 0, y : 0 };
		}
	},
	
    clipRoom : function(left, top, right, bottom) {
	    var diff;
		var dirty = false;
		if(this.left < left) {
		    diff = left - this.left;
			this.x += diff / 2;
			this.width -= diff;
			dirty = true;
		}
		if(this.top < top) {
		    diff = top - this.top;
			this.y += diff / 2;
			this.height -= diff;
			dirty = true;
		}
		if(this.right > right) {
		    diff = this.right - right;
			this.x -= diff / 2;
			this.width -= diff;
			dirty = true;
		}
		if(this.bottom > bottom) {
		    diff = this.bottom - bottom;
			this.y -= diff / 2;
			this.height -= diff;
			dirty = true;
		}
		if(dirty) {
		    this._calcDims();
		    this._calcBounds();
		}
	},
	
	drawRoom : function(window, drawNode) {
	    if(this.intersects(window.left, window.top, window.right, window.bottom)) {
		    var fillColor, lineColor;
            if(this.enabled) {
			    fillColor = mapgen.ROOM.fillColor;
				lineColor = mapgen.ROOM.lineColor
            } else {
			    fillColor = mapgen.ROOM.disabledFillColor;
				lineColor = mapgen.ROOM.disabledLineColor;
            }			
		    drawNode.drawRect(this.tl, this.br, fillColor, mapgen.ROOM.lineWidth, lineColor);
		}
	},
	
	_calcDims : function() {
	    this.halfWidth = this.width/2;
	    this.halfHeight = this.height/2;
	},
	
	_calcBounds : function() {
	    this.left = this.x - this.halfWidth;
	    this.right = this.x + this.halfWidth;
	    this.top = this.y - this.halfHeight;
	    this.bottom = this.y + this.halfHeight;
		this.tl = cc.p(this.left, this.top);
		this.br = cc.p(this.right, this.bottom);
	},
	
	halfWidth : 0,
	halfHeight : 0,
	left : 0,
	top : 0,
	right : 0,
	bottom : 0,
	tl : undefined,
	br : undefined,
	enabled : false
}