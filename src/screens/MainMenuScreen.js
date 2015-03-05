var MainMenuScreen = cc.LayerColor.extend({
	ctor:function() {
		this._super();
		this.init();
	},

	init:function() {
		var winSize = cc.director.getWinSize();
		this.setColor(new cc.Color(0,0,0,255));
		var size = cc.Director.getInstance().getWinSize();

		var menuItem1 = new cc.MenuItemFont("Start Default Map",this.onNewGame,this);
		var menuItem2 = new cc.MenuItemFont("Dummy",this.onOptions,this);
		var menuItem3 = new cc.MenuItemFont("Map Generation", this.onMapGen, this);
		var menuItem4 = new cc.MenuItemFont("Quit",this.onQuit,this);

		var menu = new cc.Menu(menuItem1,menuItem2,menuItem3, menuItem4);
		menu.alignItemsVertically();

		this.addChild(menu);
		
		var posEnt = new TilePosition(10,15);

		return this;
	},
	
	onNewGame : function() {
		cc.LoaderScene.preload(g_maingame, function() {
			cc.director.runScene(GameScreen.scene());
		}, this);
	},
	
	onOptions : function() {
		/*var xml = new TAGExt.XMLWriter();
		xml.writeStartDocument();
		xml.writeStartElement("BOG");
		xml.writeAttributeString("smellfactor", 0.5);
		xml.writeString("pooo");
		xml.writeEndElement();
		xml.writeEndDocument();
		
		//jsb.fileUtils.writeStringToFile(xml.flush(), "My.XML");*/
	},
	
	onMapGen : function() {
		cc.director.runScene(MapGenScreen.scene());
	},
	
	onQuit : function() {
		
	}
});

MainMenuScreen.scene = function() {
	var scene = new cc.Scene();
	var layer = new MainMenuScreen();
	scene.addChild(layer);
	return scene;
};