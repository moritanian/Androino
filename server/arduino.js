var Arduino = (function(){
	
	console.log('loads Arduino js class');

	function Arduino(){
		this._isConnected = false;
		this.nativeInterface = nativeInterface;
	}

	Arduino.INPUT = "INPUT";
	Arduino.OUTPUT = "OUTPUT";
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
		analoglWrite: function(port, value){
			this.nativeInterface.analogWrite(port, value);
		},
		analogRead: function(port){
			return this.nativeInterface.analogRead(port);
		}, 
		debugFunc: function(){
			this.nativeInterface.debugFunc();
		}	
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
