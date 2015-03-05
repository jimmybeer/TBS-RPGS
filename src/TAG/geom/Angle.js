var TAGGeom = TAGGeom || {};
/**
* Provides some Angle related helper methods
*/
TAGGeom.Angle = function() {}

TAGGeom.Angle.PI = Math.PI;
TAGGeom.Angle.TwoPI = Math.PI*2;
TAGGeom.Angle.RAD2DEG = (180 / Math.PI);
TAGGeom.Angle.DEG2RAD = (Math.PI / 180);

/**
* Normalizes angle to be between -PI and +PI.
*/		
TAGGeom.Angle.normalizeRad = function(angle) {
    while( angle < -TAGGeom.Angle.PI)
        angle += TAGGeom.Angle.TwoPI;
    while( angle > TAGGeom.Angle.PI)
        angle -= TAGGeom.Angle.TwoPI;
    return angle;
}		

/**
* Normalizes angle to be between -180 and +180.
*/		
TAGGeom.Angle.normalizeDeg = function(angle) {
    while( angle < -180)
        angle += 360;
    while( angle > 180)
        angle -= 360;
    return angle;
}

/**
* Normalizes angle to be between 0 and 2PI.
*/		
TAGGeom.Angle.normalizeRad2 = function(angle) {
    while( angle < 0)
        angle += TAGGeom.Angle.TwoPI;
    while( angle > TAGGeom.Angle.TwoPI)
        angle -= TAGGeom.Angle.TwoPI;
    return angle;
}		

/**
* Normalizes angle to be between 0 and +360.
*/		
TAGGeom.Angle.normalizeDeg2 = function(angle) {
    while( angle < 0)
        angle += 360;
    while( angle > 360)
        angle -= 360;
    return angle;
}

/**
 * Is an angle in the cone defined by min & max?
 * Assumes angles are normalized.
 */		
TAGGeom.Angle.isEnclosedNorm = function(angle, min, max) {
    return (angle > min && angle < max);
}	

/**
 * Is an angle (degree) in the cone defined by min & max?
 */		
TAGGeom.Angle.isEnclosedDeg = function(angle, min, max){
    while( angle > max)
        angle -= 360;
    while( angle < min)
        angle += 360;
    return (angle > min && angle < max);
}	

/**
 * Is a radian angle in the cone defined by min & max?
 */		
TAGGeom.Angle.isEnclosedRad = function(angle, min, max)
{
    while( angle > max)
        angle -= TAGGeom.Angle.PI;
    while( angle < min)
        angle += TAGGeom.Angle.PI;
    return (angle > min && angle < max);
}		

/**
 * Converts an angle from radian to degrees
 */		
TAGGeom.Angle.radToDeg = function(radians) {
    return radians * TAGGeom.Angle.RAD2DEG;
}

/**
 * Converts an angle from degree to radian
 */		
TAGGeom.Angle.degToRad = function(degrees) {
    return degrees * TAGGeom.Angle.DEG2RAD;
}	

/**
 * Returns cone angle in radian with (0,0) as center
 */	
TAGGeom.Angle.coneAngle = function(vector1, vector2) {
    return Math.atan2(vector1.y,vector1.x) - Math.atan2(vector2.y,vector2.x);
}

/**
 * Returns polar angle in radian
 */	
TAGGeom.Angle.polarAngle = function(vector) {
    return Math.atan2(vector.y, vector.x);
}