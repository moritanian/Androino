function UltrasonicDistanceSensor(arduino, opts){
	
	this.arduino = arduino;

	this.trigPin = opts.trigPin;

	this.echoPin = opts.echoPin;

	if(this.arduino.isSimulation){
		this.arduino.appendDummySendSysex(
			UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_REQUEST_COMMAND,
			function(){
				var distance = 2000; // [10um]
				var result 
					= [(distance >> 14) & 0x7f, (distance >> 7) & 0x7f, distance & 0x7f];
					
				Arduino.getSysex(UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_RESULT_COMMAND,
					JSON.stringify(result));

			});
	}

}

UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_REQUEST_COMMAND = 0B00100000;
UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_RESULT_COMMAND = 0B00100001;

UltrasonicDistanceSensor.prototype.measure = function(){

	var _this = this;

	return new Promise(function(resolve, reject){
		

		_this.arduino.setSysexListener(
			UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_RESULT_COMMAND, 
			function(bytes){
				if(!bytes || bytes.length != 6){
					reject(bytes);
					return;
				}

				var distance = (bytes[0] << 14) + (bytes[1] << 7) + (bytes[2]);
				distance /= 100.0; // [mm]

				return resolve(distance);	
		});


		_this.arduino.sendSysex(
			UltrasonicDistanceSensor.US_DISTANCE_MEASUREMENT_REQUEST_COMMAND,
			[_this.trigPin, _this.echoPin]
			);

	});
}