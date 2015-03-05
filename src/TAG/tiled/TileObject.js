var TAGTiled = TAGTiled || {};

TAGTiled.ObjectType = {
    LayerType : 0,
    MapObjectType : 1,
    MapType : 2,
    TilesetType : 3,
    TileType : 4
};

TAGTiled.FlipDirection = {    
    FlipHorizontally : 0,    
    FlipVertically : 1
};

TAGTiled.RotateDirection = {    
    RotateLeft : 0,
    RotateRight : 1
};

/**
 * The base class for anything that can hold properties.
 */
TAGTiled.TileObject = function(typeId) {
    this.mTypeId = typeId;
	this.mProperties = {};
};

TAGTiled.TileObject.prototype = {
    clone:function(object) {
	    this.mTypeId = object.mTypeId;
        this.setProperties(object.mProperties);
	},

    /**
               *Returns the type of this object.
              */
    typeId:function() { 
	    return this.mTypeId; 
	},

    /**
               * Returns the properties of this object.
              */
    properties:function() { 
	    return this.mProperties; 
	},

    /** 
                * Replaces all exisiting properties with a new set of properties.
                */
    setProperties:function(properties) { 
	    // Delete existing properties.
	    for(var prop in this.mProperties) {
            delete this.mProperties[prop];
        }
		
		var keys = Object.keys(properties);
        for(var key in keys){
		    // WARNING: does not clone each parameter value!
			this.mProperties[key] = properties[key];
		}
	},

    /**
                * Merges properties with the existing properties. Poperties with the
               * same name will be overridden.
               *
               *
               */
	mergeProperties:function(properties) { 
	    var keys = Object.keys(properties);
        for(var key in keys){
		    // WARNING: does not clone each parameter value!
			this.mProperties[key] = properties[key];
		}
	},

    /**
               * Returns the value of the object's \a name property.
               */
    property:function(name) {
 	    return this.mProperties[name]; 
	},

    /**
                * Returns whether this object has a property with a given \a name.
                */
    hasProperty:function(name) {
	    return this.mProperties.hasOwnProperty(name); 
	},

    /**
                * Sets the value of the object's  name property to  value.
                */
    setProperty:function(name, value) { 
	    this.mProperties[name] = value; 
	},

    /**
               * Removes the property with the given \a name.
               */
    removeProperty:function(name) {
	    if(this.mProperties.hasOwnProperty(name)) {
		    delete this.mProperties.remove(name); 
		}
	},

    mTypeId : undefined,
    mProperties : undefined
};