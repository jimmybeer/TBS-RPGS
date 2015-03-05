var res = {
	tile1_png : "res/tile1.png",
	NewMap_tmx : "res/NewMap.tmx",
	selection_png : "res/Selection.png",
	debugPlayer_png : "res/DebugPlayer1.png",
    pathSprite_png : "res/PathSprite.png",
	
	leftButtonNormal_png : "res/LeftButNormal.png",
		
	// Atlases
	DebugWindow0_atlas : "res/ui/DebugWindow/DebugWindow0.png",
	
	// Plist
	DebugWindow0_plist : "res/ui/DebugWindow/DebugWindow0.plist",
		
	// UI Exports
	DebugWindow0_export : "res/ui/DebugWindow/DebugWindow.ExportJson"
};

var g_splash = [];

var g_mainmenu = [
];

var g_maingame = [
    // images
    res.tile1_png,
    res.leftButtonNormal_png,
    res.debugPlayer_png,
    res.selection_png,
    res.pathSprite_png,
    
    // maps
    res.NewMap_tmx,
    
    // atlases
    res.DebugWindow0_atlas,
    
    // plists
    res.DebugWindow0_plist,
    
    // ui exports
    res.DebugWindow0_export
];