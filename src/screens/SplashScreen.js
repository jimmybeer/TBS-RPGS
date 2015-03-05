var SplashScreen = cc.Layer.extend({
    ctor:function() {
	    this._super();
		this.init();
	},
	
	init:function() {
	    var winSize = cc.director.getWinSize();
		
		var version = new cc.LabelTTF("TBS-RPG JS Build Version: " + TR.VERSION, "Arial", 21);
		version.attr({
		    x : winSize.width/2,
			y : (winSize.height/2) + 5,
			anchorX : 0.5,
			anchorY : 0
		});
		this.addChild(version);
		
		var label = new cc.LabelTTF("Click mouse, or press space, to continue.", "Arial", 16);
		label.attr({
		    x : winSize.width/2,
			y : (winSize.height/2) - 5,
			anchorX : 0.5,
			anchorY : 1
		});
		this.addChild(label);
		
		if(cc.sys.capabilities.hasOwnProperty('keyboard')) {
		    cc.eventManager.addListener({
			    event : cc.EventListener.KEYBOARD,
			    onKeyPressed:function(key, event) {
			    	if(key == cc.KEY.space) {
			    		event.getCurrentTarget().onMainMenu(this);
			    	}
				}
			}, this);
		}
		
		if('mouse' in cc.sys.capabilities) {
		    cc.eventManager.addListener({
			    event : cc.EventListener.MOUSE,
				onMouseUp:function(event) {
					event.getCurrentTarget().onMainMenu(this);
				}
			}, this);
		}
		
		return this;
	},
	onMainMenu:function(pSender) {
	    this.onButtonEffect();
		cc.eventManager.removeAllListeners();
		//var scene = new cc.Scene();
		//scene.addChild(new MainMenuScreen());
		cc.director.runScene(new cc.TransitionFade(1.2, MainMenuScreen.scene()));
	},
	onButtonEffect:function(){
	    //if(TR.SOUND) {
		    //var s = cc.audioEngine.playEffect(res.buttonEffect_mp3);
		//}
	}
});

SplashScreen.scene = function() {
    var scene = new cc.Scene();
	var layer = new SplashScreen();
	scene.addChild(layer);
	return scene;
};