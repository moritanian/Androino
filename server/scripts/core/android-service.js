function AndroidService(){

	var _this = this;

	/*
		camera系
	*/

	var camController, video;

	this.initDeviceCamera = function(){
		video = document.createElement('video');
		video.autoplay = 'autoplay';
		camController = new camera_controller(video);
	};

	this.startDeviceCamera = function(){

		if(!camController || !camController.startCamera){
			console.warn("startDeviceCamera is called before device camera initialization. "
				+ "Please call initDeviceCamera");
			
			return;
		}

		camController.startCamera();

	};

	this.stopDeviceCamera = function(){

		//camController.stopCamera();
	
	};

	this.convertDeviceCamera = function(){

		camController.convertCamera();
	
	};

	/*
		device orientation 系	
		使う場合は必ず最初に initOrientationListener する

		Copyright © 2015 lamplightdev. All rights reserved.
		https://github.com/lamplightdev/compass
	    
	*/

	(function orientationService(){

		var deviceOrientation = {alpha: 0.0, beta: 0.0, gamma:0.0};
		var screenOrientation = 0;
		var orientationDispatcher = new EventDispatcher();
		var DEVICE_ORIENTATION_EVENT = "DEVICE_ORIENTATION_EVENT";
		var SCREEN_ORIENTATION_EVENT = "SCREEN_ORIENTATION_EVENT";

		var lastRotation2d = 0;
		var rotation2D = 0;
		var sumRotation2dUnit = 0; // +PI -PI 超えるごとに増減
		var sumRotation2d = 0; 

		var defaultOrientation = screen.width > screen.height ? "landscape" : "portrait";

		var onDeviceOrientationChangeEvent = function( event ) {

			deviceOrientation = event;
		
			var heading = event.alpha;

		    if (typeof event.webkitCompassHeading !== "undefined") {
		     	heading = event.webkitCompassHeading; //iOS non-standard
		    }

		    var bOrientation = getBrowserOrientation();

		    if (typeof heading !== "undefined" && heading !== null) { // && typeof orientation !== "undefined") {
		      // we have a browser that reports device heading and orientation

		    	// what adjustment we have to add to rotation to allow for current device orientation
		      	var adjustment = 0;
		      	if (defaultOrientation === "landscape") {
		        	adjustment -= 90;
		      	}

		      	if (typeof bOrientation !== "undefined") {
		        	var currentOrientation = bOrientation.split("-");

		        	if (defaultOrientation !== currentOrientation[0]) {
		          		if (defaultOrientation === "landscape") {
		            		adjustment -= 270;
			          	} else {
			            	adjustment -= 90;
			          	}
			        }

			        if (currentOrientation[1] === "secondary") {
			        	adjustment -= 180;
			        }
			    }

				rotation2D = Util.degToRad( heading + adjustment );

				var diffRotation2d = rotation2D - lastRotation2d;

				// -PI , PI border
				if(diffRotation2d > Math.PI){ // -direction , -PI -> +PI

					if(diffRotation2d > 2.0 * Math.PI){
						log.warn("diffRotation2d is invalid. "  + diffRotation2d);
					}

					sumRotation2dUnit --;

				} else if(diffRotation2d < - Math.PI){ // + direction , +PI -> -PI
			
					if(diffRotation2d < - 2.0 * Math.PI){
						log.warn("diffRotation2d is invalid. "  + diffRotation2d);
					}

					sumRotation2dUnit ++;

				}

				sumRotation2d = rotation2D + sumRotation2dUnit * 2.0 * Math.PI;
				lastRotation2d = rotation2D;

				console.log("rot " + rotation2D);
				console.log("sum " + sumRotation2d);



			}

			orientationDispatcher.dispatchEvent({
				type: DEVICE_ORIENTATION_EVENT,
				deviceOrientation: deviceOrientation
			});

	    };

	    var onScreenOrientationChangeEvent = function() {

	    	screenOrientation = window.orientation || 0;

			orientationDispatcher.dispatchEvent({
				type: SCREEN_ORIENTATION_EVENT,
				screenOrientation: screenOrientation
			});

	    };

	    // browser agnostic orientation
		function getBrowserOrientation() {
			var orientation;
			if (screen.orientation && screen.orientation.type) {
				orientation = screen.orientation.type;
			} else {
				orientation = screen.orientation ||
			                screen.mozOrientation ||
			                screen.msOrientation;
			}

			/*
			  'portait-primary':      for (screen width < screen height, e.g. phone, phablet, small tablet)
			                            device is in 'normal' orientation
			                          for (screen width > screen height, e.g. large tablet, laptop)
			                            device has been turned 90deg clockwise from normal
			  'portait-secondary':    for (screen width < screen height)
			                            device has been turned 180deg from normal
			                          for (screen width > screen height)
			                            device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
			  'landscape-primary':    for (screen width < screen height)
			                            device has been turned 90deg clockwise from normal
			                          for (screen width > screen height)
			                            device is in 'normal' orientation
			  'landscape-secondary':  for (screen width < screen height)
			                            device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
			                          for (screen width > screen height)
			                            device has been turned 180deg from normal
			*/

			return orientation;
		}


		this.addScreenOrientationListener = function(func){
			
			orientationDispatcher.addEventListener(SCREEN_ORIENTATION_EVENT, func);

		};

		this.removeScreenOrientationListener = function(func){
			
			orientationDispatcher.removeEventListener(SCREEN_ORIENTATION_EVENT, func);

		};

		this.addDeviceOrientationListener = function(func){
			
			orientationDispatcher.addEventListener(DEVICE_ORIENTATION_EVENT, func);

		};

		this.removeDeviceOrientationListener = function(func){
			
			orientationDispatcher.removeEventListener(DEVICE_ORIENTATION_EVENT, func);

		};

		this.initOrientationListener = function(){
			
			window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
			window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		};

		this.getDeviceOrientation = function(){
			return deviceOrientation;
		};

		this.getScreenOrientation = function(){
			return screenOrientation;
		};

		/* -PI ~ PI の値を返す */
		this.getRotation2D = function(){
			return rotation2D;
		};

		this.getSumRotation2D = function(){
			return sumRotation2d;
		};

	}).call(this);

	/*
		web socket系
	*/
	(function WSsocketService(){

		var socket, myId, isConnected = false;

		this.WSinit = function(url, room, onMessage, onConnected, onDisconnected){

			isConnected = false;

			socket = io.connect(url);

			socket.on('connect', function(evt) {
       			
       			myId = socket.io.engine.id;

      			console.log('socket.io connected. enter room=' + room );
      
      			socket.emit('enter', room);
      
      			isConnected = true;

      			if(onConnected){

        			onConnected(myId);
      			
      			}

    		});
    
    		// message.from
    		socket.on('message', function(message) {
    		
    			onMessage(message);
    		
    		});

    		socket.on('disconnect', function() {
    			
    			isConnected = false;

    			onDisconnected();
    		
    		});
		}

		// message.sendto
		this.WSpost = function(message){
			
			socket.emit('message', message);
		
		}

		this.WSisConnected = function(){
			return isConnected;
		}

	}).call(this);

}
