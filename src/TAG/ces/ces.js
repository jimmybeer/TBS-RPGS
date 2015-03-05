var TAGCes = TAGCes || {}

TAGCes._entityID = 0;

/**************
 * COMPONENT
 **************/
/**
 * The Component is the container of some properties that
 * the entity possesses. It may also contain some methods.
 */
TAGCes.Component = Class.extend({
    name : '',
	 
	toString : function() {
	    return JSON.stringify(this);     
	}
});

/**************
 * ENTITY
 **************/
/**
 * The entity is the container of components.
 */
TAGCes.Entity = function() {
    // readonly id value
    this.id = TAGCes._entityID++;
    this.name = '';
	
	// map from component names to components.
	this._components = {};
	
	this.onComponentAdded = new TAGUtil.Signal();
	this.onComponentRemoved = new TAGUtil.Signal();
}

TAGCes.Entity.prototype = {
    /**
	 * Check if this entity has a component by name.
	 * @param {String} componentName
	 * @return {Boolean}
	 */
	hasComponent : function(componentName) {
	    return this._components[componentName] !== undefined;
	},
	
	/**
	 * Get a component of this entity by name.
	 * @param {String} componentName
	 * @return {Component}
	 */
	getComponent : function(componentName) {
	    return this._components[componentName];
	},
	
	/**
	 * Add a component to this entity.
	 * @param {Component}
	 */
	addComponent : function(component) {
	    this._components[component.name] = component;
		this.onComponentAdded.emit(this, component.name);
	},
	
	/**
	 * Remove a component from this entity by name.
	 * @param {String} componentName
	 */
	removeComponent : function(componentName) {
	    this._components[componentName] = undefined;
		this.onComponentRemoved.emit(this, componentName);
	},
	
	toString : function() {
	    return JSON.stringify(this);
	}
}

/**************
 * ENTITYNODE
 **************/
/** 
 * The entity node is a wrapper around an entity, to be added into 
 * the entity list. 
 *
 */
TAGCes.EntityNode = function(entity) {
    this.entity = entity;
	this.prev = null;
	this.next = null;
}

/**************
 * ENTITYLIST
 **************/
/** 
 * The entity list is a doubly-linked-list which allows the 
 * entities to be added and removed efficiently.
 */
TAGCes.EntityList = function() {
    this.head = null;
	this.tail = null;
	this.length = 0;
	
	/**
	 * Map from entity id to entity node,
	 * for O(1) find and deletion.
	 */
	this._entities = {};
	
	this.iterNext = null;
}

TAGCes.EntityList.prototype = {
    /** 
	 * Add an entity into the list.
	 * @param {Entity} entiy
	 */
	add : function(entity) {
	    var node = new TAGCes.EntityNode(entity);
		
		if(this.head === null) {
		    this.head = this.tail = node;
		} else {
		    node.prev = this.tail;
			this.tail.next = node;
			this.tail = node;
		}
		
		this.length += 1;
		this._entities[entity.id] = node;
	},
	
	/**
	 * Remove and entity from the list.
	 * @param {Entity} entity
	 */
	remove : function(entity) {
	    var node = this._entities[entity.id];
		
		if(node === undefined) {
		    return;
		}
		
		if(node.prev === null) {
		    this.head = node.next;
		} else {
		    node.prev.next = node.next;
		}
		if(node.next === null) {
		    this.tail = node.prev;
		} else {
		    node.next.prev = node.prev;
		}
		
		this.length -= 1;
		delete this._entities[entity.id];
	},
	
	/**
	 * Check if this list has the entity.
	 * @param {Entity} entity
	 * @return {Boolean}
	 */
	has : function(entity) {
	    return this._entities[entity.id] !== undefined;
	},
	
	/**
	 * Remove all the entities from this list.
	 */
	clear : function() {
	    this.iterNext = this.head = this.tail = null;
		this.length = 0;
		this._entities = {};
	},
	
	/**
	 * Retrun an array holding all the entities in the list.
	 * @return {Aray}
	 */
	toArray : function() {
	    var array, node;
		
		array = [];
		for(node = this.head; node; node = node.next) {
		    array.push(node.entity);
		}
		
		return array;
	},
	
	/**
	 * Get the head of the list and reset the iterator.
	 * @return {Entity} returns first entity in list.
	 */
	start : function() {
	    if(this.head === null) {
		    return null;
		}
		
	    this.iterNext = this.head.next;
		return this.head.entity;
	},
	
	/** 
	 * Returns the next entity in the list, or returns null.
	 */
	next : function() {
	    if(this.iterNext === null) {
		    return null;
		}
		
		var val = this.iterNext.entity;
		
		this.iterNext = this.iterNext.next;
		
		return val;
	}
}

/**************
 * FAMILY
 **************/
/**
 * The family is a collection of entities having all the specified components.
 */
TAGCes.Family = function(componentNames) {
    this._componentNames = componentNames;
	
	this._entities = new TAGCes.EntityList();
	
	this.entityAdded = new TAGUtil.Signal();
	this.entityRemoved = new TAGUtil.Signal();
}

TAGCes.Family.prototype = {
    /**
	 * Get the entities of this family.
	 * @param {Array}
	 */
	getEntities : function() {
	    return this._entities.toArray();
	},
	
	/**
     * Get the EntityList for this family.
	 */
	getEntityList : function() {
	    return this._entities;
	},
	
	/**
	 * Add the entity into the family if match.
	 * @param {Entity} entity
	 */
	addEntityIfMatch : function(entity) {
	    if(!this._entities.has(entity) && this._matchEntity(entity)) {
		    this._entities.add(entity);
			this.entityAdded.emit(entity);
		}
	},	
	
	/**
	 * Remove the entity from the family.
	 * @param {Entity} entity
	 */
	removeEntity : function(entity) {
	    if(this._entities.has(entity)) {
		    this._entities.remove(entity);
			this.entityRemoved.emit(entity);
		}
	},
	
	/**
	 * Handler to be called when a component is added to an entity.
	 * @param {Entity} entity
	 * @param {String} componentName
	 */
	onComponentAdded : function(entity, componentName) {
	    this.addEntityIfMatch(entity);
	},
	
	/**
	 * Handler to be called when a component is removed from an entity.
	 * @param {Entity} entity
	 * @param {String} componentName
	 */
	onComponentRemoved : function(entity, componentName) {
	    var names, i, len;
		
		// return if the entity is not in this family.
		if(!this._entities.has(entity)) {
		    return;
		}
		
		// remove the node if the removed component is required by this family
		names = this._componentNames;
		for(i = 0, len = names.length; i < len; ++i) {
		    if(names[i] === componentName) {
			    this._entities.remove(entity);
				this.entityRemoved.emit(entity);
				return;
			}
		}
	},
	
	/**
	 * Check if an entity belong to this family.
	 * @param {Entity} entity
	 * @return {Boolean}
	 */
	_matchEntity : function(entity) {
	    var names, i ,len;
		
		names = this._componentNames;
		
		for(i = 0, len = names.length; i < len; ++i) {
		    if(!entity.hasComponent(names[i])) {
			    return false;
			}
		}
		
		return true;
	},
	
	dispose : function() {
	    this._entities.clear();		
	    this.entityAdded.clear();
    	this.entityRemoved.clear();
	}
}

/**************
 * SYSTEM
 **************/
/**
 * The system is responsible for updating the entities.
 */
TAGCes.System = Class.extend({

    init : function() {
        // this property will be set when the system is added to a world.
        this.world = null;
	    this.family = null;
	},
	
	usesComponents : function(args) {
	    this.componentNames = args;
	},

    addedToWorld : function(world) {
	    this.world = world;
		this.family = this.world.registerFamily(this.componentNames);
	},
	
	removedFromWorld : function() {
	    this.world.unregisterFamily(this.family);
		this.family = null;
	    this.world = null;
	},
	
	/**
	 * Update the entities.
	 * @param {Number} dt time interval between updates.
	 */
	update : function(dt) {
	    throw new Error('Subclassed should override this method');
	}
});

/**************
 * WORLD
 **************/
/**
 * The world is the container for all the entities and systems.
 *
 */
TAGCes.World = function() {
    /**
     * A map from familyId to family.
	 */
    this._families = {};
	
	this._systems = [];
	
	this._entities = new TAGCes.EntityList();	
}

TAGCes.World.prototype = {
    /** 
	 * Add a system to this world
	 * @param {System} system
	 */
	addSystem : function(system) {
	    this._systems.push(system);
		system.addedToWorld(this);
		return this;
	},
	
	/**
	 * Remove a system from this world.
	 * @param {System} system
	 */
	removeSystem : function(system) {
	    var systems, i, len;
		
		systems = this._systems;
		for(i = 0, len = systems.length; i < len; ++i) {
		    if(systems[i] === system) {
			    systems.splice(i, 1);
				system.removedFromWorld();
			}
		}
	},
	
	/**
	 * Add an entity to this world.
	 * @param {Entity} entity
	 */
	addEntity : function(entity) {
	    var families, familyId, self;
		
		// try to add the entity into each family
		families = this._families;
		for(familyId in families) {
		    families[familyId].addEntityIfMatch(entity);
		}
		
		self = this;
		
		// Update the entity-family relationship whenever components are
		// added or removed from the entities
		entity.onComponentAdded.add(function(entity, component) {
		    self._onComponentAdded(entity, component);
		});
		entity.onComponentRemoved.add(function(entity, component) {
		    self._onComponentRemoved(entity, component);
		});
		
		this._entities.add(entity);
	},
	
	/** 
	 * Remove an entity from this world.
	 * @param {Entity} entity
	 */
	removeEntity : function(entity) {
	    var families, familyId;
		
		// try to remove the entity from each family
		families = this._families;
		for(familyId in families) {
		    families[familyId].removeEntity(entity);
		}
		
		entity.onComponentAdded.clear();
		entity.onComponentRemoved.clear();
		
		this._entities.remove(entity);
	},
	
	/**
	 * Get the entities having all the specified components.
	 * @param {...String} componentNames
	 * @return {Array} an array of entities.
	 */
	getEntities : function(componentNames) {
	    var familyId, families;
		
		familyId = this._getFamilyId(arguments);
		this._ensureFamilyExists(arguments);
		
		return this._families[familyId].getEntities();
	},
	
	/**
	 * Called by systems added to the world to create a family for its entities.
	 * @param {...String} componentNames
	 * @return {Family} family of entities for calling system
	 */
	registerFamily : function(componentNames) {
	    var familyId, families;
		
	    familyId = this._getFamilyId(componentNames);
	    this._ensureFamilyExists(componentNames);
		
		return this._families[familyId];
	},
	
	/**
	 * Called by systems removed from the world to remove its family.
	 * @param {Family} the family to deregister
	 */
	unregisterFamily : function(family) {
	    var families, familyId;
		
		// try to remove the entity from each family
		families = this._families;
		for(familyId in families) {
		    if(families[familyId] === family) {
			    family.dispose();
			    delete families[familyId];
				return
			}
		}
	},	    
	
	/**
	 * For each system in the world, call its 'update' method.
	 * @param {Number} dt time interval between updates.
	 */
	update : function(dt) {
	    var systems, i, len;
		
		systems = this._systems;
		for(i = 0, len = systems.length; i < len; ++i) {
		    systems[i].update(dt);
		}
	},
	
	/**
	 * Returns the signal for entities added with the specified components. The
	 * signal is also emitted when a component is added to an entity causing it to
	 * match the specified component names.
	 * @param {...String} componentNames
	 * @return {Signal} A signal which is emitted every time an entity with
	 *      specified components is added.
	 */
	entityAdded : function(componentNames) {
	    var familyId, families;
		
	    familyId = this._getFamilyId(componentNames);
	    this._ensureFamilyExists(componentNames);
		
		return this._families[familyId].entityAdded;
	},
	
	/**
	 * Returns the signal for entities removed with the specified components. The
	 * signal is also emitted when a component is removed from an entity causing it to
	 * match the specified component names.
	 * @param {...String} componentNames
	 * @return {Signal} A signal which is emitted every time an entity with
	 *      specified components is added.
	 */
	entityRemoved : function(componentNames) {
	    var familyId, families;
		
	    familyId = this._getFamilyId(componentNames);
		this._ensureFamilyExists(componentNames);
		
		return this._families[familyId].entityRemoved;
	},
	
	/**
	 * Creates a family for the passed array of component names if it does not
	 * exist already.
	 * @param {Array.<String>} components
	 */
	_ensureFamilyExists : function(components) {
	    var families = this._families;
		var familyId = this._getFamilyId(components);
		
		if(!families[familyId]) {
		    families[familyId] = new TAGCes.Family(components);
			
			for(var node = this._entities.head; node; node = node.next) {
			    families[familyId].addEntityIfMatch(node.entity);
			}
		}
	},
	
	/**
	 * Returns the family ID for the passed array of component names. A family
	 * ID is a comma separated string of all component names with a '$'
	 * prepended.
	 * @param {Array.<String>} components
	 * @return {String} the family ID for the passed array of components.
	 */
	_getFamilyId : function(components) {
	    return '$' + Array.prototype.join.call(components, ',');
	},
	
	/**
	 * Handler to called when a component is added to an entity.
	 * @param {Entity} entity
	 * @param {String} componentName
	 */
	_onComponentAdded : function(entity, componentName) {
	    var families, familyId;
		 
		families = this._families;
		for(familyId in families) {
		    families[familyId].onComponentAdded(entity, componentName);
		}
	},
	
	/**
	 * Handler to called when a component is removed from an entity.
	 * @param {Entity} entity
	 * @param {String} componentName
	 */
	_onComponentRemoved : function(entity, componentName) {
	    var families, familyId;
		 
		families = this._families;
		for(familyId in families) {
		    families[familyId].onComponentRemoved(entity, componentName);
		}
	}
}