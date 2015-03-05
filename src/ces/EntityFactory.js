var createPlayerEntity = function(tileX, tileY, sprite, parent) {
	var ent = new TAGCes.Entity();
	ent.name = 'PlayerEntity-' + ent.id;
	ent.addComponent(new TilePosition(tileX, tileY));	
	ent.addComponent(new WorldPosition());
	ent.addComponent(new View(sprite, parent));
    ent.addComponent(new ActionList());
	
	return ent;
}

var createSelectionEntity = function(sprite, parent, track, tracking) {
	var ent = new TAGCes.Entity();
	ent.name = 'SelectionEntity-' + ent.id;
	ent.addComponent(new WorldPosition());
	ent.addComponent(new View(sprite, parent, 9999));
	ent.addComponent(new Tracker(track, tracking));
	
	return ent;
}