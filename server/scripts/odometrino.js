/*
	Odometrino
	pin3 motor1
	pin4: LED
	pin5 motor1
	pin6 motor2
	pin9 motor2 
*/
function Odometrino(){
	DroinoBase.apply(this, arguments);

	var MOTOR_L1_PIN = 3;
	var MOTOR_L2_PIN = 5;
	var MOTOR_R1_PIN = 6;
	var MOTOR_R2_PIN = 9;
	var LED1_PIN = 4;

	var _this = this;

	// arduino functions
	this.goStraight = function(){
		console.log('goStraight');
		this.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.HIGH);
		this.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		this.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.HIGH);
		this.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	}

	this.turnRight = function(){
		console.log('turn right');
		this.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.HIGH);
		this.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		this.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.LOW);
		this.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	}

	this.turnLeft = function(){
		console.log('turn left');
		this.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.LOW);
		this.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		this.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.HIGH);
		this.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	}

	//
	this.props.moveStatus = 0;

	var moveChangeEvent = function(){
		if(_this.props.moveStatus == 0){
			_this.props.moveStatus = 1;
			_this.turnRight();
			_this.wait(2000, moveChangeEvent);
		} else if(_this.props.moveStatus == 1){
			_this.props.moveStatus = 2;
			_this.turnLeft();
			_this.wait(2000, moveChangeEvent);
		} else if(_this.props.moveStatus == 2){
			_this.props.moveStatus = 0;
			_this.goStraight();
			_this.wait(1000, moveChangeEvent);
		}
	}
	
	moveChangeEvent();
}

Odometrino.prototype = Object.create(DroinoBase.prototype);
Odometrino.prototype.constructer = DroinoBase;
