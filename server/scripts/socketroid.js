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

	var MOTOR_L1_PIN = 3;
	var MOTOR_L2_PIN = 5;
	var MOTOR_R1_PIN = 6;
	var MOTOR_R2_PIN = 9;
	var LED1_PIN = 4;

	var _this = this;

	/* initialization */
	this.arduino.pinMode(MOTOR_L1_PIN, Arduino.PWM);
	this.arduino.pinMode(MOTOR_L2_PIN, Arduino.PWM);
	this.arduino.pinMode(MOTOR_R1_PIN, Arduino.PWM);
	this.arduino.pinMode(MOTOR_R2_PIN, Arduino.PWM);

	var WSUrl =  "https://rtc-world-s.herokuapp.com/";
	var WSRoomName = "androino-socketroid";
	
	this.androidService.WSinit(WSUrl, WSRoomName, function(message){
		
		if(message.control){

			var led = message.control.led;

			if(led != null){

				_this.arduino.digitalWrite(LED1_PIN, led === true ? Arduino.HIGH : Arduino.LOW);

			}

			var motorLeft = message.control.motorLeft;

			if(motorLeft != null){

				if(motorLeft < 0){

					_this.arduino.analogWrite(MOTOR_L1_PIN, - motorLeft);
					_this.arduino.analogWrite(MOTOR_L2_PIN, 0);

				} else {
					
					_this.arduino.analogWrite(MOTOR_L2_PIN, motorLeft);
					_this.arduino.analogWrite(MOTOR_L1_PIN, 0);					
				
				}

			}

			var motorRight = message.control.motorRight;

			if(motorRight != null){

				if(motorRight < 0){

					_this.arduino.analogWrite(MOTOR_R1_PIN, - motorRight);
					_this.arduino.analogWrite(MOTOR_R2_PIN, 0);

				} else {
					
					_this.arduino.analogWrite(MOTOR_R2_PIN, motorRight);
					_this.arduino.analogWrite(MOTOR_R1_PIN, 0);					
				
				}

			}


		}
	
	});
	
}

Socketroid.prototype = Object.create(DroinoBase.prototype);
Socketroid.prototype.constructer = DroinoBase;
