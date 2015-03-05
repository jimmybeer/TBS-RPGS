var TAGAlg = TAGAlg || {};

/**
 * Implementation of the Park Miller (1988) "minimal standard" linear 
 * congruential pseudo-random number generator.
 * 
 * For a full explanation visit: http://www.firstpr.com.au/dsp/rand31/
 * 
 * The generator uses a modulus constant (m) of 2^31 - 1 which is a
 * Mersenne Prime number and a full-period-multiplier of 16807.
 * Output is a 31 bit unsigned integer. The range of values output is
 * 1 to 2,147,483,646 (2^31-1) and the seed must be in this range too.
 * 
 * Conversion of Michael Baczynski, www.polygonal.de as3 implementation
 */
TAGAlg.PM_PRNG = function(seed) {
    if(seed !== undefined) {
	    this.seed = seed;
	} else {
		mapgen.rndSeed = Math.random() * 2147483647;
	    this.seed = mapgen.rndSeed;
	}
 }
 
TAGAlg.PM_PRNG.prototype = {
 	/**
	 * set seed with a 31 bit unsigned integer between 1 and 0X7FFFFFFE inclusive. don't use 0!
 	 */
	seed : 1,
	
	/**
                * provides the next pseudorandom number as an unsigned integer (31 bits)
	  */
    nextInt : function() {
	    return this.gen() | 0;
	},
	
	/**
	 * provides the next pseudorandom number as a float between nearly 0 and nearly 1.0.
	 */
	nextDouble : function() {
	    return (this.gen() / 2147483647);
	},
	
	/**
 	 * provides the next pseudorandom number as an unsigned integer (31 bits) betweeen
	 * a given range.
	 */
	nextIntRange : function(min, max) {
	    return (min + ((max - min) * this.nextDouble())) | 0;
	},
	
	/**
	 * provides the next pseudorandom number as a float between a given range.
	 */
	nextDoubleRange : function(min, max) {
	    return (min + ((max - min) * this.nextDouble()));
	},
	
	/**
	 * generator:
	 * new-value = (old-value * 16807) mod (2^31 - 1)
	 */
	gen : function() {
		//integer version 1, for max int 2^46 - 1 or larger.
		return this.seed = (this.seed * 16807) % 2147483647;
			
		/**
		 * integer version 2, for max int 2^31 - 1 (slowest)
		 */
		//var test:int = 16807 * (seed % 127773 >> 0) - 2836 * (seed / 127773 >> 0);
		//return seed = (test > 0 ? test : test + 2147483647);
			
		/**
		 * david g. carta's optimisation is 15% slower than integer version 1
		 */
		//var hi:uint = 16807 * (seed >> 16);
		//var lo:uint = 16807 * (seed & 0xFFFF) + ((hi & 0x7FFF) << 16) + (hi >> 15);
		//return seed = (lo > 0x7FFFFFFF ? lo - 0x7FFFFFFF : lo);
	}
}