function Slam(mapContainer){

	this.mapView = new SlamView(mapContainer);

	var myEstPosition = {
		x: 0,
		y: 0
	};

	var myEstRotation = 0;


	this.addSeenPoint = function(depth){
		this.addPoint({
			x: myEstPosition.x + depth * Math.cos(myEstRotation), 
			y: myEstPosition.y - depth *Math.sin(myEstRotation)
		});
	};

	this.addPoint = function(position){

		this.mapView.addPoint(position);
		
	};

	this.move = function(position, rotation){

		myEstPosition.x = position.x;
		myEstPosition.y = position.y;
		myEstRotation = rotation;
		this.mapView.updateMine(myEstPosition, myEstRotation);

	}

}