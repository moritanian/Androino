function WheelMotor(arduino, pin1, pin2, between, diameter){

	this.motor = new Motor(arduino, {
		pin1: pin1,
		pin2: pin2
	});

	this.setRotationTable = function(rotationTable){

	};

	this.speed = function(speed){

		this.motor.speed(speed);

	};

	this.slowSpeed = function(direction){

		var speed = direction > 0 ? 100 : -100; 
		
		this.speed(speed);

	};

	this.highSpeed = function(direction){
		
		var speed = direction > 0 ? 255 : -255; 
		
		this.speed(speed);
	};

	this.stop = function(){
		this.motor.stop();
	};

	this.brake = function(){
		this.motor.brake();
	};


}

function TwoWheels(arduino, motorL1Pin, motorL2Pin, motorR1Pin, motorR2Pin, between, diameter){

	var leftWheel = new WheelMotor(arduino, motorL1Pin, motorL2Pin, between, diameter);

	var rightWheel = new WheelMotor(arduino, motorR1Pin, motorR2Pin, between, diameter);

	this.speed = function(left, right){

		leftWheel.speed(left);

		rightWheel.speed(right);
		
	};

	this.straight = function(speed){
		
	};

	this.stop = function(){
		leftWheel.stop();
		rightWheel.stop();
	};

	this.brake = function(){
		leftWheel.brake();
		rightWheel.brake();
	}

	this.rotateRightLowSpeed = function(){

		leftWheel.slowSpeed(1);

		rightWheel.slowSpeed(-1);

	};

	this.rotateLeftLowSpeed = function(){
		
		leftWheel.slowSpeed(-1);

		rightWheel.slowSpeed(1);
	};

	this.straightForwardLowSpeed = function(){
		
		leftWheel.slowSpeed(1);
		
		rightWheel.slowSpeed(1);
	
	};


}