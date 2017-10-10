function Led(arduino, pin, logic = true){

	this.arduino = arduino;
		
	this.pin = pin;

	// positive or negative logic
	this.logic = logic;

	// output level
	this.level = this.logic ? Arduino.LOW : Arduino.HIGH;

	this.pinMode = Arduino.OUTPUT;

	this.arduino.pinMode(this.pin, Arduino.OUTPUT);

}

Led.prototype.on = function(){

	if(this.pinMode != Arduino.OUTPUT){

		this.pinMode = Arduino.OUTPUT;

		this.arduino.pinMode(this.pin, Arduino.OUTPUT);

	}

	this.level = this.logic ? Arduino.HIGH : Arduino.LOW;

	this.arduino.digitalWrite(this.pin, this.level);
	
}

Led.prototype.off = function(){
	
	if(this.pinMode != Arduino.OUTPUT){

		this.pinMode = Arduino.OUTPUT;

		this.arduino.pinMode(this.pin, Arduino.OUTPUT);

	}

	this.level = this.logic ? Arduino.LOW : Arduino.HIGH;

	this.arduino.digitalWrite(this.pin, this.level);
	
}

Led.prototype.toggle = function(){

	if(this.isOn()){

		this.off();

	} else {

		this.on();

	}

}

Led.prototype.isOn = function(){

	return this.pinMode === Arduino.OUTPUT 
		&& (this.level === Arduino.HIGH) == this.logic;

}

Led.prototype.brightness = function(value){

	if(this.pinMode != Arduino.PWM){

		this.pinMode = Arduino.PWM;
	
		this.arduino.pinMode(this.pin, Arduino.PWM);

	}

	this.analogWrite(this.pin, value);

}
