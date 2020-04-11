/*

  game.js

  author: Kristoffer Gustavsson, aka. Nopy
  tweet: @qristofer 
  
*/

let tick=0,last_time = 0.,last_frame = 0.,frame = 0;

function boulder(x,y,r)//todo... use sin cos, ran() for radius and angle tweend poins
{
	let v=[]//[[20,-10],[0,20],[-20,-10]]
	for(let j=0; j<100; ++j)
		v[j] = [ran()*r,ran()*r]
	shape_proc(v)

	let b = c_Add()
	vset(b.p,x,y)
	c_SetHull(b,v)
	b.m = 0;
}

function game_reset()
{
	rb=[]//.length=0;

	//boulder(0,-500,500)
	for(let i=1;i<=16;++i)
	{
		let b = c_Add()
		vset(b.p, i*50, ran()*100+-100 )
		vset(b.v, ran(),ran())
		let v=[]//[[20,-10],[0,20],[-20,-10]]
		for(let j=0; j<16; ++j)
			v[j] = [ran()*35,ran()*35]
		v = shape_proc(v);
		
		c_SetHull(b,v);
	}
/*
	let dude = c_Add();
	let v = shape_proc([[-4,-8],[+4,-8],[+4,+8],[-4,+8]])
	c_SetHull(dude,v)
	vset(dude.p,0,0);
	dude.w = 0;
	dude.m*=.5;
*/
}


function game_update()
{
	/*
	
	if( keyp(KR) )
		game_reset();
	let a = vset(V0,key(RIGHT)-key(LEFT), key(UP)-key(DOWN) )
	//c_Impulse( dude, vset(V1,0,1), a ) 
	vads(dude.v,dude.v,a,.2)


	dude.w = 0;
	dude.a = 0;
	*/
	//dude.w -= a[0]*.005
	/*
	if( keyp(SPACE))//fire shoot blam
	{
		let b = c_Add()
		c_SetHull(b,rect)
		vads(b.p,dude.p,dude.d, dude.r + b.r )
		vscale(b.v,dude.d,2.);
	}
	*/
}
let PIN = undefined
function r_update()
{
	rid = undefined

	ct.setTransform(1,0, 0,1, 0,0);
	//ct.clearRect(0,0,W,H);
	ct.fillStyle = '#c44';
	ct.fillRect(0,0,cv.width,cv.height);

	ct.fillStyle = '#0f0'
	//ct.fillRect(mx-2,my-2,5,5); 
	//pg_Draw();
	//ct.setTransform(1,0,0,1,0,0);
	//plane.length = 0
	//
	let S = 1
	ct.setTransform(S,0,
					0,-S, 
					//-dude.p[0]*S + (W*.5), 
					//dude.p[1]*S + (H*.5))
					0,0)//W*.5,H*.5)

	let wx = mx , wy = - my
	//ct.fillRect(wx-2,wy-2,5,5);
	

	game_update();
	
	if(butp(0)){
		PIN = c_TryPin(wx,wy)
	}else if(PIN !== undefined ){
		if(!but(0)){
			c_PinRemove(PIN),PIN=undefined;
		}else{
			vset( PIN.p, wx,wy );
		}
	}
	//else PIN = undefined;

	c_Step();
	c_Draw();

	++frame 
	++tick 
	/*
	{
		let t = Date.now()/1e3
 		let d = t-last_time
		$('framerate').innerHTML = (((d*1000)|0)/1000).toString()
		last_time = t 
	}
	*/
	rid = requestAnimationFrame( r_update, cv ) ;
}

function resize()
{
	cv.width = cv.clientWidth
	cv.height = cv.clientHeight
	plane[0] = [0,+1,cv.height-2]
	plane[1] = [+1,0,-2]
	plane[2] = [-1,0,cv.width-2]
	plane[3] = [0,-1,-2]

}



//setup other stuff?
let cv = $("cv")
let ct = cv.getContext('2d');
window.addEventListener('resize', resize, false);
resize()
game_reset();
//request 
let rid = requestAnimationFrame( r_update, cv ) ;


