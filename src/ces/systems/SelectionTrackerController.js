var SelectionTrackerController = TAGCes.System.extend({
    init : function() {
	    this.usesComponents(['WorldPosition', 'View', 'Tracker']);
	},
	
    addedToWorld : function(world) {
	    this._super(world);
		
		// Add entity added listener
		this.family.entityAdded.add(this, this.entityAddedToFamily);
	},
	
	entityAddedToFamily : function(ent) {
		var tracked = ent.getComponent('Tracker');
		
		if(tracked.tracking === true) {
	        var wPos = ent.getComponent('WorldPosition');
	        var view = ent.getComponent('View');
			
			view.show = true;
			
    		wPos.x = tracked.trackedPos.x;
	    	wPos.y = tracked.trackedPos.y;
		}
	},
	
	update : function(dt) {
	    var tracked, wPos, view;
		
	    var list = this.family.getEntityList();
	    if(list.length === 0) {
	    	return;
	    }
		
		for(var ent = list.start(); ent !== null; ent = list.next()) {
		    tracked = ent.getComponent('Tracker');
		    if(tracked.tracking === true) {
		    	wPos = ent.getComponent('WorldPosition');
		    	view = ent.getComponent('View');
				
				wPos.x = tracked.trackedPos.x;
				wPos.y = tracked.trackedPos.y;
			
			    if(view.shown === false) {
			        // Add selection to screen and set active.
		            view.show = true;
			    }
		    } else {
		    	view = ent.getComponent('View');
		        if(view.shown === true) {
			        // Remove selection sprite from screen and set not active.
			    	view.show = false;
			    }
			}
		}
	}
});