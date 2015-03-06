/**
 * Based on SquidPony source code:
 * https://github.com/SquidPony/SquidLib/tree/master/src/squidpony/squidgrid/fov
 */
TAGAlg = TAGAlg || {};

TAGAlg.FOV = TAGAlg.FOV || {};

TAGAlg.RAD2DEG = 180/Math.PI;

TAGAlg.FOV.UP = [0, -1];
TAGAlg.FOV.DOWN = [0, 1];
TAGAlg.FOV.LEFT = [-1, 0];
TAGAlg.FOV.RIGHT = [1, 0];
TAGAlg.FOV.UP_LEFT = [-1, -1];
TAGAlg.FOV.UP_RIGHT = [1, -1];
TAGAlg.FOV.DOWN_LEFT = [-1, 1];
TAGAlg.FOV.DOWN_RIGHT = [1, 1];
TAGAlg.FOV.NONE = [0,0];

TAGAlg.FOV.CARDINALS = [TAGAlg.FOV.UP, 
                       TAGAlg.FOV.DOWN, 
                       TAGAlg.FOV.LEFT, 
                       TAGAlg.FOV.RIGHT];
TAGAlg.FOV.DIAGONALS = [TAGAlg.FOV.UP_LEFT, 
                        TAGAlg.FOV.UP_RIGHT, 
                        TAGAlg.FOV.DOWN_LEFT, 
                        TAGAlg.FOV.DOWN_RIGHT];
TAGAlg.FOV.OUTWARDS = [TAGAlg.FOV.UP, 
                       TAGAlg.FOV.DOWN, 
                       TAGAlg.FOV.LEFT, 
                       TAGAlg.FOV.RIGHT,
                       TAGAlg.FOV.UP_LEFT, 
                       TAGAlg.FOV.UP_RIGHT, 
                       TAGAlg.FOV.DOWN_LEFT, 
                       TAGAlg.FOV.DOWN_RIGHT];
                       
TAGAlg.FOV.getDirection = function(x, y) {
    if((x === 0) && (y === 0)) {
        return TAGAlg.FOV.NONE;
    }
    
    var angle = Math.atan2(y, x);
    var degree = angle * TAGAlg.RAD2DEG;
    
    // Rotate to all positive an 0 is up.
    degree += 90 + 360;
    // Normalize;
    degree %= 360;
    
    if(degree < 22.5) {
        return TAGAlg.FOV.UP;
    } else if(degree< 67.5) {
        return TAGAlg.FOV.UP_RIGHT;
    } else if(degree< 112.5) {
        return TAGAlg.FOV.RIGHT;
    } else if(degree< 157.5) {
        return TAGAlg.FOV.DOWN_RIGHT;
    } else if(degree< 202.5) {
        return TAGAlg.FOV.DOWN;
    } else if(degree< 247.5) {
        return TAGAlg.FOV.DOWN_LEFT;
    } else if(degree< 292.5) {
        return TAGAlg.FOV.LEFT;
    } else if(degree< 337.5) {
        return TAGAlg.FOV.UP_LEFT;
    } else {
        return TAGAlg.FOV.UP;
    }    
}

TAGAlg.FOV.RadiusStrategy = {
    /**
	 * In an unobstructed area the FOV would be a square.
	 * 
	 * This is the shape that would represent movement radius in an 8-way
	 * movement scheme with no additional cost for diagonal movement.
	 */ 
    SQUARE : "Square", 
	
    /**
	 * In an unobstructed area the FOV would be a diamond.
	 * 
	 * This is the shape that would represent movement radius in a 4-way
	 * movement scheme.
	 */ 
    DIAMOND : "Diamond", 
 
    /**
	 * In an unobstructed area the FOV would be a circle.
	 * 
	 * This is the shape that would represent movement radius in an 8-way
	 * movement scheme with all movement cost the same based on distance from
	 * the source
	 */ 
    CIRCLE : "Circle", 
 
    /**
	 * Same as circle but returns the radius squared. (Math.sqrt not performed).
	 */ 
    CIRCLESQ : "CircleSq", 

	radiusBetween : function(x1, y1, x2, y2) {
	    return this.radius((x1-x2), (y1-y2));
    },
    
    radiusSquare : function(dx, dy) {
	    dx = Math.abs(dx);
		dy = Math.abs(dy);
        return dx > dy ? dx : dy;
    },
    
    radiusDiamond : function(dx, dy) {
	    dx = Math.abs(dx);
		dy = Math.abs(dy);
        return dx + dy; // radius is the manhattan distance.
    },
    
    radiusCircle : function(dx, dy) {
        return Math.sqrt((dx * dx) + (dy * dy));
    },
    
    radiusCircleSq : function(dx, dy) {
        return (dx * dx) + (dy * dy);
    },

    /**
	 * Default radius strategy is circle.
	 */
    radius : function(dx, dy) {
        return Math.sqrt((dx * dx) + (dy * dy));
    },

    setStrategy : function(mode) {
		switch(mode) {
            case this.SQUARE :
                radius = this.radiusSquare;
                break;
            case this.DIAMOND : 
                radius = this.radiusDiamond;
                break;
            case this.CIRCLE : 
                radius = this.radiusCircle;
                break;
            case this.CIRCLESQ :
                radius = this.radiusCircleSq;
                break;
            default : 
                throw new UserException("Invalid BasicRadiusStrategy <" + mode + ">");
        }
    }
}

/**
 * Recursive shadowcasting FOV. Treats all translucent cells as fully transparent.
 * 
 * Performs bounds checking so edges are not required to be opaque.
 */
TAGAlg.FOV.ShadowFOV = {
    startx : 0,
    starty : 0,
    width : 0,
    height : 0,
    radius : 0,
    map : undefined,
    dirty : [],
    
    init : function(grid, radius, radiusStrategy) {
    	this.map = grid;
        
        this.width = grid.width;
        this.height = grid.height;
        
		for(var x = 0; x < this.width; ++x)
			for(var y = 0; y < this.height; ++y) {
				var node = this.map.getNodeAt(x, y);
				node.fov = {
					dirty : false,
					range : -1	
				}
			}

        this.radius = radius;
        if(radiusStrategy !== undefined) {
            TAGAlg.FOV.RadiusStrategy.setStrategy(radiusStrategy);
        }
    },
    
    clean : function() {
		for(var x = 0; x < this.width; ++x)
			for(var y = 0; y < this.height; ++y) {
				var node = this.map.getNodeAt(x, y);
				node.fov = undefined;
			}
    },
    
    reset : function() {
        var len = this.dirty.length;
        for(var i = 0; i < len; ++i) {
            var node = this.dirty[i];
            node.fov.dirty = false;
            node.fov.range = -1;
        }
        
        this.dirty = [];
    },
    
    calculateFOV : function(x, y) {
        this.startx = x;
        this.starty = y;
        
        var node = this.map.getNodeAt(this.startx, this.starty);
        node.fov.range = 0;
        node.visited = true;
        node.fov.dirty = true;
        this.dirty.push(node);
        
        var len = TAGAlg.FOV.DIAGONALS.length;
        for(var i = 0; i < len; ++i) {
            this.castLight(1, 1, 0, 0, TAGAlg.FOV.DIAGONALS[i][0], TAGAlg.FOV.DIAGONALS[i][1], 0);
            this.castLight(1, 1, 0, TAGAlg.FOV.DIAGONALS[i][0], 0, 0, TAGAlg.FOV.DIAGONALS[i][1]);
        }
    },
    
    castLight : function(row, start, end, xx, xy, yx, yy) {
        var newStart = 0;
        if(start < end) {
            return;
        }
        
        var blocked = false;
        for(var distance = row; distance <= this.radius && !blocked; distance++) {
            var deltay = -distance;
            for(var deltax = -distance; deltax <= 0; deltax++) {
                var currentx = this.startx + deltax * xx + deltay * xy;
                var currenty = this.starty + deltax * yx + deltay * yy;
                var leftSlope = (deltax - 0.5) / (deltay + 0.5);
                var rightSlope = (deltax + 0.5) / (deltay - 0.5);
                
                if(!(currentx >= 0 && currenty >= 0 && currentx < this.width && currenty < this.height) || start < rightSlope) {
                    continue;
                } else if(end > leftSlope) {
                    break;
                }
                
                // Check if node is within visual range.
                if(TAGAlg.FOV.RadiusStrategy.radius(deltax, deltay) <= this.radius) {
                    var range = TAGAlg.FOV.RadiusStrategy.radius(deltax, deltay) | 0;
                    var node = this.map.getNodeAt(currentx, currenty);
                    node.visited = true;
                    
                    // Only update range if it is closer than existing value.
                    if(node.fov.range === -1 || node.fov.range > range) {
                        node.fov.range = range;
                    }
                    
                    // Add to dirty pile if not already visited.
                    if(node.fov.dirty === false) {
                        this.dirty.push(node);
                        node.fov.dirty = true;
                    }
                }
                
                if(blocked) { // previous cell was a blocking one
                    if(!this.map.isWalkableAt(currentx, currenty)) { 
                        // hit a wall
                        newStart = rightSlope;
                        continue;
                    }
                    else {
                        blocked = false;
                        start = newStart;
                    }
                } else {
                    if(!this.map.isWalkableAt(currentx, currenty) && distance < this.radius) { 
                        // hit a wall within sight line
                        blocked = true;
                        this.castLight(distance + 1, start, leftSlope, xx, xy, yx, yy);
                        newStart = rightSlope;
                    }
                }
            }
        }
    }
}
