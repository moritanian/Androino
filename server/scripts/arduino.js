/*
	arduino js class

	communicate with arduino along firmata 

	pin assign
	
	pin2  output input servo 
	pin3  output input PWM servo 
	pin4  output input servo 
	pin5  output input PWM servo 
	pin6  output input PWM servo 
	pin7  output input servo 
	pin8  output input servo 
	pin9  output input PWM servo 
	pin10 output input PWM servo 
	pin11 output input PWM servo 
	pin12 output input servo 
	pin13 output input servo 
	pin14 output input Analog servo 
	pin15 output input Analog servo  
	pin16 output input Analog servo 
	pin17 output input Analog servo 
	pin18 output input Analog servo 
	pin19 output input Analog servo 

*/

var Arduino = (function(){
	
	console.log('loads Arduino js class');

	function Arduino(){
		this._isConnected = false;
		if(typeof(nativeInterface) === 'undefined'){

			console.warn('Androino: Cannot work in the browser.');
			this.nativeInterface = {};
			getSimulateObject(this);

		} else {
			
			this.nativeInterface = nativeInterface;

		}
	}

	// pin modes
	Arduino.INPUT = "INPUT";
	Arduino.OUTPUT = "OUTPUT";
	Arduino.PWM = "PWM";
	Arduino.ANALOG = "ANALOG";
	Arduino.SERVO = "SERVO";

	// pin outputs
	Arduino.HIGH = "HIGH";
	Arduino.LOW = "LOW";

	Arduino.prototype = {
		isConnected: function(){
			return this._isConnected;
		},
		connect: function(){
			this._isConnected = this.nativeInterface.connectArduino();
			return this.isConnected;
		},
		disconnect: function(){
			this._isConnected = this.nativeInterface.disconnectArduino();
			return this._isConnected;
		},
		pinMode: function(port, mode){
			this.nativeInterface.pinMode(port, mode);
		},
		digitalWrite: function(port, value){
			this.nativeInterface.digitalWrite(port, value);
		},
		digitalRead: function(port){
			return this.nativeInterface.digitalRead(port);
		},
		analogWrite: function(port, value){
			this.nativeInterface.analogWrite(port, value);
		},
		analogRead: function(port){
			return this.nativeInterface.analogRead(port);
		}, 
		debugFunc: function(){
			this.nativeInterface.debugFunc();
		}	
	}

	function getSimulateObject(_this){
		_this.__proto__ = {
			isConnected: function(){
				return this._isConnected;
			},
			connect: function(){
				this._isConnected = true;
				return this.isConnected;
			},
			disconnect: function(){
				this._isConnected = false;
				return this._isConnected;
			},
			pinMode: function(port, mode){
				//this.nativeInterface.pinMode(port, mode);
			},
			digitalWrite: function(port, value){
				//this.nativeInterface.digitalWrite(port, value);
			},
			digitalRead: function(port){
				//return this.nativeInterface.digitalRead(port);
				return Arduino.HIGH;
			},
			analogWrite: function(port, value){
				//this.nativeInterface.analogWrite(port, value);
			},
			analogRead: function(port){
				//return this.nativeInterface.analogRead(port);
				return 123;
			}, 
			debugFunc: function(){
				//this.nativeInterface.debugFunc();
			}	
		}
		/*
		console.log(Arduino.prototype);
		console.log(_this.__proto__);
		console.log(_this.__proto__ === _this.constructor.prototype) ;
		*/
	}

	// native 側から呼び出す関数郡
	Arduino.log = function(l){
		console.log('%cnative log: %c' + l, 'color:blue', '');
	}

	Arduino.logWarn = function(l){
		console.warn('%cnative logWarn: %c ' + l, 'color:blue', '');
	}

	Arduino.logError = function(l){
		console.error('%cnative logError: %c' + l, 'color:blue', '');
	}

	return Arduino;

})();
