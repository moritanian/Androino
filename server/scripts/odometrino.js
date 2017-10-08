/*
	Odometrino
	pin3 motor1
	pin4: LED
	pin5 motor1
	pin6 motor2
	pin9 motor2 
*/
function Odometrino(){
	// super constructer
	DroinoBase.apply(this, arguments);

	var MOTOR_L1_PIN = 3;
	var MOTOR_L2_PIN = 5;
	var MOTOR_R1_PIN = 6;
	var MOTOR_R2_PIN = 9;
	var LED1_PIN = 4;

	var US_DISTANCE_TRIG_PIN = 2;
	var US_DISTANCE_ECHO_PIN = 4;

	var _this = this;

	const MOVE_STATUS = "moveStatus";

	var $logText = $("#log-text");
	var $stopButton = $("#stop-button");
	var $resetButton = $("#reset-button");
	$stopButton.on("click", function(){
		console.log("stop");
		_this.props[MOVE_STATUS] = 5;
	});

	$resetButton.on("click", function(){
		console.log("reset");
		_this.props[MOVE_STATUS] = 1;
	});

	var motorRight = new Motor(this.arduino, {
		pin1: MOTOR_R1_PIN,
		pin2: MOTOR_R2_PIN
	});

	var motorLeft = new Motor(this.arduino, {
		pin1: MOTOR_L1_PIN,
		pin2: MOTOR_L2_PIN
	});

	var distanceSensor = new UltrasonicDistanceSensor(
		this.arduino,
		{
			trigPin: US_DISTANCE_TRIG_PIN,
			echoPin: US_DISTANCE_ECHO_PIN
		});

	// arduino functions
	this.goStraight = function(){
		console.log('goStraight');
		motorRight.forward(255);
		motorLeft.forward(255);
	}

	this.turnRight = function(){
		console.log('turn right');
		motorRight.stop();
		motorLeft.forward(255);
	}

	this.turnLeft = function(){
		console.log('turn left');
		motorRight.forward(255);
		motorLeft.stop();
	}


	//

	this.addProp(MOVE_STATUS);

	this.setPropsChangeListener(function(){

		if(_this.props[MOVE_STATUS] == 0){
		
			_this.turnRight();
			_this.delayChangeProp(2000, MOVE_STATUS, 1);

			distanceSensor.measure()
				.then(function(distance){
					$logText.append(distance + "<br>");

				}).catch(function(){

				});
		
		} else if(_this.props[MOVE_STATUS] == 1){
		
			_this.turnLeft();
			_this.delayChangeProp(2000, MOVE_STATUS, 2);
		
		} else if(_this.props[MOVE_STATUS] == 2) {
		
			_this.goStraight();
			_this.delayChangeProp(1000, MOVE_STATUS, 0);
			
		}
	});

	this.props[MOVE_STATUS] = 0;
	
	
}

Odometrino.prototype = Object.create(DroinoBase.prototype);
Odometrino.prototype.constructer = DroinoBase;
