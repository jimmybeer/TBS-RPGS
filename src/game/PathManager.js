var PathManager = function () {
    //this.aStar = new TAGAlg.AStar();
    this.currentPath = undefined;
    this.pathDefined = false;
    this.pathMarkers = [];
}

PathManager.prototype = {
    confirmPath : function(tileX, tileY) {
    	return (this.currentPath[this.currentPath.length - 1].x === tileX) && 
               (this.currentPath[this.currentPath.length - 1].y === tileY);
    },
    
    actionPath : function() {
    	var ent = TR.selected.getComponent('Tracker').trackedEnt;
        if(ent === undefined) return;
        
        var actionList = ent.getComponent('ActionList');
        if(actionList === undefined) return;
        
        var wPos = ent.getComponent('WorldPosition');
        var tPos = ent.getComponent('TilePosition');
        
        var sx = tPos.x;
        var sy = tPos.y;
        var currentRotation = wPos.rot;
        
        /* 
           * Ignore first path node, entity already on that node.
           */
        for(var i = 0; i < this.currentPath.length; ++i) {
            var n = this.currentPath[i];
            
            var dx = n.x - sx;
            var dy = n.y - sy;
            // determine if entity needs to rotate.
            var rot = this.calcRotation(dx, dy);
            if(currentRotation !== rot) {
            	cc.log("Add Rot = " + rot);
                actionList.addRotateToAction(rot);
                currentRotation = rot;
            }
            
            if(dx !== 0 || dy !== 0) {
            	cc.log("Add Move = " + dx + "," + dy);
                actionList.addMoveByAction(dx, dy);
            }
            
            sx = n.x;
            sy = n.y;
        }
        
        actionList.addCallFunc(this, this.clearPath);
        
        /*
           * Start the action list executing.
           */
        actionList.running = true;
    },
    
    calculatePathTo : function(tileX, tileY) {
	    var tracker = TR.selected.getComponent('Tracker');
	    var tPos = tracker.trackedEnt.getComponent('TilePosition');
	    //this.currentPath = this.aStar.resetMap(TR.levelMgr.grid);
        //this.currentPath = this.aStar.findPath(tPos.x, tPos.y, tileX, tileY, TR.levelMgr.grid);
	    this.currentPath = TAGAlg.AStarSimple.search(TR.levelMgr.grid, tPos.x, tPos.y, tileX, tileY);
	    
        // Path should be an array of [x, y] node coordinates!
        if(this.currentPath.length > 0) {
            var sx = tPos.x;
            var sy = tPos.y;
            for(var i = 0; i < this.currentPath.length; ++i) {
                var n = this.currentPath[i];
                if(this.pathMarkers[i] === undefined) {
                    this.pathMarkers[i] = new cc.Sprite(res.pathSprite_png);
                    this.pathMarkers[i].retain();
                }
                this.pathMarkers[i].x = TR.gameLayer.tileXtoScreenX(n.x);
                this.pathMarkers[i].y = TR.gameLayer.tileYtoScreenY(n.y);
                this.pathMarkers[i].setRotation(this.calcRotation((n.x - sx), (n.y - sy)));
                TR.gameLayer.guiRearPromptLayer.addChild(this.pathMarkers[i]);
                
                sx = n.x;
                sy = n.y;
            }
            this.pathDefined = true;
        }
    },
    
    calcRotation : function(dx, dy) {
        if(dx === -1) {
            if(dy === -1) {
                return 315;
            } else if(dy === 0) {
                return 270;
            } else {
                return 225;
            }
        } else if(dx === 0) {
            if(dy === -1) {
                return 0;
            } else if(dy === 0) {
                return 0;
            } else {
                return 180;
            }
        } else {
            if(dy === -1) {
                return 45;
            } else if(dy === 0) {
                return 90;
            } else {
                return 135;
            }
        }
    },
    
    clearPath : function() {
        var len = this.currentPath.length;
        for(var i = 0; i < len; ++i) {
            if(this.pathMarkers[i] !== undefined) {
                this.pathMarkers[i].removeFromParent();
            }
        }
        this.currentPath.length = 0;
        this.pathDefined = false;
    }
}