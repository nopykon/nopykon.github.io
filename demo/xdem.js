// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// @language_out ECMASCRIPT_2018
// ==/ClosureCompiler==


//mouse buttons
function msd(e){buttons[e.button]=tick;}
function msu(e){buttons[e.button]=0;}

//keys, buttons and cursor
var mx = 0, my = 0; 
var buttons=[];
function but(i){return buttons[i]?1:0;}
function butp(i){return buttons[i]==tick?1:0;}

function mousemove(e)
{ 
	mx = e.clientX - cv.offsetLeft + window.pageXOffset 
	my = e.clientY - cv.offsetTop + window.pageYOffset 
	//console.log(mx,my)
}

document.addEventListener("mousemove", mousemove, false);
document.addEventListener("mousedown", msd, false);
document.addEventListener("mouseup", msu, false);

/*

  c.js

  A tiny rigid body physics engine suitable for js13k

  author: Kristoffer Gustavsson, aka. Nopy, @qristofer
  e-mail: kristoffer@cinnemark.se

*/

var sqrt = Math.sqrt, 
	cos = Math.cos,
	sin = Math.sin,
	abs = Math.abs,
	min = Math.min,
	max = Math.max,
	pow = Math.pow,
	PI = Math.PI,
	TAU = Math.PI*2
function fract(x){ return x%1.}
function clamp(x,a,b){ return x<a?a:x>b?b:x }
function ran(){ return Math.random()*2-1; }

//object recycling 
var V0=[0,0,0,0],V1=[0,0,0,0],V2=[0,0,0,0],V3=[0,0,0,0]
var R0=[0,0,0,0],R1=[0,0,0,0],R2=[0,0,0,0],R3=[0,0,0,0]

function vset(v,x,y) { return v[0]=x, v[1]=y, v }
function vadd(d,a,b){ return d[0]=a[0]+b[0], d[1]=a[1]+b[1], d }
function vads(d,a,b,s){ return d[0]=a[0]+b[0]*s, d[1]=a[1]+b[1]*s, d }
function vsub(d,a,b){ return d[0]=a[0]-b[0], d[1]=a[1]-b[1], d }
function vdot(a,b){ return a[0]*b[0]+a[1]*b[1] }
function vcross(a,b){ return a[0]*b[1]-a[1]*b[0] }
function wcross(d,v,s){ return d[0]=-v[1]*s, d[1]=v[0]*s,d }
function vscale(d,v,s){return d[0]=v[0]*s, d[1]=v[1]*s,d }
function vcpy(d,s){ return d[0]=s[0],d[1]=s[1],d }
function vneg(d,s){ return d[0]=-s[0],d[1]=-s[1],d }

function vswap(a,b){vcpy(R0,a),vcpy(a,b),vcpy(b,R0)}//why not just swap objects?
//function vswap(a,b){var tmp=a;a=b;b=tmp;}

function vrot(d,a,b){
	d[0] = a[0]*b[0] - a[1]*b[1];
	d[1] = a[1]*b[0] + a[0]*b[1];
	return d
}
function vrotDX(d,a,b){
	d[0] = a[0]*b[0] + a[1]*b[1];
	d[1] =-a[1]*b[0] + a[0]*b[1];
	return d
}

/*

  SHAPES

*/
function giftwrapsort(v) //ensure shape is convex
{
	var best=0,q=V0,a=vset(V1,0,-1),sz,i
	for(i=1;i<v.length;++i)
		if(v[i][0]>v[best][0])
			best = i;
	
	vswap(v[0],v[best]);
	for(sz=1;;++sz){
		for( best=-1, i=sz; i<v.length; ++i )
			if( vcross(vsub(q,v[i],v[sz-1]),a) > 0.0 ) //ax*by - ay*by
				vcpy(a,q),best=i;
		
		if( best == -1 )
			return sz;
		
		vswap(v[sz],v[best]);
		vsub(a,v[0],v[sz]);
	}
}
function shape_proc( v )//, wrap ) 
{
//	if(wrap)
		v.length = giftwrapsort(v);
	
	var i,A,tA=0,a=v[v.length-1],b=v[0],c=vset(V0,0,0)
	for(i=0;i<v.length;++i,a=b,b=v[i])
	{
		A = vcross(a,b);
		tA += A ;
		vads(c,c,a,A);
		vads(c,c,b,A);
	}

	//adjust
	vscale(c,c,1/(tA*3)) ;
	for(i=0;i<v.length;++i)
		vsub(v[i],v[i], c ) ;
	
	//find radius
	var rmax = 0, rr;
	for(i=0;i<v.length;++i)
		if( (rr=vdot(v[i],v[i])) > rmax )
			rmax=rr ; 
	
	v.r = sqrt(rmax)
	v.m = tA*.5;
	return v
}
//diabox = [[10,0],[0,10],[-10,0],[0,-10]]
rect = shape_proc([[-20,-10],[20,-10],[20,10],[-20,10]])
cube = shape_proc([[-12,-12],[12,-12],[12,12],[-12,12]])
octo = shape_proc([[10,0],[7,7],[0,10],[-7,7],[-10,0],[-7,-7],[0,-10],[7,-7]])

function c_SetHull(B,v){
	B.V = v;
	B.r = v.r
	B.m = v.m
}

/*

  rigid bodies

*/
var rb=[];
//var srb=[];//static bodies
var plane=[[0,1,100]];
var gravity=[0,-.1];

function c_Add()
{
	var b = {
		p:[0.,0.],
		v:[0.,0.],
		d:[1.,0.],
		a:0.,
		w:0.,//ran()*.1,
		pp:[0,0],
		locked:false
	}
	c_SetHull(b,cube);
	rb.push(b)
	return b;
}

var pin=[]
function c_Pin(b,x,y)
{
	var c = vset([],x,y)
	var m = vsub(V1, c, b.p)
	var P = {B:b, p:c, r:vrotDX([],b.d,m)};
	pin.push(P)
	return P
}
function c_PinRemove(p){ 
	var i = pin.indexOf(p)
	if( i>-1 )
		pin.splice(i,1)
}

function c_PinStep()
{
	for(var i=0;i<pin.length;++i)
	{
		var P = pin[i]
		var B = P.B
		var pt = vrot(V0, B.d, P.r)
		var v = wcross(V1, pt, B.w )
		vadd(v,v,B.v)
		
		var d = vadd(V2,pt,B.p) 
		vsub(d,P.p,d);
		//vads(B.p,B.p,d,.5);
		vsub(v,d,v)
		vscale(v,v,.5);

		c_Impulse(B,pt,v);
		
	}
}

function pt_hull(V,p)
{
	var a=V[V.length-1],b=V[0],j=0
	for( ;j < V.length &&
		 vcross(vsub(R1,p,a),vsub(R0,b,a)) < 0; ++j,a=b,b=V[j]);
	return j == V.length;
}

function c_TryPin(x,y)
{
	var c = vset(V0,x,y);
	for( var i=0;i<rb.length;++i)
	{
		var B = rb[i]
		var m = vsub(V1, c, B.p)
		var r = vrotDX(V2,B.d,m)
		if(pt_hull(B.V,r))
			return c_Pin(B,x,y);
	}
	return undefined
}

function c_Remove(){}

function c_Impulse(	B,pt,F )
{
	vadd(B.v,B.v,F);
	var rr = B.r*B.r
	var iI = .5/rr ;
	B.w += iI * vcross(pt,F);//(x*Fy - y*Fx)
}

function closest_point( v, d, SMIN )
{
	var s,best=v[0];
	var smin=vdot(d,v[0])
	for(var i=1;i<v.length;++i)
		if( (s=vdot(d,v[i])) < smin )
			smin=s, best = v[i]
	SMIN[2] = smin
	return best
}

function c_Step()
{

	c_PinStep();

	for(var i=0;i<rb.length;++i)
	{
		var B = rb[i] ;

		vadd(B.p,B.p,B.v);
		/*
		var vv = vdot(B.v,B.v)
		if( isFinite(vv) && !isNaN(vv) )
		{
			vads(B.v,B.v,B.v,-vv *.001 );///B.m*.5 );
		}*/
		vscale(B.v,B.v,.99);
		if(B.m)
			vadd(B.v,B.v,gravity);

		B.a+=B.w
		vset(B.d,cos(B.a),sin(B.a))
		/*vset(V0,cos(B.w),sin(B.w))//
		  vrot(V1,B.d,V0);
		  vscale(B.d,V1,1./sqrt(vdot(V1,V1)))*/

	}

	//rbrb
	for(var i=0;i<rb.length-1;++i)
		for(var j=i+1;j<rb.length;++j)
			collide(rb[i],rb[j]);
	
	//rbp rb planes 
	for(var i=0;i<rb.length;++i)
	{
		var B = rb[i] ;
		if(B.m > 0.)
		for(var j=0; j<plane.length; ++j)
		{
			var P = plane[j] ; 
			var Qs = vdot(B.p,P) + P[2] 
			if( Qs < B.r ) 
			{

				//unrotate
				vrotDX(V0,B.d,P)
				var best = closest_point( B.V, V0, V1 ),
					smin = V1[2] + Qs
				
				if( smin >= 0. )
					continue;
				
				var pt = vrot(V0,B.d,best);
				var v = wcross(V1,pt,B.w)
				vadd(v,v,B.v);
				var dp = vdot(P,v);
				
				//normal force
				var nf = -min(dp,0.)*.5 - smin*.1

				//friction force
				vads(v,v,P,-dp);
				var ff = vdot(v,v) < .1 ? 1. : .05//-1./(1.-smin);

				//var ff = .25
				var F = vscale(V2,P,nf);
				vads(F,F,v,-ff);
				c_Impulse(B,pt,F);

				//teleport
				vads(B.p,B.p,P,-smin*.7);
			}
		}
	}
}

function smallest_axis(n_max,v_max,A,B,smax)
{
	//create A's frame 
	var Q = vrotDX(V0,A.d,B.d);
	var Qp = vrotDX(V1,A.d,vsub(V2,B.p,A.p));//m

	//iterate B's planes
	for(var i=0,a=B.V[B.V.length-1],b=B.V[0]; i<B.V.length; ++i,a=b,b=B.V[i])
	{
		//normal
		var N = vset(V2, b[1]-a[1], a[0]-b[0] );
		//vscale(N,N,1./sqrt(vdot(N,N)) )
		var d = vrot(V3,Q,N);
		
		var cp = closest_point( A.V, d, V3 )
		var ds = vdot(N,a) + vdot(d,Qp)
		
		var smin = V3[2] - ds
		
		if( smin >= 0 )//gap found
			return 1.;

		//projecting
		var dd = vdot(N,N);
		var dv = vscale(V2, d, smin/dd );//overlap 
		var nn = vdot(dv,dv)

		if( nn < smax*smax )
		{
			var len = sqrt(nn)
			smax = -len 
			vscale(n_max,dv,1./-len );
				//vcpy(n_max,d);
			vcpy(v_max,cp);
		}
	}
	return smax
}

function collide(A,B)
{
	if( 0==A.m+B.m )
		return
	//radius check
	vsub(V0,B.p,A.p)
	if(vdot(V0,V0) >= (B.r+A.r)*(B.r+A.r) )
		return;
		
	var n=R0,v=R1,N=R2,p=R3,smax,bmax

	if( (bmax=smallest_axis(n,v,B,A, -99999.)) >= 0. ||
		(smax=smallest_axis(n,v,A,B, bmax)) >= 0. )
		return ;
	
	if( smax > bmax ){
		vrot(p,A.d,v) 
		vadd(p,p,A.p);
		vrot(N,A.d,n) 
		vneg(N,N);
	}else{
		vrot(p,B.d,v);
		vadd(p,p,B.p);
		vrot(N,B.d,n);
	}

	//calculate impulses
	var ap = vsub(V0,p,A.p);
	var bp = vsub(V1,p,B.p);
	var av = vadd(V2,wcross(V2,ap,A.w),A.v);
	var bv = vadd(V3,wcross(V3,bp,B.w),B.v);
	var v = vsub(V2,bv,av)

	var dp = vdot( N,v)
	var nf = -min(0.,dp) - .25*smax

	vads(v,v,N,-dp);

	//var ff = vdot(v,v) <.05 ? 1. : 1.-1./(1.-smax);
	var ff = vdot(v,v) < .1 ? 1. : .05//-1./(1.-smin);

	var F = vscale(V3,N,nf);
	vads(F,F,v,-ff);
	
	if( A.m && B.m ){
		var mr = A.m / ( B.m+A.m)	
		c_Impulse(A,ap,vscale(V2,F, mr-1));
		c_Impulse(B,bp,vscale(V2,F, mr));
		vads(A.p,A.p,N,+smax*.5)//tele
		vads(B.p,B.p,N,-smax*.5)//tele
	}else if( A.m ){
		c_Impulse(A,ap,vneg(V2,F))
		vads(A.p,A.p,N,+smax)//tele
	}else{
		c_Impulse(B,bp,F)
		vads(B.p,B.p,N,-smax)//tele
	}
	

}

function c_Draw()
{

	ct.beginPath()
	
	for( var i=0;i<pin.length;++i)
	{
		var p = pin[i].p;
		ct.moveTo(p[0]-2,p[1]-2);
		ct.lineTo(p[0]+2,p[1]+2);
		ct.moveTo(p[0]+2,p[1]-2);
		ct.lineTo(p[0]-2,p[1]+2);
	}
	ct.stroke();
	
	ct.save();
	
	ct.strokeStyle = 'white'
	ct.fillStyle = '#993333'
	for(var i=0;i<rb.length;++i)
	{
		var B = rb[i] ;
		var vc = B.V.length
		
		ct.save();
		ct.transform( B.d[0],B.d[1], -B.d[1],B.d[0], B.p[0], B.p[1] )
		ct.beginPath();
		
		for(var j=0;j<vc;++j)
			ct.lineTo(B.V[j][0],B.V[j][1]);

	//	if(strok)ct.linemoveTo(B.V[vc-1][0],B.V[vc-1][1]);
		ct.fill();
		ct.restore()
	}
}




/*

  demo.js

  author: Kristoffer Gustavsson, aka. Nopy
  tweet: @qristofer 
  discord: Nopy#7636
  website: qristofer.github.io, nopykon.github.io 
  e-mail: kristoffer@cinnemark.se

  No Going Back

  Atmosphere:0. - 1.
  Velocity: $$$$$$
  AirFriction: $$$$
  Heat: [----------]

  Back To Earth
  Mission Accomplished.
  Now return home cowboy.

  
*/

tick=0,last_time = 0.,last_frame = 0.,frame = 0;

function boulder(x,y,r)//todo... use sin cos, ran() for radius and angle tweend poins
{
	var v=[]//[[20,-10],[0,20],[-20,-10]]
	for(var j=0; j<100; ++j)
		v[j] = [ran()*r,ran()*r]
	shape_proc(v)

	var b = c_Add()
	vset(b.p,x,y)
	c_SetHull(b,v)
	b.m = 0;
}

function game_reset()
{
	rb=[]//.length=0;

	//boulder(0,-500,500)
	for(var i=1;i<=16;++i)
	{
		var b = c_Add()
		vset(b.p, i*50, ran()*100+-100 )
		vset(b.v, ran(),ran())
		var v=[]//[[20,-10],[0,20],[-20,-10]]
		for(var j=0; j<16; ++j)
			v[j] = [ran()*35,ran()*35]
		v = shape_proc(v);
		
		c_SetHull(b,v);
	}

	dude = c_Add();
	var v = shape_proc([[-4,-8],[+4,-8],[+4,+8],[-4,+8]])
	c_SetHull(dude,v)
	vset(dude.p,0,0);
	dude.w = 0;
	dude.m*=.5;

}


function game_update()
{
}
var PIN = undefined
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
	var S = 1
	ct.setTransform(S,0,
					0,-S, 
					//-dude.p[0]*S + (W*.5), 
					//dude.p[1]*S + (H*.5))
					0,0)//W*.5,H*.5)

	var wx = mx , wy = - my
	//ct.fillRect(wx-2,wy-2,5,5);
		
	if(butp(0))
	{
		PIN = c_TryPin(wx,wy)
	}else if(PIN !== undefined ){
		if(!but(0))
			c_PinRemove(PIN),PIN=undefined;
		else
			vset( PIN.p, wx,wy );
	}//else PIN = undefined;

	c_Step();
	c_Draw();

	++frame 
	++tick 
	if(0)
	{
		var t = Date.now()/1e3
 		var d = t-last_time
		$('framerate').innerHTML = (((d*1000)|0)/1000).toString()
		last_time = t 
	}

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


function init()
{
	//setup other stuff?
	cv = $("cv")
	ct = cv.getContext('2d');
	
	window.addEventListener('resize', resize, false);
	resize()
	game_reset(); 
	rid = requestAnimationFrame( r_update, cv ) ; 
}

init();



