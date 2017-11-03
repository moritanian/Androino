function UltrasonicDistanceSensor(arduino, opts){
	
	this.arduino = arduino;

	this.trigPin = opts.trigPin;

	this.echoPin = opts.echoPin;

	// dummy func
	if(this.arduino.isSimulation){

		var androidService = new AndroidService();

		this.arduino.appendDummySendSysex(
			
			UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_REQUEST_COMMAND,
			function(){
				//var distance = 4000 + Math.random() * 0; // [10um]
				var rot = androidService.getSumRotation2D();
				var sensorRot = rot - Math.PI/ 2.0;
				var true_distance = 500;
				var x = 60;
				var z = 60;
				var distance = (true_distance - x*Math.sin(rot) + z*Math.cos(rot))/Math.cos(sensorRot);
				distance *=100;
				distance += Math.random() * 20;
				var result 
					= Arduino.encodeByteStream(
						[(distance >> 16) & 0xff, (distance >> 8) & 0xff, distance & 0xff]
					);
					
				Arduino.getSysex(UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_RESULT_COMMAND,
					JSON.stringify(result));

			});
	}

}

UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_REQUEST_COMMAND = 0B00100000;
UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_RESULT_COMMAND = 0B00100001;

UltrasonicDistanceSensor.prototype.measureLow = function(){

	var _this = this;

	return new Promise(function(resolve, reject){
		

		_this.arduino.setSysexListener(
			UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_RESULT_COMMAND, 
			function(bytes){
				if(!bytes || bytes.length != 6){
					reject(bytes);
					return;
				}

				var db = Arduino.decodeByteStream(bytes);

				var distance = (db[0] << 16) + (db[1] << 8) + (db[2]);
				distance /= 100.0; // [mm]

				return resolve(distance);	
		});


		_this.arduino.sendSysex(
			UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_REQUEST_COMMAND,
			[_this.trigPin, _this.echoPin]
			);

	});
}

//
UltrasonicDistanceSensor.prototype.measure = function(execCount = 10, trimmeanRange = 50.0){

	var _this = this;

	var timeSpan = 60; 
	var lows = [];

	var count = 0;

	return new Promise(function(resolve, reject){

		var measureFunc = function(){

			_this.measureLow().then(function(distance){
				
				lows.push(distance);
				
				if(lows.length == execCount){
					resolve(Util.trimmean(lows, trimmeanRange));
				}

			}).catch(function(e){
				reject(e);
			});

			count ++;
			if(count < execCount){
				
				setTimeout(measureFunc, timeSpan);

			}

		}

		measureFunc();

	});
}