TAGAlg = TAGAlg || {};

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
    
	inRange : function(grid, startX, startY, range,) {
	    this.cleanDirty();
	  
        var available = [];
	    var start = grid.getNodeAt(startX, startY);
	    var openHeap = [];//new TAGDs.BinaryHeap(function(node) { return node.aStar.f });
	    openHeap.push(start);
        this.dirty.push(start);
	 
	    while(openHeap.length > 0) { 
            // Grab the lowest f(x) to process next. Heap keeps this sorted for us. 
            var currentNode = openHeap.pop();
            
	        // Normal case -- move currentNode from open to closed, process each of
            // its neighbours 
            currentNode.aStar.closed = true;
            
	        // Find all neighbors for the current node. 
            var neighbors = grid.getNeighbors(currentNode, this.allowDiagonal, this.dontCrossCorners);
	 
            for(var i = 0, il = neighbors.length; i < il; ++i) { 
                var neighbor = neighbors[i];
	            if(neighbor.aStar.closed) { 
                    // Not a valid node to process, skip to next neighbor. 
                    continue; 
                }
                
	            // The g score is the shortest distance from start to current node. 
                // We need to check if the path we have arraived at this neighbor is the
	            // shortest one we have seen yet. 
                var gScore = currentNode.aStar.g + neighbor.traversalWeight; 
                var beenVisited = neighbor.visited;
	
                if(!beenVisited || (gScore < neighbor.aStar.g && gScore <= range)) { 
                    // Found an optimal (so far) path to this node. Take score for node to see how good it is. 
                    neighbor.aStar.visited = true; 
                    // store this node.
                    neighbor.aStar.g = gScore; 
	
                    if(!beenVisited) { 
                        // pushing to heap will put it in the proper place based on the 'f' value. 
                        openHeap.push(neighbor); 
                        this.dirty.push(neighbor);
                        available.push(neighbor);
                    } else { 
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap. 
                        //openHeap.rescoreElement(neighbor); 
                    } 
                } 
            } 
        }
	    // No result was found 
        return available; 
    },
    
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
