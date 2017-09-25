function DroinoBase(){
	
	var _this = this;
	this.arduino = new Arduino();
	this.androidService = new AndroidService();
	
	/*
		props

		function listener(){
			return ;
		}
	*/
	var propsChangeListener;
	this.setPropsChangeListener = function(listener){
		propsChangeListener = listener;
	}

	this.props = {};	
	var _props = {};

	this.addProp = function(propName){
		
		this.props.__defineGetter__(propName, function() {
			return _props[propName];
		});
		
		this.props.__defineSetter__(propName, function(val) {
  			_props[propName] = val;
  			propsChangeListener();
		});

	}

	this.wait = function(time, func){
		setTimeout(func, time);
	}

	this.delayChangeProp = function(time, propName, value){
		setTimeout(function(){
			_this.props[propName] = value;
		}, time)
	}

	/*
		queue
	*/
	var taskQueue = [];

	var taskQueueDispatcher = new EventDispatcher();

	const TaskQueueEvents = {
		ENQUEUE_TASK: "EnqueueTask",
		DEQUEUE_TASK: "DequeueTask",
		EMPTY_QUEUE: "EmptyQueue"
	};
	
	var enqueueTask = function(taskName, func, time){
		taskQueue.push({"taskName": taskName, 'func': func, 'time' : time});
		taskQueueDispatcher.dispatchEvent({type: TaskQueueEvents.ENQUEUE_TASK});

	}

	var dequeueTask = function(){
		
		if(taskQueue.length ==  0){
			onTaskQueueTimer = false;
			taskQueueDispatcher.dispatchEvent({type: TaskQueueEvents.EMPTY_QUEUE});
			return null;
		}

		var task = taskQueue.shift();
		task['func'](_this);
		setTimeout(dequeueTask, task['time']);

		taskQueueDispatcher.dispatchEvent({type: TaskQueueEvents.DEQUEUE_TASK});

	}

	this.registerQueueTask = function(taskName, func){
		this[taskName] = function(time){
			enqueueTask(taskName, func, time);
		}
	}

	this.queueTaskWhile = function(func){
		taskQueueDispatcher.addEventListener(TaskQueueEvents.EMPTY_QUEUE, function(){
			func(_this);
		});
		func(_this);
	}

	var startEnqueueFunc = function(){
		dequeueTask();
		taskQueueDispatcher.removeEventListener(TaskQueueEvents.ENQUEUE_TASK, 
				startEnqueueFunc);
	}

	taskQueueDispatcher.addEventListener(TaskQueueEvents.EMPTY_QUEUE, function(){

		 taskQueueDispatcher.addEventListener(TaskQueueEvents.ENQUEUE_TASK, startEnqueueFunc);

	});

	taskQueueDispatcher.addEventListener(TaskQueueEvents.ENQUEUE_TASK, startEnqueueFunc);



}