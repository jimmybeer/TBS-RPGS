var ActionListController = TAGCes.System.extend({
    init : function() {
	    this.usesComponents(['ActionList', 'TilePosition', 'WorldPosition']);
	},
	
    addedToWorld : function(world) {
	    this._super(world);
		
		// Add entity added listener
		//this.family.entityAdded.add(this, this.entityAddedToFamily);
	},
	
	removedFromWorld : function() {
	    // Remove all sprites from the view.
	    var list = this.family.getEntityList();
		var actionList;
		
		for(var ent = list.start; ent; ent = list.next()) {
		    actionList = ent.getComponent('ActionList');
			actionList.running = false;
		}
		
		// Remove entity added listener cleared when familt unregistered.			
	    this._super(world);
	},
	
	entityAddedToFamily : function(ent) {
	},
	
	update : function(dt) {
		var list = this.family.getEntityList();
		if(list.length === 0) {
			return;
		}
		var actionList, action;

		for(var ent = list.start(); ent !== null; ent = list.next()) {
		    actionList = ent.getComponent('ActionList');
            
            /*
                * Check action list is currently running.
                */
            if(actionList.running === true) {
                /*
                     * If current action counter has reached end of action list then stop running.
                     */
                if(actionList.currentAction < actionList.actions.length) {
                    action = actionList.actions[actionList.currentAction];
                    
                    /*
                          * New action so perform the action.
                          */
                    if(action.count === 0) {
                        switch(action.action) {
                            case "MoveBy" :
                                this.moveBy(ent, action.dx, action.dy);
                                break;
                            case "RotateTo" :
                                this.rotateTo(ent, action.rot);
                                break;
                            case "CallFunc" : 
                            	action.func.apply(action.context, action.params);
                        }
                    }
                    
                    /* 
                          * Increment the delay counter and check if delay is complete, if so go to next action.
                          */
                    action.count++; 
                    if(action.count >= action.delay) {
                        actionList.currentAction++;
                    }
                } else {
                    actionList.running = false;
                }
            }
		}
	},
    
    moveBy : function(entity, dx, dy) {
        var tPos = entity.getComponent('TilePosition');
        if(tPos !== undefined) {
            tPos.moveBy(dx, dy);
        }
    },
    
    rotateTo : function(entity, angle) {
        var wPos = entity.getComponent('WorldPosition');
        if(wPos !== undefined) {
            wPos.rot = angle;
        }
    }
});