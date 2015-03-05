TAGAlg = TAGAlg || {};
TAGAlg._p = {};
TAGAlg.DigitalFOV = {};
/**
 * The digital FOV
 * (http://roguebasin.roguelikedevelopment.org/index.php?title=Digital_field_of_view)
 * 
 * A line L(a,b,s) is a set of grids(x,y) such that
 * y = (b * x) / a + s, rounded down.
 * A grid (X,Y) in the first octant (that is 0 <= Y <= X) can be seen
 * from the grid (0,0) if and only if (X,Y) is (0,0) or there are
 * real numbers a, b and s such that:
 * 0 <= b / a <= 1
 * L(a, b, s) passes (0,0) and (X,Y)
 * a grid(x,y) on L(a,b,s) is not a wall as long as 1 <= x <= X-1
 */
 
/**
 * Map must be a 2-dimension array with non-zero values for walls
 */
 
 
TAGAlg._p.Ray = function(radius) {
	for(var i = 0, len = radius + 1; i < len; ++i) {
	    this.top_wall_array_u[i] = 0;
	    this.top_wall_array_v[i] = 1;
		this.bottom_wall_array_u[i] = 0;
		this.bottom_wall_array_v[i] = 0;
	}
	
	this.top_wall_num = 1;
	this.bottom_wall_num = 1;
}

TAGAlg._p.Ray.prototype = {
    bottom_ray_touch_top_wall_u : 0,
	bottom_ray_touch_top_wall_v : 1,
	bottom_ray_touch_bottom_wall_u : 1,
	bottom_ray_touch_bottom_wall_v : -1,
	
	top_ray_touch_bottom_wall_u : 0,
	top_ray_touch_bottom_wall_v : 0,
	top_ray_touch_top_wall_u : 1,
	top_ray_touch_top_wall_v : 2,
	
	/**
	 * The bottom ray touches the top wall at
	 * (top_wall_array_u[b_ray_t], top_wall_array_v[b_ray_t])
	 * when it is updated
	 * note that top_wall_array_u[b_ray_t] <= bottom_ray_touch_top_wall_u
	 * even if those 2 numbers may not be equal
	 */
	b_ray_t : 0,
	  
	/**
     * the top ray touches the bottom wall at
     * (bottom_wall_array_u[t_ray_b], bottom_wall_array_v[t_ray_b])
     * when it is updated
     * note that bottom_wall_array_u[t_ray_b] <= top_ray_touch_bottom_wall_u
     * even if those 2 numbers may not be equal
     */
	t_ray_b : 0,
	
	/* Remember only relevant walls */
	top_wall_num : 0,
	bottom_wall_num : 0,
	top_wall_array_u : [],
	top_wall_array_v : [],
	bottom_wall_array_u : [],
	bottom_wall_array_v : [],
	
	deleteRay : function() {
		this.top_wall_array_u = null;
		this.top_wall_array_v = null;
		this.bottom_wall_arrray_u = null;
		this.bottom_wall_array_v = null;
	},
	
	copy : function(from) {
	    if(from === undefined || from === this) return;
		
	    this.bottom_ray_touch_top_wall_u = from.bottom_ray_touch_top_wall_u;
	    this.bottom_ray_touch_top_wall_v = from.bottom_ray_touch_top_wall_v;
	    this.bottom_ray_touch_bottom_wall_u = from.bottom_ray_touch_bottom_wall_u;
	    this.bottom_ray_touch_bottom_wall_v = from.bottom_ray_touch_bottom_wall_v;
	
	    this.top_ray_touch_bottom_wall_u = from.top_ray_touch_bottom_wall_u;
	    this.top_ray_touch_bottom_wall_v = from.top_ray_touch_bottom_wall_v;
	    this.top_ray_touch_top_wall_u = from.top_ray_touch_top_wall_u;
	    this.top_ray_touch_top_wall_v = from.top_ray_touch_top_wall_v;
		
		this.b_ray_t = from.b_ray_t;
		this.t_ray_b = from.t_ray_b;
		this.top_wall_num = from.top_wall_num;
		this.bottom_wall_num = from.bottom_wall_num;
		
		this.top_wall_array_u = [];
		this.top_wall_array_v = [];
		this.bottom_wall_arrray_u = [];
		this.bottom_wall_array_v = [];
		
	    for(var i = 0, len = from.top_wall_array_u.length; i < len; ++i) {
	        this.top_wall_array_u[i] = from.top_wall_array_u[i];
	        this.top_wall_array_v[i] = from.top_wall_array_v[i];
		    this.bottom_wall_array_u[i] = from.bottom_wall_array_u[i];
		    this.bottom_wall_array_v[i] = from.bottom_wall_array_v[i];
	    }
	}
}

TAGAlg._p.rays_add_bottom_wall = function(/*rays*/ rp, u, v) {
    if(!rp) return 1;
	
	if(TAGAlg._p.which_side_of_line(rp.top_ray_touches_bottom_wall_u,
	                                rp.top_ray_touch_bottom_wall_v,
									rp.top_ray_touch_top_wall_u,
									rp.top_ray_touch_top_wall_v,
									u, v+1) >= 0) {
		/* The new bottom wall blocks all rays. */
		return 1;
	}
	
    /* Update bottom ray */
	if(TAGAlg._p.which_side_of_line(rp.bottom_ray_touch_top_wall_u,
	                                rp.bottom_ray_touch_top_wall_v,
									rp.bottom_ray_touch_bottom_wall_u,
									rp.bottom_ray_touch_bottom_wall_v,
									u, v+1) > 0) {
		rp.bottom_ray_touch_bottom_wall_u = u;
		rp.bottom_ray_touch_bottom_wall_v = v + 1;
		
		while(rp.b_ray_t + 1 < rp.top_wall_num) {
		    if(rp.top_wall_array_u[rp.b_ray_t + 1] >= u) {
			    break;
			}
			if(TAGAlg._p.which_side_of_line(rp.bottom_ray_touch_top_wall_u,
	                                        rp.bottom_ray_touch_top_wall_v,
									        rp.bottom_ray_touch_bottom_wall_u,
									        rp.bottom_ray_touch_bottom_wall_v,
									        rp.top_wall_array_u[rp.b_ray_t + 1],
											rp.top_wall_array_v[rp.b_ray_t + 1]) >= 0) {
				break;
		    }
		    rp.bottom_ray_touch_top_wall_u = rp.top_wall_array_u[rp.b_ray_t + 1];
			rp.bottom_ray_touch_top_wall_v = rp.top_wall_array_v[rp.b_ray_t + 1];
			rp.b_ray_t++;
		}
	}
	
	/* Remeber bottom wall */ 
	/* Note that two or more bottom walls may be added to the same ray for a given u */
	if((rp.bottom_wall_num >= 1) &&
	   (rp.bottom_wall_array_u[rp.bottom_wall_num - 1] === u)) {
	    rp.bottom_wall_array_u[rp.bottom_wall_num - 1] = u;
		rp.bottom_wall_array_v[rp.bottom_wall_num - 1] = v + 1;
    } else {
	    rp.bottom_wall_array_u[rp.bottom_wall_num] = u;
		rp.bottom_wall_array_v[rp.bottom_wall_num] = v + 1;
		rp.bottom_wall_num++;
	}
	
	while(rp.bottom_wall_num >= 3) {
	    if(TAGAlg._p.which_side_of_line(rp.bottom_wall_array_u[rp.bottom_wall_num - 3],
	                                    rp.bottom_wall_array_v[rp.bottom_wall_num - 3],
									    rp.bottom_wall_array_u[rp.bottom_wall_num - 1],
									    rp.bottom_wall_array_v[rp.bottom_wall_num - 1],
									    rp.bottom_wall_array_u[rp.bottom_wall_num - 2],
	                                    rp.bottom_wall_array_v[rp.bottom_wall_num - 2]) > 0) {
			break;
		}
		
		/* rp.bottom_wall_array[rp.bottom_wall_num - 2] is no longer relevant */
		rp.bottom_wall_array_u[rp.bottom_wall_num - 2] = rp.bottom_wall_array_u[rp.bottom_wall_num - 1];
        rp.bottom_wall_array_v[rp.bottom_wall_num - 2] = rp.bottom_wall_array_v[rp.bottom_wall_num - 1];
        if(rp.t_ray_b === rp.bottom_wall_num - 2) {
            rp.t_ray_b--;
		}
        rp.bottom_wall_num--;
	}
	
	return 0;
}

TAGAlg._p.rays_add_top_wall = function(/*rays*/ rp, u, v) {
    if(!rp) return 1;
	
	if(TAGAlg._p.which_side_of_line(rp.bottom_ray_touch_top_wall_u,
	                                rp.bottom_ray_touch_top_wall_v,
									rp.bottom_ray_touch_bottom_wall_u,
									rp.bottom_ray_touch_bottom_wall_v,
									u, v) <= 0) {
		/* The new top wall blocks all rays. */
		return 1;
	}
	
    if(TAGAlg._p.which_side_of_line(rp.top_ray_touch_bottom_wall_u,
	                                rp.top_ray_touch_bottom_wall_v,
									rp.top_ray_touch_top_wall_u,
									rp.top_ray_touch_top_wall_v,
									u, v) < 0) {
		rp.top_ray_touch_top_wall_u = u;
		rp.top_ray_touch_top_wall_v = v;
		
		while(rp.t_ray_b + 1 < rp.bottom_wall_num) {
		    if(rp.bottom_wall_array_u[rp.t_ray_b + 1] >= u) {
			    break;
			}
			
			if(TAGAlg._p.which_side_of_line(rp.top_ray_touch_bottom_wall_u,
	                                        rp.top_ray_touch_bottom_wall_v,
								        	rp.top_ray_touch_top_wall_u,
									        rp.top_ray_touch_top_wall_v,
									        rp.bottom_wall_array_u[rp.t_ray_b + 1],
											rp.bottom_wall_array_v[rp.t_ray_b + 1]) <= 0) {
                break;
            }

            rp.top_ray_touch_bottom_wall_u = rp.bottom_wall_array_u[rp.t_ray_b + 1];
			rp.top_ray_touch_bottom_wall_v = rp.bottom_wall_array_v[rp.t_ray_b + 1];
			rp.t_ray_b++;
		}
	}
	
	/* Remember top wall. */
	rp.top_wall_array_u[rp.top_wall_num] = u;
	rp.top_wall_array_v[rp.top_wall_num] = v;
	rp.top_wall_num++;
	
	while(rp.top_wall_num >= 3) {
	    if(TAGAlg._p.which_side_of_line(rp.top_wall_array_u[rp.top_wall_num - 3],
	                                    rp.top_wall_array_v[rp.top_wall_num - 3],
								        rp.top_wall_array_u[rp.top_wall_num - 1],
									    rp.top_wall_array_v[rp.top_wall_num - 1],
									    rp.top_wall_array_u[rp.top_wall_num - 2],
									    rp.top_wall_array_v[rp.top_wall_num - 2]) < 0) {
                break;
        }
		
		/* rp.top_wall_array[rp.top_wall_num - 2] is no longer relevant */
		rp.top_wall_array_u[rp.top_wall_num - 2] = rp.top_wall_array_u[rp.top_wall_num - 1];
		rp.top_wall_array_v[rp.top_wall_num - 2] = rp.top_wall_array_v[rp.top_wall_num - 1];
		if(rp.b_ray_t === rp.top_wall_num - 2) {
		    rp.b_ray_t--;
		}
		rp.top_wall_num--;
	}
	
	return 0;
}

/* return 1 (true) or 0 (false) */
TAGAlg._p.grid_is_illegal = function(x, y, width, height) {
    if((x < 0) || (x >= width))
	    return true;
	if((y < 0) || (y >= height))
	    return true;
		
	return false;
}

/**
 * Suppose that:
 * there are 4 points (ax, ay), (bx, by), (x, y) and (x, Y)
 * ax < bx
 * the 3 points (ax, ay), (bx, by) and (x, Y) are on the same line
 * The return value of this function has same sign as y - Y, that is,
 * this function returns a positive value if and only if (x, y) is
 * above the line which passes (ax, bx) and (bx, by).
 * The caller of this function must ensure that ax < bx.
 */
TAGAlg._p.which_side_of_line = function(ax, ay, bx, by, x, y) {
    return (y-ay) * (bx-ax) - (by-ay) * (x-ax);
}
 
/**
 * Line of Sight
 * runs at 0(N)
 * returns non-zero if the grid(bx, by) can be seen from the grid (ax, ay)
 * 0 otherwise.
 */
TAGAlg.DigitalFOV.digital_los = function(map, width, height, ax, ay, bx, by) {
    /** 
	 * A ray passes (0,0) and (X,Y) passesno grid other than
	 * (x, (x * Y) / X) and (x, (x * Y) / X + 1)
	 */
	var dx, dy, dx_abs, dy_abs;
	var u, v, du_abs, dv_abs;
    var dir, temp;
	var x0, y0, x1, y1;
	var grid0_is_illegal, grid1_is_illegal;
	var r = 0; 
	var result = 1;
	
	var bottom_ray_touch_top_wall_u = 0;
	var bottom_ray_touch_top_wall_v = 1;
	var bottom_ray_touch_bottom_wall_u = 1;
	var bottom_ray_touch_bottom_wall_v = -1;
	
	var top_ray_touch_bottom_wall_u = 0;
	var top_ray_touch_bottom_wall_v = 0;
	var top_ray_touch_top_wall_u = 1;
	var top_ray_touch_top_wall_v = 2;
	
	/**
     * The bottom ray touches the top wall at
     * (top_wall_array_u[b_ray_t], top_wall_array_v[b_ray_t])
     * when it is updated
     * note that top_wall_array_u[b_ray_t] <= bottom_ray_touch_top_wall_u
     * even if those 2 numbers may not be equal
     */
    var b_ray_t = 0;
 
    /**
     * the top ray touches the bottom wall at
     * (bottom_wall_array_u[t_ray_b], bottom_wall_array_v[t_ray_b])
     * when it is updated
     * note that bottom_wall_array_u[t_ray_b] <= top_ray_touch_bottom_wall_u
     * even if those 2 numbers may not be equal
     */
	var t_ray_b = 0;
	
	/* Remember only relevant walls */
	var top_wall_num = 1;
	var bottom_wall_num = 1;
	var top_wall_array_u = [0];
	var top_wall_array_v = [1];
	var bottom_wall_array_u = [0];
	var bottom_wall_array_v = [0];
	
	if(!map) { 
	    return 0;
	}
	if(TAGAlg._p.grid_is_illegal(ax, ay, width, height)) {
	    return 0;
	}
	if(TAGAlg._p.grid_is_illegal(bx, by, width, height)) {
	    return 0;
	}
	
	dx = bx - ax;
	dy = by - ay;
	dx_abs = Math.abs(dx);
	dy_abs = Math.abs(dy);
	
	if((dx_abs <= 1) && (dy <= 1)) {
	    return 1;
	}
	
	if(dx >= 0) {
	    if(dy >= 0) {
		    if(dx_abs >= dy_abs) {
			    dir = 0;
			} else { 
			    dir = 1;
			}
		} else {
		    if(dx_abs >= dy_abs) {
			    dir = 7;
			} else {
			    dir = 6;
			}
		}
	} else {
	    if(dy >= 0) {
		    if(dx_abs >= dy_abs) {
			    dir = 3;
			} else {
			    dir = 2;
			}
		} else {
		    if(dx_abs >= dy_abs) {
			    dir = 4;
			} else {
			    dir = 5;
			}
		}
	}
	
	if(dx_abs >= dy_abs) {
	    du_abs = dx_abs;
		dv_abs = dy_abs;
	} else {
	    du_abs = dy_abs;
		dv_abs = dx_abs;
	}
		
	v = 0;
	r = 0;
	for(u = 1; u <= du_abs; ++u) {
	    /**
     	 * v = (u * dv_abs) / du_abs;
         * r = (u * dv_abs) % du_abs;
         */
		r += dv_abs;
		if(r >= du_abs) {
		    v++;
			r-= du_abs;
		}
		
		x0 = u;
		y0 = v;
		x1 = u;
		y1 = v + 1;
		
		if((dir & 1) === 1) {
		    temp = x0;
			x0 = y0;
			y0 = temp;
			
			temp = x1;
			x1 = y1;
			y1 = temp;
		}
		if((dir & 2) === 2) {
		    temp = x0;
			x0 = -y0;
			y0 = temp;
			
			temp = x1;
			x1 = -y1;
			y1 = temp;
		}
		if((dir & 4) === 4) {
		    x0 = -x0;
			y0 = -y0;
			
			x1 = -x1;
			y1 = -y1;
		}
		
		x0 += ax;
		y0 += ay;
		x1 += ax;
		y1 += ay;
		
		grid0_is_illegal = TAGAlg._p.grid_is_illegal(x0, y0, width, height); 
		grid1_is_illegal = TAGAlg._p.grid_is_illegal(x1, y1, width, height); 
		
		if(r === 0)
		{
		    if(!((!grid0_is_illegal)
			      && (TAGAlg._p.which_side_of_line(bottom_ray_touch_top_wall_u,
	                                               bottom_ray_touch_top_wall_v,
								                   bottom_ray_touch_bottom_wall_u,
									               bottom_ray_touch_bottom_wall_v,
									               u, v + 1) > 0)
		          && (TAGAlg._p.which_side_of_line(top_ray_touch_bottom_wall_u,
	                                               top_ray_touch_bottom_wall_v,
								                   top_ray_touch_top_wall_u,
									               top_ray_touch_top_wall_v,
									               u, v) < 0))) {
			    result = 0;
				break;
			}

		    if((grid0_is_illegal) || (!map.isWalkableAt(x0, y0))) {
		        if(u < du_abs) {
		    	    result = 0;
		    	}
		    	break;
		    }
		} else {
		    /* check if some ray is still available. */
			if((!((!grid0_is_illegal)
			       && (TAGAlg._p.which_side_of_line(bottom_ray_touch_top_wall_u,
	                                                bottom_ray_touch_top_wall_v,
								                    bottom_ray_touch_bottom_wall_u,
									                bottom_ray_touch_bottom_wall_v,
									                u, v + 1) > 0)
		           && (TAGAlg._p.which_side_of_line(top_ray_touch_bottom_wall_u,
	                                                top_ray_touch_bottom_wall_v,
								                    top_ray_touch_top_wall_u,
									                top_ray_touch_top_wall_v,
									                u, v) < 0)))
				&& (!((!grid1_is_illegal)
				       && (TAGAlg._p.which_side_of_line(bottom_ray_touch_top_wall_u,
	                                                    bottom_ray_touch_top_wall_v,
								                        bottom_ray_touch_bottom_wall_u,
									                    bottom_ray_touch_bottom_wall_v,
									                    u, v + 2) > 0)
		           && (TAGAlg._p.which_side_of_line(top_ray_touch_bottom_wall_u,
	                                                top_ray_touch_bottom_wall_v,
								                    top_ray_touch_top_wall_u,
									                top_ray_touch_top_wall_v,
									                u, v + 1) < 0)))) {
				result = 0;
				break;
			}
			
			/* update top and bottom ray */
			if((grid0_is_illegal) || (!grid.isWalkableAt(x0, y0))) {
			    if(TAGAlg._p.which_side_of_line(bottom_ray_touch_top_wall_u,
	                                            bottom_ray_touch_top_wall_v,
								                bottom_ray_touch_bottom_wall_u,
									            bottom_ray_touch_bottom_wall_v,
									            u, v + 1) > 0) {
					bottom_ray_touch_bottom_wall_u = u;
					bottom_ray_touch_bottom_wall_v = v + 1;
					while(b_ray_t + 1 < top_wall_num) {
					    /**
						 * This loop is called at most du_abs times
						 * because each call increases bottom_ray_touch_top_wall_u,
						 * which starts at 0 and can't be greater than du_abs.
						 */
						if(TAGAlg._p.which_side_of_line(bottom_ray_touch_top_wall_u,
	                                                    bottom_ray_touch_top_wall_v,
								                        bottom_ray_touch_bottom_wall_u,
									                    bottom_ray_touch_bottom_wall_v,
									                    top_wall_array_u[b_ray_t + 1], 
														top_wall_array_v[b_ray_t + 1]) >= 0) {
							break;
					    }
                        bottom_ray_touch_top_wall_u = top_wall_array_u[b_ray_t + 1];
                        bottom_ray_touch_top_wall_v = top_wall_array_v[b_ray_t + 1];
                        b_ray_t++;					
					}
				}
			}
			if((grid1_is_illegal) || (!grid.isWalkableAt(x1, y1))) {
			    if(TAGAlg._p.which_side_of_line(top_ray_touch_bottom_wall_u,
	                                            top_ray_touch_bottom_wall_v,
								                top_ray_touch_top_wall_u,
									            top_ray_touch_top_wall_v,
									            u, v + 1) < 0) {
					top_ray_touch_top_wall_u = u;
					top_ray_touch_top_wall_v = v + 1;
					while(t_ray_b + 1 < bottom_wall_num) {
					    /**
						 * This loop is called at most du_abs times
						 * because each call increases top_ray_touch_bottom_wall_u,
						 * which starts at 0 and can't be greater than du_abs.
						 */
						if(TAGAlg._p.which_side_of_line(top_ray_touch_bottom_wall_u,
	                                                    top_ray_touch_bottom_wall_v,
								                        top_ray_touch_top_wall_u,
									                    top_ray_touch_top_wall_v,
									                    bottom_wall_array_u[t_ray_b + 1], 
														bottom_wall_array_v[t_ray_b + 1]) <= 0) {
							break;
					    }
                        top_ray_touch_bottom_wall_u = bottom_wall_array_u[t_ray_b + 1];
                        top_ray_touch_bottom_wall_v = bottom_wall_array_v[t_ray_b + 1];
                        b_ray_t++;					
					}
				}
			}
			
			/* Remember wall */
			if((grid0_is_illegal) || (!grid.isWalkableAt(x0, y0))) {
			    if(TAGAlg._p.which_side_of_line(top_ray_touch_bottom_wall_u,
	                                            top_ray_touch_bottom_wall_v,
								                top_ray_touch_top_wall_u,
									            top_ray_touch_top_wall_v,
									            u, v + 1) >= 0) {
					/* The new bottom wall blocks all rays */
					if(u < du_abs) {
					    result = 0;
					}
					break;
				}

                bottom_wall_array_u[bottom_wall_num] = u;
                bottom_wall_array_v[bottom_wall_num] = v + 1;
                bottom_wall_num++;

                while (bottom_wall_num >= 3) {
				    /** 
					 * this loop is called at most (2 * du_abs) times
                     * because for each u, each call after the first removes
                     * a wall from bottom_wall_array and at most du_abs walls
                     * can be added to bottom_wall_array
                     */
					if(TAGAlg._p.which_side_of_line(bottom_wall_array_u[bottom_wall_num - 3],
	                                                bottom_wall_array_v[bottom_wall_num - 3],
								                    bottom_wall_array_u[bottom_wall_num - 1],
									                bottom_wall_array_v[bottom_wall_num - 1],
									                bottom_wall_array_u[bottom_wall_num - 2], 
													bottom_wall_array_v[bottom_wall_num - 2]) > 0) {
						break;
				    }
					
					/* bottom_wall_array[bottom_wall_num - 2] is no longer relevant */
                    bottom_wall_array_u[bottom_wall_num - 2] = bottom_wall_array_u[bottom_wall_num - 1];
                    bottom_wall_array_v[bottom_wall_num - 2] = bottom_wall_array_v[bottom_wall_num - 1];
                    if (t_ray_b === bottom_wall_num - 2) {
                        t_ray_b--;
					}
                    bottom_wall_num--;
				}
			}
			if((grid1_is_illegal) || (!grid.isWalkableAt(x1, y1))) {
			    if(TAGAlg._p.which_side_of_line(bottom_ray_touch_top_wall_u,
	                                            bottom_ray_touch_top_wall_v,
								                bottom_ray_touch_bottom_wall_u,
									            bottom_ray_touch_bottom_wall_v,
									            u, v + 1) <= 0) {
					/* The new top wall blocks all rays */
					if(u < du_abs) {
					    result = 0;
					}
					break;
				}

                top_wall_array_u[top_wall_num] = u;
                top_wall_array_v[top_wall_num] = v + 1;
                top_wall_num++;

                while (top_wall_num >= 3) {
				    /** 
					 * this loop is called at most (2 * du_abs) times
                     * because for each u, each call after the first removes
                     * a wall from top_wall_array and at most du_abs walls
                     * can be added to bottom_wall_array
                     */
					if(TAGAlg._p.which_side_of_line(top_wall_array_u[top_wall_num - 3],
	                                                top_wall_array_u[top_wall_num - 3],
								                    top_wall_array_u[top_wall_num - 1],
									                top_wall_array_u[top_wall_num - 1],
									                top_wall_array_u[top_wall_num - 2], 
													top_wall_array_u[top_wall_num - 2]) < 0) {
						break;
				    }
					
					/* top_wall_array_u[top_wall_num - 2] is no longer relevant */
                    top_wall_array_u[top_wall_num - 2] = top_wall_array_u[top_wall_num - 1];
                    top_wall_array_u[top_wall_num - 2] = top_wall_array_u[top_wall_num - 1];
                    if (b_ray_t === top_wall_num - 2) {
                        b_ray_t--;
					}
                    top_wall_num--;
				}
			}
		}
	}
	
	return result;
}

TAGAlg._p.digital_fov_recursive_body = function(map, width, height, map_fov, 
                                                center_x, center_y, radius, 
												dir, u_start, /* ray */ rp) {
    /**
     * If a wall is found, divide all rays that are not blocked
     * by it into 2 groups: rays that pass above it and rays that pass
     * below it.  Handle the "below" group with another call of
     * this function.
     */
    var u, v;
    var temp;
    var x, y;
    var illegal;
    var v_start, v_end;
    var previous_grid_is_wall;
    var new_top_wall_found;
    var new_top_wall_v;

    var rp_child = null;

    if(!rp) {
        return 1;
	}
	
    if (rp.bottom_ray_touch_bottom_wall_u === rp.bottom_ray_touch_top_wall_u) {
        rp.deleteRay();
        return 1;
    }
	
    if (rp.top_ray_touch_top_wall_u === rp.top_ray_touch_bottom_wall_u) {
        rp.deleteRay();
        return 1;
    }

    for (u = u_start; u <= radius; ++u) {
        v_start = rp.bottom_ray_touch_bottom_wall_v - rp.bottom_ray_touch_top_wall_v;
        v_start *= u - rp.bottom_ray_touch_top_wall_u;
		
        /**
		 * if v_start is non-negative, this round it down
         * if v_start is negative, we don't care because
         * v_start is set to 0 later
         */
        v_start /= rp.bottom_ray_touch_bottom_wall_u - rp.bottom_ray_touch_top_wall_u;
        v_start += rp.bottom_ray_touch_top_wall_v;
        if(v_start < 0) {
            v_start = 0;
		} else {
			v_start |= 0;
		}

        v_end = rp.top_ray_touch_top_wall_v - rp.top_ray_touch_bottom_wall_v;
        v_end *= u - rp.top_ray_touch_bottom_wall_u;
        /** 
		 * v_end must be rounded up
         * note that v_end can't be negative
         */
        v_end += rp.top_ray_touch_top_wall_u - rp.top_ray_touch_bottom_wall_u - 1;
        v_end /= rp.top_ray_touch_top_wall_u - rp.top_ray_touch_bottom_wall_u;
        v_end += rp.top_ray_touch_bottom_wall_v;
        v_end -= 1;
        v_end = (v_end + 0.5) | 0;
        if(v_end > u) {
            v_end = u;
		}

        previous_grid_is_wall = true;
        new_top_wall_found = false;
        new_top_wall_v = rp.top_ray_touch_top_wall_v;

        if (v_start > v_end) {
            break;
		}

        for (v = v_start; v <= v_end; ++v){
        	//cc.log("u,v = (" + u + "," + v + ")");
        	//cc.log("v_start,v_end = (" + v_start + "," + v_end + ")");
            x = u;
            y = v;

            if((dir & 1) == 1) {
                temp = x;
                x = y;
                y = temp;
            }
            if((dir & 2) == 2) {
                temp = x;
                x = -y;
                y = temp;
            }
            if((dir & 4) == 4) {
                x = -x;
                y = -y;
            }

            //cc.log("center_x,center_y = (" + center_x + "," + center_y + ")");
            //cc.log("width,height = (" + width + "," + height + ")");
            x += center_x;
            y += center_y;

            illegal = TAGAlg._p.grid_is_illegal(x, y, width, height);

            if(!illegal) {
            	//cc.log("x,y(" + x + "," + y + ") width(" + width + "), height(" + height + ")");
            	//cc.log("indices = [" + (x - center_x + radius) + "] [" + (y - center_y + radius) + "]");
                map_fov[x - center_x + radius][y - center_y + radius] = 1;
		    }

            if((illegal) || (!map.isWalkableAt(x,y))) {
                if (!previous_grid_is_wall) {
                    new_top_wall_found = true;
                    new_top_wall_v = v;
                }

                previous_grid_is_wall = true;
            }
            else {
                if (previous_grid_is_wall) {
                    if (new_top_wall_found) {
                    	rp_child = new TAGAlg._p.Ray(radius);
						
                        rp_child.copy(rp);
                        TAGAlg._p.rays_add_top_wall(rp_child, u, new_top_wall_v);
                        if (TAGAlg._p.digital_fov_recursive_body(map,
                                                                 width, height,
                                                                 map_fov,
                                                                 center_x, center_y, radius,
                                                                 dir,
                                                                 u + 1,
                                                                 rp_child) != 0) {
                            rp.deleteRay();
                            return 1;
                        }
                        rp_child.deleteRay();
						rp_child = null;
                        new_top_wall_found = false;
                    }
                    TAGAlg._p.rays_add_bottom_wall(rp, u, v - 1);
                }
                previous_grid_is_wall = false;
            }
        }

        if (new_top_wall_found) {
            TAGAlg._p.rays_add_top_wall(rp, u, new_top_wall_v);
        }
        else if (previous_grid_is_wall) { 
            break;
        }
    }

    rp.deleteRay();
	return 0;
}

/**
 * map_fov must be a 2d array of size (2*radius + 1, 2 * radius + 1)
 * The caller of the function must allocate enough memory to map_fov
 * before calling.
 * The result is written to map_fov; the grid(x,y) can be seen from
 * the grid(center_x, center_y) if and only if
 * map_fov[x - center_x + radius][y - center_y + radius] is non-zero.
 *
 * Field of Vision
 * uses shadowcasting
 * runs at 0(N^2) in the sense that each grid in an octant is visited 
 * at most once
 * returns 0 on success, 1 on error.
 */
 TAGAlg.DigitalFOV.digital_fov = function(map, width, height, 
                                          map_fov, center_x, center_y, 
										  radius) {
    var x, y, dir;
    var error_found;
    var rp = null;

    if(!map) {
        return 1;
	}
    if(!map_fov) {
    	return 1;
	}
    if(radius < 0) {
        return 1;
	}
    cc.log("center_x,center_y = (" + center_x + "," + center_y + ")");
	var xLen = center_x + radius;
	var yLen = center_y + radius;
    for(x = center_x - radius; x <= xLen; x++) {
        for(y = center_y - radius; y <= yLen; y++) {
        	//cc.log("indices = [" + (x - center_x + radius) + "] [" + (y - center_y + radius) + "]");
            map_fov[x - center_x + radius][y - center_y + radius] = 0;
        }
    }

    if (TAGAlg._p.grid_is_illegal(center_x, center_y, width, height)) {
        return 1;
	}

    map_fov[0 + radius][0 + radius] = 1;

    error_found = 0;
    for (dir = 0; dir < 8; dir++) {
    	rp = new TAGAlg._p.Ray(radius);
		
        if(TAGAlg._p.digital_fov_recursive_body(map, width, height,
                                                map_fov,
                                                center_x, center_y, 
												radius, dir,
                                                1, rp) != 0) {
            error_found = 1;
		}
        rp.deleteRay();
		rp = null;
    }

    return error_found;
}