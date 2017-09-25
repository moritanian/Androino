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
	this.registerQueueTask('goStraight', function(g){
		console.log('goStraight');
		g.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.HIGH);
		g.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		g.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.HIGH);
		g.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	});

	this.registerQueueTask('turnRight', function(g){
		console.log('turn right');
		g.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.HIGH);
		g.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		g.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.LOW);
		g.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	});

	this.registerQueueTask('turnLeft', function(g){
		console.log('turn left');
		g.arduino.digitalWrite(MOTOR_L1_PIN, Arduino.LOW);
		g.arduino.digitalWrite(MOTOR_L2_PIN, Arduino.LOW);
		g.arduino.digitalWrite(MOTOR_R1_PIN, Arduino.HIGH);
		g.arduino.digitalWrite(MOTOR_R2_PIN, Arduino.LOW);
	});

	(function main(){

		this.queueTaskWhile(function(g){

			g.turnLeft(500);
			
			g.turnRight(500);
			
			g.goStraight(1000);

		});
	
	}).call(this);

	
	
}

Odometrino.prototype = Object.create(DroinoBase.prototype);
Odometrino.prototype.constructer = DroinoBase;
