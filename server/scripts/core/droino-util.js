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
	return new Date().getTime();
};

Util.stopwatch = (function() {
    function stopwatch() {
        this.start_time = 0;
        this.stop_time = 0;
        this.run_time = 0;
        this.running = false;
    };

    stopwatch.prototype.start = function() {
        this.start_time = Util.getTime();
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

    stopwatch.prototype.get = function(){
    	return Util.getTime() - this.start_time;
    }

    stopwatch.prototype.get_and_start = function(){
    	var old_start_time = this.start_time;
    	this.start_time = new Date().getTime();
    	return this.start_time - old_start_time;
    };

    return stopwatch;
})();

Util.isNativeEnv = function(){
	return !(typeof(nativeInterface) === 'undefined');
};

Util.isPC = function(){
	return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
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

Util.ArrayBuilder = function(value){
	var funcs = {
		multiply: function(num){
			var arr = [];
			if(num.constructor.name != "Number" || num < 0){
				console.warn("ArrayBuilder: multiply num is invalid: " + num.constructor.name);
				return;
			}
			for(var i=0; i<num; i++){
				arr.push(value);
			}
			return arr;
		}
	};

	return funcs;
};

/* 
	chart.js wrapper 
	real time chart for sensor values
*/
Util.ChartBuilder = (function(){
	
	var creators = {};

	colors = [
		"rgba(250, 10, 10, 1)",
		"rgba(10, 250, 10, 1)",
		"rgba(10, 10, 250, 1)",
		"rgba(192, 192, 75, 1)",
		"rgba(75, 192, 192, 1)",
		"rgba(192, 192, 75, 1)",
	];

	creators.createLineChart = function(ctx, _datasets, _option = {}){
		
		var intervalId;
		var datasets = [];
		var timeSpan = _option.timeSpan || 10.0;
		console.log(_datasets.length);
		for(var i=0; i< _datasets.length; i++){
			datasets.push({
				label: _datasets[i].label,
				fill: true,
		 		//lineTension: 0.2,
		 		//backgroundColor: "rgba(75,192,192,0.4)",
		 		borderColor: colors[i],
		 		/*borderCapStyle: 'butt',
		 		borderDash: [],
		 		borderDashOffset: 0.0,
		 		borderWidth: 1,
		 		borderJoinStyle: 'miter',
		 		pointBorderColor: colors[i],
		 		pointBackgroundColor: "#fff",
		 		pointBorderWidth: 1,
		 		pointHoverRadius: 5,
		 		pointHoverBackgroundColor: colors[i],
		 		pointHoverBorderColor: "rgba(220,220,220,1)",
		 		pointHoverBorderWidth: 2,
		 		*/
		 		pointRadius: 0.4,
		 		pointHitRadius: 10,
		 		data: []
			});
		}
		var data = {
		 	//labels: [],
		 	datasets: datasets
		};

		var yMax = _option.yMax || 100;
		var yMin = _option.yMin || 0;
		var stepSize = _option.yStepSize || (yMax - yMin) / 10.0;

		var option = {
			//showLines: true,
			animation: false,
			legend: {
				//display: false
			},
			title: {
				display: true,
				text: "sensor values"
			},
			scales: {
				
				yAxes: [{
					ticks: {
						max: yMax,
						min: yMin,
						stepSize: stepSize
					},
					gridLines: {
						drawTicks: false
					},
					scaleLabel: {
						display: true,
						labelString: _option.yLabel
					}
				}],
				xAxes: [{
					//type: 'time',
					//distribution: 'series',
					//type: 'linear',
                	//position: 'bottom',
					/*gridLines: {
						display: true,
						drawTicks: false
					},
					*/
					ticks: {
						max: timeSpan,
						min: 0
						/*
						fontSize: 10,
						maxRotation: 10,
						callback: function(value) {
							if (value.toString().length > 0) {
								return value;
							} else {return null};
						}
						*/
					}
					
				}]
			}
		};

		var chart = Chart.Scatter(ctx, {
			data: data,
			options: option
		});

		var updateFlag = false;

		chart.addData = function(values, time){
			
			time = time !== "undefined" ? time : this.watch.get() / 1000.0;

			for(var i=0; i<values.length; i++){
				
				if(values[i] == null){
					continue;
				}

				while(this.data.datasets[i].data.length > 0 && this.data.datasets[i].data[0].x < time - timeSpan ){
					this.data.datasets[i].data.shift();
				}

				this.data.datasets[i].data.push({
					x: time,
					y: values[i]
				});
		    }

			//this.data.labels.shift();

		    //this.data.labels.push(label);
		    
		    this.options.scales.xAxes[0].ticks.max = time;
		    this.options.scales.xAxes[0].ticks.min = time - timeSpan;
		    
		    updateFlag = true;

		    //this.update();
		};

		function updateLoop(){

			if(updateFlag){
				updateFlag = false;
				chart.update();
			}

			setTimeout(updateLoop, 1000);

		}

		updateLoop();

		chart.stop = function(){
			clearInterval(intervalId);
		};

		var counter = 0;
		
		chart.startInterval = function(getFunc, interval){
			intervalId = setInterval(function(){
				var label = "";
				counter ++;
				if((counter % (1000 / interval)) == 0){
					label = counter * interval / 1000;
				}

				chart.addData(getFunc(), counter, label);
			}, interval);
		};

		chart.startTimer = function(){
			this.watch = new Util.stopwatch();
			this.watch.start();
		};

		return chart;
	}

	return creators;

})();

Util.CircularBuffer = (function(){

	function CircularBuffer(size){
		
		this.length = 0;

		this.size = size;

		this._buffer = [];

		this.head = -1;

		this.sum = 0;
	
	}

	CircularBuffer.prototype = {

		fill: function(value = 0){

			for(var i=0; i<this.size; i++){

				this._buffer[i] = value;

			}

			this.head = 0;

			this.length = this.size;

			this.sum = this.length * value;

			return this.length;

		},

		append: function(value){
			
			this.head++;

			if(this.head == this.size){

				this.head = 0;	
			
			}

			if(this.length < this.size){

				this._buffer.push(value);

				this.length ++;

				this.sum += value;

				return this.length;
			}

			this.sum -= this._buffer[this.head];

			this.sum += this.value;

			this._buffer[this.head] = value;

			return this.length;

		},

		get: function(position){

			if(position > this.length - 1){

				return null;
			
			}

			var index = this.head - position;

			if(index < 0){

				index += this.length;

			}

			return this._buffer[index];

		},

		average: function(){

			return this.sum / this.length;

		},

		calcDiffArea: function(value){

			var area = 0;

			for(var i=0; i<this.length; i++){
				
				area += Math.abs(this._buffer[i] - value);

			}

			return area;
			
		}
	};


})();

Util.TimedBuffer = (function(){

	var TimedBuffer = function(timeSpan = 1000){
	
		this.watch = new Util.stopwatch();
	
		this._buffer = [];

		this.speed = 0;

		this.timeSpan = timeSpan;
	};


	TimedBuffer.prototype = {

		start: function(){
			this.watch.start();
		},

		push: function(value){
			
			var elapsedTime = this.watch.get();
			

			while(this._buffer.length > 0){

				if(elapsedTime - this._buffer[0][0] < this.timeSpan){
					break;
				} 		

				this._buffer.shift();		
			}			

			this._buffer.push([elapsedTime, value]);

			if(this._buffer.length == 1){

				this.speed = 0;
			
			} else {

				this.speed = (value - this._buffer[0][1]) / 
					(elapsedTime - this._buffer[0][0])
					* 1000.0;
			}
		},

		get: function(){

			var len = this._buffer.length;

			if(len == 0){
				return null;
			}

			var elapsedTime = this.watch.get();

			var speed = this.getSpeed();

			return this._buffer[len - 1][1] +
				speed * (elapsedTime - this._buffer[len - 1][0]) / 1000.0; 


		},

		getSpeed : function(){

			var elapsedTime = this.watch.get();

			var len = this._buffer.length;

			if(len == 0 ||
				elapsedTime - this._buffer[len - 1][0] > this.timeSpan){

				this.speed = 0;

			}

			return this.speed; 

		}
	};

	return TimedBuffer;
})();

