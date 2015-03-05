var TAGGeom = TAGGeom || {};
	
	/**
	 * Vector2D represents a 2D vector in cartesian coordinate space.
	 *
	 * To convert between flash.geom.Point and this class, use the methods
	 * toPoint and fromPoint.
	 * 
	 * All the methods return a reference to the result, even when the result
	 * is the original vector. So you can chain methods together.
	 */
TAGGeom.Vector2D = function(vx, vy) {
		this.x = vx || 0;
		this.y = vy || 0;
}

/**
 * Converts from flash.geom.Point to Vector2D.
 */
TAGGeom.Vector2D.fromPoint = function(point) {
	return new TAGGeom.Vector2D( point.x, point.y );
}
		
/**
 * Creates a Vector2 object from polar coordinates.
 */
TAGGeom.Vector2D.fromPolar = function( len, angle ) {
	return new TAGGeom.Vector2D( len * Math.cos( angle ), len * Math.sin( angle ) );
}		
/**
 * Creates a Vector2 object between the two input vectors. Ratio indicates the position
 * between the two vectors. A ratio of 0 returns v1 and a ratio of 1 returns v2.
 */
TAGGeom.Vector2D.fromInterpolation = function( vector1, vector2, ratio ) {
	return vector1.added( vector2.subtracted( vector1 ).scaled( ratio ) );
}	

TAGGeom.Vector2D.prototype = {			

	/**
	 * Converts from Vector2 to flash.geom.Point.
	 */
	toPoint : function() {
		return new TAGGeom.Point( this.x, this.y );
	},	
		
	/**
	 * Assigns new coordinates to this vector and returns a reference to self.
	 */
	reset : function( vx, vy ) {
		this.x = vx || 0;
		this.y = vy || 0;
		return this;
	},
		
	/**
	 * Copys another vector into this one and returns a reference to self.
	 */
	copy : function( vector ) {
		this.x = vector.x;
		this.y = vector.y;
		return this;
	},
	
	/**
	 * Returns a new Vector2D that equals this one. 
	 */
    clone : function() {
		return new TAGGeom.Vector2D( this.x, this.y );
	},

	/**
	 * Returns a new Vector2D that equals the sum of this and another vector.
	 */
	added : function( vector )	{
		return new TAGGeom.Vector2D( this.x + vector.x, this.y + vector.y );
	},
		
	/**
	 * Adds another vector to this one and returns a reference to self.
	 */
	add : function( vector ) {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	},
		
	/**
	 * Returns a new Vector2D covering the distance from the other vector to this one.
	 */		
    subtracted : function( vector ) {
		return new TAGGeom.Vector2D( this.x - vector.x, this.y - vector.y );
	},
	
	/**
	 * Subtracts another vector from this one and returns a reference to self.
	 */
	subtract : function( vector2D ) {
		this.x -= vector.x;
		this.y -= vector.y;
		return this;
	},
		
	/**
	 * Returns a new vector equaling this vector multiplied by the other vector.
	 */
	 multiplied : function( vector ){
		return new TAGGeom.Vector2D( this.x * vector.x, this.y * vector.y);
	},
		
	/**
	 * Multiplies this vector with another vector and returns a reference to self.
	 */
	multiply : function( vector ) {
	    this.x *= vector.x;
		this.y *= vector.y;
		return this;
	},

	scaled : function( scale ) {
		return new TAGGeom.Vector2D( this.x * scale, this.y * scale );
	},

	/**
	 * Multiplies this vector by a number and returns a reference to self.
	 */
	scale : function( s ) {
		this.x *= s;
		this.y *= s;
		return this;
	},
		
    /**
      * Returns a new vector equalling this vector with angle (rads) added to its polar coordinates.
	 */
	rotated : function( angle ) {
		var newAngle = Math.atan2( this.y, this.x ) + angle;
		return TAGGeom.Vector2D.fromPolar( this.length(), newAngle );
	},
		
	/**
	 * Rotates this vector by angle (rads) and returns a reference to self.
	 */
	rotate : function( angle ) {
		var newAngle = Math.atan2( this.y, this.x ) + angle;
		var len = this.length();
		this.x = len * Math.cos( newAngle );
		this.y = len * Math.sin( newAngle );
		return this;
	},		
		
	/**
	 * Returns a new Vector2D equaling this vector translated by tx and ty.
	 */
	translated : function( tx, ty) {
		return new TAGGeom.Vector2D( this.x + tx, this.y + ty );
	},
		
	/**
	 * Translates this vector by tx and ty and returns a reference to self.
	 */
	translate : function( tx, ty) {
		this.x += tx;
		this.y += ty;
		return this;
	},
		
	/**
	 * Returns a new Vector transformed by a matrix.
	 */
	/*transformed : function(matrix) {
		return new TAGGeom.nVector2D( mtx.a * this.x + mtx.c * this.y + mtx.tx, mtx.b * this.x + mtx.d * this.y + mtx.ty );
	},*/
		
	/**
	 * Transforms this vector by a matrix.
	 */
	/*transform : function(matrix) {
		var ox = this.x;
		this.x = mtx.a * ox + mtx.c * this.y + mtx.tx;
		this.y = mtx.b * ox + mtx.d * this.y + mtx.ty;
		return this;
	},*/
				
	/**
	 * Returns a new vector of the same length but in the opposite direction.
	 */
	inverted : function() {
		return new TAGGeom.Vector2D( -this.x, -this.y );
	},
		
	/**
	 * Inverses this vector and returns a reference to self.
	 */
	inverse : function() {
		this.x *= -1;
		this.y *= -1;
		return this;
	},	
		
	/**
	 * Rotate a copy of this vector that is orthogonal/perpendicular. (cw rotation by 90°).
	 */
	turnedRight : function() {
		return new TAGGeom.Vector2D(-this.y, this.x);
	},
		
	/**
	 * Rotate this vector cw by 90° and return a reference to self.
	 */
	turnRight : function() {
		var tmp = this.x;
		this.x = -this.y;
		this.y = tmp;
		return this;
	},
		
	/**
	 * Rotate a copy of this vector that is orthogonal/perpendicular. (ccw rotation by 90°).
	 */
	turnedLeft : function() {
		return new TAGGeom.Vector2D(this.y,-this.x);
	},
		
	/**
	 * Rotate this vector cw by 90° and return a reference to self.
	 */
	turnLeft : function() {
		var tmp = this.x;
		this.x = this.y;
		this.y = -tmp;
		return this;
	},
		
	/**
	 * Scales this vector to have unit length and returns a reference to self.
	 */
	normalize : function() {
		var s = this.length();
		if ( s !== 0 ) {
			s = 1 / s;
			this.x *= s;
			this.y *= s;
		} else {
			this.x = 0;
			this.y = 0;
		}
		return this;
	},
	
	/**
	 * Returns a new Vector of the same direction as this but with unit length.
	 */
	normalized : function() {
		return this.clone().normalize();
	},
		
		/**
		 * Floors the components of the vector and returns a reference to self.
		 */
	floor : function() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},
		
	/**
	 * Returns a new Vector matching this but with floord components.
	 */
	floored : function() {
	    return this.clone().floor();
	},
		
	/**
	 * Rounds the components of the vector to the nearest integer and returns a reference to self.
	 */
	round : function() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},
		
    /**
	 * Returns a new Vector matching this but with rounded components.
	 */
	rounded : function() {
		return this.clone().round();
	},		

	/**
	 * Compares this vector to another and return true if the vectors have the same coordinates.
	 */
    isEqual : function( vector ) {
		return this.x === vector.x && this.y === vector.y;
	}, 

	/**
	 * Compares this vector to another and return true if the distance between them
	 * is within tolerance.
	 */
	nearEquals : function( vector, tolerance ) {
		return this.subtracted( vector ).lengthSquared() <= tolerance * tolerance;
	},
		
	/**
	 * Calculates the dot product with another vector.
	 */
	dotProduct : function( vector ) {
    	return ( this.x * vector.x + this.y * vector.y );
	},
		
	/**
	 * Calculates the cross product with another vector. Returns the magnitude of the resulting vector that is perpendicular to the 2D plane.
	 */
	crossProduct : function( vector ) {
		//rotate one vector anti-clockwise by 90 degrees and take the dot product between both vectors
		return ( this.x * vector.y - this.y * vector.x );
	},
		
	/**
	 * Calculates the distance from the other vector.
	 */
	distance : function( vector ) {
		var dx = this.x - vector.x;
		var dy = this.y - vector.y;
		return Math.sqrt( dx * dx + dy * dy );
	},
		
	/**
	 * Calculates the square of the distance from the other vector.
	 */
	distanceSquared : function( vector ) {
		var dx = this.x - vector.x;
		var dy = this.y - vector.y;
		return ( dx * dx + dy * dy );
	},
		
	/**
	 * The length of this vector.
	 */
	 setLength : function(newLen) {
		var len = Math.sqrt(this.lengthSquared());
		var f = (len > 0) ? newLen / len : 0;
		this.x *= f;
		this.y *= f;
	},
		
	/**
	 * The length of this vector.
	 */
	length : function() {
		return Math.sqrt( this.lengthSquared() );
	},
		
	/**
	 * The square of the length of this vector.
	 */
	lengthSquared : function(){
		return ( this.x * this.x + this.y * this.y );
	},
		
	/**
	 * An angle describing the orientation of the Vector. (-1,0) is 0. (1,0) is Pi. 
	 */
	polarAngle : function() {	
		return Math.atan2(this.y, this.x) + Math.PI;
		/* 
		//the same effect but a lot slower..
		var r:Number = length;
		if(r == 0)
			return 0;
		else if(x >= 0)
			return Math.asin(y / r);
		else
			return Math.PI - Math.asin(y / r); 	
		*/
	},
		
	/**
	 * Get a string representation of this vector
	 */
	toString : function() {
		return "(x=" + this.x + ", y=" + this.y + ")";
	}
}

