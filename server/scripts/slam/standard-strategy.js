function StandardStrategy(twoWheels, distanceSensor, slam, stream){

	const MinimumDistance = 50;
	const MaximumEffectiveDistance = 1500;
	const StraightStartOptimumDistance = 800;

	rotateDistanceTable = [];

	var androidService = new AndroidService();

	distanceSensor.startInterval();


	this.start = async function(){

		stream.log("StandardStrategy");
		
		await doCalibration();

		// #TODO break when finish creating map  
		while(true){

			await this.rotateMapStrategy(Math.PI * 2);

			var destRotation = calcOptimalStraightOrientation();

			await this.rotate(destRotation - androidService.getSumRotation2D());

			await straightForwardStrategy();

		}
	};

	function calcOptimalStraightOrientation(){

		const BufferSize = 10;

		var distanceBuffer = new Util.CircularBuffer(BufferSize);

		var optimalRotation = 0;

		distanceBuffer.fill(0);

		for(var i=0; i<rotateDistanceTable.length; i++){

			var distance = rotateDistanceTable[i].distance;

			distanceBuffer.append(distance);

			var diffArea = distanceBuffer.calcDiffArea();

			if(minDiffArea > diffArea){

				minDiffArea = diffArea;

				if(i > BufferSize / 2){
				
					optimalRotation = 
						rotateDistanceTable[i - BufferSize /2]
						.rotation;

				} else {

					optimalRotation = 
						rotateDistanceTable[0]
						.rotation;
				}

			}

		}

		return optimalRotation;

	}


	this.rotateMapStrategy = function(rotation = Math.PI * 2){

		stream.log("StandardStrategy rotateMapStrategy");
		
		var minDiffArea = Infinity;

		rotateDistanceTable = [];

		androidService.resetSumRotation2DDestination(); 
		androidService.addSumRotation2DDestination(rotation);

		function distanceCallback(event){

			var crtRotation = androidService.getSumRotation2D();

			var distance = event.distance;

			rotateDistanceTable.push({
				distance: distance,
				rotation: crtRotation
			});

			slam.setRotation(crtRotation);
			slam.addSeenPoint(distance);

			stream.map({
				rotation: crtRotation,
				distance: distance});

		};

		androidService.addDistanceEventListener(distanceCallback);

		return new Promise((resolve, reject) => {


			this.rotate(rotation).then(function(){
				
				androidService.removeDistanceEventListener(distanceCallback);

			});



		}) ;

	};

	this.rotate = function(rotation, rotationListener){

		const ALLOW_RAD_SPAN = Util.degToRad(0.2); // 誤差許容角度

		return new Promise(function(resolve, reject){

			var rotationCallback = function(event){

				var diffRad = androidService.getRotation2DDiff();

				if(rotationListener != null){
					
					rotationListener(androidService.getSumRotation2D());

				}

				if(Math.abs(diffRad) < ALLOW_RAD_SPAN ){
					
					twoWheels.brake();

					androidService.
						removeDeviceOrientationListener(
							rotationCallback
							);

					resolve();

					return;		
				}

				if(diffRad > 0){

					twoWheels.rotateLeftLowSpeed();
				
				} else {

					twoWheels.rotateRightLowSpeed();
				
				}

			};

			androidService.
				addDeviceOrientationListener(
					rotationCallback
					);

		}) ;
	};

	this.straightForwardStrategy = function(){

		stream.log("StandardStrategy straightForwardStrategy");

		var lastDistance = -1;

		const DistanceInterval = 30;

		var filter; 

		return new Promise((resolve, reject) =>{

			function distanceCallback(event){

				var crtRotation = androidService.getSumRotation2D();

				var distance = event.distance;

				if(filter == null){
					
					var crtPosition = slam.getMyEstimatePosition();

					var filter = new StraightForwardFilter(crtPosition, distance);

					twoWheels.straightForwardLowSpeed();

					lastDistance = distance;

					return;

				}

				// TODO set position in slam

				if(distance < MinimumDistance){

					androidService.
						removeDistanceEventListener(distanceCallback);

					return resolve();

				}

				if(lastDistance - distance > DistanceInterval){

					lastDistance = distance;
						
					androidService.
						removeDistanceEventListener(distanceCallback);

					this.rotateMapStrategy().then(function(){
						androidService.
							addDistanceEventListener(distanceCallback);

					});

					return;
				}

				// #todo get wheel speed correctly
				filter.update(distance, twoWheels.speed);

				
			};

			androidService.addDistanceEventListener(distanceCallback);

		});

	};

	// #TODO use EKF or ..
	function StraightForwardFilter(initPosition, initRotation, initDistance){

		this.estPosition = initPosition;

		this.estDepth = initDistance;

		var targetPosition = initPosition.clone()
			.add( - Math.sin(initRotation), 0, - Math.cos(initRotation))
			.multiplyScalar(this.estDepth);

		this.update = function(rotation, distance, speed){

			this.estDepth = distance;

			this.estPosition = setPositionByDistance(rotation, this.estDepth);

		};

		function getPositionByDepth(rotation, estDepth){

			return targetPosition.clone()
				.add(Math.sin(rotation), 0, Math.cos(rotation))
				.multiplyScalar(estDepth);

		} 
	}

	// TODO use EKF or ..
	function rotateFilter(initPosition, initRotation){

		this.estPosition = initPosition;
		
		this.estRotation = initRotation;

		this.update = function(rotation, speed){

			this.estRotation = rotation;

		};
	};

	// #TODO calibration
	function doCalibration(){

		stream.log("StandardStrategy doCalibration");
	}
}