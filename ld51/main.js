/*

 game.js
 
*/
let mouse_x = 0;
let mouse_y = 0;
let mouse_nx = 0;
let mouse_ny = 0;
let mouse_down = false;

let G = {
	tick: 0,
	state: 0
};
function game_step()
{
	switch( G.state ) {
	case 0:
		state = 1 ; 
		break;
	case 1:

		break;
	}

	++G.tick;
}

function game_render(ST)
{

	ct.clearRect(0,0,cv.width,cv.height);
	ct.fillStyle = '#fff';
	ct.fillRect(100,100,200,200);


}


/*

  main.js

  
*/

let cv,ct,rid;
let tick=0,last_time = 0.,last_frame = 0.,frame = 0 ;

// let img = new Image();
// img.src = "tex.png";

// let suit = new Image();
// suit.src = "suit.png";


let last_t=now();

function r_update()
{
	rid = undefined;

	const pHz = 150;//144
	const ONE_TICK = 1./pHz;
	let cur = now();
	let pass = cur - last_t;
	let num = floor(pass*pHz);///ONE_TICK);
	let rest = pass-num*ONE_TICK;
	if( num > 0 )//?? REMOVE BS?
	{
		last_t = cur - rest ;
		for( num = min( num, 3 ); num--; ++tick )
			game_step();
	}

	game_render( rest * pHz);
	++frame;
	rid = requestAnimationFrame( r_update, cv ) ;
}






/*

  

*/
function init()
{
	cv = document.getElementById("canvas");
	ct = cv.getContext('2d');

	cv.addEventListener('contextmenu', (e) => {	e.preventDefault();	})
	cv.addEventListener('mousemove', function(e) {
		var rect = cv.getBoundingClientRect();
		mouse_x = e.clientX - rect.left ;
		mouse_y = e.clientY - rect.top ;
		
		mouse_nx = mouse_x / rect.width
		mouse_ny = mouse_y / rect.height
	}, false);
	cv.onmousedown = function(e){	mouse_down = true;	}
	cv.onmouseup = function(e){	mouse_down = false;	}
	
	function resize()//resolution
	{
		if( 0 ) // low-rez mode  
		{
			const H = 360
			cv.width = 0|(H*cv.clientWidth)/cv.clientHeight;
			cv.height = H
		}else { // full resolution
			
			cv.width = cv.clientWidth;
			cv.height = cv.clientHeight;
		}
	}
	window.addEventListener('resize', resize, false);
	resize();
	//ct.imageSmoothingEnabled = false;
	rid = requestAnimationFrame( r_update, cv ) ;
}

init();

