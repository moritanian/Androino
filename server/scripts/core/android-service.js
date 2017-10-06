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
	}

	this.startDeviceCamera = function(){

		if(!camController || !camController.startCamera){
			console.warn("startDeviceCamera is called before device camera initialization. "
				+ "Please call initDeviceCamera");
			
			return;
		}

		camController.startCamera();

	}

	this.stopDeviceCamera = function(){

		//camController.stopCamera();
	
	}

	this.convertDeviceCamera = function(){

		camController.convertCamera();
	
	}

	/*
		device orientation 系	
	*/

	this.deviceOrientation = {};

	var onDeviceOrientationChangeEvent = function( event ) {

		_this.deviceOrientation = event;

    };

    var onScreenOrientationChangeEvent = function() {

    	_this.screenOrientation = window.orientation || 0;

    };

	this.addOrientationListener = function(func){
		
		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

	};

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
