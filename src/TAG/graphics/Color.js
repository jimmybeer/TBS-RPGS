var TAGg = TAGg || {};

TAGg.Color = function(r, g, b, a) {
	this.red = r || 0;
	this.green = g || 0;
	this.blue = b || 0;
	this.alpha = a || 1;
}

/**
 * Set Hue [0..2PI], Saturation [0..1] and Value [0..1]
 */	
TAGg.Color.fromHSV = function(hue, saturation, value) {
    var result = new TAGg.Color();
    result.setHSV(hue, saturation, value);
    return result;
}

TAGg.Color.prototype = {	    
    redByte : function() {
        return this.red < 0 ? 0 : this.red > 1 ? 255 : this.red * 255;
    },
    setRedByte : function(v) {
        this.red = v / 255;
    },
    
    blueByte : function() {
        return this.blue < 0 ? 0 : this.blue > 1 ? 255 : this.blue * 255;
    },
    setBlueByte : function(v) {
        this.blue = v / 255;
    },
    
    greenByte : function() {
        return this.green < 0 ? 0 : this.green > 1 ? 255 : this.green * 255;
    },
    setGreenByte : function(v) {
        this.green = v / 255;
    },
    
    alphaByte : function() {
        return this.alpha < 0 ? 0 : this.alpha > 1 ? 255 : this.alpha * 255;
    },
    setAlphaByte : function(v)
    {
        this.alpha = v / 255;
    },
    
    //getters
    rgba : function() {
        return this.alphaByte() << 24 | this.redByte() <<16 | this.greenByte() <<8 | this.blueByte();
    },
    
    setRgba : function(v) {
        var a = v >> 24 & 0xFF;
        var r = v >> 16 & 0xFF;
        var g = v >> 8 & 0xFF;
        var b = v & 0xFF;
        this.red = r / 255;
        this.green = g / 255;
        this.blue = b / 255;
        this.alpha = a / 255;
    },
    
    setRGB : function(r, g, b, a) {
        this.red = r;
        this.green = g;
        this.blue = b;
        this.alpha = a | 1;			
    },
    
    /**
      * Set Hue [0..2PI], Saturation [0..1] and Value [0..1]
      */	
    setHSV : function(hue, saturation, value) {
        hue = TAGGeom.Angle.normalizeRad2(hue);
        var hseg = 3 * hue / Math.PI;
        var c = saturation * value;
        var x = c * ( 1 - Math.abs(hseg%2 - 1));
        var i = Math.floor(hseg);
        switch (i) {
            case 0: this.red = c; this.green = x; this.blue = 0; break;
            case 1: this.red = x; this.green = c; this.blue = 0; break;
            case 2: this.red = 0; this.green = c; this.blue = x; break;
            case 3: this.red = 0; this.green = x; this.blue = c; break;
            case 4: this.red = x; this.green = 0; this.blue = c; break;
            case 5: this.red = c; this.green = 0; this.blue = x; break;
        }
        var m = value - c;
        this.red += m;
        this.green += m;
        this.blue += m;
    },
    
    /**
     * Get a string representation of this color
     */
    toString : function() {
        return "(r=" + this.redByte() + ", g=" + this.greenByte() + ", b=" + this.blueByte() + ", a=" + this.alphaByte() + ")";
    }
}