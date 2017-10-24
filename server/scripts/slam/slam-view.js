function SlamView(container){

	var renderer, scene, camera, controls, mine, points;

	var sc_width = document.body.clientWidth;
	var sc_height = 300;
	const cameraParams ={
		fov: 55,
		near: 0.5,
		far: 3000000
	}

	const scale = 0.1; // (cm)

	function initScene(){

		THREE.LinearMipMapLinearFilter = 1008;	

		renderer = new THREE.WebGLRenderer({antialias: false});
		
		renderer.setPixelRatio( sc_width/ sc_height );
		renderer.setSize(sc_width, sc_height);

		container.appendChild( renderer.domElement );

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( cameraParams.fov,  sc_width/ sc_height, cameraParams.near, cameraParams.far );
		camera.position.set(100.0, 50.0, 290.0);
			
		// control
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.enablePan = true;
		controls.minDistance = 10.0;
		controls.maxDistance = 5000.0;
		controls.maxPolarAngle = Math.PI * 0.495;
		controls.target.set( 0,0,0);

		// lights
		scene.add( new THREE.AmbientLight( 0xcccccc ) );

		var light = new THREE.DirectionalLight( 0xffffbb, 1 );
		light.position.set( - 1, 30, - 1 );
		scene.add( light );

		// my object
		mine = new THREE.Group();
		var geometry = new THREE.BoxGeometry( 16, 10, 10 );
		var material = new THREE.MeshBasicMaterial( {color: 0x4041d0} );
		var b = new THREE.Mesh( geometry, material );
		mine.add(b);

		var dir = new THREE.Vector3( 1, 0, 0 );
		var origin = new THREE.Vector3( 8, 1, 0 );
		var length = 6;
		var arrowHelper = new THREE.ArrowHelper( dir, origin, length, 0xff0000);
		arrowHelper.scale.set(2,2,2);
		mine.add( arrowHelper );
		mine.position.set(0,5, 0);

		scene.add( mine );

		// plane
		var plane =  new THREE.Mesh(                                      
            new THREE.PlaneGeometry(1000, 1000, 1, 1),
            new THREE.MeshLambertMaterial({ 
            color: 0x333333
        }));        
        plane.rotation.set(-Math.PI / 2.0, 0, 0);
        scene.add(plane);

     

        // points
		points = new THREE.Group();
		scene.add(points);
	}

	initScene();

	function createPointObj(position){
		
		var geometry = new THREE.SphereGeometry( 5, 3.2, 3.2 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		var sphere = new THREE.Mesh( geometry, material );
		sphere.position.set(position.x * scale , 5.0, position.y * scale);
		sphere.scale.set(0.1, .1, .1);
		return sphere;
		
		var geometry = new THREE.BoxGeometry( 200, 2, 2 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		var cube = new THREE.Mesh( geometry, material );
		cube,position.set(position.x * scale , 5.0, position.y * scale);
		return cube;
	}
	

	SlamView.prototype.update = function(){

		controls.update();

		renderer.render( scene, camera );

	};

	SlamView.prototype.addPoint = function(position){
		
		points.add(createPointObj(position));

	};

	SlamView.prototype.updateMine = function(position, rotation){

		mine.position.set(position.x * scale , 5.0, position.y * scale);

		mine.rotation.set(0, rotation, 0);

	}

	SlamView.prototype.clearPoints = function(){
		var len = points.children.length;
		for(var i = len-1; i >=0; i--){
			var point = points.children[i];
			points.remove( point );
			point.geometry.dispose();
			point.material.dispose();
			//point.texture.dispose();
		}
	};	

}

