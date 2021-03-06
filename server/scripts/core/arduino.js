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
"use strict";
var Arduino = (function(){
	
	console.log('loads Arduino js class');

	function Arduino(){
		
		this._isConnected = false;
		this.isSimulation = false;
		
		if(typeof(nativeInterface) === 'undefined'){
			
			console.warn('Androino: Cannot work in the browser.');
			this.nativeInterface = getDummyInterface();
			this.isSimulation = true;

		} else {
			this.nativeInterface = nativeInterface;
		}
	}

	// pin modes 
	// #TODO symbol に変えたい firmata test のほうで修正必要
	Arduino.INPUT = "INPUT";
	Arduino.OUTPUT = "OUTPUT";
	Arduino.PWM = "PWM";
	Arduino.ANALOG = "ANALOG";
	Arduino.SERVO = "SERVO";

	// pin outputs
	Arduino.HIGH = "HIGH";
	Arduino.LOW = "LOW";

	Arduino.SYSEX_STRING_CMD = 0x71;
	Arduino.PROTOCOL_VERSION_CMD = 0xF9;
	Arduino.SYSEX_FIRMWARE_VERSION_CMD = 0x79;

	Arduino._sysexFuncs = {};
	Arduino._sysexFuncs[Arduino.SYSEX_STRING_CMD]
		= function(bytes){
			var str = Arduino.decodeByteStreamString(bytes);
			console.log("sysex string : " + str);
		};
	Arduino._sysexFuncs[Arduino.SYSEX_FIRMWARE_VERSION_CMD]
		= function(bytes){
			console.log("sysex firmware cmd: " + bytes.toString());
		};

	Arduino._sysexFuncs[Arduino.PROTOCOL_VERSION_CMD]
		= function(bytes){
			console.log("protocol cmd: " + bytes.toString());
		};


	Arduino._dummySendSysex = {};
	// 送信するとechoされる(dummy)
	Arduino._dummySendSysex[Arduino.SYSEX_STRING_CMD] = function(bytes){
		Arduino._sysexFuncs[Arduino.SYSEX_STRING_CMD](bytes); 
	};

	// check connection
	function preFirmataFunc(_this){
	
		
	/* 
			connect() をpromiseにしたのでひとまずコメントアウト
		if(!_this._isConnected){
		
			if(!_this.connect())
		

				return false;
		}
		*/

		return true;
	}

	Arduino.encodeByteStreamString = function(str){
		var bytes = [], b;
		for(var c of str){
			b = c.charCodeAt();
			bytes.push(b & 0x7f);
			bytes.push((b >> 7) & 1);
		}
		return bytes;
	}

	Arduino.decodeByteStreamString = function(bytes){
		var str = "", b; 
		for(var index = 0; index < bytes.length;  index+=2){
			b = ((bytes[index + 1] << 7) & 0x80) | (bytes[index] & 0x7f)
			str += String.fromCharCode(b);
		}
		return str;
	}

	Arduino.encodeByteStream = function(bytes){
		var db = [];
		for(var b of bytes){
			db.push(b & 0x7f);
			db.push((b >> 7) & 1);
		}
		return db;
	}

	
	Arduino.decodeByteStream = function(bytes){
		var db = []; 
		for(var index = 0; index < bytes.length;  index+=2){
			var b = ((bytes[index + 1] << 7) & 0x80) | (bytes[index] & 0x7f)
			db.push(b);
		}
		return db;
	}

	Arduino.prototype = {
		isConnected: function(){
			return this._isConnected;
		},
		connect: function(){

			var _this = this;

			function tryConnect(resolve, reject){
				
				_this._isConnected = _this.nativeInterface.connectArduino();

				if(_this._isConnected){

					resolve();

				} else {

					setTimeout(function(){
						tryConnect(resolve, reject);
					}, 1000);

				}
			}

			return new Promise(function(resolve, reject){
				tryConnect(resolve, reject);
			});

		},
		disconnect: function(){
			if(!preFirmataFunc(this))
				return false;
			this._isConnected = this.nativeInterface.disconnectArduino();
			return this._isConnected;
		},
		pinMode: function(pin, mode){
			if(!preFirmataFunc(this))
				return false;
			this.nativeInterface.pinMode(pin, mode);
		},
		digitalWrite: function(pin, value){
			if(!preFirmataFunc(this))
				return false;
			this.nativeInterface.digitalWrite(pin, value);
		},
		digitalRead: function(pin){
			if(!preFirmataFunc(this))
				return false;
			return this.nativeInterface.digitalRead(pin);
		},
		analogWrite: function(pin, value){
			if(!preFirmataFunc(this))
				return false;
			this.nativeInterface.analogWrite(pin, value);
		},
		analogRead: function(pin){
			if(!preFirmataFunc(this))
				return false;
			
			if(pin > 13)
				pin -= 14;

			return this.nativeInterface.analogRead(pin);
		},
		/* extend command */
		sendSysex: function(cmd, bytes){
			this.nativeInterface.sendSysex(cmd, bytes);
		},
		setSysexListener: function(cmd, func){
			Arduino._sysexFuncs[cmd] = func;
		},
		sendString: function(str){ // #TODO マルチバイトは?
			var bytes = Arduino.encodeByteStreamString(str);
			this.sendSysex(Arduino.SYSEX_STRING_CMD, bytes);
		},
		/* debug */
		debugFunc: function(){
			if(!preFirmataFunc(this))
				return false;
			this.sendString("str_test");
			this.nativeInterface.debugFunc();
		},
		appendDummyInterfaceFunc: function(name, func){

			this.nativeInterface[name] = func;

		},
		appendDummySendSysex: function(cmd, func){
			Arduino._dummySendSysex[cmd] = func;
		}	
	};

	// #TODO visulal simulation ソフトウェア上でピンアサイン指定してシミュレーションしたい
	function getDummyInterface() {
		return {
			connectArduino: function(){
				return true;
			},
			disconnectArduino: function(){
				return false;
			},
			pinMode: function(pin, mode){
			},
			digitalWrite: function(pin, value){
				console.log("dummy digitalWrite " + pin + ": " + value);
			},
			digitalRead: function(pin){
				return Arduino.HIGH;
			},
			analogWrite: function(pin, value){
				console.log("dummy alongWrite " + pin + ": " + value);
			},
			analogRead: function(pin){
				return 123;
			}, 
			sendSysex: function(cmd, bytes){

				if(Arduino._dummySendSysex[cmd]){

					Arduino._dummySendSysex[cmd](bytes);

				}
			},
			debugFunc: function(){
			}	
		};
	}

	
		/*
		console.log(Arduino.prototype);
		console.log(_this.__proto__);
		console.log(_this.__proto__ === _this.constructor.prototype) ;
		*/

	// native 側から呼び出す関数郡
	Arduino.getSysex = function(cmd, bytesJsonStr){
		
		if(!Arduino._sysexFuncs[cmd]){
			console.warn("getSysex: sysex command whose listener not be set has called.");
			console.log(cmd);
			console.log(bytesJsonStr);
			return ;
		}
		
		try {
			var bytes = JSON.parse(bytesJsonStr);
			Arduino._sysexFuncs[cmd](bytes);
		} catch(err){
			console.warn(err);
			Arduino._sysexFuncs[cmd](null);	
		}
	};

	Arduino.log = function(l){
		console.log('%cnative log: %c' + l, 'color:blue', '');
	};

	Arduino.logWarn = function(l){
		console.warn('%cnative logWarn: %c ' + l, 'color:blue', '');
	};

	Arduino.logError = function(l){
		console.error('%cnative logError: %c' + l, 'color:blue', '');
	};

	return Arduino;

})();
