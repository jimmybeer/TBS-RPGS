var TAGDs = TAGDs || {};

/**
 * A union-find data structure for maintaining disjoint sets.
 */
TAGDs.UnionFind = function(count) {
  this.roots = new Array(count);
  this.ranks = new Array(count);
  
  for(var i=0; i<count; ++i) {
    this.roots[i] = i;
    this.ranks[i] = 0;
  }
}

TAGDs.UnionFind.prototype = {
    length : function() {
        return this.roots.length;
    },

    makeSet : function() {
        var n = this.roots.length;
        this.roots.push(n);
        this.ranks.push(0);
        return n;
    },

    find : function(x) {
        var roots = this.roots;
        while(roots[x] !== x) {
            var y = roots[x];
            roots[x] = roots[y];
            x = y;
        }
        return x;
    },

    link : function(x, y) {
        var xr = this.find(x),
            yr = this.find(y);
        if(xr === yr) {
            return;
        }
        var ranks = this.ranks,
            roots = this.roots,
            xd    = ranks[xr],
            yd    = ranks[yr];
        if(xd < yd) {
            roots[xr] = yr;
        } else if(yd < xd) {
            roots[yr] = xr;
        } else {
            roots[yr] = xr;
            ++ranks[xr];
        }
    }
}
