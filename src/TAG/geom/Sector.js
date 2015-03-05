var TAGGeom = TAGGeom || {};

TAGGeom.Sector = function(alphaRadian, betaRadian) {
    this.alpha = alphaRadian || 0;
    this.theta = (betaRadian || 0) - alphaRadian;
}

TAGGeom.Sector.prototype = {		
	beta : function() {
        return this.alpha + this.theta;			
    },
        
    clear : function() {
        this.alpha = this.theta = 0;	
    },
    
    setFullCircle : function() {
        alpha = 0;
        theta = Angle.TwoPI;
    },
    
    setCone : function(dirVector, coneAngle, normalize) {
        var n = normalize || false;
        
        this.alpha = Math.atan2(dirVector.y, dirVector.x) - 0.5 * coneAngle;
        if(n)
            this.alpha = TAGGeom.Angle.normalizeRad2(this.alpha);
        this.theta = coneAngle;
    },
    
    setFromCoords : function(cx, cy, ax, ay, bx, by, normalize) {
        var n = normalize || false;
        
        this.alpha = Math.atan2(ay-cy, ax-cx);
        var newBeta = Math.atan2(by-cy, bx-cx);
        if(n)
        {	
            this.alpha = TAGGeom.Angle.normalizeRad2(this.alpha);
            newBeta = TAGGeom.Angle.normalizeRad2(newBeta);
        }
        if(this.alpha >= newBeta)
            this.alpha = this.theta = 0;	//clear
        else
            this.theta = newBeta - this.alpha;
    },
    
    copy : function(sector) {
        this.alpha = sector.alpha;
        this.theta = sector.theta;		
    },
    
    setIntersection : function(aSector, bSector) {
        if(aSector.theta == 0 || bSector.theta == 0)
            this.alpha = this.theta = 0;	//clear
        else
        {
            this.alpha = Math.max(aSector.alpha, bSector.alpha);
            var newBeta = Math.min(aSector.alpha + aSector.theta, bSector.alpha + bSector.theta);
            if(newBeta <= this.alpha)
                this.alpha = this.theta = 0;//clear
            else
                this.theta = newBeta - this.alpha;				
        }
    },

    setUnion : function(aSector, bSector) {
        if(aSector.theta == 0)
        {
            //copy b
            this.alpha = bSector.alpha;
            this.theta = bSector.theta;
        }
        else if(bSector.theta == 0)
        {
            //copy a
            this.alpha = aSector.alpha;
            this.theta = aSector.theta;
        }
        else
        {
            this.alpha = Math.min(aSector.alpha, bSector.alpha);
            var newBeta = Math.max(aSector.beta, bSector.beta);
            if(newBeta <= this.alpha)
                this.alpha = this.theta = 0;	//clear
            else
                this.theta = newBeta - this.alpha;
        }
    }		
}
