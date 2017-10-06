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
		_this.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.HIGH);
		_this.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		_this.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.HIGH);
		_this.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	}

	this.turnRight = function(){
		console.log('turn right');
		_this.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.HIGH);
		_this.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		_this.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.LOW);
		_this.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	}

	this.turnLeft = function(){
		console.log('turn left');
		_this.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.LOW);
		_this.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		_this.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.HIGH);
		_this.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	};


	/*
	new this.Asyncable()
		.addSyncTask("goStraight", _this.goStraight)
		.addSyncTask("turnLeft", _this.turnLeft)
		.turnLeft()
		.asyncWait(1000)
		.asyncTask(_this.turnRight)
		
		.goStraight()
		.asyncWait(1000)
		
		.addSyncTask("turnLeft", _this.turnLeft)
		.turnLeft()
		
		.asyncWait(1000)
		.asyncTask(_this.turnRight)
		.asyncWait(1000)
		
		.asyncWait(1000)
		.asyncTask(_this.turnRight);
		
	*/
	
	
	(async function() { 
		
		while(true){
			await this.sleep(1000);
			this.goStraight();
			await this.sleep(1000);
			this.turnLeft();
			await this.sleep(1000);
			this.turnRight();
		}
	
	}).call(this);
	
}

Odometrino.prototype = Object.create(DroinoBase.prototype);
Odometrino.prototype.constructer = DroinoBase;
