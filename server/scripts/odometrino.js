/*
	Odometrino
	pin3 motor1
	pin4: LED
	pin5 motor1
	pin6 motor2
	pin9 motor2 
*/
function Odometrino(WSUrl =  "http://localhost:3002/"){

	// super constructer
	Odometrino.base(this, 'constructor', WSUrl);

	var stream; 
	
	this.onReady = function(){
		stream = new this.androidService.SocketStream(WSUrl);

		stream.startStream();
	}
	
	var MOTOR_L1_PIN = 5;
	var MOTOR_L2_PIN = 3;
	var MOTOR_R1_PIN = 9;
	var MOTOR_R2_PIN = 6;
	var LED1_PIN = 4;

	var US_DISTANCE_TRIG_PIN = 7;
	var US_DISTANCE_ECHO_PIN = 2;

	var _this = this;

	const MOVE_STATUS = "moveStatus";

	const STATUS_ROTATING = 5;
	const STATUS_ROTATE_FIN = 6;

	var $logText = $("#log-text");
	var $distanceValue = $("#distance-value");
	var $stopButton = $("#stop-button");
	var $resetButton = $("#reset-button");
	var $proximityButton = $("#proximity-button");
	var $proximityText = $("#proximity-value");
	var $rotateButton = $("#rotate-button");
	$stopButton.on("click", function(){
		console.log("stop");
		_this.props[MOVE_STATUS] = 7;

		_this.androidService.clearDeviceVelocity();
		_this.androidService.clearDevicePosition();

		_this.androidService.stopDeviceCamera();
		$("#video").hide();
		if(slam.mapView)
			slam.mapView.clearPoints();

		distanceSensor.measure()
			.then(function(distance){
				$distanceValue.text(distance.toFixed(2));
			}).catch(function(e){
				console.warn(e);
			});

		_this.androidService.restartVisualOdometry();
		
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
		_this.props[MOVE_STATUS] = STATUS_ROTATING;
		_this.androidService.addDeviceProximityListener(function(event){
			$proximityText.text(event.proximity);
		});

		throw new Error("sasda");
		//a = b;
		//console.error("sas");
	});

	var rotDir = 1;
	$rotateButton.on("click", function(){
		console.log("rotate");
		_this.props[MOVE_STATUS] = 5;
	
	});
	
	/*
		片側で 120
		両輪で 95
	*/
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

	var distanceSensor = new UltrasonicDistanceSensor(
		this.arduino,
		{
			trigPin: US_DISTANCE_TRIG_PIN,
			echoPin: US_DISTANCE_ECHO_PIN
		});

	// arduino functions
	this.goStraight = function(value = 255){
		console.log('goStraight');
		motorRight.forward(value);
		motorLeft.forward(value);
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
		motorRight.speed(sp);
		motorLeft.speed(-sp);
	}
	this.stop = function(){
		motorRight.stop();
		motorLeft.stop();
	}


	// sensdors
	this.androidService.initIMUListener();

	_this.androidService.addDeviceOrientationListener(function(){
		$sumRotText.text(Util.radToDeg(_this.androidService.getSumRotation2D()).toFixed(2));
	});

	// slam
	var slam = new Slam();

	function animate(){
		if(slam.mapView)
			slam.mapView.update();
		requestAnimationFrame(animate);
	}
	animate();

	var $alphaText =  $("#orientation-alpha");
	var $betaText =  $("#orientation-beta");
	var $gammaText =  $("#orientation-gamma");
	var $rotText =  $("#orientation-rot");
	var $sumRotText =  $("#orientation-sum");
	var $diffRotText =  $("#orientation-diff");

	var $accXText =  $("#accX-text");
	var $accYText =  $("#accY-text");
	var $accZText =  $("#accZ-text");

	var $velXText =  $("#velX-text");
	var $velYText =  $("#velY-text");
	var $velZText =  $("#velZ-text");

	var $posXText =  $("#posX-text");
	var $posYText =  $("#posY-text");
	var $posZText =  $("#posZ-text");


	// #TODO droino baseにうつす
	this.rotateDeg = function(deg){
		return this.rotateRad(Util.degToRad(deg));
	};

	//
	this.rotateRad = function(rotation){
		var ROTATE_SPEED_COEFF = 30;
		var ALLOW_RAD_SPAN = Util.degToRad(0.2); // 誤差許容角度
		console.log(ALLOW_RAD_SPAN);
	
		this.androidService.resetSumRotation2D(); 
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
				//_this.rotate(diffRad * ROTATE_SPEED_COEFF);
				_this.rotate(1.0 * diffRad /Math.abs(diffRad) );
				//console.log(diffRad * ROTATE_SPEED_COEFF);

			}

			_this.androidService.addDeviceOrientationListener(rotationCallback);

		}) ;
	};

	this.addProp(MOVE_STATUS);

	var isGoStraight = false;

	this.setPropsChangeListener(function(){

		if(_this.props[MOVE_STATUS] == 0){
		
			_this.turnRight();
			_this.delayChangeProp(800, MOVE_STATUS, 1);

		
		
		} else if(_this.props[MOVE_STATUS] == 1){
		
			_this.turnLeft();
			_this.delayChangeProp(800, MOVE_STATUS, 2);
		
		} else if(_this.props[MOVE_STATUS] == 2) {
		
			_this.goStraight();
			_this.delayChangeProp(800, MOVE_STATUS, 0);
			
		} else if(_this.props[MOVE_STATUS] == STATUS_ROTATING){

			function measureExec(){
				
				if(_this.props[MOVE_STATUS] != STATUS_ROTATING){
					return;
				}

				setTimeout(measureExec, 60);

				var measureStartRotation = _this.androidService.getSumRotation2D();
				
				distanceSensor.measureLow()
					.then(function(distance){
						
						$distanceValue.text(distance.toFixed(2));

						var measureEndRotation =  _this.androidService.getSumRotation2D();

						var measureRotation = (measureStartRotation + measureEndRotation) / 2.0;

						slam.setRotation(measureRotation);

						slam.addSeenPoint(distance);
/*
						if(isGoStraight){
							slam.newOdometryData({
								x: 0,
								y: 0,
								z: -0
							});
						} else {

						}
*/
						stream.map({
							rotation: measureRotation,
							distance: distance});


					}).catch(function(e){
						stream.error(e);
						console.error(e);
					});
			}

			measureExec();

			rotDir = -rotDir;

			(async function() { 
		
				while(true){
					await _this.rotateDeg(360 * rotDir);
					
					_this.stop();
					await _this.sleep(100);
					
					isGoStraight = true;
					_this.goStraight(1);
					await _this.sleep(2000);

					_this.stop();
					await _this.sleep(100);

					isGoStraight = false;

					rotDir = -rotDir;
				}
			
			}).call(this);

		}
	});

	/*

	this.androidService.addDeviceMotionListener(function(event){
		var motionData = event.motionData;

		$accXText.text(motionData.acc.x.toFixed(4));
		$accYText.text(motionData.acc.y.toFixed(4));
		$accZText.text(motionData.acc.z.toFixed(4));

		$velXText.text(motionData.vel.x.toFixed(4));
		$velYText.text(motionData.vel.y.toFixed(4));
		$velZText.text(motionData.vel.z.toFixed(4));

		$posXText.text(motionData.pos.x.toFixed(4));
		$posYText.text(motionData.pos.y.toFixed(4));
		$posZText.text(motionData.pos.z.toFixed(4));

	});
	*/

	this.androidService.addVisualOdometryEventListener(function(event){
		var odometryData = event.visualOdometryData;
/*
		if(!isGoStraight){
			return;
		}
*/
		// デバイスの向きでかわるので注意
		slam.newRotation( _this.androidService.getSumRotation2D());
		slam.newOdometryData(odometryData);
		var pos = slam.getMyEstimatePosition();
		if(stream){
			stream.map({
				position:{x: pos.x, z:pos.z},
			  	rotation: _this.androidService.getSumRotation2D()
			  });
		}

	});

	this.props[MOVE_STATUS] = 4;


	// sensor chart
	var ctx = document.getElementById('myChart').getContext('2d');
	var chart = Util.ChartBuilder.createLineChart(ctx,
		[{label: "alpha"}, {label: "beta"}, {label: "gamma"}], 
		{yMax: 180, yMin: -180, xNum: 100, yLabel: "radian"});
/*
	chart.start(function(){
			var o = _this.androidService.getDeviceOrientation();
			return [o.alpha, o.beta, o.gamma];
		},
		100,);
		*/
	
	var w = new Util.stopwatch();
	w.start();
	_this.androidService.addDeviceOrientationListener(function(event){
		chart.addData([
			//event.deviceOrientation.alpha, 
			_this.androidService.getSumRotation2D(), 
			event.deviceOrientation.beta, 
			event.deviceOrientation.gamma],
			w.get() / 1000.0
			);
	});

}

Util.inherits(Odometrino, DroinoBase);
