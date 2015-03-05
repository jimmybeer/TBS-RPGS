var LightingManager = function() {
}

LightingManager.prototype = {
    init : function(nodes) {
        for(var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            node.light = {
                // The base tint to revert to when not in view.
                baseTint : TR.lighting.visitedTint,
                // The base level, use this to prevent base tint level being
				// overridden my other low tints.
                baseLevel : 0,
                // The current tint to apply to this node.
                currentTine : TR.lighting.blackTint,
                // The current tint level for easy comparison.
                tintLevel : -1
            };
        }
    },
    
    clean : function(nodes) {
        for(var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            node.light.baseTint = undefined;
            node.light.currentTine = undefined;
            node.light = undefined;
        }
    },
    
    disableLighting : function(nodes) {
        for(var i = 0; i < nodes.length; i++) {
            this.setTint(nodes[i], TR.lighting.whiteTint, 10);
        }
    },
    
    updateLighting : function(nodes) {
        for(var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var range = node.fov.range;
            
            if(node.visited === false) {
                // Do not show nodes that have never been seen
                this.setTint(node, TR.lighting.blackTint, -1);
            } else if(range === -1) {
                // Node has been seen but is currently out of range
                this.setTint(node, node.light.baseTint, node.light.baseLevel);
            } else {
                // Determine light level for current node.
                this.setTintLevel(node, 10 - range);
            }
            
            this.applyTint(node);
        }
    },
    
    setTint : function(node, tint, level) {
    	node.light.currentTint = tint;
        node.light.tintLevel = level || 0;
    },
    
    setTintLevel : function(node, level) {
    	node.light.currentTint = TR.lighting.tints[level];
        node.light.tintLevel = level;
    },
    
    setHigherTint : function(node, level) {
        if(level > node.tintLevel) {
            node.light.currentTint = TR.lighting.tints[level];
            node.light.tintLevel = level;
        }
    },
    
    setLowerTint : function(node, level) {
        if(level < node.tintLevel) {
        	node.light.currentTint = TR.lighting.tints[level];
        	node.light.tintLevel = level;
        }
    },
    
    applyTint : function(node) {
        node.tileSprite.setColor(node.light.currentTint);
    }
}