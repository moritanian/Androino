var AndroidService = (function(){

	var instance;

	function AndroidService(){

		// singleton
  		if (typeof instance === "object"){
    		return instance;
  		}

  		instance = this;

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
		    
		*/

		(function IMUService(){

			var deviceOrientation = {alpha: 0.0, beta: 0.0, gamma:0.0};
			var screenOrientation = 0;
			var IMUDispatcher = new EventDispatcher();
			var DEVICE_MOTION_EVENT = "DEVICE_MOTION_EVENT";
			var DEVICE_PROXIMITY_EVENT = "DEVICE_PROXIMITY_EVENT";
			var VISUAL_ODOMETRY_EVENT = "VISUAL_ODOMETRY_EVENT";
			var DEVICE_ORIENTATION_EVENT = "DEVICE_ORIENTATION_EVENT";
			var SCREEN_ORIENTATION_EVENT = "SCREEN_ORIENTATION_EVENT";

			// motion
			var motionData = {
				acc: {x: 0.0, y: 0.0, z: 0.0},
				vel: {x: 0.0, y: 0.0, z: 0.0},
				pos: {x: 0.0, y: 0.0, z: 0.0}
			}

			// proximity;
			var proximity = 0.0;

			// visual odometry
			var visualOdometryData = {
				x: 0,
				y: 0,
				z: 0
			};

			// rotation 
			var lastRotation2d = 0;
			var rotation2D = 0;
			var sumRotation2dUnit = 0; // +PI -PI 超えるごとに増減
			var sumRotation2d = 0; 
			var sumRotation2dDestination = 0; 

			var defaultOrientation = screen.width > screen.height ? "landscape" : "portrait";

			var motionTimeWatch;
			const accThreshold = 0.01;

			var onDeviceMotionChangeEvent = function( event){

				if(!event.acceleration || event.acceleration.x == null)
					return;

				var deltaTime;
				if(motionTimeWatch){
					deltaTime = motionTimeWatch.get_and_start();
				} else {
					motionTimeWatch = new Util.stopwatch();
					deltaTime = 0;
				}

				var oldAcc = {
					x: motionData.acc.x,
					y: motionData.acc.y,
					z: motionData.acc.z
				};

				motionData.acc.x = event.acceleration.x;
				motionData.acc.y = event.acceleration.y;
				motionData.acc.z = event.acceleration.z;

				var oldVel = {
					x: motionData.vel.x,
					y: motionData.vel.y,
					z: motionData.vel.z
				};

				motionData.vel.x += (motionData.acc.x + oldAcc.x) * deltaTime / 2.0;
				motionData.vel.y += (motionData.acc.y + oldAcc.y) * deltaTime / 2.0;
				motionData.vel.z += (motionData.acc.z + oldAcc.z) * deltaTime / 2.0;

				motionData.pos.x += (motionData.vel.x + oldVel.x) * deltaTime / 2.0;
				motionData.pos.y += (motionData.vel.y + oldVel.y) * deltaTime / 2.0;
				motionData.pos.z += (motionData.vel.z + oldVel.z) * deltaTime / 2.0;

				if(Math.abs(motionData.acc.x) < accThreshold &&
					Math.abs(motionData.acc.y) < accThreshold &&
					Math.abs(motionData.acc.z) < accThreshold){

					instance.clearDeviceVelocity();
				}

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

			var onVisualOdometryEvent = function(event){

				visualOdometryData.x = event.x;
				visualOdometryData.y = event.y;
				visualOdometryData.z = event.z;
				
				IMUDispatcher.dispatchEvent({
					type: VISUAL_ODOMETRY_EVENT,
					visualOdometryData: visualOdometryData
				});

			};

			var onDeviceOrientationChangeEvent = (function() {

				var RIGHT = new math.Vector3(1.0, 0 ,0);
				var UP = new math.Vector3(0, 1.0 ,0);
				var FORWARD = new math.Vector3(0, 0 ,1.0);

				var ROOT1_2 = 1.0 / Math.sqrt(2.0);

				var getDeviceEuler, deviceEuler, heading;

				var userAgent = window.navigator.userAgent.toLowerCase();

				if(userAgent.indexOf('android') == -1 && userAgent.indexOf('chrome') != -1){
					
					// chrome のsensorデバッグのorientation が標準と違う
					
					getDeviceEuler = function(event){
						
						order = "ZYX";

						deviceEuler = new math.Euler(
							Util.degToRad(event.beta), 
							Util.degToRad(event.gamma), 
							Util.degToRad(event.alpha),
							order);					

						return deviceEuler;

					};

				} else {
					
					getDeviceEuler = function(event){
						
						order = "ZXY";

						deviceEuler = new math.Euler(
							Util.degToRad( event.beta),
							Util.degToRad( event.gamma),
							Util.degToRad( event.alpha),
							order);
						

						return deviceEuler;

					};
				}

				var onDeviceOrientationChangeEvent = function( event ) {

					deviceOrientation = event;

					deviceEuler = getDeviceEuler(deviceOrientation);

					var right = RIGHT.clone();
					var up = UP.clone();
					var forward = FORWARD.clone()
						
					right.applyEuler(deviceEuler);
					up.applyEuler(deviceEuler);
					forward.applyEuler(deviceEuler);
					

					
					// 対象の二次元平面回転の軸方向に極がこないようにreorder
					if(right.z > ROOT1_2 || right.z < - ROOT1_2){

						heading = Math.atan2(forward.y, forward.x);

					} else if( up.z > ROOT1_2 || up.z < -ROOT1_2){

						heading = Math.atan2(right.y, right.x);

					} else {

						heading = Math.atan2(right.y, right.x);

					}


					//console.log(heading);

				    var bOrientation = getBrowserOrientation();

				    if (typeof heading !== "undefined" && heading !== null) { // && typeof orientation !== "undefined") {
				      // we have a browser that reports device heading and orientation

				    	// what adjustment we have to add to rotation to allow for current device orientation
				      	var adjustment = 0;
				      	if (defaultOrientation === "landscape") {
				        	adjustment -= Math.PI/2.0;
				      	}

				      	if (typeof bOrientation !== "undefined") {
				        	var currentOrientation = bOrientation.split("-");

				        	if (defaultOrientation !== currentOrientation[0]) {
				          		if (defaultOrientation === "landscape") {
				            		adjustment -= Math.PI * 1.5;
					          	} else {
					            	adjustment -= Math.PI * 0.5;
					          	}
					        }

					        if (currentOrientation[1] === "secondary") {
					        	adjustment -= Math.PI;
					        }
					    }

						rotation2D = heading + adjustment;



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

					}

					IMUDispatcher.dispatchEvent({
						type: DEVICE_ORIENTATION_EVENT,
						deviceOrientation: deviceOrientation
					});

			    };

			    return onDeviceOrientationChangeEvent;
			})();

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

			this.addVisualOdometryEventListener = function(func){

				IMUDispatcher.addEventListener(VISUAL_ODOMETRY_EVENT, func);

			};

			this.removeVisualOdometryEventListener = function(func){

				IMUDispatcher.removeEventListener(VISUAL_ODOMETRY_EVENT, func);

			}



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

				// called from java native
				window.addEventListener("deviceproximity", onDeviceProximityChangeEvent, false);
				window.addEventListener("visualodometry", onVisualOdometryEvent, false);

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
				// TODO 時間補正
				return sumRotation2d;
			};

			this.addSumRotation2DDestination = function(add){
				sumRotation2dDestination += add;
				return sumRotation2dDestination;
			};

			this.getRotation2DDiff = function(){
				return sumRotation2dDestination - sumRotation2d;
			};

			this.getDeviceVelocity = function(){
				return {
					x: motionData.vel.x,
					y: motionData.vel.y,
					z: motionData.vel.z
				};
			};

			this.getDevicePosition = function(){
				return {
					x: motionData.pos.x,
					y: motionData.pos.y,
					z: motionData.pos.z
				};
			};

			this.getVisualOdometryPosition = function(){
				return {
					x: visualOdometryData.x,
					y: visualOdometryData.y,
					z: visualOdometryData.z
				};
			};

			this.initVisualOdometry = function(){
				if(Util.isNativeEnv()){
					nativeInterface.initVisualOdometry();
				} else {
					console.warn("Cannot call initVisualOdometry in the browser environment");
				}
			};

			this.restartVisualOdometry = function(){
				if(Util.isNativeEnv()){
					nativeInterface.restartVisualOdometry();
				} else {
					console.warn("Cannot call restartVisualOdometry in the browser environment");
				}
			};


			this.stopVisualOdometry = function(){
				if(Util.isNativeEnv()){
					nativeInterface.stopVisualOdometry();
				} else {
					console.warn("Cannot call stopVisualOdometry in the browser environment");
				}
			};

			this.clearDevicePosition = function(){
				motionData.pos.x = 0;
				motionData.pos.y = 0;
				motionData.pos.z = 0;
			};

			this.clearDeviceVelocity = function(){
				motionData.vel.x = 0;
				motionData.vel.y = 0;
				motionData.vel.z = 0;
			};


			// 目標角度を現在角度にリセット
			this.resetSumRotation2D = function(){
				sumRotation2dDestination = sumRotation2d; 
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

	      				if(onConnected){
		
		        			onConnected(myId);

	      				}
	      			
	      			}

	    		});
	    
	    		// message.from
	    		socket.on('message', function(message) {
	    			
	    			if(onMessage){		
	    			
	    				onMessage(message);
	    			
	    			}	
	    		});

	    		socket.on('join', function(message) {
	    			console.log("join");	
	    		});

	    		socket.on('disconnect', function() {
	    			
	    			isConnected = false;


	    			if(onDisconnected){

		    			onDisconnected();

	    			}
	    		
	    		});
			};

			// message.sendto
			this.WSpost = function(message){
				
				socket.emit('message', message);
			
			};

			this.WSisConnected = function(){
				return isConnected;
			};

			this.WSdisconnect = function(){
				socket.disconnect();
			};

		}).call(this);

		/*
			IF 同じで console, socket , rtc に対応(送信 + 受信)
		*/
		(function stream(){
			
			const MESSAGE_TYPE = {
				LOG: 1,
				WARN: 2,
				ERROR: 3,
				MAP: 4,
				ARDUINO: 5
			};

			function StreamBase(){
			
			}

			StreamBase.prototype = {
				log: function(l){
					this.push();
				},
				warn: function(w){

				},
				error: function(message, file, line, col, error){

				},
				map: function(mine, distance){

				},
				arduino: function(){

				},
				MESSAGE_TYPE: MESSAGE_TYPE
			};
			
			this.ConsoleStream = function(){
				
				instance.ConsoleStream.base(this, 'constructor');

				this.log = function(l){
					this.push(l);
				};

				this.warn = function(w){
					this.push(w);
				};

				this.error = function(e){
					this.push(e)
					console.trace();
				};

				this.push = function(a){
					console.log("catch " + a);
				};

				setupStream(this);
			
			};
			
			Util.inherits(this.ConsoleStream, StreamBase);


			this.SocketStream = function(WSUrl){
				
				instance.SocketStream.base(this, 'constructor');

				var onmessageDispatcher = new EventDispatcher();


				this.startStream = function(){

					var WSRoomName = "androino-stream";
		
					instance.WSinit(WSUrl, WSRoomName, function(message){
						
						onmessageDispatcher.dispatchEvent(message);
						
					});
				};

				this.endStream = function(){
					this.WSdisconnect();
				};

				this.log = function(l){
					this.postMessage({
						type: MESSAGE_TYPE.LOG,
						value: l
					});
				};

				this.warn = function(l){
					this.postMessage({
						type: MESSAGE_TYPE.WARN,
						value: l
					});
				};

				this.error = function(message, file, line, col, error){
					this.postMessage({
						type: MESSAGE_TYPE.ERROR,
						message: message,
						file: file,
						line: line,
						col: col,
						error: error
					});
				};

				this.map = function(mine, distance){
					this.postMessage({
						type: MESSAGE_TYPE.MAP,
						mine: mine,
						distance: distance
					});
				};

				this.postMessage = function(obj){
					instance.WSpost(obj);
				};


				this.onMessage = function(type, func){
					onmessageDispatcher.addEventListener(type, func);
				};

				setupStream(this);

			};

			Util.inherits(this.SocketStream, StreamBase);

			this.RTCStream = function(){

			};

			/* 
			console , error handling
			*/
			function setupStream(stream){
				window.onerror = function (message, file, line, col, error) {
				/*	console.log(message);
				*/
					console.error(`${file}:${line} ${col}`);
					console.error(error);
					
					stream.error(message, file, line, col, error);
					return false;
				};

				var consoleLog = console.log;
				var consoleWarn = console.warn;
				var consoleError = console.error;
		/*
				console.log = function(l){
					stream.log(l)
				};

				console.warn = function(w){
					stream.warn(w);
				};

				console.error = function(e){
					stream.error(e);
				};
		*/

			};

		
		
		}).call(this);



	}

	return AndroidService;

})();
