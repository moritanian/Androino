/*
	slam.js
	author: moritanian 
	
	## location estimation
	output:
		- x
		- y
		- rotation

	input:
		- rotation
		- depth
		- image
		- motorL
		- motorR

	# TODO モータ出力と速度の関係の統計データ解析

	## point データ
	- pos{x, y}
	- distance
	- accuracy (of mine position)
	
	distance と accuracy (of mine pos) からpoint のaccuracy をだす
	ある程度データたまったら形状推定

	時刻tでのdepth計測 と 時刻 t+dt でのdepth 計測から移動量を補正したい
	
	
*/
function Slam(mapContainer){

	if(mapContainer){
		this.mapView = new SlamView(mapContainer);
	}

	var myEstPosition = {
		x: 0,
		y: 0,
		z: 0
	};

	var depthSensor = {
		x: 0,
		y: 0,
		z: 0,
		rot: 0
	};

	var myEstRotation = 0;


	this.setDepthSensorLocation = function(pos, rot){
		depthSensor.x = pos.x || 0;
		depthSensor.y = pos.y || 0;
		depthSensor.z = pos.z || 0;
		depthSensor.rot = rot;
	};

	this.addSeenPoint = function(depth){
		this.addPoint({
			x: myEstPosition.x + Math.cos(myEstRotation) * depthSensor.x + Math.sin(myEstRotation) * depthSensor.z - depth * Math.sin(myEstRotation + depthSensor.rot), 
			z: myEstPosition.z - Math.sin(myEstRotation) * depthSensor.x + Math.cos(myEstRotation) * depthSensor.z - depth * Math.cos(myEstRotation + depthSensor.rot)
		});
	};

	this.addPoint = function(position){

		if(this.mapView)
			this.mapView.addPoint(position);
		
	};

	function update(rotation, depth, motorData, odometryData){

	};

	this.newRotation = function(rotation){
		myEstRotation = rotation;
	}

	this.move = function(position, rotation){

		myEstPosition.x = position.x;
		myEstPosition.y = position.y;
		myEstPosition.z = position.z;
		myEstRotation = rotation;
		if(this.mapView)
			this.mapView.updateMine(myEstPosition, myEstRotation);

	};

	this.newOdometryData = function(odometryData){
		myEstPosition.z +=   odometryData.z * Math.cos(myEstRotation); //odometryData.x * Math.cos(myEstRotation);//
		myEstPosition.x += + odometryData.z * Math.sin(myEstRotation); //odometryData.x * Math.sin(myEstRotation);// 
		if(this.mapView)
			this.mapView.updateMine(myEstPosition, myEstRotation);
	};

	this.getMyEstimatePosition = function(){
		return {
			x: myEstPosition.x,
			y: myEstPosition.y,
			z: myEstPosition.z
		};
	};

}