var Calibration = async function(){
	
	var arduino = new Arduino();
	var androidService = new AndroidService();

	const maxValue = 255;
	const minValue = 100;

	var WSUrl =  "https://rtc-world-s.herokuapp.com/";

	var stream = new androidService.SocketStream(WSUrl);

	stream.startStream();

	androidService.initIMUListener();

	var MOTOR_L1_PIN = 5;
	var MOTOR_L2_PIN = 3;
	var MOTOR_R1_PIN = 9;
	var MOTOR_R2_PIN = 6;

	var US_DISTANCE_TRIG_PIN = 7;
	var US_DISTANCE_ECHO_PIN = 2;

	var motorRight = new Motor(arduino, {
		pin1: MOTOR_R1_PIN,
		pin2: MOTOR_R2_PIN,
		offset: 0
	});

	var motorLeft = new Motor(arduino, {
		pin1: MOTOR_L1_PIN,
		pin2: MOTOR_L2_PIN,
		offset: 0
	});

	var distanceSensor = new UltrasonicDistanceSensor(
		arduino,
		{
			trigPin: US_DISTANCE_TRIG_PIN,
			echoPin: US_DISTANCE_ECHO_PIN
		});

	var watch = new Util.stopwatch();
	watch.start();

	var rotationTableL = await calibRotation(motorLeft);

	var rotationTableR = await calibRotation(motorRight);
	
	var rotationTableAllL = await calibRotation({
		speed: function(value){
			motorLeft.speed(value);
			motorRight.speed(-value);
		},
		brake: function(){
			motorLeft.brake();
			motorRight.brake();
		}
	});

	var rotationTableAllR = await calibRotation({
		speed: function(value){
			motorLeft.speed(-value);
			motorRight.speed(value);
		},
		brake: function(){
			motorLeft.brake();
			motorRight.brake();
		}
	});



	// 
	async function calibRotation(motor) { 
		
		var value = minValue, rotationSpeed;

		const rotationSpeedBorder = 1.0e-5;  

		var rotationTable = [];

		var moveFlag = false;

		var lastRotation;

		const sleepTime = 300;
		const step =77;

		var status = 0;

		var count = 0;

		while(status < 2){

			count ++;

			//lastRotation = androidService.getRotation2D();

			if(count % 30 == 0){
			
				console.log(value);
				motor.speed(value);


				if(status == 0){
					value+= step;

					if(value > maxValue){
						status = 1;
					}

				} else {

					value -= step;

					if(value == minValue){
						status = 2;
					}
				}
					
			}
				
			rotationSpeed = androidService.getRotation2DSpeed();
/*
			rotationSpeed = 
				(androidService.getRotation2D() - lastRotation) / 
					sleepTime  * 1000.0;
*/
			lastRotation = androidService.getRotation2D();

			if(Math.abs(rotationSpeed) > rotationSpeedBorder){
				moveFlag = true;
			}

			var rotationData = [value, rotationSpeed, watch.get()];
			
			rotationTable.push(rotationData);

			stream.calibration({
				rotationData : rotationData
			});

			await Util.sleep(sleepTime);

		}

		motor.brake();

		return rotationTable;
	
	}

	async function calibStraight(motorLeft, motorRight, rotationTableL, rotationTableR){

	}

}
