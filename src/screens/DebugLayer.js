var DebugLayer = cc.Layer.extend({
    ctor:function() {
	    this._super();
		this.init();
	},
	
	init:function() {
	    var winSize = cc.director.getWinSize();
		
		var label = new cc.LabelTTF("DEBUG ENABLED", "Arial", 8);
		label.attr({
		    x : 0,
			y : winSize.height - 2,
			anchorX : 0,
			anchorY : 1
		});
		this.addChild(label);
		
		this.controls.ui = this.getUIWidget(res.DebugWindow0_export);
		this.controls.ui.retain();
		this.controls.ui.attr({
			anchorX : 0,
			anchorY : 0
		});
		this.controls.uiStart = { x : -this.controls.ui.width, y : 0 };
		this.controls.uiEnd = { x : 0, y : 0 };
		
		this.controls.button = new cc.Sprite(res.leftButtonNormal_png);
		this.controls.button.attr({
		    x : 0,
			y : 100,
			anchorX : 0,
			anchorY : 0
		});
		this.controls.button.retain();
		this.addChild(this.controls.button);
		
		this.controls.showListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			// When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
			swallowTouches: true,
			//onTouchBegan event callback function                      
			onTouchBegan: function (touch, event) { 
				var target = event.getCurrentTarget();  
				if(target.parent.targetContains(target, touch.getLocation())) {
					return true;
				}
				return false;
			},
			onTouchEnded: function (touch, event) {   
				event.getCurrentTarget().parent.onEnableControls();
			}
		});
		this.controls.showListener.retain();
		
		cc.eventManager.addListener(this.controls.showListener, this.controls.button);
	},
	/*
	 * Called to test if the touch coordinates occured within a targets bounds. 
	 */
	targetContains : function(target, touch) {
		//Get the position of the current point relative to the target
		var locationInNode = target.convertToNodeSpace(touch);    
		var s = target.getContentSize();
		var rect = cc.rect(0, 0, s.width, s.height);

		//Check the click area
		if (cc.rectContainsPoint(rect, locationInNode)) {
			return true;
		} else {
			return false;
		}
	},

	/*
	 * Load a UI Widget from a JSON file.
	 */
	getUIWidget:function(id) {
		return ccs.uiReader.widgetFromJsonFile(id);
	},
	
	/*
	 * Show button has been pressed, remove button
	 * and instigate animation of debug window entering screen.
	 */
	onEnableControls : function() {
	    // disbable showcontrols touch event.
		this.removeChild(this.controls.button);
		
		this.animateWindow(this.controls, this.enableControls);
	},
	/*
	 * Enable eventlisteners on all controls.
	 */
	enableControls : function(ui) {
	    // add all action events.
		var children = ui.children;
		for(var i = 0; i < children.length; ++i) {
			var child = children[i];
		    if(child.touchEnabled) {
		        child.addTouchEventListener(function (pSender, type) { 
		        	cc.log("Child touched");
		        	if(cc.Event.TOUCH === type) {
		        		if(pSender.name === "CloseBut") {
		        			this.onDisableControls();
		        		} else {
		        			cc.log("process");
    			        	TR.commandMgr.processUICommand(pSender.name, pSender);
		        		}
			        	return true;
		        	}
		        	return false;
		        }, this);
		    }		    
		}
	},
	onDisableControls : function() {
		this.closeWindow(this.controls, this.disableControls);
	},
	disableControls : function() {
	    this.removeChild(this.controls.ui);
		
	    this.addChild(this.controls.button);
		
		// add show controls action events.
	},
	
	animateWindow : function(window, onEnd) {
		this.addChild(window.ui);
		window.ui.setPosition(window.uiStart);
	    
		var action = cc.moveBy(1, cc.p((window.uiEnd.x - window.ui.x), (window.uiEnd.y - window.ui.y))).easing(cc.easeOut(0.3));
		
		window.ui.runAction(cc.Sequence(action, cc.callFunc(onEnd, this, window.ui)));
	},
	closeWindow : function(window, onEnd) {
		var action = cc.moveBy(1, cc.p((window.uiStart.x - window.ui.x), (window.uiStart.y - window.ui.y))).easing(cc.easeOut(0.3));

		window.ui.runAction(cc.Sequence(action, cc.callFunc(onEnd, this, window.ui)));

	},
	
	//uiListener : undefined,
	controls : {}
});