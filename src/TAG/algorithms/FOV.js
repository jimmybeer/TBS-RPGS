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
 * Recursive shadowcasting FOV. Uses force * decay for the radius calculation
 * and treats all translucent cells as fully transparent.
 * 
 * Performs bounds checking so edges are not required to be opaque.
 */
TAGAlg.FOV.ShadowFOV = {
    startx : 0,
    starty : 0,
    width : 0,
    height : 0,
    force : 0,
    decay : 0,
    radius : 0,
    map : undefined,
    dirty : [],
    
    init : function(grid, force, decay, radiusStrategy) {
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
        
        this.force = force;
        this.decay = decay;
        this.radius = (force / decay);
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
    	cc.log("Calculating FOV @ " + x + "," + y);
        this.startx = x;
        this.starty = y;
        
        var node = this.map.getNodeAt(this.startx, this.starty);
        node.fov.range = 0;
        node.fov.dirty = true;
        node.visited = true;
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
                // * DELETE COMMENT * check if it's within the lightable area
				// and light if needed.
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
                    /*
					 * var bright = (1 - (this.decay *
					 * TAGAlg.FOV.RadiusStrategy.radius(deltax, deltay) /
					 * this.force));
					 * 
					 * this.map.setTintAtLevel(currentx, currenty, (bright * 10) |
					 * 0); this.map.setVisited(currentx, currenty);
					 */
                }
                
                if(blocked) { // previous cell was a blocking one
                    if(!this.map.isWalkableAt(currentx, currenty)) { // hit a
																		// wall
                        newStart = rightSlope;
                        continue;
                    }
                    else {
                        blocked = false;
                        start = newStart;
                    }
                } else {
                    if(!this.map.isWalkableAt(currentx, currenty) && distance < this.radius) { // hit
																								// a
																								// wall
																								// within
																								// sight
																								// line
                        blocked = true;
                        this.castLight(distance + 1, start, leftSlope, xx, xy, yx, yy);
                        newStart = rightSlope;
                    }
                }
            }
        }
    }
}
/**
 * Recursive shadowcasting FOV. Uses force * decay for the radius calculation
 * and treats all translucent cells as fully transparent. Slightly smaller lit
 * area to prevent single pillar issue.
 * 
 * Performs bounds checking so edges are not required to be opaque.
 */
TAGAlg.FOV.TightShadowFOV = {
    scale : 3,
    startx : 0,
    starty : 0,
    width : 0,
    height : 0,
    force : 0,
    decay : 0,
    radius : 0,
    map : undefined,
    scaledMap : undefined,
    lightMap : undefined,
    
    init : function(gridMap, force, decay, radiusStrategy) {
        this.map = gridMap;
        
        this.width = gridMap.width * this.scale;
        this.height = gridMap.height * this.scale;
        
        this.scaledMap = new Array(this.width);
        this.lightMap = new Array(this.width);
        for(var x = 0; x < this.width; x++) {
            this.scaledMap[x] = new Array(this.height);
            this.lightMap[x] = new Array(this.height);
            for(var y = 0; y < this.height; y++) {
                this.scaledMap[x][y] = this.map.isWalkableAt(((x / this.scale) | 0), ((y / this.scale) | 0));
            }
        }
        
        this.radius = (force / decay) * this.scale;
        this.force = force * this.scale;
        this.decay = decay;
        if(radiusStrategy !== undefined) {
            TAGAlg.FOV.RadiusStrategy.setStrategy(radiusStrategy);
        }
    },
    
    calculateFOV : function(sx, sy) {
        this.startx = (sx * this.scale + 0.5 * this.scale) | 0;
        this.starty = (sy * this.scale + 0.5 * this.scale) | 0;
        
        // initialise light map.
        for(var x = 0; x < this.width; x++) {
            for(var y = 0; y < this.height; y++) {
                this.lightMap[x][y] = 0;
            }
        }
        
        this.lightMap[this.startx][this.starty] = this.force; // light the
																// starting
																// cell.
        var len = TAGAlg.FOV.DIAGONALS.length;
        for(var i = 0; i < len; ++i) {
            this.castLight(1, 1, 0, 0, TAGAlg.FOV.DIAGONALS[i][0], TAGAlg.FOV.DIAGONALS[i][1], 0);
            this.castLight(1, 1, 0, TAGAlg.FOV.DIAGONALS[i][0], 0, 0, TAGAlg.FOV.DIAGONALS[i][1]);
        }
        
        var wLen = this.map.width;
        var hLen = this.map.height;
        
        for(var x = 0; x < wLen; x++) {
            for(var y = 0; y < hLen; y++) {
                var avg = 0;
                for(var i = 0; i < this.scale; i++) {
                    for(var j = 0; j < this.scale; j++) {
                        avg += this.lightMap[x * this.scale + i][y * this.scale + i];
                    }
                }
                var val = (avg / (this.scale * this.scale));
                if(val > 0.5) {
                	this.map.setTintAtLevel(x, y, (val * 10) | 0);
                }
            }
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
                
                // check if it's within the lightable area and light if needed.
                if(TAGAlg.FOV.RadiusStrategy.radius(deltax, deltay) <= this.radius) {
                    var bright = (1 - (this.decay * TAGAlg.FOV.RadiusStrategy.radius(deltax, deltay) / this.force));
                    this.lightMap[currentx][currenty] = bright;
                }
                
                if(blocked) { // previous cell was a blocking one
                    if(this.scaledMap[currentx][currenty] === false) { 
                    	// hit a wall
                        newStart = rightSlope;
                        continue;
                    }
                    else {
                        blocked = false;
                        start = newStart;
                    }
                } else {
                    if((this.scaledMap[currentx][currenty] === false) && distance < this.radius) { 
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

TAGAlg.FOV.PartialOcclusionFOV = {
    /**
	 * Requires: TAGGeom.Vector2d TAGGeom.Sector TAGGeom.Angle
	 */
    startx : 0,
    starty : 0,
    width : 0,
    height : 0,
    radius : 0,
    map : undefined,
    grid : undefined,
    _tmp : new TAGGeom.Vector2D(),
    lightPos : new TAGGeom.Vector2D(),
    
    _ambientLight : 0x403020,
    
    init : function(gridMap, range) {
        this.width = gridMap.width;
        this.height = gridMap.height;
        this.map = gridMap;
        this.grid = new Array(this.width * this.height);
        this.radius = range || 10;

        // create lightGrid nodes
        for(var y = 0; y < this.height; y++)
            for(var x = 0; x < this.width; x++) {
                this.grid[y * this.width + x] = new TAGAlg.FOV.LightGridData(x, y, !this.map.isWalkableAt(x, y));
            }
        
        // connect lightGrid nodes
        for(var y = 0; y < this.height; y++)
            for(var x = 0; x < this.width; x++)
            {
                var ld = this.grid[y * this.width + x];
                ld.left = this.fetch(x-1,y);
                ld.right = this.fetch(x+1,y);
                ld.up = this.fetch(x,y-1);
                ld.down = this.fetch(x,y+1);
            }
    },
    
    calculateFOV : function(sx, sy) {
		// set the color of each cell to _ambientLight
		this.clearGrid();
		
		var color = 0xD0D0B0;// 0xB0B070;
		var baseColor = 0x000000;// 0x202040;
		
		this.lightPos.x = sx;
		this.lightPos.y = sy;
        
		// this.addShadowLightRecursive(this.lightPos, this.radius, color);
		this.addShadowLight(this.lightPos, this.radius, color);
        
        // finally render lightgrid to buffer
        this.renderBuffer();	
    },
		
	clearGrid : function() {
        for(var i = 0; i < this.grid.length; i++)
            this.grid[i].clear(this.ambientLight);
    },
    
    // just some utility method to provide acces to the lightgrid without
	// worrying about causing index-out-of-bound exceptions
    fetch : function(x, y) {
        if(x >= 0 && x < this.width && y >= 0 && y < this.height)
            return this.grid[y * this.width + x];
        else
            return undefined;
    },
    
    addShadowLightRecursive : function(pos, range, color) {
        // this is the recursive variant of the algorithm
        var minx = Math.max(0, pos.x - range);
        var maxx = Math.min(this.width-1, pos.x + range);
        var miny = Math.max(0, pos.y - range);
        var maxy = Math.min(this.height-1, pos.y + range);
        
        var centerY = Math.max(0, Math.ceil(pos.y) - 1);
        var centerX = Math.max(0, Math.ceil(pos.x) - 1);
        
        // reset occlusion
        for(var y = miny; y <= maxy; y++)
            for(var x = minx; x <= maxx; x++)
                this.grid[y * this.width + x].resetOcclusion();	
        
        // calculate occlusion by starting from the edges, eventually visiting
		// all cells in the relevant rect
        this.fetch(minx, miny).calclOcclusionRecursive(pos, true);
        this.fetch(minx, maxy).calclOcclusionRecursive(pos, true);
        
        // clear center (necessary HACK becuse left and right marching eval uses
		// different Angle-normalization)
        for(var y = miny; y <= centerY; y++)
            this.grid[y * this.width + centerX].resetOcclusion();			
        
        this.fetch(maxx, miny).calclOcclusionRecursive(pos, false);
        this.fetch(maxx, maxy).calclOcclusionRecursive(pos, false);
        
        // shade based on occlusion & distance from light source
        var rSqr = range * range;
        for(var y = miny; y <= maxy; y++)
            for(var x = minx; x <= maxx; x++)
            {
                // cell receives light based on intensity and occlusion
                // intensity is calculated based on distance from lightsource
                var dSqr = pos.distanceSquared(this._tmp.reset(x+0.5, y+0.5));
                var intensity = Math.max(0.0, 1.0 - dSqr / rSqr);
                var ld = this.grid[y * this.width + x];
                ld.addScaled(color, intensity * (1 - ld.occlusion));
            }			
    },
     
    renderBuffer : function() {
        for(var y = 0; y < this.height; y++)
            for(var x = 0; x < this.width; x++)
            {
            	var occ = this.fetch(x,y).occlusion;
            	cc.log("occ = " + (((occ * 10) - 1) | 0));
                this.map.setTintAtLevel(x, y, ((occ * 10) - 1) | 0);
                this.map.setVisited(x, y);
            }
    },
    
    addShadowLight : function(pos, range, color) {
    	// this is the iterating variant of the algorithm
    	var minx = Math.max(0, pos.x - range);
        var maxx = Math.min(this.width-1, pos.x + range);
        var miny = Math.max(0, pos.y - range);
        var maxy = Math.min(this.height-1, pos.y + range);

        // the iterator pattern we need is a little more complex then your
		// average FOR-loop...
        var px = Math.ceil(pos.x) - 1;
        var py = Math.ceil(pos.y) - 1;
        var maxi = range*Math.SQRT2;
        for(var i = 0; i <= maxi; i++)
    	    for(var j = Math.max(0, i-range); j <= i && j <= range; j++)
    	    {
    	    	// West->North
    	    	this.updateOcclusion(px-i+j, py-j, pos, true);
    	    	// Sout->West
    	    	this.updateOcclusion(px-i+j, py+j, pos, true);
    	    }		

        for(var i = 0; i <= maxi; i++)
    	    for(var j = Math.max(0, i-range); j <= i && j <= range; j++)
    	    {
    		    // North->Eeast
    		    this.updateOcclusion(px+j, py-i+j, pos, false);
    		    // East->South
    		    this.updateOcclusion(px-j+i, py+j, pos, false);
    	    }


        // shade based on occlusion & distance from light source
        var rSqr = range * range;
    	for(var y = miny; y <= maxy; y++)
    		for(var x = minx; x <= maxx; x++)
    		{
    			var dSqr = pos.distanceSquared(this._tmp.reset(x+0.5, y+0.5));
    	        var intensity = Math.max(0.0, 1.0 - dSqr / rSqr);
    	        var ld = this.grid[y * this.width + x];
    	        ld.addScaled(color, intensity * (1 - ld.occlusion));
    		}			
    },

    updateOcclusion : function(x, y, pos, normalize) {
    	if(x >= 0 && x < this.width && y >= 0 && y < this.height)
    		this.grid[y * this.width + x].calcOcclusion(pos, normalize);
    }
}

TAGAlg.FOV.LightGridData = function(cx, cy, op) {
	this.opaque = op || false;
	
    // color
	this._color = new TAGg.Color();
		
	// spatial data
	this.x = cx || 0;
	this.y = cy || 0;
		
	this.left = undefined;
	this.right = undefined;
	this.up = undefined;
	this.down = undefined;
		
    // used for raycasting
	this.touched = 0;
		
	// occlusion
	this.occlusion = -1;// UNKNOWN_OCCLUSION;
	this._lightSector = new TAGGeom.Sector();
	this._incomingA = new TAGGeom.Sector();
	this._incomingB = new TAGGeom.Sector();
}

TAGAlg.FOV.LightGridData.prototype = {
    UNKNOWN_OCCLUSION : -1,
    
    resetOcclusion : function() {
		this.occlusion = this.UNKNOWN_OCCLUSION;				
	},
	
	clear : function(c)	{
		this._color.red = (c >> 16 & 0xFF) / 255;
		this._color.green = (c >> 8 & 0xFF) / 255;
		this._color.blue = (c & 0xFF) / 255;
	},
    	
    addScaled : function(c, sf) {
        this._color.red += sf * (c >> 16 & 0xFF) / 255.0;
        this._color.green += sf * (c >> 8 & 0xFF) / 255.0;
        this._color.blue += sf * (c & 0xFF) / 255.0;
    },
    
    // evaluate this cells occlusion (RECURSIVE version)
    // (Vector2D, Boolean)
	calclOcclusionRecursive : function(pos, normalize) {
        if(this.occlusion !== this.UNKNOWN_OCCLUSION)
            return;
        
        // offset relative to the center position
        var dx = Math.ceil(pos.x) - this.x - 1;
        var dy = Math.ceil(pos.y) - this.y - 1;					
        
        // make sure relevant neighbours are evaluated first
        var a = undefined;  // LightGridData
        if(dx > 0)
        	a = this.right;
        else if (dx < 0)
        	a = this.left;
        
        if(a !== undefined)
            a.calclOcclusionRecursive(pos, normalize);

        var b = undefined;  // LightGridData
        if(dy > 0)
        	b = this.down;
        else if(dy < 0)
        	b = this.up;

        if(b !== undefined)
            b.calclOcclusionRecursive(pos, normalize);	
        
        // the rest is similar to the iterator version...
        
        if(this.opaque)
        {
            this._lightSector.clear();
            this.occlusion = 1.0;
            return;
        }
        var sx = (dx === 0) ? 0 : (dx < 0) ? -1 : 1;
        var sy = (dy === 0) ? 0 : (dy < 0) ? -1 : 1;
        var ox = (sy === 0) ? sx : 0
        var oy = (sx === 0) ? sy : 0
        var x1 = this.x + 0.5 * (1 - sy + ox);
        var y1 = this.y + 0.5 * (1 + sx + oy);
        var x2 = this.x + 0.5 * (1 + sy + ox);
        var y2 = this.y + 0.5 * (1 - sx + oy);
        this._lightSector.setFromCoords(pos.x, pos.y, x1, y1, x2, y2, normalize);			
        if(Math.abs(dx) + Math.abs(dy) > 1) // no direct connection with
											// lightsource - there might be
											// occlusion
        {
            // evaluate right
            if(a !== undefined)
                this._incomingA.setIntersection(this._lightSector, a._lightSector);	
            else
                this._incomingA.clear();
            
            // evaluate down
            if(b !== undefined)
                this._incomingB.setIntersection(this._lightSector, b._lightSector);	
            else
                this._incomingB.clear();
            
            // combine exposure from both edges and compare with max possible
			// exposure (myTheta)
            var myTheta = this._lightSector.theta;
            this._lightSector.setUnion(this._incomingA, this._incomingB);
            this.occlusion = 1.0 - (this._lightSector.theta / myTheta);					
        }
        else
            this.occlusion = 0.0; // ends recursion
    },
    
    calcOcclusion : function(pos, normalize) {
    	if(this.opaque) // this cell itself occludes all light
    	{
    		this._lightSector.clear();
    		this.occlusion = 1.0;
    		return;
    	}

    	// vector (dx, dy) describes relative position from center
    	var dx = Math.ceil(pos.x) - this.x - 1;
    	var dy = Math.ceil(pos.y) - this.y - 1;	
    	
    	// sign of vector components
    	var sx = (dx == 0) ? 0 : (dx < 0) ? -1 : 1;
    	var sy = (dy == 0) ? 0 : (dy < 0) ? -1 : 1;
    	
    	// offset necessary for vertical/horizontal lines
    	var ox = (sy == 0) ? sx : 0
    	var oy = (sx == 0) ? sy : 0
    			
    	// calculate the points that define the sector
    	var x1 = this.x + 0.5 * (1 - sy + ox);
    	var y1 = this.y + 0.5 * (1 + sx + oy);
    	var x2 = this.x + 0.5 * (1 + sy + ox);
    	var y2 = this.y + 0.5 * (1 - sx + oy);
    	
    	// calculate sector
    	this._lightSector.setFromCoords(pos.x, pos.y, x1, y1, x2, y2, normalize);			
    	if(Math.abs(dx) + Math.abs(dy) > 1) // no direct connection with
											// lightsource - there might be
											// occlusion
    	{
    		// gather horizontal
    		if(dx > 0 && this.right != null)
    			this._incomingA.setIntersection(this._lightSector, this.right._lightSector);	
    		else if(dx < 0 && this.left != null)
    			this._incomingA.setIntersection(this._lightSector, this.left._lightSector);	
    		else
    			this._incomingA.clear();

    		// gather vertical
    		if(dy > 0 && this.down != null)
    			this._incomingB.setIntersection(this._lightSector, this.down._lightSector);	
    		else if(dy < 0 && this.up != null)
    			this._incomingB.setIntersection(this._lightSector, this.up._lightSector);	
    		else
    			this._incomingB.clear();

    		// combine exposure from both edges and compare with max possible
			// exposure (myTheta)
    		var myTheta = this._lightSector.theta;
    		this._lightSector.setUnion(this._incomingA, this._incomingB);
    		this.occlusion = 1.0 - (this._lightSector.theta / myTheta);					
    	}
    	else
    		this.occlusion = 0.0; // ends recursion
    }
}
