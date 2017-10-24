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

	var US_DISTANCE_TRIG_PIN = 7;
	var US_DISTANCE_ECHO_PIN = 2;

	var _this = this;

	const MOVE_STATUS = "moveStatus";

	var $logText = $("#log-text");
	var $distanceValue = $("#distance-value");
	var $stopButton = $("#stop-button");
	var $resetButton = $("#reset-button");
	var $proximityButton = $("#proximity-button");
	var $proximityText = $("#proximity-value");
	var $rotateButton = $("#rotate-button");
	$stopButton.on("click", function(){
		console.log("stop");
		_this.props[MOVE_STATUS] = 5;
		_this.androidService.stopDeviceCamera();
	});

	$resetButton.on("click", function(){
		console.log("reset");
		//_this.props[MOVE_STATUS] = 1;

		// video
		$("#video").show();
		_this.androidService.initDeviceCamera($("#video").get(0));
	});

	$proximityButton.on("click", function(){
		console.log("proximity");
		_this.props[MOVE_STATUS] = 5;
		_this.androidService.addDeviceProximityListener(function(event){
			$proximityText.text(event.proximity);
		});
	});

	var rotDir = 1;
	$rotateButton.on("click", function(){
		console.log("rotate");
		_this.props[MOVE_STATUS] = 5;
		rotDir = -rotDir;
		_this.rotateDeg(90 * rotDir);
	});
	
	/*
		片側で 120
		両輪で 95
	*/
	const offset = 95;

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

	this.rotate = function(sp){
		motorRight.speed(-sp);
		motorLeft.speed(sp);
	}
	this.stop = function(){
		motorRight.stop();
		motorLeft.stop();
	}


	// sensdors
	this.androidService.initIMUListener();

	_this.androidService.addDeviceOrientationListener(function(){
		$sumRotText.text(_this.androidService.getSumRotation2D().toFixed(2));
	});


	this.addProp(MOVE_STATUS);

	this.setPropsChangeListener(function(){

			distanceSensor.measure()
				.then(function(distance){
					$distanceValue.text(distance.toFixed(2));

				}).catch(function(e){
					console.warn(e);
				});

		if(_this.props[MOVE_STATUS] == 0){
		
			_this.turnRight();
			_this.delayChangeProp(800, MOVE_STATUS, 1);

		
		
		} else if(_this.props[MOVE_STATUS] == 1){
		
			_this.turnLeft();
			_this.delayChangeProp(800, MOVE_STATUS, 2);
		
		} else if(_this.props[MOVE_STATUS] == 2) {
		
			_this.goStraight();
			_this.delayChangeProp(800, MOVE_STATUS, 0);
			
		}
	});

	this.props[MOVE_STATUS] = 5;
	
	var $alphaText =  $("#orientation-alpha");
	var $betaText =  $("#orientation-beta");
	var $gammaText =  $("#orientation-gamma");
	var $rotText =  $("#orientation-rot");
	var $sumRotText =  $("#orientation-sum");
	var $diffRotText =  $("#orientation-diff");

	// #TODO droino baseにうつす
	this.rotateDeg = function(deg){
		this.rotateRad(Util.degToRad(deg));
	}

	//
	this.rotateRad = function(rotation){
		var ROTATE_SPEED_COEFF = 30;
		var ALLOW_RAD_SPAN = Util.degToRad(0.2); // 誤差許容角度
		console.log(ALLOW_RAD_SPAN);
	
		this.androidService.addSumRotation2DDestination(rotation);

		return new Promise(function(resolve, reject){

			var rotationCallback = function(event){

				var crtOrientation = event.deviceOrientation;
/*
				$alphaText.text(crtOrientation.alpha.toFixed(2));
				$betaText.text(crtOrientation.beta.toFixed(2));
				$gammaText.text(crtOrientation.gamma.toFixed(2));
*/
				var diffRad = _this.androidService.getRotation2DDiff();

				//$rotText.text(_this.androidService.getRotation2D().toFixed(2));
				$diffRotText.text(Util.radToDeg(diffRad).toFixed(2));
	

				if(Math.abs(diffRad) < ALLOW_RAD_SPAN ){
					
					_this.stop();

					_this.androidService.removeDeviceOrientationListener(rotationCallback);

					resolve();

					return;		
				}

				// #TODO 制御
				_this.rotate(diffRad * ROTATE_SPEED_COEFF);
				console.log(diffRad * ROTATE_SPEED_COEFF);

			}

			_this.androidService.addDeviceOrientationListener(rotationCallback);

		}) ;
	}
	
}

Odometrino.prototype = Object.create(DroinoBase.prototype);
Odometrino.prototype.constructer = DroinoBase;
