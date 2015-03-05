var TAGAlg = TAGAlg || {};

/**
 * Implementation of "FOV using recursive shadowcasting - improved" as 
 * described on http://roguebasin.roguelikedevelopment.org/index.php?title=FOV_using_recursive_shadowcasting_-_improved 
 *  
 * The FOV code is contained in the region "FOV Algorithm". 
 * The method GetVisibleCells() is called to calculate the cells 
 * visible to the player by examing each octant sequantially.  
 * The generic list VisiblePoints contains the cells visible to the player. 
 *  
 * GetVisibleCells() is called everytime the player moves, and the event playerMoved 
 * is called when a successful move is made (the player moves into an empty cell) 
 */ 
TAGAlg.FOVRecurse = function() {
}

TAGAlg.FOVRecurse.prototype = {
    // position from where the FOV is calculated.
    player : { x : 0, y : 0 },
	
	// Radius of the player's vision
	visualRange : 5,
	
	// List of visiible nodes.
	visblePoints : [],
    // The octants which a player can see
	visibleOctants : [ 1, 2, 3, 4, 5, 6, 7, 8],
	
    //  Octant data 
    // 
    //    \ 1 | 2 / 
    //   8 \  |  / 3 
    //   -----+----- 
    //   7 /  |  \ 4 
    //    / 6 | 5 \ 
    // 
    //  1 = NNW, 2 =NNE, 3=ENE, 4=ESE, 5=SSE, 6=SSW, 7=WSW, 8 = WNW 

	/**
     * Start here: go through all the octants which surround the player to 
     * determine which open cells are visible 
     */
	getVisibleCells : function(x, y, rng, grid) {
	    this.visiblePoints = [];
	    this.player.x = x;
		this.player.y = y;
		this.visualRange = rng;
		this.map = grid;
		
		for(var i = 0; i < this.visibleOctants.length; ++i) {
			cc.log("this.scanOctant(1, " + this.visibleOctants[i] + ", 1.0, 0.0);");
			this.scanOctant(1, this.visibleOctants[i], 1.0, 0.0);
		}
		
		return this.visiblePoints;
	},
	
	/**
	 * Examine the provided octant and calculate the visible cells within it. 
     *
	 * @param {int} Depth of the scan
     * @param {int} Octant being examined
     * @param {double} Start slope of the octant
     * @param {double} End slope of the octance
	 */
	scanOctant : function(pDepth, pOctant, pStartSlope, pEndSlope) {
	    var map = this.map;
		var player = this.player;
	    var visrange2 = this.visualRange * this.visualRange;
		var x = 0, y = 0;
		
		switch(pOctant) {
		    case 1 : //nnw 
                y = player.y - pDepth; 
				if (y < 0) return; 
					 
                x = player.x - ((pStartSlope * pDepth) | 0) /* converts to whole number */; 
                if (x < 0) x = 0; 
  
                while (this.getSlope(x, y, player.x, player.y, false) >= pEndSlope) {
				
 				    if (this.getVisDistance(x, y, player.x, player.y) <= visrange2) { 
					
                        if (!map.isWalkableAt(x, y)) { //current cell blocked 
						
                            if (x - 1 >= 0 && map.isWalkableAt(x - 1, y)) {//prior cell within range AND open... 
							
							    //...incremenet the depth, adjust the endslope and recurse 
                                this.scanOctant(pDepth + 1, pOctant, pStartSlope, 
								                this.getSlope(x - 0.5, y + 0.5, this.player.x, this.player.y, false)); 
                            }
							
                        } else {   
						
    					    if (x - 1 >= 0 && !map.isWalkableAt(x - 1, y)) { //prior cell within range AND open... 
								//..adjust the startslope 
								pStartSlope = this.getSlope(x - 0.5, y - 0.5, player.x, player.y, false); 
                            }       
                            this.visiblePoints.push([x, y]); 
                        }                             
                    } 
                    x++; 
                } 
                x--; 

			    break;
		    case 2 : //nne   
                y = player.y - pDepth; 
 				if (y < 0) return;					 
 					 
                x = player.x + ((pStartSlope * pDepth) | 0) /* converts to whole number */; 
                if(x >= map.width) x = map.width - 1; 
                      
                while(this.getSlope(x, y, player.x, player.y, false) <= pEndSlope) { 
                         
				    if (this.getVisDistance(x, y, player.x, player.y) <= visrange2) { 
                             
					    if (!map.isWalkableAt(x, y)) { 
                                 
						    if (x + 1 < map.width && map.isWalkableAt(x + 1, y)) { 
                                     
							    this.scanOctant(pDepth + 1, pOctant, pStartSlope, 
								                this.getSlope(x + 0.5, y + 0.5, player.x, player.y, false)); 
							}
							
                        } else { 
                            if (x + 1 < map.width && !map.isWalkableAt(x + 1, y)) {
								 
                                pStartSlope = -this.getSlope(x + 0.5, y - 0.5, player.x, player.y, false); 
                            }
                                 
						    this.visiblePoints.push([x, y]); 
                        }                             
                    } 
                    x--; 
                } 
                x++; 
                break;
		    case 3 :  
                x = player.x + pDepth; 
 		        if (x >= map.width) return; 
 					 
                y = player.y - ((pStartSlope * pDepth) | 0);  
                if (y < 0) y = 0; 
  
                while (this.getSlope(x, y, player.x, player.y, true) <= pEndSlope) { 
  
                    if (this.getVisDistance(x, y, player.x, player.y) <= visrange2) { 
  
                        if (!map.isWalkableAt(x, y)) { 
						
                            if (y - 1 >= 0 && map.isWalkableAt(x, y - 1)) {
                                this.scanOctant(pDepth + 1, pOctant, pStartSlope, 
								                this.getSlope(x - 0.5, y - 0.5, player.x, player.y, true)); 
							}
							
                        } else { 
						
                            if (y - 1 >= 0 && !map.isWalkableAt(x, y - 1)) {
                                pStartSlope = -this.getSlope(x + 0.5, y - 0.5, player.x, player.y, true); 
							}
  
                            this.visiblePoints.push([x, y]); 
                        }                            
                    } 
                    y++; 
                } 
                y--; 
			    break;
		    case 4 :   
                x = player.x + pDepth; 
 				if (x >= map.width) return; 
 					 
                y = player.y + ((pStartSlope * pDepth) | 0); 
                if (y >= map.height) y = map.height - 1; 
  
                while (this.getSlope(x, y, player.x, player.x, true) >= pEndSlope) {
				
                    if (this.getVisDistance(x, y, player.x, player.y) <= visrange2) { 
  
                        if (!map.isWalkableAt(x, y)) {
						
                            if (y + 1 < map.height&& map.isWalkableAt(x, y + 1)) {
                                this.scanOctant(pDepth + 1, pOctant, pStartSlope, 
								                this.getSlope(x - 0.5, y + 0.5, player.x, player.y, true)); 
							}
						
						} else { 
                        
  					     	if (y + 1 < map.height && !map.isWalkableAt(x, y + 1)) {
                                pStartSlope = this.getSlope(x + 0.5, y + 0.5, player.x, player.y, true); 
                            }
                            
							this.visiblePoints.push([x, y]); 
                        }                           
                    } 
                    y--; 
                } 
                y++; 
			    break;
		    case 5 :
			    y = player.y + pDepth; 
 				if (y >= map.height) return; 
 					 
                x = player.x + ((pStartSlope * pDepth) | 0); 
                if (x >= map.width) x = map.width - 1; 
                      
                while (this.getSlope(x, y, player.x, player.y, false) >= pEndSlope) { 
				
                    if (this.getVisDistance(x, y, player.x, player.y) <= visrange2) { 
  
                        if (!map.isWalkableAt(x, y)) { 
						
                            if (x + 1 < map.height && map.isWalkableAt(x+1, y)) {
							
                                this.scanOctant(pDepth + 1, pOctant, pStartSlope, 
								                this.getSlope(x + 0.5, y - 0.5, player.x, player.y, false)); 
					        }
							
                        } else { 
                            if (x + 1 < map.height && !map.isWalkableAt(x+1, y)) {
                                pStartSlope = this.getSlope(x + 0.5, y + 0.5, player.x, player.y, false); 
							}
  
                            this.visiblePoints.push([x, y]); 
                        } 
                    } 
                    x--; 
                } 
                x++; 
			    break;
		    case 6 :
			    y = player.y + pDepth; 
				if (y >= map.height) return;					 
 					 
                x = player.x - ((pStartSlope * pDepth) | 0); 
                if (x < 0) x = 0; 
                      
                while (this.getSlope(x, y, player.x, player.y, false) <= pEndSlope) { 
                         
				    if (this.getVisDistance(x, y, player.x, player.y) <= visrange2) { 
  
                        if (!map.isWalkableAt(x, y)) { 
						
                            if (x - 1 >= 0 && map.isWalkableAt(x - 1, y)) {
                                     
							    this.scanOctant(pDepth + 1, pOctant, pStartSlope, 
								                this.getSlope(x - 0.5, y - 0.5, player.x, player.y, false)); 
							}
							
                        } else { 
                            
							if (x - 1 >= 0 && !map.isWalkableAt(x - 1, y)) {
							
                                pStartSlope = -this.getSlope(x - 0.5, y + 0.5, player.x, player.y, false); 
							}
  
                            this.visiblePoints.push([x, y]); 
                        } 
                    } 
                    x++; 
                } 
                x--; 
			    break;
		    case 7 :
			    x = player.x - pDepth; 
 				if (x < 0) return; 
 					 
                y = player.y + ((pStartSlope * pDepth) | 0);                     
                if (y >= map.height) y = map.height - 1; 
  
                while (this.getSlope(x, y, player.x, player.y, true) <= pEndSlope) { 
  
                    if (this.getVisDistance(x, y, player.x, player.y) <= visrange2) { 
  
                        if (!map.isWalkableAt(x, y)) { 
                                 
						    if (y + 1 < map.height && map.isWalkableAt(x, y + 1)) {
                                     
							    this.scanOctant(pDepth + 1, pOctant, pStartSlope, 
								                this.getSlope(x + 0.5, y + 0.5, player.x, player.y, true)); 
							}
							
                        } else { 
                                 
						    if (y + 1 < map.height && !map.isWalkableAt(x, y + 1)) {
                                pStartSlope = -this.getSlope(x - 0.5, y + 0.5, player.x, player.y, true); 
							}
  
                            this.visiblePoints.push([x, y]); 
                        } 
                    } 
                    y--; 
                } 
                y++; 
			    break;
		    case 8 ://wnw 
                x = player.x - pDepth; 
 				if (x < 0) return; 
 					 
                y = player.y - ((pStartSlope * pDepth) | 0); 
                if (y < 0) y = 0; 
  
                while (this.getSlope(x, y, player.x, player.y, true) >= pEndSlope) { 
  
                    if (this.getVisDistance(x, y, player.x, player.y) <= visrange2) { 
  
                        if (!map.isWalkableAt(x, y)) { 
                                 
					        if (y - 1 >=0 && map.isWalkableAt(x, y - 1)) {
                                
								this.scanOctant(pDepth + 1, pOctant, pStartSlope, 
								                this.getSlope(x + 0.5, y - 0.5, player.x, player.y, true)); 
							}
  
                        } else { 
                                 
						    if (y - 1 >= 0 && !map.isWalkableAt(x, y - 1)) {
                                     
							    pStartSlope = this.getSlope(x - 0.5, y - 0.5, player.x, player.y, true); 
							}
  
                            this.visiblePoints.push([x, y]); 
                        } 
                    } 
                    y++; 
                } 
                y--; 
    		    break;
		}
		
		if(x < 0) {
		    x = 0;
		} else if (x >= map.width) {
		    x = map.width-1;
		}
		
		if(y < 0) {
		    y = 0;
		} else if (y >= map.height) {
		    y = map.height-1;
		}

		if((pDepth < this.visualRange) & map.isWalkableAt(x, y)) {
		    this.scanOctant(pDepth + 1, pOctant, pStartSlope, pEndSlope);
		}
	},
	
	/**
     * Get the gradient of the slope formed by the two points 
     * @param {double} pX1 
     * @param {double} pY1
     * @param {double} pX2
     * @param {double} pY2 
     * @param {boolean} Invert slope
	 */
    getSlope : function(px1, py1, px2, py2, pInvert) {
	    if(pInvert) {
		    return (py1 - py2) / (px1 - px2);
		} else {
		    return (px1 - px2) / (py1 - py2);
		}
	},
	
	/**
     * Calculate the distance between the two points 
     * @param {int} pX1 
     * @param {int} pY1
     * @param {int} pX2
     * @param {int} pY2
     * @returns {int} Distance
	 */
	getVisDistance : function(px1, py1, px2, py2) {
	    return ((px1 - px2) * (px1 - px2)) + ((py1 - py2) * (py1 - py2));
	}
}