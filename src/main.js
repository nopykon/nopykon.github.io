//main.js
'use strict';


var log_s='';
function log(){
	var s='';
	for (var i = 0; i < arguments.length; i++) {
		log_s += arguments[i];
	}
	document.getElementById('info').innerHTML = log_s;
}


//make it splash screen
function tmp_init(){}
function tmp_update(){}
function tmp_render(t){	//
	gl.clearColor(.01, sin(now())+1., .01, 1.);
	gl.clear(gl.COLOR_BUFFER_BIT );
	gl_check('tmp_render');

}

//state function pointers 
var update, render,  tick = 0, frame = 0 ; 
var last_t=now(),tii=0,rid=undefined;

/*
var focus = 1;
window.onfocus = function() {
	console.log('focus pokus')
	focus = true;
	if( rid === undefined ) 
		requestAnimationFrame(r_update, cv );
};
window.onblur = function() { //focus lost
	focus = false;
	if( rid !== undefined) 
		window.cancelAnimationFrame(rid), rid = undefined;
	
	var i;
	for(i=0;i<keys.length;++i)keys[i]=0;
	for(i=0;i<buttons.length;++i)buttons[i]=0;
};
*/

var pHz = 60//240//144
var frame_time = now(), frame_count = 0;
var r_update = function()
{
	rid = undefined;
	if(!focus)return;

	//simulate context loss
	/*if(key(KQ)==1)
	{
		gl.getExtension('WEBGL_lose_context').loseContext();
	}*/
	

	//update simulation
	const ONE_TICK = 1./pHz
	var cur = now()
	var pass = cur - last_t
	var num = floor(pass/ONE_TICK)
	var rest = pass-num*ONE_TICK

	if( num > 0 )
	{
		last_t = cur - rest ;
		for( num = min( num, 3 ); num--; ++tick )
			update();
	}

	//check context loss

	//render
	for( var e = gl.getError(); e !== 0 ; e = gl.getError() )
	{
		if( e === gl.CONTEXT_LOST_WEBGL )
			//TODO: handle this
			console.log("(pre render) (LOST CONTEXT) GL ERROR:", e );
		else
			console.log("(pre render) GL ERROR:", e );
	}
	
	render( rest * pHz);
		 
	gl_check('post render')
	++frame;

	/*
	//framerate
	cur = now();
	var dur = cur - frame_time ;
	++frame_count;
	if( dur > 2. )
	{
		//console.log('FPS:',frame_count/dur ) ;
		$('framerate').innerHTML = '<HHH>'+(floor(100.*frame_count/dur)/100.).toString() + '</HHH>';
		frame_time = now();
		frame_count = 0;
	}
	*/
	//if(rid === undefined )
	//r_update();
	rid = requestAnimationFrame( r_update, cv ) ;


	
}

/*var raf  = //redraw inteval function
	raf = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	null ;*/


function init() 
{

	
	gl = cv.getContext('webgl');//,{antialias:false})
	/*, {
	gl = cv.getContext()'webgl',{antialias:false})/*, {
		alpha: false,
		premultipliedAlpha: false,
		depth: true,
		stencil: false
		//antialias: false
		//preserveDrawingBuffer: true//slow af
	} );*/
	
	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = cv.getContext('experimental-webgl');
		return ;
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
		return ;
	}


	cv.addEventListener('webglcontextlost', function(e) {
		console.log('CONTEXT LOST!', e )
		console.log(e); 
		e.preventDefault();

		//don't call r_update again until context is restored
		if( rid !== undefined )
			window.cancelAnimationFrame(rid);
		
	}, false);
	

    var ext = gl.getExtension("OES_standard_derivatives");
	if( ext  ) 
		gl.hint(ext.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, gl.FASTEST );
	
  	function resize_canvas ()
  	{
		// Lookup the size the browser is displaying the canvas.
		var displayWidth  = cv.clientWidth;
		var displayHeight = cv.clientHeight;
		
		if(0)//retro
		{
			var rh = 360 ;//240 ;//192 ; 
  			cv.width = 0| ((rh*displayWidth) / displayHeight )  ;
  			cv.height = rh ;
		}
		else
		{
			cv.width = displayWidth
			cv.height = displayHeight ;
		}
		
		gl.viewport(0,0, cv.width,cv.height);	
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		//console.log('w, h = ', cv.width, cv.height ); 
  	};

  	resize_canvas();
    window.addEventListener('resize', resize_canvas, false);
    //window.addEventListener('keydown', kbd, false);
    //window.addEventListener('keyup', kbu, false);

	// set initial state 
	update = gta_update ; 
	render = gta_render ; 
	
	gta_init();

	gl.enable( gl.CULL_FACE ) ;
	gl.enable( gl.DEPTH_TEST ) ;

	r_update();
	//gl.disable( gl.DEPTH_TEST ) ;
	

	

	/*

	//game_init();
	//log('game initiated!<br>')
	if(raf===null)
	{
		window.setInterval(r_update,1000/60);
	}
	else
	{

		var raf_func = function()	{
			r_update()
			raf( r_anim );
		};
		
		raf( raf_func );
	}*/
}


init();

