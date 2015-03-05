var TAGUtil = TAGUtil || {};

/**
  * Ths signal can register listeners and invoke the listeners with messages.
  *
  */
TAGUtil.Signal = function() {
    this._listeners = [];
}

TAGUtil.Signal.prototype = {
    /**
	 * Add a listener to this signal.
	 * @param {function} listener
	 */
	add : function(context, listener) {
	    if(!(!listener || !context)) {
	    	var func = { c : context, l : listener };
		    this._listeners.push(func);
		}
	},
	
	/**
	 * Remove a listener from this signal.
	 * @param {function} listener
	 */
	remove : function(listener) {
	    var i, len;
		
	    for(i = 0, len = this._listeners.length; i < len; ++i) {
	    	if(this._listeners[i] === listener) {
	    		this._listeners.splice(i, 1);
				return true;
			}
		}
		return false;
	},
	
	/**
	 * Emit a message.
	 * @param {...*} messages
	 */
	emit : function (/* messages */) {
	    var messages = arguments;
		var i, len;
		
		for(i = 0, len = this._listeners.length; i < len; ++i) {
			this._listeners[i].l.apply(this._listeners[i].c, messages);
		}
	},
	
	clear : function() {
		this._listeners.splice(0);
	}
}