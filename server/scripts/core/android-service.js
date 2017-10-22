function AndroidService(){

	var _this = this;

	/*
		camera系
		#TODO 画像処理
			- マーカーを追う
			- 
	*/
	(function videoService(){

		var video,  localStream;
		var cameraData = [];
		var camId = 1;
		var resolution;

		this.RESOLUTION = {
    		VGA: "VGA",
    		HD: "HD" 
  		};

 		let RESOLUTION_HASH = {};
  		RESOLUTION_HASH[this.RESOLUTION.VGA] = [640, 480];
  		RESOLUTION_HASH[this.RESOLUTION.HD] = [1280, 720];

		this.initDeviceCamera = function(_video, _resolution){
			
			if(!_video){
				video = document.createElement('video');
			} else {
				video = _video;
			}
			
			video.autoplay = 'autoplay';
			
			initCamera();

			if(_resolution in this.RESOLUTION)
      			resolution = _resolution;
     		else
      			resolution = "";
		};

		this.startDeviceCamera = function(){
		
			setCamera();
			
		};

		this.stopDeviceCamera = function(){

			stopCamera();
		};

		this.convertDeviceCamera = function(){

			camId++;
			
			if(camId == cameraData.length){
				camId = 0;
			}
			
			setCamera();
		
		};

		this.addLoadedEventListener = function(loadedFunc){
			function wrappedLoadedFunc(){
				video.removeEventListener('loadeddata', wrappedLoadedFunc);
				loadedFunc(video.videoWidth, video.videoHeight);
			}
			video.addEventListener("loadeddata", wrappedLoadedFunc);
  		};

		function initCamera(){
			if(!!MediaStreamTrack.getSources){
				MediaStreamTrack.getSources(function(data){
		            //カメラ情報を取得して、出力する
		            var strCamera = "";
		            var len = data.length;
		            for( var i = 0 ; i < len ; i ++ ){
		            	//strCamera += "<p>種類："+ data[i].kind+"<br/>ID："+ data[i].id+"</p>";
		            	if( data[i].kind == "video" ){
		            		cameraData.push(data[i]);
		            	}
		            }
		            if( cameraData.length == 0 ){
		            	alert("カメラが見つかりません");
		            	return;
		            }
		            //カメラを取得・切り替える
		            setCamera();
		        });
	        }else if(!!navigator.mediaDevices.enumerateDevices){
	          	navigator.mediaDevices.enumerateDevices()
	          	.then(function(devices) {
	            	devices.forEach(function(device) {
	              		if(device.kind === "videoinput"){
	              			cameraData.push({id:device.deviceId, label: device.label});
	              		}
	            	});
	            	setCamera();
	          	})
	          	.catch(function(err) {
	            	console.error(err.name + ": " + err.message);
	          	});
	        }else{
	        	//カメラを取得・切り替える
	        	setCamera();   
	        }
	    }

	    var setCamera = function(){
		    navigator.getUserMedia = navigator.getUserMedia ||
		    	navigator.webkitGetUserMedia || 
		    	window.navigator.mozGetUserMedia;
		    window.URL = window.URL || window.webkitURL;
		    
		    //カメラ再生中の場合は切り替えのため、一旦停止する
		    stopCamera();

		    if(cameraData.length > 0){
		    	
		    	if(camId > cameraData.length-1){
		    		camId = 0;
		    	}

		    	var constraints = {
		    		video: {
		    			optional: [{sourceId: cameraData[camId].id }], //カメラIDを直接指定する
					},
					audio: false
				};

				if(resolution != ""){
					constraints.video.mandatory = {
						"minWidth": RESOLUTION_HASH[resolution][0],
						"minHeight": RESOLUTION_HASH[resolution][1]
		        	}
		      	}
		    }else{
		    	var constraints = {video: true, audio: false};
		    }

		    //カメラをIDを使用して取得する
		    navigator.getUserMedia(
		    	constraints,

		    	function(stream) {
		        	//切り替え時にカメラを停止するため、情報を保存しておく
		        	localStream = stream;
		        	//カメラをvideoに結びつける
		        	video.src = window.URL.createObjectURL(stream);
		      	},
		      	function(err) {
		      		console.error(err);
		      	}
		    );
		}

		function stopCamera(){

			if( localStream ){
	          localStream.getTracks().forEach(function (track) { track.stop()});
	        }

		}

	
	}).call(this);


	/*
		device motion 系	
		使う場合は必ず最初に initIMUListener する

		Copyright © 2015 lamplightdev. All rights reserved.
		https://github.com/lamplightdev/compass
	    
	*/

	(function IMUService(){

		var deviceOrientation = {alpha: 0.0, beta: 0.0, gamma:0.0};
		var screenOrientation = 0;
		var IMUDispatcher = new EventDispatcher();
		var DEVICE_MOTION_EVENT = "DEVICE_MOTION_EVENT";
		var DEVICE_PROXIMITY_EVENT = "DEVICE_PROXIMITY_EVENT";
		var DEVICE_ORIENTATION_EVENT = "DEVICE_ORIENTATION_EVENT";
		var SCREEN_ORIENTATION_EVENT = "SCREEN_ORIENTATION_EVENT";

		// motion
		var motionData = {
			acc: {x: 0.0, y: 0.0, z: 0.0},
			vel: {x: 0.0, y: 0.0, z: 0.0},
			pos: {x: 0.0, y: 0.0, z: 0.0}
		}

		// proximity;
		proximity = 0.0;

		// rotation 
		var lastRotation2d = 0;
		var rotation2D = 0;
		var sumRotation2dUnit = 0; // +PI -PI 超えるごとに増減
		var sumRotation2d = 0; 

		var defaultOrientation = screen.width > screen.height ? "landscape" : "portrait";

		var onDeviceMotionChangeEvent = function( event){

			motionData.acc.x = event.acceleration.x;
			motionData.acc.y = event.acceleration.y;
			motionData.acc.z = event.acceleration.z;

			IMUDispatcher.dispatchEvent({
				type: DEVICE_MOTION_EVENT,
				motionData: motionData
			});

		};

		var onDeviceProximityChangeEvent = function( event){

			proximity = event.value;
			
			IMUDispatcher.dispatchEvent({
				type: DEVICE_PROXIMITY_EVENT,
				proximity: proximity
			});

		};

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
/*
				console.log("rot " + rotation2D);
				console.log("sum " + sumRotation2d);
*/


			}

			IMUDispatcher.dispatchEvent({
				type: DEVICE_ORIENTATION_EVENT,
				deviceOrientation: deviceOrientation
			});

	    };

	    var onScreenOrientationChangeEvent = function() {

	    	screenOrientation = window.orientation || 0;

			IMUDispatcher.dispatchEvent({
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

		this.addDeviceMotionListener = function(func){
			
			IMUDispatcher.addEventListener(DEVICE_MOTION_EVENT, func);

		};

		this.removeDeviceMotionListener = function(func){
			
			IMUDispatcher.removeEventListener(DEVICE_MOTION_EVENT, func);

		};

		this.addDeviceProximityListener = function(func){
			
			IMUDispatcher.addEventListener(DEVICE_PROXIMITY_EVENT, func);

		};

		this.removeDeviceProximityListener = function(func){
			
			IMUDispatcher.removeEventListener(DEVICE_PROXIMITY_EVENT, func);

		};




		this.addScreenOrientationListener = function(func){
			
			IMUDispatcher.addEventListener(SCREEN_ORIENTATION_EVENT, func);

		};

		this.removeScreenOrientationListener = function(func){
			
			IMUDispatcher.removeEventListener(SCREEN_ORIENTATION_EVENT, func);

		};

		this.addDeviceOrientationListener = function(func){
			
			IMUDispatcher.addEventListener(DEVICE_ORIENTATION_EVENT, func);

		};

		this.removeDeviceOrientationListener = function(func){
			
			IMUDispatcher.removeEventListener(DEVICE_ORIENTATION_EVENT, func);

		};

		this.initIMUListener = function(){

			window.addEventListener( 'devicemotion', onDeviceMotionChangeEvent, false );
			window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
			window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

			// 
			window.addEventListener("deviceproximity", onDeviceProximityChangeEvent, false);


		};

		this.getDeviceOrientation = function(){
			return deviceOrientation;
		};

		this.getDeviceProximity = function(){
			return proximity;
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
