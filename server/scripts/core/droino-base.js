function DroinoBase(){
	
	var _this = this;
	this.arduino = new Arduino();
	this.androidService = new AndroidService();
	
	/*
		props

			state machine style code

		function listener(){
			return ;
		}
	*/
	var propsChangeListener;
	this.setPropsChangeListener = function(listener){
		propsChangeListener = listener;
	};

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

	};

	this.wait = function(time, func){
		setTimeout(func, time);
	};

	this.delayChangeProp = function(time, propName, value){

		var crtPropValue = this.props[propName];
		
		setTimeout(function(){

			if(_this.props[propName] !== crtPropValue){
				return;
			}
			_this.props[propName] = value;
		}, time)
	};

	/*
		queue

			c, c++ style code
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

	};

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

	};

	this.registerQueueTask = function(taskName, func){
		this[taskName] = function(time){
			enqueueTask(taskName, func, time);
		};
	};

	this.queueTaskWhile = function(func){
		taskQueueDispatcher.addEventListener(TaskQueueEvents.EMPTY_QUEUE, function(){
			func(_this);
		});
		func(_this);
	};

	var startEnqueueFunc = function(){
		dequeueTask();
		taskQueueDispatcher.removeEventListener(TaskQueueEvents.ENQUEUE_TASK, 
				startEnqueueFunc);
	};

	taskQueueDispatcher.addEventListener(TaskQueueEvents.EMPTY_QUEUE, function(){

		 taskQueueDispatcher.addEventListener(TaskQueueEvents.ENQUEUE_TASK, startEnqueueFunc);

	});

	taskQueueDispatcher.addEventListener(TaskQueueEvents.ENQUEUE_TASK, startEnqueueFunc);

	/*
		promise 

			js promise style code

			example

			new Asyncable()
				.asyncTask(func)
				.asyncWait(1000)
				.asyncTask(func)
				.asyncWait(10000)
	*/
	this.sleep = function(time) {
	  	return new Promise(resolve => { 
	    	setTimeout(() => { 
	      		resolve();
	   		}, time);
	  	});
	}

	/*
	this.Asyncable = (function(){

		var Asyncable = function(promise){

			var scope = this;
			
			var attachedTaskNames = [];

			if(!promise){
				promise = asyncTask();
			}


			function asyncTask(func){
				return new Promise(function(resolve, reject) {
					if(func){
						func();
					}
	    			resolve();
	    		});
			}

			function asyncWait(delay){
	 			return new Promise(function(resolve, reject){
	        		setTimeout(resolve, delay);
	        	});
			}

			this.asyncTask = function(func){
				var promiseObj = promise.then(function(){return asyncTask(func)});
				return attachTasks(new Asyncable(promiseObj));
			};

			this.asyncWait = function(delay){
				var promiseObj = promise.then(function(){return asyncWait(delay)});
				return attachTasks(new Asyncable(promiseObj));
			};

			this.addAsyncTask = function(taskName, func){
				
				this.addTask(taskName, function(){
					return attachTasks(new Asyncable(new Promise(func)));
				});

				return this;

			};

			this.addSyncTask = function(taskName, func){
				
				this.addTask(taskName, function(){
					return scope.asyncTask(func);
				});

				return this;

			};

			this.addTask = function(taskName, func){

				attachedTaskNames.push(taskName);

				this[taskName] = func;

			}

			function attachTasks(targetObj){

				for(var index in attachedTaskNames){
					var taskName = attachedTaskNames[index];
					targetObj.addTask(taskName, scope[taskName]);
				}

				return targetObj;
			
			}
		}

		return Asyncable;

	})();
	*/

}
