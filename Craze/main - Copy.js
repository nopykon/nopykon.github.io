

//math-ish
function project_PixelToWorld( w, x,y){
	let d = mmulv(V0,CT, [(2*x - cv.width) / (2*cv.height),
						  -(2*y - cv.height) / (2*cv.height),
						  -1 ] )//-focal
	let t = CT[3][2] / -d[2] ; 
	ads3(w, CT[3], d, t );
	return w; 
}



/*

 game.js

 DESIGN

 touch & mouse gameplay 

 ads between levels 

*/

let mouse_x = 0;
let mouse_y = 0;
let mouse_nx = 0;
let mouse_ny = 0;
let mouse_down = false;

//game objects
let dudes = []
let items = []
let trash = []

const DUDE_IDLE = 0,
	  DUDE_MOVE = 1,
	  DUDE_AIM = 2,
	  DUDE_FIRE = 3,
	  DUDE_NADE = 4
	  
let dude={
	p:[0,0,0],
	d:[0,1,0],
	vel: 0,
	dst:[0,0,0],
	dst_dir:[0,0,0],
	aim_amount: 0,
	aim_amountv: 0,
	state: DUDE_IDLE,
	time: 0
};

let bullet=[]
function bullet_add( P, D, V ){
	bullet.push( { p:[P[0],P[1],P[2]], d:[D[0],D[1],D[2]], vel: V } );
}
function bullet_step(){

	for( let i=0;i<bullet.length;++i){
		let e = bullet[i];
		ads3( e.p, e.p, e.d, e.vel )
		if( abs(e.p[0]-dude.p[0]) > 4 || abs(e.p[1]-dude.p[1]) > 4 )	{
			if( i < bullet.length-1 )
				bullet[i] = bullet[bullet.length-1]
			bullet.pop()
		}
	}
}

function MTY( d ){
	set3( MT[0], d[1],-d[0],0 );
	cpy3( MT[1], d )
	set3( MT[2], 0,0,1 ); 
}

function bullet_draw(ST)
{
	ct.fillStyle = '#f00'
	//ct.fillRect(4,4,100,100);
	tpovDX(DX,CT,ID);
	for( let i=0;i<bullet.length;++i)
	{
		ct.fillRect(4+i*12,4,10,10);

		let e = bullet[i]
		// MTY( e.d )
		// cpy3(MT[0],ID[0]);
		// cpy3(MT[1],ID[1]);
		// cpy3(MT[2],ID[2]);
		// //ads3(MT[3], e.p,e.d, e.v*ST )
		// cpy3(MT[3], e.p)
		// tpovDX(DX,CT,MT);
		// drawMesh( Seal );
		ads3(V0, e.p,e.d, e.vel*ST ) ; 
		let p = tmulv_DX( V1, DX, V0 )
		//if( cull( p ) )
		{
		 	zdiv(p,p);
			ct.fillRect( p[0]-3,p[1]-3,6,6)
		}

		
		// const Pv = [ [ -.1, -.3, 0],
		// 			 [ +.1, -.3, 0],
		// 			 [ +.1, +.3, 0],
		// 			 [ -.1, +.3, 0]]
		// const Tv = [ [ 0,0], [1,0], [1,1], [0,1] ]

		// const Iv =  [ 4, 0,1,2,3 ]
	}
}

let G = {
	tick: 0,
	state: 0
};

function turn2( r, a, b, t ){
	
	if( dot2(a,b) < -.7071 )
	{
		if( cross2(a,b) > 0 ) {
			r[0] = a[0] + (b[1]-a[1])*t;
			r[1] = a[1] - (b[0]-a[0])*t;
		}else{
			r[0] = a[0] - (b[1]-a[1])*t;
			r[1] = a[1] + (b[0]-a[0])*t;
		}
	}else{
		r[0] = a[0] + (b[0]-a[0])*t;
		r[1] = a[1] + (b[1]-a[1])*t;
	}
	norm(r,r);
} 

function dude_step(e)
{
	const DUDE_ACC = .001;
	const DUDE_VEL = .025;


	if( DUDE_MOVE == e.state )
	{
		//let dst = project_PixelToWorld(V0, mouse_x, mouse_y) ; 
		let m = sub3( V0, e.dst, e.p);
		m[2]=0;
		let mm = dot(m,m);  
		if( mm > .5 ){
			scale3(e.dst_dir,m,1./sqrt(mm))
			e.vel = min( e.vel+DUDE_ACC, DUDE_VEL )
		}
		else
			e.vel = max( e.vel-DUDE_ACC, 0 );
	}else
		e.vel = max( e.vel-DUDE_ACC, 0 );

	if(DUDE_AIM == e.state ){
		let m = sub3( V0, e.dst, e.p);
		m[2]=0;
		let mm = dot(m,m);  
		if( mm > .01 )
			scale3(e.dst_dir,m,1./sqrt(mm)) //could do this on event...
		turn2(e.d, e.d, e.dst_dir, .1 );	
		
		e.aim_amountv = .05*( 1. - e.aim_amount ) ;
	}else if( DUDE_FIRE == e.state ){
	
	}else
		e.aim_amountv = -.05*e.aim_amount ; 
	e.aim_amount += e.aim_amountv;
	
	turn2(e.d, e.d, e.dst_dir, .1 );	
	ads3(e.p, e.p, e.dst_dir, e.vel);
}
function game_step()//G)
{
	dude_step(dude);
	bullet_step()	

	switch( G.state ) {
	case 0:
		state = 1 ; 
		break;
	case 1:

		break;
	}

	++G.tick;
}




function menu_step(){}
function menu_render(ST){}

function intermission_step(){}
function intermission_render(ST){}

	
function game_render(ST)
{
	//ct.setTransform(1,0, 0,1, 0,0);
	ct.setTransform(1,0,
					0,-1,
					0,cv.height);
	ct.save();
	ct.clearRect(0, 0, cv.width,cv.height )///2 )
	
	/*

	  cam setup

	*/
	setFocal( 1. );// * (1-f) + 3 * f )
	
	let yaw =  0;
	let pit = -PI/4;//(4 + sin(now()))
	
	let P = [[1,0,0], [0,cos(pit),sin(pit)],[0,-sin(pit),cos(pit)]]
	let Q = [[cos(yaw),sin(yaw),0],[0,0,1],[sin(yaw),-cos(yaw),0]]
	mmul(CT,Q,P)

	let dam = dude.aim_amount + dude.aim_amountv*ST ;
	ads3(CT[3], dude.p, dude.d, dude.vel*ST + dude.vel*16. + dam )

	//ads3(CT[3], CT[3], dude.d, .5 + .5*sin(now()))
	ads3(CT[3], CT[3], CT[2], 10 );



	tpovDX(DX,CT,ID);
	
	//draw meshi
	{
		tpovDX(DX,CT,ID);
		drawMesh(Terrain, -1);

		// let a=-tick*.0025, s = 1
		// let C = cos(a), S =sin(a)

		// let q = sin(tick*.05)*.025 
		// s -= q
		// q+=1

		let d = dude.d
		MTY(d);
		ads3( MT[3], dude.p,dude.dst_dir, dude.vel );

		tpovDX(DX,CT,MT);
		drawMesh(Dude);
		drawMesh(Shadow);
		
		project_PixelToWorld( MT[3], mouse_x, mouse_y ); 
		tpovDX(DX,CT,MT);
		drawMesh(Shadow);

		// project_PixelToWorld( MT[3], cv.width/2, cv.height/2 );
		// tpovDX(DX,CT,MT);
		// drawMesh(Shadow);
		//
		bullet_draw(ST)

		zlist.sort( zsortf )
		zlist_draw();
	}
	// ct.restore()
	// ct.fillStyle = '#f00'
}


/*

  main.js

  
*/

let cv,ct,rid;
let tick=0,last_time = 0.,last_frame = 0.,frame = 0 ;

let img = new Image();
img.src = "tex.png";

let other = new Image();
other.src = "sprites22.png";


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



let tap_x = 0, tap_y = 0, tap_t = -999, tap_r = -999 ;

let prep_move = false;

function init_game()
{
	cv = document.getElementById("canvas");
	ct = cv.getContext('2d');

	//touchstart
	cv.addEventListener('touchstart', function(e){
		e.preventDefault(); 
		var rect = cv.getBoundingClientRect();
		let x = e.touches[0].clientX - rect.left ;
		let y = e.touches[0].clientY - rect.top ;
		let t = now();
		let w = project_PixelToWorld(V0, x,y );
		let m = sub3( V1, w, dude.p );

		//also check enemies... might want to double tap them...
		//also, should probably be mid-body position.... for better accuracy
		if( dot(m,m) < 1 )	{	
			project_PixelToWorld(dude.dst,x,y);
			dude.state = DUDE_MOVE ;
		}else{
			dude.state = DUDE_AIM;
		}
		tap_x = x;
		tap_y = y;
		tap_t = t;
	});

	//touchmove
	cv.addEventListener('touchmove', function(e){
		e.preventDefault();
		var rect = cv.getBoundingClientRect();
		tap_x = e.touches[0].clientX - rect.left ;
		tap_y = e.touches[0].clientY - rect.top ;
		project_PixelToWorld(dude.dst,tap_x,tap_y); //either aim or move dst
		//dude.is_moving = true ; 
	});

	//touchend 
	cv.addEventListener('touchend', function(e){
		e.preventDefault(); 
		
		if( DUDE_MOVE == dude.state ){
			dude.state = DUDE_IDLE ;
			dude.time = now();
		}else if( DUDE_AIM == dude.state ){
			dude.state = DUDE_IDLE ; //FIRE ... recoil rather
			dude.time = now();
			bullet_add(dude.p,
					   dude.d,
					   .1 )
		}
	});

	cv.addEventListener('touchcancel', function(e){e.preventDefault();	}); //when touch goes outside of play area

	cv.addEventListener('click', function(e){e.preventDefault() } );
	//cv.addEventListener('auxclick', function(e){e.preventDefault(); console.log("RIGHT CLICK"); } );

	cv.addEventListener('contextmenu', (e) => {	e.preventDefault();	 console.log("RIGHT CLICK"); });

	
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

init_game();

