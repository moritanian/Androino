var Util = {};


// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 */
Util.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  /**
   * Calls superclass constructor/method.
   *
   * This function is only available if you use goog.inherits to
   * express inheritance relationships between classes.
   *
   * NOTE: This is a replacement for goog.base and for superClass_
   * property defined in childCtor.
   *
   * @param {!Object} me Should always be "this".
   * @param {string} methodName The method name to call. Calling
   *     superclass constructor can be done with the special string
   *     'constructor'.
   * @param {...*} var_args The arguments to pass to superclass
   *     method/constructor.
   * @return {*} The return value of the superclass method/constructor.
   */
  childCtor.base = function(me, methodName, var_args) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};

/**
 * @author mrdoob / http://mrdoob.com/
 */

function EventDispatcher() {}

Object.assign( EventDispatcher.prototype, {

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	},

	dispatchEvent: function ( event ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			var array = listenerArray.slice( 0 );

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}

} );


Util.degToRad = function(deg){
	return deg * Math.PI / 180.0;
}

Util.radToDeg = function(rad){
	return rad * 180.0 / Math.PI;
}

Util.trimmean = function(arr, range){
	
	var median = Util.median(arr);

	var inrangesSum = 0;
	var inrangesNum = 0;

	for(d of arr){
		if(Math.abs(d - median) < range){
			inrangesSum += d;
			inrangesNum ++;
		}
	}

	return inrangesSum / inrangesNum;
	
}

Util.median = (function(){
	var cmp_numeric = function(a, b) { return (a < b); };

	function median(arr){
		var len = arr.length;
		jsfeat.math.qsort(arr, 0, arr.length-1, cmp_numeric);
		var m;

		if(len % 2 == 0){
			m = (arr[len/2-1] + arr[len/2])/ 2.0; 
		} else {
			m = arr[(len-1)/2];
		}
		return m;
	}
	return median;
})();

Util.getTime = function(){
	new Date().getTime();
};

Util.stopwatch = (function() {
    function stopwatch() {
        this.start_time = 0;
        this.stop_time = 0;
        this.run_time = 0;
        this.running = false;
    };

    stopwatch.prototype.start = function() {
        this.start_time = new Date().getTime();
        this.running = true;
    };

    stopwatch.prototype.stop = function() {
        this.stop_time = new Date().getTime();
        this.run_time = (this.stop_time - this.start_time);
        this.running = false;
    };

    stopwatch.prototype.get_runtime = function() {
        return this.run_time;
    };

     stopwatch.prototype.display = function(title) {
        title = title || ""
        console.log("timer: " + this.run_time + " (" + title + ")");
    };


    stopwatch.prototype.reset = function() {
        this.run_time = 0;
    };

    stopwatch.prototype.get_and_start = function(){
    	var old_start_time = this.start_time;
    	this.start_time = new Date().getTime();
    	return this.start_time - old_start_time;
    }

    return stopwatch;
})();

Util.isNativeEnv = function(){
	return !(typeof(nativeInterface) === 'undefined');
};

Util.loadScript = function(url){
	return new Promise((resolve, reject) => {
		var script = document.createElement('script');
  		script.type = 'text/javascript';
		script.src = url;

		if ( script.readyState ) {
			script.onreadystatechange = function() {
				if ( script.readyState === 'loaded' || script.readyState === 'complete' ) {
					script.onreadystatechange = null;
					resove();
				};
	    	};
	    } else {
	    	script.onload = function() {
	    		resolve();
	    	};
	  };
	  document.getElementsByTagName('head')[0].appendChild(script);
	});
};

Util.sleep = function(time) {
  	return new Promise(resolve => { 
    	setTimeout(() => { 
      		resolve();
   		}, time);
  	});
};
