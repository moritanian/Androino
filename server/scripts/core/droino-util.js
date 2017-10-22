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

var Util = {};

Util.degToRad = function(deg){
	return deg * Math.PI / 180.0;
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

Util.stopwatch = (function() {
    function stopwatch() {
        this.start_time = 0;
        this.stop_time = 0;
        this.run_time = 0;
        this.running = false;
    }

    stopwatch.prototype.start = function() {
        this.start_time = new Date().getTime();
        this.running = true;
    }

    stopwatch.prototype.stop = function() {
        this.stop_time = new Date().getTime();
        this.run_time = (this.stop_time - this.start_time);
        this.running = false;
    }

    stopwatch.prototype.get_runtime = function() {
        return this.run_time;
    }

     stopwatch.prototype.display = function(title) {
        title = title || ""
        console.log("timer: " + this.run_time + " (" + title + ")");
    }


    stopwatch.prototype.reset = function() {
        this.run_time = 0;
    }

    return stopwatch;
})();

