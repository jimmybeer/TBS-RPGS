var mapgen = mapgen || {};

mapgen.rndFunc = undefined;
mapgen.rndSeed = undefined;

mapgen.setSeed = function(seed) {
    mapgen.rndSeed = seed;
	mapgen.rndFunc = new TAGAlg.PM_PRNG(seed);
}

mapgen.SETTINGS = {
    xOrigin : 250,
	yOrigin : 250,
	radius : 250,
	
	minRoomWidth : 20,
	maxRoomWidth : 50,
	minRoomHeight : 20,
	maxRoomHeight : 50
};

mapgen.ROOM = {
    fillColor : new cc.Color(200,200,200),
	lineColor : new cc.Color(255,0,0),
    disabledFillColor : new cc.Color(0,0,0),
	disabledLineColor : new cc.Color(155,0,0),
	lineWidth : 1
};

mapgen.ORIGIN = {
    left : cc.p(-5,0),
    top : cc.p(0, -5),
	right : cc.p(0, 5),
	bottom : cc.p(0, 5),
	lineWidth : 1,
	lineColor : new cc.Color(255, 255, 255)
};

mapgen.TRIANGLE = {
	lineWidth : 1,
	lineColor : new cc.Color(0, 0, 255),
	pointColor : new cc.Color(0, 0, 255),
	pointRadius : 4
};

mapgen.CORRIDOR = {
	lineWidth : 1,
	lineColor : new cc.Color(0, 255, 0),
	pointColor : new cc.Color(0, 255, 0),
	pointRadius : 4
};

mapgen.FILTER = {
    lineWidth : 1,
	lineColor : new cc.Color(255,255,255)
};

mapgen.createRoom = function() {
    if(mapgen.rndFunc === undefined) {
	    if(mapgen.rndSeed === undefined) {
	    	mapgen.rndSeed = (Math.random() * 2147483647) | 0;
		}
	    mapgen.rndFunc = new TAGAlg.PM_PRNG(mapgen.rndSeed);
	}
	
	var x, y, w, h;

	x = mapgen.SETTINGS.xOrigin +
	    mapgen.rndFunc.nextIntRange(-mapgen.SETTINGS.radius, mapgen.SETTINGS.radius);
	y = mapgen.SETTINGS.yOrigin +
	    mapgen.rndFunc.nextIntRange(-mapgen.SETTINGS.radius, mapgen.SETTINGS.radius);
	w = mapgen.rndFunc.nextIntRange(4, mapgen.SETTINGS.maxRoomWidth);
	h = mapgen.rndFunc.nextIntRange(4, mapgen.SETTINGS.maxRoomHeight);
		
    return new mapgen.Room(x, y, w, h);
}

mapgen.separateRooms = function(rooms) {
    var force = { x : 0, y : 0 };
	var interactions = 0;
	var len = rooms.length;
	var currRoom;
	var nextRoom;
	
	for(var i = 0; i < len; i++) {
	    currRoom = rooms[i];
		for(var j = 0; j < len; j++) {
		    if(j === i) continue;
			
			nextRoom = rooms[j];
			
			if(currRoom.intersects(nextRoom)) {
			    var res = currRoom.calcPenetration(nextRoom);
				
			    if(Math.abs(res.x) > Math.abs(force.x)) {
    				force.x = res.x;
			    }
			    if(Math.abs(res.y) > Math.abs(force.y)) {
			    	force.y = res.y;
			    }
			}
		}
		
		if(force.x !== 0 && force.y != 0) {
		    interactions++;
			if(Math.abs(force.x) < Math.abs(force.y)) {
			    currRoom.x += force.x;
			} else {
			    currRoom.y += force.y;
			}
			
			currRoom._calcBounds();
			
			force.x = force.y = 0;
		}
	}
	
	return interactions;
}

mapgen.filterRooms = function(rooms, filters) {
    if(!filters) return;
	
    // Run enabling filters.
	for(var r = 0; r < rooms.length; ++r) {
	    var room = rooms[r];
		if(room.enabled === false) {
		    for(var f = 0; f < filters.length; ++f) {
		    	if((filters[f] instanceof mapgen.MinRoomSizeFilter) ||
		    	   (filters[f] instanceof mapgen.MaxRoomSizeFilter)) {
		    		continue;
		    	}
			    if(filters[f].filter(room)) {
				    // Room disabled by filter, no point running further filters.
					room.enabled = true;
				    break;
				}
			}
		}
	}

	// Disable any enabled rooms that are outside of the size requirements.
	for(var r = 0; r < rooms.length; ++r) {
		var room = rooms[r];
		if(room.enabled === true) {
			for(var f = 0; f < filters.length; ++f) {
				if((filters[f] instanceof mapgen.MinRoomSizeFilter) ||
						(filters[f] instanceof mapgen.MaxRoomSizeFilter)) {
				    if(filters[f].filter(room)) {
					    // Room disabled by filter, no point running further filters.
					    room.enabled = false;
					    break;
				    }
				}
			}
		}
	}
}

mapgen.MinRoomSizeFilter = function(width, height) {
    this.minWidth = width;
	this.minHeight = height;
}

mapgen.MinRoomSizeFilter.prototype.filter = function(room) {
    if((room.width < this.minWidth) || (room.height < this.minHeight)) {
	    return true;
	}
	return false;
}

mapgen.MinRoomSizeFilter.prototype.drawFilter = function(node) {
}

mapgen.MaxRoomSizeFilter = function(width, height) {
    this.maxWidth = width;
	this.maxHeight = height;
}

mapgen.MaxRoomSizeFilter.prototype.filter = function(room) {
    if((room.width > this.maxWidth) || (room.height > this.maxHeight)) {
	    return true;
	}
	return false;
}

mapgen.MaxRoomSizeFilter.prototype.drawFilter = function(node) {
}

mapgen.SquareBoundsFilter = function(x, y, width, height) {
    this.left = x - width / 2;
	this.right = x + width / 2;
	this.top = y - height / 2;
	this.bottom = y + height / 2;
	this.tl = cc.p(this.left, this.top);
	this.tr = cc.p(this.right, this.top);
	this.br = cc.p(this.right, this.bottom);
	this.bl = cc.p(this.left, this.bottom);
}

mapgen.SquareBoundsFilter.prototype.filter = function(room) {
    if(((room.x < this.left) || (room.x > this.right)) ||
	   ((room.y < this.top) || (room.y > this.bottom))) {
	    return false;
	}
	return true;
}

mapgen.SquareBoundsFilter.prototype.drawFilter = function(node) {
    node.drawSegment(this.tl, this.tr, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.tr, this.br, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.bl, this.br, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.bl, this.tl, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
}

mapgen.CircleBoundsFilter = function(x, y, radius) {
    this.x = x;
	this.y = y;
	this.radius = radius;
	this.radiusSq = radius * radius;
	
	this.centre = cc.p(x, y);
}

mapgen.CircleBoundsFilter.prototype.filter = function(room) {
    var dx = this.x - room.x;
	var dy = this.y - room.y;
	var len = (dx * dx) + (dy * dy);
	
	if(len > this.radiusSq) {
	    return false;
	} 
	return true;
}

mapgen.CircleBoundsFilter.prototype.drawFilter = function(node) {
    node.drawCircle(this.centre, this.radius, 360, 20, 
	               false, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor); 
}

mapgen.CircleHaloFilter = function(x, y, innerRadius, outterRadius) {
    this.x = x;
	this.y = y;
	this.innerRadiusSq = innerRadius * innerRadius;
	this.outterRadiusSq = outterRadius * outterRadius;
	this.outterRadius = outterRadius;
	this.innerRadius = innerRadius;
	
	this.centre = cc.p(x, y);
}

mapgen.CircleHaloFilter.prototype.filter = function(room) {
    var dx = this.x - room.x;
	var dy = this.y - room.y;
	var len = (dx * dx) + (dy * dy);
	
	if((len < this.innerRadiusSq) || (len > this.outterRadiusSq)) {
	    return false;
	} 
	return true;
}

mapgen.CircleHaloFilter.prototype.drawFilter = function(node) {
    node.drawCicle(this.centre, this.innerRadiusSq, 360, 20, 
	               false, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor); 
    node.drawCicle(this.centre, this.outterRadiusSq, 360, 20, 
	               false, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor); 
}

mapgen.SquareHaloFilter = function(x, y, innerWidth, innerHeight, outterWidth, outterHeight) {
    this.innerLeft = x - innerWidth/2;
	this.innerRight = x + innerWidth/2;
    this.innerTop = y - innerHeight/2;
	this.innerBottom = y + innerHeight/2;
	this.outterLeft = x - outterWidth/2;
	this.outterRight = x + outterWidth/2;
	this.outterTop = y - outterHeight/2;
	this.outterBottom = y + outterHeight/2;
	
	this.itl = cc.p(this.innerLeft, this.innerTop);
	this.itr = cc.p(this.innerRight, this.innerTop);
	this.ibr = cc.p(this.innerRight, this.innerBottom);
	this.ibl = cc.p(this.innerLeft, this.innerBottom);
	
	this.otl = cc.p(this.outterLeft, this.outterTop);
	this.otr = cc.p(this.outterRight, this.outterTop);
	this.obr = cc.p(this.outterRight, this.outterBottom);
	this.obl = cc.p(this.outterLeft, this.outterBottom);
}

mapgen.SquareHaloFilter.prototype.filter = function(room) {
    var x = room.x, y = room.y;
	var _ = this;
	
	if((x <= _.innerLeft) || (x >= _.innerRight) || (y <= _.innerTop) || (y >= _.innerBottom)) {
	    if((x < _.outterLeft) || (x > _.outterRight) || (y < _.outterTop) || (y > _.outterBottom)) {
		    return false;
		}
    } else {
        // inside inner square.
        return false; 
    }
    return true	
}

mapgen.SquareHaloFilter.prototype.drawFilter = function(node) {
    node.drawSegment(this.itl, this.itr, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.itr, this.ibr, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.ibl, this.ibr, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.ibl, this.itl, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
	
    node.drawSegment(this.otl, this.otr, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.otr, this.obr, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.obl, this.obr, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
    node.drawSegment(this.obl, this.otl, mapgen.FILTER.lineWidth, mapgen.FILTER.lineColor);
}