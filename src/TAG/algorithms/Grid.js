var TAGAlg = TAGAlg || {};

/**
 * A node in grid. This class holds some basic information about a node and
 * custom attributes may be added, depending on the algorithms' needs.
 * 
 * @constructor
 * @param {number}
 *            x - The x coordinate of the node on the grid.
 * @param {number}
 *            y - The y coordinate of the node on the grid.
 * @param {boolean}
 *            [walkable] - Whether this node is walkable.
 */ 
TAGAlg.Node = function(x, y, walkable, sprite) { 
    /**
	 * The x coordinate of the node on the grid.
	 * 
	 * @type number
	 */ 
    this.x = x; 

	/**
	 * The y coordinate of the node on the grid.
	 * 
	 * @type number
	 */ 
    this.y = y; 

	/**
	 * Whether this node can be walked through.
	 * 
	 * @type boolean
	 */ 
    this.walkable = (walkable === undefined ? true : walkable); 
    
    /**
	 * The graphical object present at this node.
	 */
    this.tileSprite = sprite;
    
    /**
	 * The base tint to revert to when not in view.
	 */
    // this.baseTint = TR.blackTint;
    
    /**
	 * The current tint to apply to this node.
	 */
   // this.currentTint = TR.blackTint;
    
    /**
	 * The current tint level for easy comparison.
	 */
	// this.tintLevel = 0;
    
    /**
	 * Flag stating whether or not this node has been previously seen.
	 */
    this.visited = false;
	this.exists = true;
    
    /**
	 * AStar attributes
	 */
    this.traversalWeight = 1;
    // this.f = 0; // g + h i.e. the lower the f the better.
    // this.g = 0; // Total cost of reaching this node.
    // this.h = 0; // Estimated cost to reach the finish from this node.
    // this.visited = false;
    // this.closed = false;
    // this.parent = null;
}; 

/**
 * The Grid class, which serves as the encapsulation of the layout of the nodes.
 * 
 * @constructor
 * @param {number}
 *            width Number of columns of the grid.
 * @param {number}
 *            height Number of rows of the grid.
 * @param {Array.
 *            <Array.<(number|boolean)>>} [matrix] - A 0-1 matrix representing
 *            the walkable status of the nodes(0 or false for walkable). If the
 *            matrix is not supplied, all the nodes will be walkable.
 */ 
TAGAlg.Grid = function(width, height, matrix) { 
    /**
	 * The number of columns of the grid.
	 * 
	 * @type number
	 */ 
    this.width = width;
	
	/**
	 * The number of rows of the grid.
	 * 
	 * @type number
	 */ 
    this.height = height;
	
	/**
	 * A 2D array of nodes.
	 */ 
    if(matrix !== undefined && matrix instanceof cc.TMXLayer) {
    	this.nodes = this._buildFromTMXLayer(width, height, matrix);
    } else {
        this.nodes = this._buildNodes(width, height, matrix);
    }
    
    /* Array to minimise re-initialisation. */
    // this.dirtyNodes = [];
}

TAGAlg.Grid.prototype = {
		/**
		 * Build and return the nodes from a TMXTileLayer.
		 * 
		 * @private
		 * @param {number}
		 *            width
		 * @param {number}
		 *            height
		 * @param {TMXTileLayer}
		 *            layer.
		 */
	_buildFromTMXLayer : function(width, height, layer) {
		var i, j;
		var nodes = new Array(height);

		for(i = 0; i < height; ++i) {
			nodes[i] = new Array(width);
			for(j = 0; j < width; ++j) {
			    if(layer.getTileGIDAt(j, i) > 0) {
   		            nodes[i][j] = new TAGAlg.Node(j, i, true, layer.getTileAt(j, i));
				} else {
				    nodes[i][j] = new TAGAlg.Node(j, i, false, null);
					nodes[i][j].exists = false;
				}
			}
		}	
		
		return nodes;
	},
	
    /**
	 * Build and return the nodes.
	 * 
	 * @private
	 * @param {number}
	 *            width
	 * @param {number}
	 *            height
	 * @param {Array.
	 *            <Array.<number|boolean>>} [matrix] - A 0-1 matrix represening
	 *            the walkable status of the nodes.
	 */
    _buildNodes : function(width, height, matrix) {
	    var i, j;
		var nodes = new Array(height);
		
		for(i = 0; i < height; ++i) {
		    nodes[i] = new Array(width);
			for(j = 0; j < width; ++j) {
			    nodes[i][j] = new TAGAlg.Node(j, i);
			}
		}
		
		if(matrix === undefined) {
		    return nodes;
		}
		
		if(matrix.length !== height || matrix[0].length !== width) {
		    throw new Error('Matrix size does not fit');
		}
		
		for(i = 0; i < height; ++i) {
		    for(j = 0; j < width; ++j) {
			    if(matrix[i][j]) {
				    // 0, false, null will be walkable
					nodes[i][j].walkable = false;
				}
			}
		}
		
		return nodes;
	},
	
	getNodeAt : function(x, y) {
		return this.nodes[y][x];
	},
	
	/**
	 * Determine whether the node at the given position is walkable. (Also
	 * returns false if the position is outside the grid.)
	 * 
	 * @param {number}
	 *            x - The x coordinate of the node.
	 * @param {number}
	 *            y - The y coordinate of the node.
	 * @return {boolean} - The walkability of the node.
	 */ 
	isWalkableAt : function(x, y) {
	    return this.isInside(x, y) && this.nodes[y][x].walkable;
	},
	
	/**
	 * Determine whether the node at the given position actually contains a
	 * tile. (Also returns false if the position is outside the grid.)
	 * 
	 * @param {number}
	 *            x - The x coordinate of the node.
	 * @param {number}
	 *            y - The y coordinate of the node.
	 * @return {boolean} - The walkability of the node.
	 */ 
	existsAt : function(x, y) {
	    return this.isInside(x, y) && this.nodes[y][x].exists;
	},
	
	/**
	 * Determine whether the position is inside the grid. XXX: `grid.isInside(x,
	 * y)` is wierd to read. It should be `(x, y) is inside grid`, but I failed
	 * to find a better name for this method.
	 * 
	 * @param {number}
	 *            x
	 * @param {number}
	 *            y
	 * @return {boolean}
	 */ 
    isInside : function(x, y) {
	    return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
	},
	
	/**
	 * Set whether the node on the given position is walkable. NOTE: throws
	 * exception if the coordinate is not inside the grid.
	 * 
	 * @param {number}
	 *            x - The x coordinate of the node.
	 * @param {number}
	 *            y - The y coordinate of the node.
	 * @param {boolean}
	 *            walkable - Whether the position is walkable.
	 */ 
    setWalkableAt : function(x, y, walkable) {
	    this.nodes[y][x].walkable = walkable;
    },

    /**
	 * Set the node as having been visited i.e. change its base tint. NOTE:
	 * throws exception if the coordinate is not inside the grid.
	 * 
	 * @param {number}
	 *            x - The x coordinate of the node.
	 * @param {number}
	 *            y - The y coordinate of the node.
	 * @param {cc.Color3}
	 *            tint - tint to apply to node's currentTint.
	 */ 
    setVisited : function(x, y) {
    	this.nodes[y][x].visited = true;
    },
	
	/**
	 * Get the neighbors of the given node.
	 * 
	 *     offsets      diagonalOffsets: 
	 *  +---+---+---+    +---+---+---+ 
	 *  |   | 0 |   |    | 0 |   | 1 | 
	 *  +---+---+---+    +---+---+---+ 
	 *  | 3 |   | 1 |    |   |   |   | 
	 *  +---+---+---+    +---+---+---+ 
	 *  |   | 2 |   |    | 3 |   | 2 | 
	 *  +---+---+---+    +---+---+---+ 
	 * 
	 * When allowDiagonal is true, if offsets[i] is valid, then
	 * diagonalOffsets[i] and diagonalOffsets[(i + 1) % 4] is valid.
	 * 
	 * @param {Node}
	 *            node
	 * @param {boolean}
	 *            allowDiagonal
	 * @param {boolean}
	 *            dontCrossCorners
	 */ 
    getNeighbors : function(node, allowDiagonal, dontCrossCorners) {
	    var x = node.x;
	    var y = node.y;
		var neighbors = [];
		var s0 = false, d0 = false;
		var s1 = false, d1 = false;
		var s2 = false, d2 = false;
		var s3 = false, d3 = false;
		var nodes = this.nodes;
		
		// up
		if(this.isWalkableAt(x, y-1)) {
		    neighbors.push(nodes[y-1][x]);
			s0 = true;
		}
		// right
		if(this.isWalkableAt(x+1, y)) {
		    neighbors.push(nodes[y][x+1]);
			s1 = true;
		}
		// down
		if(this.isWalkableAt(x, y+1)) {
		    neighbors.push(nodes[y+1][x]);
			s2 = true;
		}
		// left
		if(this.isWalkableAt(x-1, y)) {
		    neighbors.push(nodes[y][x-1]);
			s3 = true;
		}
		
		if(!allowDiagonal) {
		    return neighbors;
		}
		
		if(dontCrossCorners) {
		    d0 = s3 && s0;
			d1 = s0 && s1;
			d2 = s1 && s2;
			d3 = s2 && s3;
		} else {
		    d0 = s3 || s0;
			d1 = s0 || s1;
			d2 = s1 || s2;
			d3 = s2 || s3;
		} 
			
		// up Left
		if(d0 && this.isWalkableAt(x-1, y-1)) {
		    neighbors.push(nodes[y-1][x-1]);
		}
		// up right
		if(d1 && this.isWalkableAt(x+1, y-1)) {
		    neighbors.push(nodes[y-1][x+1]);
		}
		// down right
		if(d2 && this.isWalkableAt(x+1, y+1)) {
		    neighbors.push(nodes[y+1][x+1]);
		}
		// down left
		if(d3 && this.isWalkableAt(x-1, y+1)) {
		    neighbors.push(nodes[y+1][x-1]);
		}
		
		return neighbors;
	},
    
    /*
	 * markDirty : function(node) { this.dirtyNodes.push(node); },
	 * 
	 * resetDirty : function() { this.dirtyNodes = []; },
	 */
	
	/**
	 * Get a clone of this grid.
	 * 
	 * @return {Grid} Cloned grid.
	 */ 
    /*
	 * clone : function() { var i,j; var width = this.width; var height =
	 * this.height; var nodes = this.nodes;
	 * 
	 * var newGrid = new TAGAlg.Grid(width, height); var newNodes =
	 * newGrid.nodes;
	 * 
	 * for(i = 0; i < height; ++i) { for(j = 0; j < width; ++j) {
	 * newNodes[i][j].walkable = nodes[i][j].walkable; } }
	 * 
	 * return newGrid; }
	 */
}