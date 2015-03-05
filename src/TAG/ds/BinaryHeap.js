var TAGDs = TAGDs || {};

TAGDs.BinaryHeap = function(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
}

TAGDs.BinaryHeap.prototype = {
    push : function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);
        
        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    
    pop : function() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the start, and let it bubble up.
        if(this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    },
    
    remove : function(node) {
        var i = this.content.indexOf(node);
        
        if(i === -1) return;
        
        // When it is found, the process seen in 'pop' is repeated to fill up the hole.
        var end = this.content.pop();
        
        if(i !== this.content.length - 1) {
            this.content[i] = end;
            
            if(this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            } else {
                this.bubbleUp(i);
            }
        }
    },
    
    size : function() {
        return this.content.length;
    },
    
    rescoreElement : function(node) {
        var i = this.content.indexOf(node);
        
        if(i === -1) return;
        
        this.sinkDown(i);
    },
    
    sinkDown : function(n) {
        // Fetch the element that has to be sunk
        var element = this.content[n];
        var elemScore = this.scoreFunction(element);
        
        //When at 0, an element can not sink any further.
        while(n > 0) {
            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1;
            var parent = this.content[parentN];
            
            // Swap the elements if the parent is greater.
            if(elemScore < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // update 'n' to continue at the new position.
                n = parentN;
            } else {
                // Found a parent tha is less, no need to sink any further.
                break;
             }
        }
    },
    
    bubbleUp : function(n) {
        // look up the target element and its score.
        var length = this.content.length;
        var element = this.content[n];
        var elemScore = this.scoreFunction(element);
        
        while(true) {
            // compute the indicies of the child elements.
            var child2N = (n + 1) << 1;
            var child1N = child2N - 1;
            
            // This is used to store the new position of the element, if any.
            var swap = null;
            var child1Score;
            
            //If the first child exists (is inside the arra0)...
            if(child1N < length) {
                // look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);
                
                // If this score is less than our element's, we need to swap.
                if(child1Score < elemScore) {
                    swap = child1N;
                }
            }
            
            // Do the same checks for the other child.
            if(child2N < length) {
                var child2 = this.content[child2N];
                var child2Score = this.scoreFunction(child2);
                if(child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }
            
            // If the element needs to be moved, swap it and continue.
            if(swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            } else {
                // Otherwise we are done!
                break;
            }
        }
    }
}