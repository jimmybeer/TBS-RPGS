TAGAlg = TAGAlg || {};

TAGAlg.Heuristic = TAGAlg.Heuristic || {};

/*******************************************************************************
 * HEURISITIC
 ******************************************************************************/
/**
 * Manhattan distance.
 * 
 * @param {number}
 *            dx - Difference in x.
 * @param {number}
 *            dy - Difference in y.
 * @return {number} dx + dy
 */ 
TAGAlg.Heuristic.manhattan = function(dx, dy) { 
    return dx + dy; 
}, 

/**
 * Euclidean distance.
 * 
 * @param {number}
 *            dx - Difference in x.
 * @param {number}
 *            dy - Difference in y.
 * @return {number} sqrt(dx * dx + dy * dy)
 */ 
TAGAlg.Heuristic.euclidean = function(dx, dy) { 
    return Math.sqrt(dx * dx + dy * dy); 
}, 

/**
 * Octile distance.
 * 
 * @param {number}
 *            dx - Difference in x.
 * @param {number}
 *            dy - Difference in y.
 * @return {number} sqrt(dx * dx + dy * dy) for grids
 */ 
TAGAlg.Heuristic.octile = function(dx, dy) { 
    var F = Math.SQRT2 - 1; 
    return (dx < dy) ? F * dx + dy : F * dy + dx; 
}, 

/**
 * Chebyshev distance.
 * 
 * @param {number}
 *            dx - Difference in x.
 * @param {number}
 *            dy - Difference in y.
 * @return {number} max(dx, dy)
 */ 
TAGAlg.Heuristic.chebyshev = function(dx, dy) { 
    return Math.max(dx, dy); 
} 

/*******************************************************************************
 * UTILS
 ******************************************************************************/
/**
 * Backtrace according to the parent records and return the path. (including
 * both start and end nodes)
 * 
 * @param {Node}
 *            node End node
 * @return {Array.<Array.<number>>} the path
 */ 
TAGAlg.backtrace = function(node) {
    var path = [[node.x, node.y]];
	while(node.parent) {
	    node = node.parent;
		path.push([node.x, node.y]);
	}
	return path.reverse();
}

/**
 * Backtrace from start and end node, and return the path. (including both start
 * and end nodes)
 * 
 * @param {Node}
 * @param {Node}
 */
TAGAlg.biBacktrace = function(nodeA, nodeB) {
    var pathA = TAGAlg.backtrace(nodeA);
	var pathB = TAGAlg.backtrace(nodeB);
	return pathA.concat(pathB.reverse());
}

/**
 * Compute the length of the path.
 * 
 * @param {Array.
 *            <Array.<number>>} path The path
 * @return {number} The length of the path
 */ 
TAGAlg.pathLength = function(path) {
    var i, sum = 0, a, b, dx, dy;
	for(i = 1; i < path.length; ++i) {
	    a = path[i - 1];
		b = path[i];
		dx = a[0] - b[0];
		dy = a[1] - b[1];
		sum += Math.sqrt(dx * dx + dy * dy);
	}
	return sum;
}

/**
 * Given the start and end coordinates, return all the coordinates lying on the
 * line formed by these coordinates, based on Bresenham's algorithm.
 * http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
 * 
 * @param {number}
 *            x0 Start x coordinate
 * @param {number}
 *            y0 Start y coordinate
 * @param {number}
 *            x1 End x coordinate
 * @param {number}
 *            y1 End y coordinate
 * @return {Array.<Array.<number>>} The coordinates on the line
 */
TAGAlg.interpolate = function(x0, y0, x1, y1) {
    var line = [];
	var sx, sy, dx, dy, err, e2;
	
	dx = Math.abs(x1 - x0);
	dy = Math.abs(y1 - y0);
	
	sx = (x0 < x1) ? 1 : -1;
	sy = (y0 < y1) ? 1 : -1;
	
	err = dx - dy;
	
	while(true) {
	    line.push([x0, y0]);
		
		if(x0 === x1 && y0 === y1) {
		    break;
		}
		
		e2 = 2 * err;
		if(e2 > -dy) {
		    err = err - dy;
			x0 = x0 + sx;
		} 
		if(e2 < dx) {
		    err = err + dx;
			y0 = y0 + sy;
		}
	}
	
	return line;
}

/**
 * Given a compressed path, return a new path that has all the segments in it
 * interpolated.
 * 
 * @param {Array.
 *            <Array.<number>>} path The path
 * @return {Array.<Array.<number>>} expanded path
 */ 
TAGAlg.expandPath = function(path) {
    var expanded = [];
	var len = path.length;
	var coord0, coord1;
	var interpolated;
	var interpolatedLen;
	var i, j;
	
	if(len < 2) { 
	    return expanded;
	}
	
	for(i = 0; i < len -1; ++i) {
	    coord0 = path[i];
		coord1 = path[i + 1];
		
		interpolated = TAGAlg.interpolate(coord0[0], coord0[1], coord1[0], coord1[1]);
		interpolatedLen = interpolated.length;
		for(j = 0; j < interlatedLen - 1; ++ j) {
		    expanded.push(interpolated[j]);
		}
	}
	expanded.push(path[len - 1]);
	
	return expanded;
}

/**
 * Smoothen the give path. The original path will not be modified; a new path
 * will be returned.
 * 
 * @param {PF.Grid}
 *            grid
 * @param {Array.
 *            <Array.<number>>} path The path
 */ 
TAGAlg.smoothenPath = function(grid, path) {
    var len = path.length;
	var x0 = path[0][0];     // path start x
	var y0 = path[0][1];     // path start y
	var x1 = path[len-1][0]; // path end x
	var y1 = path[len-1][1]; // path end y
	var sx, sy;              // current start coordinate
	var ex, ey;              // current end coordinate
	var newPath, i, j, coord, line, testCoord, blocked;
	
	sx = x0;
	sy = y0;
	newPath = [[sx,sy]];
	
	for(i = 2; i < len; ++i) {
	    coord = path[i];
		ex = coord[0];
		ey = coord[1];
		line = TAGAlg.interpolate(sx, sy, ex, ey);
		
		blocked = false;
		for(j = 1; j < line.length; ++j) {
		    testCoord = line[j];
			
			if(!grid.isWalkableAt(testCoord[0], testCoord[1])) {
			    blocked = true;
				break;
			}
		}
		if(blocked) {
		    var lastValidCoord = path[i - 1];
			newPath.push(lastValidCoord);
			sx = lastValidCoord[0];
			sy = lastValidCoord[1];
		}
	}
	newPath.push([x1, y1]);
	
	return newPath;
}

/**
 * Compress a path, remove redundant nodes without altering the shape The
 * original path is not modified
 * 
 * @param {Array.
 *            <Array.<number>>} path The path
 * @return {Array.<Array.<number>>} The compressed path
 */ 
TAGAlg.compressPath = function(path) {
    // nothing to compress
	if(path.length < 3) {
	    return path;
	}
	
	var compressed = [];
	var sx = path[0][0]; // start x
	var sy = path[0][1]; // start y
	var px = path[1][0]; // second point x
	var py = path[1][1]; // second point y
	var dx = px - sy; // direction between the two points
	var dy = py - sy; // direction between the two points
	var lx, ly, ldx, ldy, sq, i;
	
	// normalize the direction
	sq = Math.sqrt(dx * dx + dy * dy);
	dx /= sq;
	dy /= sq;
	
	// start the new path
	compressed.push([sx, sy]);
	
	for(i = 2; i < path.length; i++) {
	    // store the last point
		lx = px;
		ly = py;
		
		// store the last direction
		ldx = dx;
		ldy = dy;
		
		// next point
		px = path[i][0];
		py = path[i][1];
		
		// next direction
		dx = px - lx;
		dy = py - ly;
		
		// normalize
		sq = Math.sqrt(dx * dx + dy * dy);
		dx /= sq;
		dy /= sq;
		
		// If the direction has changed, store the point
		if(dx !== ldx || dy !== ldy) {
		    compressed.push([lx, ly]);
		}
	}
	
	// store the last point
	compressed.push([lx, ly]);
	
	return compressed;
}

/*******************************************************************************
 * ASTAR
 ******************************************************************************/
/**
 * A* path-finder. based upon
 * https://github.com/qiao/PathFinding.js/blob/master/src/finders/AStarFinder.js
 * 
 * @constructor
 * @param {object}
 *            opt
 * @param {boolean}
 *            opt.allowDiagonal Whether diagonal movement is allowed.
 * @param {boolean}
 *            opt.dontCrossCorners Disallow diagonal movement touching block
 *            corners.
 * @param {function}
 *            opt.heuristic Heuristic function to estimate the distance
 *            (defaults to manhattan).
 * @param {integer}
 *            opt.weight Weight to apply to the heuristic to allow for
 *            suboptimal paths, in order to speed up the search.
 */ 
TAGAlg.AStar = function(opt) {
	opt = opt || { allowDiagonal : true, dontCrossCorners : true };
	this.allowDiagonal = opt.allowDiagonal;
	this.dontCrossCorners = opt.dontCrossCorners;
	this.heuristic = opt.heuristic || TAGAlg.Heuristic.manhattan;
	this.weight = opt.weight || 1;
}

TAGAlg.AStar.prototype = {
	resetMap : function(grid) {
		for(var x = 0; x < grid.width; ++x)
			for(var y = 0; y < grid.height; ++y) {
				var node = grid.getNodeAt(x, y);
				node.g = 9999;
				node.h = 0;
				node.f = 0;
				node.closed = false;
				node.parent = undefined;
			}
	},
	
    /**
	 * Find and return the the path.
	 * 
	 * @return {Array.<[number, number]>} The path, including both start and
	 *         end positions.
	 */ 
    findPath : function(startX, startY, endX, endY, grid) {
	    var openList = new TAGDs.Heap(function(nodeA, nodeB) {
		        return nodeA.f - nodeB.f;
		    });
		var startNode = grid.getNodeAt(startX, startY);
		var endNode = grid.getNodeAt(endX, endY);
		var heuristic = this.heuristic;
		var allowDiagonal = this.allowDiagonal;
		var dontCrossCorners = this.dontCrossCorners;
		var node, neighbors, neighbor, i, l, x, y, ng;
		
		// set the 'g' and 'f' value of the start node to be 0
		startNode.g = 0;
		startNode.f = 0;
		
		// push the start node into the open list.
		openList.push(startNode);
		startNode.opened = true;
		
		// while open list is not empty
		while(!openList.empty()) {
		    // pop the position of node which has the minimum 'f' value.
			node = openList.pop();
			node.closed = true;
			
			// if reached end position, constrcut the path and return it
			if(node === endNode) {
				return TAGAlg.backtrace(endNode);
			}
			
			// get neigbours of the current node
			neighbors = grid.getNeighbors(node, this.allowDiagonal, this.dontCrossCorners);
			for(i = 0, l = neighbors.length; i < l; ++i) {
			    neighbor = neighbors[i];
				
				if(neighbor.closed) {
				    continue;
				}
				
				x = neighbor.x;
				y = neighbor.y;
				
				// get the distance between current node and the neigbor
				// and calculate the next g score
				ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : Math.SQRT2);
				
				// check if the neighbor has not been inspected yet, or
				// can be reached with smaller cost from the current node
				if(!neighbor.opened || ng < neighbor.g) {
				    neighbor.g = ng;
					neighbor.h = neighbor.h || this.weight * this.heuristic(Math.abs(x - endX), Math.abs(y - endY));
					neighbor.f = neighbor.g + neighbor.h;
					neighbor.parent = node;
					
					if(!neighbor.opened) {
					    openList.push(neighbor);
						neighbor.opened = true;
					} else {
					    // the neighbor can be reached with smalled cost.
						// since its f value has been updated, we have to
						// udpate its position in the open list
						openList.updateItem(neighbor);
					}
				}
			} // end for each neighbor
		} // end while not empty list
		
		// fail to find the path
		return [];
	}
}

/**
 * Source: https://github.com/bgrins/javascript-astar/blob/master/astar.js
 */
TAGAlg.AStarSimple = {
	dirty : [],
	heuristic : undefined,
	allowDiagonal : true,
	dontCrossCorners : true,
	closest : true,
	
	init : function(grid, options) {
		var options = options || {};
    	this.heuristic = options.heuristic || TAGAlg.AStarSimple.heuristics.diagonal;
	    this.allowDiagonal = options.allowDiagonal || true;
	    this.dontCrossCorners = options.dontCrossCorners || true;
	    this.closest = options.closest || true;
		
		var w = grid.width;
		var h = grid.height;
		
		for(var x = 0; x < w; ++x)
			for(var y = 0; y < h; ++y) {
				var node = grid.getNodeAt(x, y);
				node.aStar = {
					f : 0,  // g + h i.e. the lower the f the better.
					g : 0,  // Total cost of reaching this node.
					h : 0,  // Estimated cost to reach the finish from this
							// node.
					visited : false,
					closed : false,
					parent : null	
				}
			}
	},
    
    clean : function(grid) {	
		var w = grid.width;
		var h = grid.height;
		
		for(var x = 0; x < w; ++x)
			for(var y = 0; y < h; ++y) {
				var node = grid.getNodeAt(x, y);
                node.aStar.parent = undefined;
				node.aStar = undefined;
			}
    },
	
    cleanDirty : function() {
        var len  = this.dirty.length;
        for(var i = 0; i < len; ++i) {
            var node = this.dirty[i];
            node.aStar.f = 0;
            node.aStar.g = 0;
            node.aStar.h = 0;
            node.aStar.visited = false;
            node.aStar.closed = false;
            node.aStar.parent = null;
        }
        this.dirty = [];
    },
    
    pathTo : function(node) {
        var curr = node;
        var path = [];
        while(curr.aStar.parent) {
            path.push(curr);
            curr = curr.aStar.parent;
        }
        return path.reverse();
    },
    
    search : function(grid, startX, startY, endX, endY) {
        this.cleanDirty();
        
        var start = grid.getNodeAt(startX, startY);
        var end = grid.getNodeAt(endX, endY);
        
        var openHeap = new TAGDs.BinaryHeap(function(node) { return node.aStar.f });
        var closestNode = start; // set the start node to be the closest if
									// required.
        
        start.aStar.h = this.heuristic(start, end);
        this.dirty.push(start);
        openHeap.push(start);
        
        while(openHeap.size() > 0) {
            // Grab the lowest f(x) to process next. Heap keeps this sorted for
			// us.
            var currentNode = openHeap.pop();
            
            // End case -- result has been found, return the traced path
            if((currentNode.x === end.x) && (currentNode.y === end.y)) {
                return this.pathTo(currentNode);
            }
            
            // Normal case -- move currentNode from open to closed, process each
			// of its neighbours
            currentNode.aStar.closed = true;
            
            // Find all neighbors for the current node.
            var neighbors = grid.getNeighbors(currentNode, this.allowDiagonal, this.dontCrossCorners);
            
            for(var i = 0, il = neighbors.length; i < il; ++i) {
                var neighbor = neighbors[i];
                
                if(neighbor.aStar.closed) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }
                
                // The g score is the shortest distance from start to current
				// node.
                // We need to check if the path we have arraived at this
				// neighbor is the shortest one we have seen yet.
                var gScore = currentNode.aStar.g + neighbor.traversalWeight;
                var beenVisited = neighbor.aStar.visited;
                
                if(!beenVisited || gScore < neighbor.aStar.g) {
                    // Found an optimal (so far) path to this node. Take score
					// for node to see how good it is.
                	neighbor.aStar.visited = true;
                	neighbor.aStar.parent = currentNode;
                	neighbor.aStar.h = neighbor.aStar.h || this.heuristic(neighbor, end);
                	neighbor.aStar.g = gScore;
                	neighbor.aStar.f = neighbor.aStar.g + neighbor.aStar.h;
                    
                    if(this.closest) {
                        // If a neighbor is closer than the current closet node
						// or if it's equally close but has
                        // a cheaper path than the current closest node then it
						// becomes the closet node.
                    	if(neighbor.aStar.h < closestNode.aStar.h || (neighbor.aStar.h === closestNode.aStar.h && neighbor.aStar.g < closestNode.aStar.g)) {
                            closestNode = neighbor;
                        }
                    }
                    
                    if(!beenVisited) {
                        // pushing to heap will put it in the proper place based
						// on the 'f' value.
                        openHeap.push(neighbor);
                        
                        // Add to dirty pile
                        this.dirty.push(neighbor);
                    } else {
                        // Already seen the node, but since it has been rescored
						// we need to reorder it in the heap.
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }
        
        if(closest) {
            return this.pathTo(closestNode);
        }
        
        // No result was found
        return [];
    },
    
    /*
	 * inRange : function(grid, startX, startY, range, options) {
	 * this.cleanDirty(grid);
	 * 
	 * options = options || {}; var heauristic = options.heuristic ||
	 * AStarSimple.heurisitics.diagonal; var allowDiagonal =
	 * options.allowDiagonal || true; var dontCrossCorners =
	 * options.dontCrossCorners || true;
	 * 
	 * var start = grid.getNodeAt(startX, startY);
	 * 
	 * var openHeap = new TAGDs.BinaryHeap(function(node) { return node.f });
	 * 
	 * openHeap.push(start);
	 * 
	 * while(openHeap.size() > 0) { // Grab the lowest f(x) to process next.
	 * Heap keeps this sorted for us. var currentNode = openHeap.pop();
	 *  // Normal case -- move currentNode from open to closed, process each of
	 * its neighbours currentNode.closed = true;
	 *  // Find all neighbors for the current node. var neighbors =
	 * grid.getNeighbors(currentNode, allowDiagonal, dontCrossCorners);
	 * 
	 * for(var i = 0, il = neighbors.length; i < il; ++i) { var neighbor =
	 * neighbors[i];
	 * 
	 * if(neighbor.closed) { // Not a valid node to process, skip to next
	 * neighbor. continue; }
	 *  // The g score is the shortest distance from start to current node. //
	 * We need to check if the path we have arraived at this neighbor is the
	 * shortest one we have seen yet. var gScore = currentNode.g +
	 * neighbor.traversalWeight; var beenVisited = neighbor.visited;
	 * 
	 * if(!beenVisited || (gScore < neighbor.g && gScore <= range)) { // Found
	 * an optimal (so far) path to this node. Take score for node to see how
	 * good it is. neighbor.visited = true; // store this node.
	 * //neighbor.parent = currentNode; //neighbor.h = neighbor.h ||
	 * heuristic(neighbor || end); neighbor.g = gScore; //neighbor.f =
	 * neighbor.g + neighbor.h; grid.markDirty(neighbor);
	 * 
	 * 
	 * if(!beenVisited) { // pushing to heap will put it in the proper place
	 * based on the 'f' value. openHeap.push(neighbor); } else { // Already seen
	 * the node, but since it has been rescored we need to reorder it in the
	 * heap. openHeap.rescoreElement(neighbor); } } } }
	 *  // No result was found return []; },
	 */
    
    // See list of heuristics:
	// http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
    heuristics : {
        manhattan : function(pos0, pos1) {
            var d1 = Math.abs(pos1.x - pos0.x);
            var d2 = Math.abs(pos1.y - pos0.y);
            return d1 + d2;
        },
        diagonal : function(pos0, pos1) {
            var D = 1;
            var D2 = Math.sqrt(2);
            var d1 = Math.abs(pos1.x - pos0.x);
            var d2 = Math.abs(pos1.y - pos0.y);
            return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
        }
    }
}