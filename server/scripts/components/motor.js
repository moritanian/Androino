function Motor(arduino, opts){

	this.pin1 = opts.pin1;

	this.pin2 = opts.pin2;

	this.arduino = arduino;

	this.arduino.pinMode(this.pin1, Arduino.PWM);

	this.arduino.pinMode(this.pin2, Arduino.PWM);

	this.maxValue = opts.maxValue || 255;
}

Motor.prototype.forward = function(value){

	this.arduino.analogWrite(this.pin1, value);

	this.arduino.analogWrite(this.pin2, 0);

}

Motor.prototype.backward = function(value){

	this.arduino.analogWrite(this.pin2, value);

	this.arduino.analogWrite(this.pin1, 0);

}

Motor.prototype.stop = function(){

	this.arduino.analogWrite(this.pin1, 0);

	this.arduino.analogWrite(this.pin2, 0);

}

Motor.prototype.brake = function(){

	this.arduino.analogWrite(this.pin1, this.maxValue);

	this.arduino.analogWrite(this.pin2, this.maxValue);

}

Motor.prototype.speed = function(value){

	if(speed > 0){

		this.forward(value);

	} else if(speed == 0){

		this.stop();

	} else {

		this.backward(value);

	}

}
