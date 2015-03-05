var TAGAlg = TAGAlg || {};

TAGAlg.Delaunay = undefined;

(function() {

    var EPSILON = 1.0 / 1048576.0;

	function supertriangle(vertices) {
	    var xmin = Number.POSITIVE_INFINITY,
		    ymin = Number.POSITIVE_INFINITY,
			xmax = Number.NEGATIVE_INFINITY,
			ymax = Number.NEGATIVE_INFINITY,
			i, dx, dy, dmax, xmid, ymid;
		
		for(i = vertices.length; i--; ) {
		    if(vertices[i][0] < xmin) xmin = vertices[i][0];
		    if(vertices[i][0] > xmax) xmax = vertices[i][0];
		    if(vertices[i][1] < ymin) ymin = vertices[i][1];
		    if(vertices[i][1] > ymax) ymax = vertices[i][1];
		}
		
		dx = xmax - xmin;
		dy = ymax - ymin;
		dmax = Math.max(dx, dy);
		xmid = xmin + (dx * 0.5);
		ymid = ymin + (dy * 0.5);
		
		return [
		    [xmid - 20 * dmax, ymid -      dmax],
			[xmid            , ymid + 20 * dmax],
			[xmid + 20 * dmax, ymid -      dmax]
		];
	}
	
	function circumcircle(vertices, i, j, k) {
	    var x1 = vertices[i][0],
		    y1 = vertices[i][1],
			x2 = vertices[j][0],
			y2 = vertices[j][1],
			x3 = vertices[k][0],
			y3 = vertices[k][1],
			fabsy1y2 = Math.abs(y1 - y2),
			fabsy2y3 = Math.abs(y2 - y3),
			xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;
			
		/* Checj for coincident points */
		if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON) {
		    throw new Error("Delaunay: Coincendent points!");
		}
		
		if(fabsy1y2 < EPSILON) {
		    m2 = -((x3 - x2) / (y3 - y2));
			mx2 = (x2 + x3) / 2.0;
			my2 = (y2 + y3) / 2.0;
			xc = (x2 + x1) / 2.0;
			yc = m2 * (xc - mx2) + my2;
		}
		
		else if(fabsy2y3 < EPSILON) {
		    m1 = -((x2 - x1) / (y2 - y1));
			mx1 = (x1 + x2) / 2.0;
			my1 = (y1 + y2) / 2.0;
			xc = (x3 + x2) / 2.0;
			yc = m1 * (xc - mx1) + my1;
		}
		
		else {
		    m1 = -((x2 - x1) / (y2 - y1));
			m2 = -((x3 - x2) / (y3 - y2));
			mx1 = (x1 + x2) / 2.0;
			mx2 = (x2 + x3) / 2.0;
			my1 = (y1 + y2) / 2.0;
			my2 = (y2 + y3) / 2.0;
			xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
			yc = (fabsy1y2 > fabsy2y3) ?
			    m1 * (xc - mx1) + my1 :
				m2 * (xc - mx2) + my2;
		}
		
		dx = x2 - xc;
		dy = y2 - yc;
		return {i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy}; 
	}
	
	function dedup(edges) {
	    var i, j, a, b, m, n;
		
		for(j = edges.length; j; ) {
		    b = edges[--j];
			a = edges[--j];
			
			for(i = j; i; ) {
			    n = edges[--i];
				m = edges[--i];
				
				if((a === m && b ===n) || (a === n && b === m)) {
				    edges.splice(j, 2);
					edges.splice(i, 2);
				    break;
				}
			}
		}
	}
	
    TAGAlg.Delaunay = {
	    /* 
		 * Calculates a list of triangles from a list of vertex.
		 * Expects an array of vertices i.e:
		 *    verticies[0] = [x, y]
		 *    verticies[1] = [x, y]
		 *    verticies[2] = [x, y]
		 * Returns a giant array, arranged in triplets, representing triangles by indices into the input array.
		 * i,e, triangle 1 = vertices[triangles[0]][0], vertices[triangles[0]][1]),
		 *		   vertices[triangles[1]][0], vertices[triangles[1]][1]),
		 *		   vertices[triangles[2]][0], vertices[triangles[2]][1]),
		 */
	    triangulate : function(vertices, allowIntersects) {
            if(allowIntersects === undefined) allowIntersects = true;	
			
		    var n = vertices.length,
			    i, j, indices, st, open, closed, edges, dx, dy, a, b, c;
				
			/* Bail if there aren't enough vertices to form any triangles. */
			if(n < 3)
			    return [];
				
			/* Slice out the actual vertices from the passed objects. (Duplicate the
			 * array even if we don't, though, since we need to make a supertriangle
			 * later on!) */
			vertices = vertices.slice(0);
			
			/* Make and array of indices into the vertex array, sorted by the
			 * vertices' x-position. */
			indices = new Array(n);
			
			for(i = n; i--; ) {
			    indices[i] = i;
			}
			
			indices.sort(function(i, j) {
			    return vertices[j][0] - vertices[i][0];
			});
			
			/* Next, find the vertices of the supertriangle (which contains all other
			 * triangles), and append them onto the end of a (copy of) the vertex
			 * array. */
			st = supertriangle(vertices);
			vertices.push(st[0], st[1], st[2]);
			
			/* Initialize the open list (containing the supertriable and nothing
			 * else) and the closed list (which is empty since we haven't processed
			 * any triangles yet). */
			open = [circumcircle(vertices, n + 0, n + 1, n + 2)];
			closed = [];
			edges = [];
			
			/* Incrementally add each vertex to the mesh. */
			for(i = indices.length; i--; edges.length = 0) {
			    c = indices[i];
				
				/* For each open triangle, check to see if the current point is 
				 * inside it's circumcircle. If it is, remove the triangle and add 
				 * it's edges to an edge list. */
				for(j = open.length; j--; ) {
				    /* If this point is to the right of this triangle's circumcircle,
					 * then this triangle should never get checked again. Remove it
					 * from the open list, add it to the closed list, and skip. */
					dx = vertices[c][0] - open[j].x;
					if(dx > 0.0 && dx * dx > open[j].r) {
					    closed.push(open[j]);
						open.splice(j, 1);
						continue;
					}
					
					/* If we're outside the circumcircle, skip this triangle. */
					dy = vertices[c][1] - open[j].y;
					if(dx * dx + dy * dy - open[j].r > EPSILON) {
					    continue;
					}
					
					/* Remove the triangle and add it's edges to the edge list. */
					edges.push(
					    open[j].i, open[j].j,
						open[j].j, open[j].k,
						open[j].k, open[j].i
					);
					
					open.slice(j, 1);
				}
				
				/* Remove any doubled edges. */
				dedup(edges); 
				
				/* Add a new triangle for each edge. */
				for(j = edges.length; j; ) {
				    b = edges[--j];
					a = edges[--j];
					open.push(circumcircle(vertices, a, b, c));
				}
			}
			
			/* Copy any remaining open triangles to the closed list, and then
			 * remove any triangles that share a vertex with the supertriangle,
			 * building a list of triplets that represent triangles. */
			for(i = open.length; i--; ) {
			    closed.push(open[i]);
			}
			open = [];
						
			for(i = closed.length; i--; ) {
			    if(closed[i].i < n && closed[i].j < n && closed[i].k < n)
				    if(allowIntersects) {
        			    open.push([closed[i].i, closed[i].j], 
        			    		  [closed[i].j, closed[i].k],
    	    		    		  [closed[i].k, closed[i].i]);    
					} else {
					    this.handleIntersection(closed[i].i, closed[i].j, open, vertices);
					    this.handleIntersection(closed[i].j, closed[i].k, open, vertices);
					    this.handleIntersection(closed[i].k, closed[i].i, open, vertices);
					}
			}
			
			// If intersects are not allowed need to reconstrcut open list removing nulls.
			if(allowIntersects === false) {
				closed = open;
				open = [];
			    for(var i = 0, len = closed.length; i < len; i++) {
                    if(closed[i] !== null) {
                        open.push(closed[i]);
                    }
                }					
			}
			
			/* Yay we're done! */
			return open;
		},
		
		contains : function(tri, p) { 
            /* Bounding box test first, for quick rejections. */ 
            if((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) || 
               (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) || 
               (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) || 
               (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1])) { 
                return null; 
			}
  
            var a = tri[1][0] - tri[0][0], 
                b = tri[2][0] - tri[0][0], 
                c = tri[1][1] - tri[0][1], 
                d = tri[2][1] - tri[0][1], 
                i = a * d - b * c; 
  
            /* Degenerate tri. */   
			if(i === 0.0) {
                return null; 
			}
  
            var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i, 
                v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i; 
  
            /* If we're outside the tri, fail. */ 
            if(u < 0.0 || v < 0.0 || (u + v) > 1.0) {
                return null; 
			}
  
            return [u, v]; 
		},
		
		handleIntersection : function(p1, p2, open, vertices) {
		    var p1x = vertices[p1][0],
			    p1y = vertices[p1][1],
                p2x = vertices[p2][0],
			    p2y = vertices[p2][1],
				p3x, p3y, p4x, p4y;
				
			var x = p2x - p1x;
			var y = p2y - p1y;
			var p12Len = (x * x) + (y * y);
            var p34Len = 0;			 
				
			var intersections = [];
			
			for(var i = 0, len = open.length; i < len; i++) {
			    if(open[i] === null) continue;
				
			    p3x = vertices[open[i][0]][0];
			    p3y = vertices[open[i][0]][1];
                p4x = vertices[open[i][1]][0];
                p4y = vertices[open[i][1]][1];

                //cc.log("p3x = " + p3x + " p3y = " + p3y + " p4x = " + p4x + " p4y = " + p4y);
				
				if(this.intersects(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y)) {
				    // On intersection only store the shortest line.
					x = p4x - p3x;
					y = p4y - p3y;
					p34Len = (x * x) + (y * y);
					
					if(p34Len < p12Len) {
					    // Line on open list is shorted than new line so discard new line.
					    return;
					} else {
					    // New line is shorter than line on open list. Store open list index for possible removal.
						intersections.push(i);
					}
				}
			}
			
			// If we reach here there was either no intersections, or the new line is shorter than any line it intersects with.
			// Therefore remove those lines from the open list.
			for(var i = 0, len = intersections.length; i < len; i++) {
			    open[intersections[i]] = null;
			}
			
			open.push([p1, p2]);
		},
		 
		intersects : function(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
		    var s1x = p2x - p1x,
			    s1y = p2y - p1y,
				s2x = p4x - p3x,
				s2y = p4y - p3y;
				
			// Check for parallels.
			var div = (-s2x * s1y + s1x * s2y);
			if(div === 0) {
			    return false;
			}
				
			var s = (-s1y * (p1x - p3x) + s1x * (p1y - p3y)) / div,
			    t = ( s2x * (p1y - p3y) - s2y * (p1x - p3x)) / div;
				
			if(s > 0 && s < 1 && t > 0 && t < 1) {
				cc.log("intersection");
                return true;
			}
            return false;			
		}
    };
	
})();

