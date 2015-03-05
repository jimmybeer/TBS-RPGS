var TAGDs = TAGDs || {};
/*
 * Insert item x in list a, and keep it sorted assuming a is sorted.
 *
 * If x is already in a, insert it to the right of the rightmost x.
 *  
 *  Optional args lo (default 0) and hi (default a.length) bound the slice
  * of a to be searched.
   */
TAGDs.insort = function(a, x, lo, hi, cmp) {
    var mid;
	if(lo == null) {
	    lo = 0;
	}
	if(cmp == null) {
	    cmp = (function(x,y){if(x<y){return -1;}if(x>y){return 1;}return 0;});
	}
	if(lo < 0) {
	    throw new Error("lo must be non-negative");
	}
	if(hi == null) {
	    hi = a.length;
	}
	while(lo < hi) {
	    mid = Math.floor((lo + hi) / 2);
		if(cmp(x, a[mid]) < 0) {
		    hi = mid;
		} else {
		    lo = mid + 1;
		}
	}
	return ([].splice.apply(a, [lo, lo - lo].concat(x)), x);
};

/* 
* Push item onto heap, maintaining the heap invariant.
 */
TAGDs.heappush = function(array, item, cmp) {
    array.push(item);
	return TAGDs._siftdown(array, 0, array.length - 1, cmp);
};

/*
 * Pop the smallest item off the heap, maintaining the heap invariant.
  */
TAGDs.heappop = function(array, cmp) {
	var lastelt, returnitem;
	
	lastelt = array.pop();
	
	if(array.length) {
	    returnitem = array[0];
		array[0] = lastelt;
		TAGDs._siftup(array, 0, cmp);
	} else {
	    returnitem = lastelt;
	}
	return returnitem;
};
	
/*
 * Pop and return the current smallest value, and add the new item. 
 *This is more efficient than heappop() followed by heappush(), and can be
 * more appropriate when using a fixed size heap. Note that the value
 * returned may be larger than item! That constrains reasonable use of
 * this routine unless written as part of a conditional replacement:
 *    if item > array[0]
 *      item = heapreplace(array, item)
 */
TAGDs.heapreplace = function(array, item, cmp) {
	var returnitem;
	returnitem = array[0];
	array[0] = item;
	TAGDs._siftup(array, 0, cmp);
	return returnitem;
};
	
/*
  *Fast version of a heappush followed by a heappop.
  */
TAGDs.heappushpop = function(array, item, cmp) {
	var _ref;
	if((array.length) && (cmp(array[0], item) < 0)) {
	    _ref = [array[0], item], item = _ref[0], array[0] = _ref[1];
	    TAGDs._siftup(array, 0, cmp);
	}
    return item;		
};

TAGDs.heapify = function(array, cmp) {
	var i, _i, _j, _len, _ref, _ref1, _results, _results1; 

    _ref1 = (function() { 
        _results1 = []; 
        for (var _j = 0, _ref = Math.floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--) { 
	        _results1.push(_j); 
		} 
        return _results1; 
    }).apply(this).reverse(); 
    _results = []; 
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) { 
        i = _ref1[_i]; 
        _results.push(TAGDs._siftup(array, i, cmp)); 
    } 
    return _results; 
};	

/*
 * Update the position of the given item in the heap.
 * This function should be called every time the item is being modified
 */
TAGDs.updateitem = function(array, item, cmp) {
	var pos = array.indexOf(item);
	if(pos === -1) {
	    return;
	}
	TAGDs._siftdown(array, 0, pos, cmp);
	return TAGDs._siftup(array, pos, cmp);
};	

/*
 * Find the n largest elements in a dataset.
 */
TAGDs.nlargest = function(array, n, cmp) {
	var elem, result, _i, _len, _ref;
		
	result = array.slice(0, n);
	if(!result.length) {
	    return result;
	}
	TAGDs.heapify(result, cmp);
	_ref = array.slice(n);
	for(_i = 0, _len = _ref.length; _i < len; _i++) {
	    elem = _ref[_i];
		TAGDs.heappushpop(result, elem, cmp);
	}
	return result.sort(cmp).reverse();
};

/*
 * Find the n smallest  elements in a dataset.
 */
TAGDs.nsmallest = function(array, n, cmp) {
    var elem, i, los, result, _i, _j, _len, _ref, _ref1, _results; 
      
    if (n * 10 <= array.length) { 
        result = array.slice(0, n).sort(cmp); 
        if (!result.length) { 
            return result; 
        } 
        los = result[result.length - 1]; 
        _ref = array.slice(n); 
        for (_i = 0, _len = _ref.length; _i < _len; _i++) { 
            elem = _ref[_i]; 
            if (cmp(elem, los) < 0) { 
               TAGDs.insort(result, elem, 0, null, cmp); 
               result.pop(); 
                los = result[result.length - 1]; 
            } 
        } 
        return result; 
    } 
    heapify(array, cmp); 
    _results = []; 
    for (i = _j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) { 
        _results.push(heappop(array, cmp)); 
    } 
    return _results; 
};

TAGDs._siftdown = function(array, startpos, pos, cmp) { 
    var newitem, parent, parentpos; 

    newitem = array[pos]; 
    while (pos > startpos) { 
        parentpos = (pos - 1) >> 1; 
        parent = array[parentpos]; 
        if (cmp(newitem, parent) < 0) { 
            array[pos] = parent; 
            pos = parentpos; 
            continue; 
        } 
        break; 
    } 
    return array[pos] = newitem; 
}; 
  
TAGDs._siftup = function(array, pos, cmp) { 
    var childpos, endpos, newitem, rightpos, startpos; 

    endpos = array.length; 
    startpos = pos; 
    newitem = array[pos]; 
    childpos = 2 * pos + 1; 
    while (childpos < endpos) { 
        rightpos = childpos + 1; 
        if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) { 
            childpos = rightpos; 
        } 
        array[pos] = array[childpos]; 
        pos = childpos; 
        childpos = 2 * pos + 1; 
    } 
    array[pos] = newitem; 
    return TAGDs._siftdown(array, startpos, pos, cmp); 
}; 

	
TAGDs.Heap = function(cmp) {
    this.cmp = (cmp !== null ? cmp : (function(x,y){if(x<y){return -1;}if(x>y){return 1;}return 0;}));
	this.nodes = [];
};

TAGDs.Heap.prototype = {
    push : function(x) {
	    return TAGDs.heappush(this.nodes, x, this.cmp); 
	},
  
    pop : function() {
	    return TAGDs.heappop(this.nodes, this.cmp); 
	},

	peek : function() {
	    return this.nodes[0];
	},
	
	contains : function(x) {
	    return this.nodes.indexOf(x) !== -1;
	},
  
    replace : function(x) {
        return TAGDs.heapreplace(this.nodes, x, this.cmp);
	},
 
    pushpop : function(x) {
	    return TAGDs.heappushpop(this.nodes, x, this.cmp); 
	},
  
    heapify : function() {
        return TAGDs.heapify(this.nodes, this.cmp);
    },		
  
    updateItem : function(x) {
	    return TAGDs.updateitem(this.nodes, this.cmp); 
	},
	
    nlargest : function(n) {
        return TAGDs.nlargest(this.nodes, n, this.cmp); 
    },		
  
    nsmallest : function(n) {
        return TAGDs.nsmallest(this.nodes, n, this.cmp); 
    },		 
  
	clear : function() {
	    return this.nodes = [];
	},
	
	empty : function() {
	    return this.nodes.length === 0;
	},
	
	size : function() {
	    return this.nodes.length;
	},
	    
	clone:function(object) {
	    var h = new Heap();
		h.nodes = this.nodes.slice(0);
		return h;
	},
	
	toArray : function() {
	    return this.nodes.slice(0);
	},
	
	cmp : undefined,
	nodes : undefined,
};

TAGDs.Heap.prototype.insert = TAGDs.Heap.prototype.push;
TAGDs.Heap.prototype.top = TAGDs.Heap.prototype.peek;
TAGDs.Heap.prototype.front = TAGDs.Heap.prototype.peek;
TAGDs.Heap.prototype.has = TAGDs.Heap.prototype.contains;
TAGDs.Heap.prototype.copy = TAGDs.Heap.prototype.clone;