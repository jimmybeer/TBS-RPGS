var HSM = (function (){

    /**
	 * public
	 */
	var Logger = { debug : function(){}, trace : function(){} };
	
	/** 
	 * The base HSM.State class.
	 * @param {String} stateId - Identifies the state. Must be unique in 
	 *                 the containing state machine.
	 */
	var State = function(stateId) {
	    this._id = stateId;
		this._owner = null;
		/**
		 * Map of events to handlers.
		 * Either a single handler or an array of handlers can be given.
		 * The guard of each handler will be called until a guard returns true
		 * (or a handler doesn't have a guard). This handler will then be trigger.
		 */
		this.handler = {};
	};
	
	State.prototype.on_entry = undefined;
	State.prototype.on_exit = undefined;
	
	State.prototype._enter = function(sourceState, targetState, theData) {
	    if(this.on_entry !== undefined) {
		    this.on_entry.apply(this, arguments);
		}
	};
	
	State.prototype._exit = function(theNextState, theData) {
	    if(this.on_exit !== undefined) {
		    this.on_exit.apply(this, arguments);
		}
	};
	
	State.prototype.toString = function() {
        return this._id;
    };
	
	State.prototype.id = function() {
	    return this._id;
	};
	
	State.prototype.owner = function() {
	    return this._owner;
	};
	
	State.prototype.setOwner = function(theOwner) {
	    if(this._owner) {
		    throw("Invalid Arguement - State< " + this._id + " > already owned");
		}
		this._owner = theOwner;
	};
	
	/** 
	 * Adapter class for nested states  
     * 
     * @param {String} stateID - Identifies the state. Must be unique in the containing state machine.  
     * @param {StateMachine} subMachine - the nested state machine.  
     */ 
	var CompositeState = function(stateId, subMachine) {
	    State.call(this, stateId);
		if(subMachine instanceof StateMachine) {
    		this._subMachine = subMachine;
		} else {
		    this._subMachine = new StateMachine(subMachine);
		}
		this._subMachine._owner = this;
	};
	
	CompositeState.prototype = Object.create(State.prototype);
	CompositeState.prototype.constructor = CompositeState;
	
	CompositeState.prototype._enter = function(sourceState, targetState, theData) {
	    State.prototype._enter.apply(this, arguments);
		return this._subMachine._enterState(sourceState, targetState, theData);
	};
	
	CompositeState.prototype._exit = function(theNextState, theData) {
	    this._subMachine.teardown(theNextState, theData);
		State.prototype._exit.apply(this, arguments);
        this._subMachine._curState = this._subMachine.initialState;
	};
	
	CompositeState.prototype._handle = function() {
	    return this._subMachine._handle.apply(this._subMachine, arguments);
	};
	
	CompositeState.prototype.toString = function() {
	    return this._id + "/(" + this._subMachine.toString() + ")";
	};
	
	CompositeState.prototype.subMachine = function() {
	    return this._subMachine;
	};
	
	CompositeState.prototype.subState = function() {
	    return this._subMachine.state();
	};
	
	/** Adapter class for parallel states  
     * @param {String} stateID - Identifies the state. Must be unique in the containing state machine.  
     * @param {StateMachine[]} subMachines - an array of parallel state machines.  
     */ 

	var ParallelState = function(stateId, subMachines) {
	    var i;
		State.call(this, stateId);
		this._subMachines = subMachines || [];
		for(i = 0; i < this._subMachines.length; ++i) {
		    if(!(subMachines[i] instanceof StateMachine)) {
			    this._subMachines[i] = new StateMachine(subMachines[i]);
			}
		    this._subMachines[i]._owner = this;
		}
	};
	
	ParallelState.prototype = Object.create(State.prototype);
	ParallelState.prototype.constructor = ParallelState;
	
	ParallelState.prototype.toString = function() {
	    return this._id + "/(" + this._subMachines.join('|') + ")";
	};
	
	ParallelState.prototype._enter = function(sourceState, targetState, theData) {
	    var i;
		State.prototype._enter.apply(this, arguments);
		for(i = 0; i < this._subMachines.length; ++i) {
		    this._subMachines[i]._enterState(sourceState, targetState, theData);
		}
	};
	
	ParallelState.prototype._exit = function(theNextState, theData) {
	    var i;
		for(i = 0; i < this._subMachines.length; ++i) {
		    this._subMachines[i].teardown(theData);
		}
		State.prototype._exit.apply(this, arguments);
	};
	
	ParallelState._handle = function() {
	    var handled = false;
		var i;
		for(i = 0; i < this._subMachines.length; ++i) {
		    if(this._subMachines[i]._handle.apply(this._subMachines[i], arguments)) {
			    handled = true;
			}
		}
		return handled;
	};
	
	ParallelState.prototype.subMachines = function() {
	    return this._subMachines;
	};
	
	ParallelState.prototype.parallelStates = function() {
	    return this._subMachines.map(function(s) { return s.state(); });
	};
	
	/**
	 * State machine representation.
	 * @param {State[]} theStates - the states that compose the state machine. 
	 *                              the first state is the initial state.
	 */
	var StateMachine = function(theStates) {
	    this.states = {};
		this._owner = null;
		this._curState = null;
		this._eventInProgress = false;
		this._eventQueue = [];
		var i;
		for(i = 0; i < theStates.length; ++i) {
		    if(!(theStates[i] instanceof State)) {
			    throw("Invalid Argument - not a state");
			}
			this.states[theStates[i].id] = theStates[i];
            theStates[i].setOwner(this);
		}
		
		this.initialState = theStates.length ? theStates[0] : null;
	};
	
	StateMachine.prototype.toString = function() {
	    if(this._curState !== null) {
		    return this._curState.toString();
		}
		return "_uninitialisedStatemachine_";
	};
	
	StateMachine.prototype.path = function() {
	    var p = [this];
		while(p[0]._owner) {
		    p.unshift(p[0]._owner._owner);
		}
		return p;
	};
	
	StateMachine.prototype.id = function() {
	    return this._owner ? this._owner._id : '_top_';
	};
	
	StateMachine.prototype.state = function() {
	    return this._curState;
	};
	
	/**
	 * Get the lowest common ancestor of states of this 
	 * state machine and an arbitrary other state
	 */
	StateMachine.prototype.lca = function(state) {
	    var i;
		var thisPath = this.path();
		var statePath = state._owner.path();
		for(i = 1; i < thisPath.length; ++i) {
		    if(statePath[i] !== thisPath[i]) {
			    return thisPath[i-1];
			}
		}
		return this;
	};
	
	/**
	 * Initialises this state machine and set the current state to the initial state.
	 * Any nested state machines will also be initialised and set to their inital state.
	 * @param [data] event parameters.
	 */
	StateMachine.prototype.init = function(theData) {
	    Logger.debug("<StateMachine " + this.id() + 
		             "::init> setting initial state: " + this.initialState.id());
		this._enterState(null, this.initialState, theData);
		return this;
	};
	
	/**
	 * Performs a transition between sourceState and targetState. 
	 * Must only be called on the lowest common ancestor of sourceState and targetState.
	 */
	StateMachine.prototype._switchState = function(sourceState, targetState, theAction, theData) {
	    Logger.debug("<StateMachine " + this.id() + "::_switchState> " +
		             sourceState.id() + " => " + targetState.id());
		this._exitState(sourceState, targetState, theData);
		if(theAction) {
		    theAction.apply(this, [sourceState, targetState].concat(theData));
		}
		this._enterState(sourceState, targetState, theData);
	};
	
	/**
	 * Enters targetState. For all nested state machines up to the depth of the targetState,
	 * the state machines are set directly to this state instead of the intial state.
	 * For all nested state machines beyond the depth of targetState, set to initial state.
	 */
	StateMachine.prototype._enterState = function(sourceState, targetState, theData) {
        var targetPath = targetState.owner().path();
	    var targetLevel = targetPath.length;
		var thisLevel = this.path().length;

        if(targetLevel < thisLevel) {
		    this._curState = this.initialState;
		} else if(targetLevel === thisLevel) {
		    this._curState = targetState;
        } else {
            this._curState = targetPath[thisLevel]._owner;
        }
        Logger.trace("<StateMachine " + this.id() + "::_enterState> entering state: " +
                     this._curState._id + ", targetState: " + targetState._id);
        // call new state's enter handler
        this._curState._enter(sourceState, targetState, theData);	
	};
	
	StateMachine.prototype._exitState = function(sourceState, targetState, theData) {
	    Logger.trace("<StateMachine " + this.id() + "::_exitState> exiting state: " + this._curState._id);
		this._curState._exit(targetState, theData);
	};
	
	StateMachine.prototype.teardown = function(targetState, theData) {
	    this._exitState(this._curState, targetState, theData);
	};
	
	/**
	 * Check if this transition's guard passes (if one exists) and
	 * execute the transition.
	 */
	StateMachine.prototype._tryTransition = function(handler, data) {
	    if(!('guard' in handler) || handler.guard(this._curState, handler.target, data)) {
		    var lca = this.lca(handler.target);
			Logger.trace("<StateMachine " + this.id() + 
			             "::_tryTransition> guard passed, passing event to lca: " + 
			             lca.id());

			lca._switchState(this._curState, handler.target, handler.action, data);
			return true;
		}
		return false;
	}
	
	/**
	 * Create a new event an passed it to the top-level state machine for handling.
	 * @param {string} event - event to be handled.
	 * @param [data] event parameters
	 */
	StateMachine.prototype.emit = function(ev) {
	    var thisPath = this.path();
	    if(thisPath.length > 1) {
		    // If we are not at the top level state machine,
			// call again at the top level state machine
            thisPath[0].emit.apply(thisPath[0], arguments);
		} else {
		    this._eventQueue.push(arguments);
			// we are at the top level state machine
			if(this._eventInProgress === true) {
			    Logger.trace("<StateMachine " + this.id() + ">::emit: queuing event " + ev);
			} else {
			    this._eventInProgress = true;
				while(this._eventQueue.length > 0) {
				    this._handle.apply(this, this._eventQueue.shift());
				}
				this._eventInProgress = false;
			}
		}
	};
	
	StateMachine.prototype.handleEvent = StateMachine.prototype.emit;
	
	StateMachine.prototype._handle = function(ev, data) {
	    // check if the current state is a (nested) state machine, if so give it the event.
		// if it handles the event, stop processing here.
		if('_handle' in this._curState) {
		    Logger.trace("<StateMachine " + this.id() + "::_handle> handing down " + ev);
			if(this._curState._handle.apply(this._curState, arguments)) {
			    return true;
			}
		}
		
		Logger.trace("<StateMachine " + this.id() + "::_handle> handling event " + ev);
		if(ev in this._curState.handler) {
		    if(this._curState.handler[ev] instanceof Array) {
			    // we have multiple handlers for this event
				// try them all in turn
				var handlers = this._curState.handler[ev];
				var i;
				for(i = 0; i < handlers.length; ++i) {
				    if(this._tryTransition(handlers[i], data)) {
					    return true;
					}
				}
				return false;
			}
			// only one handler - try it.
			return this._tryTransition(this._curState.handler[ev], data);
		}
		// no handler for this event.
		return false;
	};
	
    /**
	 * Interface
	 */
	return {
	    State : State,
		CompositeState : CompositeState,
		ParallelState : ParallelState,
		StateMachine : StateMachine,
		Logger : Logger
	};
}()); // Execute outer function to provide closure

// nodejs export
if(typeof module === 'object' && module.exports) {
    module.exports = HSM;
}