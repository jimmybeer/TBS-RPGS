var ViewController = TAGCes.System.extend({
    init : function() {
	    this.usesComponents(['WorldPosition', 'View']);
	},
	
    addedToWorld : function(world) {
	    this._super(world);
		
		// Add entity added listener
		this.family.entityAdded.add(this, this.entityAddedToFamily);
	},
	
	removedFromWorld : function() {
	    // Remove all sprites from the view.
	    var list = this.family.getEntityList();
		var view;
		
		for(var ent = list.start; ent; ent = list.next()) {
		    view = ent.getComponent('View');
			view.sprite.removeFromParent();
			view.shown = false;
			view.show = false;
		}
		
		// Remove entity added listener cleared when familt unregistered.			
	    this._super(world);
	},
	
	entityAddedToFamily : function(ent) {
		var view = ent.getComponent('View');
		var pos = ent.getComponent('WorldPosition');
		
		view.sprite.x = pos.x;
		view.sprite.y = pos.y;
		
		if(view.show === true) {
    	    cc.log("ADDED TO PARENT at (" + view.sprite.x + "," + view.sprite.y + ")");
		
	    	view.parent.addChild(view.sprite);//, view.zOrder, view.tag);
			view.shown = true;
		}
	},
	
	update : function(dt) {
		var list = this.family.getEntityList();
		if(list.length === 0) {
			return;
		}
		var pos, view;

		for(var ent = list.start(); ent !== null; ent = list.next()) {
		    view = ent.getComponent('View');
		    pos = ent.getComponent('WorldPosition');
			
			if(view.shown === true) {
			    if(view.show === false) {
				    view.sprite.removeFromParent(false);
			        view.shown = false;
				} else {
				    view.sprite.x = pos.x;
	    		    view.sprite.y = pos.y;
	    		    view.sprite.setRotation(pos.rot);
				}
			} else {
				if(view.show === true) {
					view.parent.addChild(view.sprite);//, view.zOrder, view.tag);
					view.shown = true;
				    view.sprite.x = pos.x;
	    		    view.sprite.y = pos.y;
		    	    view.sprite.setRotation(pos.rot);
				}
			}
		}
	}
});