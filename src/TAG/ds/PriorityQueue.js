var TAGDs = TAGDS || {};

/**
 * Initializes a new empty PriorityQueue with the given comparator(a,b)
 * function, uses DEFAULT_COMPARATOR() when no function is provided.
 *
 * The comparator function must return a positive number when a > b
 * 0 when a == b and a negative number when a < b.
 */
TAGDs.PriorityQueue = function(comparator) {
    this._comparator = comparator || TAGDs.DEFAULT_COMPARATOR;
	this._elements = [];
}

/**
 * Compares a and b.
 */
TAGDs.DEFAULT_COMPARATOR = function(a, b) {
    if(a instanceof Number && b instanceof Number) {
	    return a-b;
	} else {
	    a = a.toString();
		b = b.toString();
		
		if(a == b) return 0;
		
		return (a > b) ? 1 : -1;
	}
}

TAGDs.PriorityQueue.prototype = {
    /**
	 * Returns whether the priority queue is empty or not.
	 */
	isEmpty : function() {
	    return this.size === 0;
	},
	
	/** 
	 * Peels at the top element of the priority queue.
	 */
	peek : function() { 
	    if(this.isEmpty()) throw new Error('PriorityQueue is empty!');
		
		return this._elements[0];
	},
	
	/** 
	 * Dequeues the top element of the priority queue.
	 */
	deq : function() {
	    var first = this.peek();
		var last = this._elements.pop();
		var size = this.size();
		
		if(size === 0) return first;
		
		this._elements[0] = last;
		var current = 0;
		
		while(current < size) {
		    var largest = current;
		    var left = (2 * current) + 1;
			var right = (2 * current) + 2;
			
			if(left < size && this._compare(left, largest) > 0) {
			    largest = left;
			}
			
			if(right < size && this._compare(right, largest) > 0) {
			    largest = right;
			}
			
			if(largest === current) break;
			
			this._swap(largest, current);
			current = largest;
		}
		
		return first;
	},
	
	/** 
	 * Enqueues the element at the priority queue and returns its new size.
	 */
	enq : function(element) {
	    var size = this._elements.push(element);
		var current = size - 1;
		
		while(current > 0) {
		    var parent = Math.floor((current - 1) / 2);
			
			if(this._compare(current, parent) < 0) break;
			
			this._swap(parent, current);
			
			current = parent;
		}
		
		return size;
	},
	
	/**
	 * Returns the size of the priority queue.
	 */
	size : function() {
	    return this._elements.length;
	},
	
	/**
	 * Iterrates over queue elements.
	 */
	forEach : function(fn) {
	    return this._elements.forEach(fn);
	},
	
	/**
	 * Compares the values at positions a and b in the priority queue using its
	 * comparator function.
	 */
	_compare : function(a, b) {
	    return this._comparator(this._elements[a], this._elements[b]);
	},
	
	/**
	 * Swaps the values at positions a and b in the priority queue.
	 */
	_swap : function(a, b) {
	    var aux = this._elements[a];
		this._elements[a] = this._elements[b];
		this._elements[b] = aux;
	}
}