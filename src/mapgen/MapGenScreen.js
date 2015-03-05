var MapGenScreen = cc.DrawNode.extend({
	ctor : function() {
		this._super();
		this.init();
	},

	init : function() {
	    var winSize = cc.director.getWinSize();
		this.window = {
		    left : 0,
			top : 0,
			right : winSize.width,
			bottom : winSize.height
		};
		
		/* Set mapgen settings based on window size. */
		mapgen.SETTINGS.xOrigin = winSize.width / 2;
		mapgen.SETTINGS.yOrigin = winSize.height / 2;
		mapgen.SETTINGS.radius = 
			(winSize.width < winSize.height) ? 
					(winSize.width / 2) - 100 : 
					(winSize.height / 2) - 100;
		
	    this.rooms = [];
	    
	    this.built = false;
	    this.totalRooms = 150;
	    this.roomCount = 0;
	    this.buildMode = 0;
		
		this.filters = [];
		this.filters.push(new mapgen.MinRoomSizeFilter(mapgen.SETTINGS.minRoomWidth, 
		                                               mapgen.SETTINGS.minRoomHeight));
		this.filters.push(new mapgen.CircleBoundsFilter(mapgen.SETTINGS.xOrigin, 
		                                                mapgen.SETTINGS.yOrigin, 
												        mapgen.SETTINGS.radius));
		this.filters.push(new mapgen.SquareHaloFilter(mapgen.SETTINGS.xOrigin,
				                                      mapgen.SETTINGS.yOrigin,
                                                      300, 50, winSize.width, 100));
	    
	    this.scheduleUpdate();
	},
	
	metric_dist : function( a, b ) {
		if(a === undefined) {
			return 0;
		}
		if(b === undefined) {
			return 0;
		}
		var dx = a[0] - b[0];
		var dy = a[1] - b[1];
		return dx*dx + dy*dy;
	},
	
	update : function() {
		if(this.built) return;
		
		/* Create random rooms within a radius */
		if(this.roomCount < this.totalRooms) {
			this.rooms.push(mapgen.createRoom());
			this.updateDisplay();
	    	this.roomCount++;
	    	return;
	    }
		
		/* Separate all overlapping rooms */
		if(this.buildMode === 0) {
		    if(mapgen.separateRooms(this.rooms) === 0) {
		    	this.buildMode = 1;
		    } else {
		    	this.updateDisplay();
		    	return;
		    }
		}
		
		/* Filter rooms */
		if(this.buildMode === 1) {
		    mapgen.filterRooms(this.rooms, this.filters);
			this.updateDisplay();
	        this.buildMode = 2;
	        return;
		}

		/* Calculate Delaunay triangulation */
		/* create list of room center points. */
		if(this.buildMode === 2) {
			this.buildMode = 3;
		    this.roomVertices = [];
		    for(var i = 0; i < this.roomCount; ++i) {
	            var room = this.rooms[i];
			    if(room.enabled) {
			        this.roomVertices.push([room.x, room.y]);
                }
            }	
	        this.triangles = TAGAlg.Delaunay.triangulate(this.roomVertices, false);
	        
	        this.minEdges = TAGAlg.Kruskal(this.roomVertices, 
	        		                       this.triangles, 
	        		                       this.metric_dist);
	    	this.updateDisplay();
	    	return;
		}
		
		/* Select some random corridors. */
		if(this.buildMode === 3) {
			this.buildMode = 4;
			
			this.randoms = [];
			for(var i = 0; i < 10; i++) {
				var idx = (Math.random() * this.triangles.length) | 0;
				this.randoms[i] = this.triangles[idx];
			}
			this.updateDisplay();
			return;
		}
		
		this.build = true;
	},
	
	updateDisplay : function() {
	    this.clear();
		
	    if(this.showOrigin) {
		    this.drawSegment(mapgen.ORIGIN.left, mapgen.ORIGIN.right, mapgen.ORIGIN.lineWidth, mapgen.ORIGIN.lineColor);
		    this.drawSegment(mapgen.ORIGIN.top, mapgen.ORIGIN.bottom, mapgen.ORIGIN.lineWidth, mapgen.ORIGIN.lineColor);
		}
		
		if(this.showRooms) {
		    for(var i = 0, len = this.rooms.length; i < len; ++i) {
			    this.rooms[i].drawRoom(this.window, this);
			}
		}
		
		if(this.showFilters) {
		    for(var f = 0; f < this.filters.length; ++f) {
		    	this.filters[f].drawFilter(this);
		    }
		}
		
		if(this.showDelaunay) {
			if(this.roomVertices !== undefined && this.minEdges !== undefined) {
			    var rv = this.roomVertices;
			    var t = this.minEdges;
				var lw = mapgen.TRIANGLE.lineWidth;
				var lc = mapgen.TRIANGLE.lineColor;
				var pr = mapgen.TRIANGLE.pointRadius;
				var pc = mapgen.TRIANGLE.pointColor;
				
				for(var i = 0, len = t.length; i < len; i++) {
			    	var idx = t[i][0];
			    	var p1 = cc.p(rv[idx][0], rv[idx][1]);
			    	idx = t[i][1];
					var p2 = cc.p(rv[idx][0], rv[idx][1]);
					
					this.drawSegment(p1, p2, lw, lc);
					
					this.drawDot(p1, pr, pc);
					this.drawDot(p2, pr, pc);
				}
			}
		}
		
		if(this.showRandoms) {
			if(this.roomVertices !== undefined && this.randoms !== undefined) {
				var rv = this.roomVertices;
				var t = this.randoms;
				var lw = mapgen.CORRIDOR.lineWidth;
				var lc = mapgen.CORRIDOR.lineColor;
				var pr = mapgen.CORRIDOR.pointRadius;
				var pc = mapgen.CORRIDOR.pointColor;
				
				cc.log("t.length = " + t.length);

				for(var i = 0, len = t.length; i < len; i++) {
					cc.log("draw random " + i);
					var idx = t[i][0];
					var p1 = cc.p(rv[idx][0], rv[idx][1]);
					idx = t[i][1];
					var p2 = cc.p(rv[idx][0], rv[idx][1]);

					this.drawSegment(p1, p2, lw, lc);

					this.drawDot(p1, pr, pc);
					this.drawDot(p2, pr, pc);
				}
			}
		}
	},
	
	window : undefined,
	rooms : undefined,
	roomVertices : undefined,
	triangles : undefined,
    minEdges : undefined,
    randoms : undefined,
	showOrigin : true,
	showRooms : true,
	showDelaunay : true,
	showRandoms : true,
	showFilters : true,
});

MapGenScreen.scene = function() {
	var scene = new cc.Scene();
	var layer = new MapGenScreen();
	scene.addChild(layer);
	return scene;
};