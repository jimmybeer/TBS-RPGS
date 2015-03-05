/*
 * Used to track a components position within the tilemap.
 */
var TilePosition = TAGCes.Component.extend({
    name : 'TilePosition',
	init : function(x, y) {
	    this.x = x || 0;
		this.y = y || 0;
		this.targetX = x || 0;
		this.targetY = y || 0;
		this.dirty = true;
	},
	
	setTargetPos : function(x, y){
		this.targetX = x;
		this.targetY = y;
		
		if((this.targetX !== this.x) || (this.targetY !== this.y)) {
    		this.dirty = true;
		}
	},

	moveBy : function(dx, dy){
		this.targetX = this.x + dx;
		this.targetY = this.y + dy;

		if((this.targetX !== this.x) || (this.targetY !== this.y)) {
			this.dirty = true;
		}
	}
});

/*
 * Used to track a components position by world coordinates.
 */
var WorldPosition = TAGCes.Component.extend({
    name : 'WorldPosition',
	init : function(x, y, rot) {
	    this.x = x || 0;
		this.y = y || 0;
		this.rot = rot || 0;
	}
});

/* 
 * Used to hold a components visible representation.
 */
var View = TAGCes.Component.extend({
	name : 'View',
	init : function(sprite, parent, zOrder, tag) {
		this.sprite = sprite;
		this.sprite.retain();
		this.parent = parent;
		this.zOrder = zOrder;
		this.tag = tag;
		
		this.show = true;
		this.shown = false;
	}
});

/* 
 * Used to enable a component to track another component.
 */
var Tracker = TAGCes.Component.extend({
    name : 'Tracker',
	init : function(ent, tracking) {
	    this.trackedEnt = ent;
	    this.trackedPos = ent.getComponent('WorldPosition');
		this.tracking = tracking;
	},
	trackEntity : function(ent) {
	    this.trackedEnt = ent;
	    this.trackedPos = ent.getComponent('WorldPosition');
		this.tracking = true;
	},
    clear : function() {
        this.trackedEnt = undefined;
        this.trackedPos = undefined;
        this.tracking = false;
    }
});

/*
 * Used to hold a list of actions to perform an a component. Only one will be performed at a time.
 */
var ActionList = TAGCes.Component.extend({
    name : 'ActionList',
    init : function(list, run) {
        this.actions = list || [];
        this.currentAction = 0;
        this.interruptImmediately = false;
        this.interruptAfterCurrent = false;
        this.running = false;
        if(this.actions.length > 0) {
            this.running = run || true;
        }
    },
    
    addAction : function(action, run) {
        this.actions.push(action);
        
        if(run !== undefined) {
            this.running = run;
        }
    },
    
    addMoveByAction : function(dx, dy) {
        var action = {
            action : "MoveBy",
            dx : dx,
            dy : dy,
            delay : 32,
            count : 0
        };
        
        this.addAction(action);
    },
    
    addRotateToAction : function(angle) {
        var action = {
            action : "RotateTo",
            rot : angle,
            delay : 32,
            count : 0
        };
        
        this.addAction(action);
    },
    
    addCallFunc : function (c, f, a) {
    	var action = {
    			action : "CallFunc",
    			context : c,
    			func : f,
    			args : a,
    			delay : 0,
    			count : 0
    	};
    	
    	this.addAction(action);
    }
});
