function DroinoBase(){
	
	this.arduino = new Arduino();
	this.androidService = new AndroidService();
	
	this.props = {};	

	this.addEventListener = function(eventType, func){

	}

	this.wait = function(time, func){
		setTimeout(func, time);
	}

}