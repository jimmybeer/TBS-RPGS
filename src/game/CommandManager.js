var CommandManager = function() {
    this.currentCommand = "None";
    this.moveScreen = true;
}

CommandManager.prototype = {
	/*
	 * This is called when a touch event has occrred on a tile in the tile
	 * layer. This function determines what action to take based on the current
	 * command.
	 */
    processCommandForTouchedTile : function(pos) {
	    switch(this.currentCommand) {
		    case "None" : 
			    if(TR.DEBUG) {
				    TR.levelMgr.debugTileInfo(pos.tileX, pos.tileY);
				}
				var ent = TR.levelMgr.testForEntityAtTile(pos.tileX, pos.tileY, false);
                
                /*
				 * if a tile containing an entity has been selected, set that
				 * entity as the currently selected entity.
				 */
                if(ent !== undefined) {
                    TR.levelMgr.selectEntity(ent);
                }
                /*
				 * if an empty tile has been selected and an entity is currently
				 * selected try to calculate a path to the tile.
				 */
                else if(TR.entSeleted) {
                    if(TR.pathMgr.pathDefined === true) {
                        if(TR.pathMgr.confirmPath(pos.tileX, pos.tileY)) {
                            /*
							 * Is selected tile the same as the end of the
							 * defined path if so then action ther path.
							 */
                            cc.log("Path CONFIRMED!");
                            TR.pathMgr.actionPath();
                        } else {
                            /*
							 * Otherwise clear the existing path and calculate
							 * new one.
							 */
                        	cc.log("Clear Path");
                            TR.pathMgr.clearPath();
                            TR.pathMgr.calculatePathTo(pos.tileX, pos.tileY);                            
                        }
                    } else {
                    	cc.log("New Path");
                        TR.pathMgr.calculatePathTo(pos.tileX, pos.tileY);
                    }
                }
                
				break;
			case "AddPlayer" :
			    TR.levelMgr.addPlayer(pos.tileX, pos.tileY);
			    this.currentCommand = "None";
			    break;
		}
	},
	/*
	 * This is called to move something by the provided offset.
	 */
	processMoveCommand : function(dx, dy) {
		if(TR.manualMoving && TR.entSeleted && TR.selected !== undefined) {
			var tracker = TR.selected.getComponent('Tracker');
			var tPos = tracker.trackedEnt.getComponent('TilePosition');
			var wPos = tracker.trackedEnt.getComponent('WorldPosition');
			// if(TR.levelMgr.tileExistsAt(tPos.x + dx, tPos.y + dy)) {
    		// tPos.moveBy(dx, dy);
			// }
			if(dx === -1) wPos.rot = 270;
			if(dx === 1) wPos.rot = 90;
			if(dy === -1) wPos.rot = 0;
			if(dy === 1) wPos.rot = 180;
		} else if(this.moveScreen) {
			TR.gameLayer.stepScrollMap(-dx, dy);
		} else {
			
		}
	},
	/*
	 * This function process input from the DebugLayer and turns them into
	 * commands.
	 */
    processUICommand : function(command, widget) {
	    // Provide switch case for immediate actions, otherwise allow default to
		// update currentCommand with command text
    	switch(command) {
    	case "FOVEnable" : 
    		if(TR.levelMgr.switchLighting()) {
    			widget.setTitleText("FOV On");
    		} else {
    			widget.setTitleText("FOV Off");
    		}
        	break;
        case "ManualMoveEnable" : 
            TR.manualMoving = !TR.manualMoving;
    		if(TR.manualMoving) {
    			widget.setTitleText("Manual Move On");
            } else {
    			widget.setTitleText("Manual Move Off");
            }        
            break;
        default :
		    this.currentCommand = command;
			break;
    	}
    }
}