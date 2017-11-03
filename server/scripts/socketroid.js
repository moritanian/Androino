/*
	Odometrino
	pin3 motor1
	pin4: LED
	pin5 motor1
	pin6 motor2
	pin9 motor2 
*/
function Socketroid(){
	DroinoBase.apply(this, arguments);

	var MOTOR_L1_PIN = 5;
	var MOTOR_L2_PIN = 3;
	var MOTOR_R1_PIN = 9;
	var MOTOR_R2_PIN = 6;
	var LED1_PIN = 4;

	var _this = this;

	const offset = 110;

	var motorRight = new Motor(this.arduino, {
		pin1: MOTOR_R1_PIN,
		pin2: MOTOR_R2_PIN,
		offset: offset
	});

	var motorLeft = new Motor(this.arduino, {
		pin1: MOTOR_L1_PIN,
		pin2: MOTOR_L2_PIN,
		offset: offset
	});


	var WSUrl =  "https://rtc-world-s.herokuapp.com/";
	var WSRoomName = "androino-socketroid";
	
	this.androidService.WSinit(WSUrl, WSRoomName, function(message){
		
		if(message.control){

			var led = message.control.led;

			if(led != null){

				_this.arduino.digitalWrite(LED1_PIN, led === true ? Arduino.HIGH : Arduino.LOW);

			}

			var leftValue = message.control.motorLeft;

			if(leftValue != null){

				motorLeft.speed(leftValue)		

			}

			var rightValue = message.control.motorRight;

			if(rightValue != null){

				motorRight.speed(rightValue);

			}


		}
	
	});
	
}

Socketroid.prototype = Object.create(DroinoBase.prototype);
Socketroid.prototype.constructer = DroinoBase;
