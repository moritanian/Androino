var Motor = function(arduino, opts){

	var maxValue = 255;

	var offset;

	var currentValue;

	this.pin1 = opts.pin1;

	this.pin2 = opts.pin2;

	this.arduino = arduino;

	this.arduino.pinMode(this.pin1, Arduino.PWM);

	this.arduino.pinMode(this.pin2, Arduino.PWM);

	maxValue = opts.maxValue || maxValue;

	offset = opts.offset || offset;

	currentValue = 0;

	this.forward = function(value = maxValue){

		value = validateAnalogValue(value);

		this.arduino.analogWrite(this.pin1, value);

		this.arduino.analogWrite(this.pin2, 0);

		currentValue = value;
	};

	this.backward = function(value = maxValue){

		value = validateAnalogValue(value);

		this.arduino.analogWrite(this.pin2, value);

		this.arduino.analogWrite(this.pin1, 0);

		currentValue = - value;

	};

	this.stop = function(){

		this.arduino.analogWrite(this.pin1, 0);

		this.arduino.analogWrite(this.pin2, 0);

		currentValue = 0;
	
	};

	this.brake = function(){

		this.arduino.analogWrite(this.pin1, this.maxValue);

		this.arduino.analogWrite(this.pin2, this.maxValue);

		currentValue = 0;
	};

	this.speed = function(value = 0){

		if(value > 0){

			this.forward(value);

		} else if(value == 0){

			this.stop();

		} else {

			this.backward(-value);

		}

	};

	this.getCurrentValue = function(){
		return currentValue;
	};

	function validateAnalogValue(value){
		var ranged = Math.min(Math.max(value, 0), maxValue);
		if(ranged == 0){
			return 0;
		}
		// linear in offset ~ max
		return Math.floor(offset + ranged * (maxValue - offset) / maxValue);
	}

};
