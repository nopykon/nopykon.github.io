/*

  c.js

  A tiny rigid body physics engine suitable for js13k

  author: Kristoffer Gustavsson, aka. Nopy, @qristofer
  e-mail: kristoffer@cinnemark.se

*/

'use strict';

let M = Math,
	sqrt = M.sqrt, 
	cos = M.cos,
	sin = M.sin,
	abs = M.abs,
	min = M.min,
	max = M.max,
	PI = M.PI,
	TAU = M.PI*2,
	fract = a => a%1.,
	clamp = (a,b,c) => a<b?b:a>c?c:a,
	ran = () => M.random()*2-1 ;

//object recycling 
let V0=[0,0,0,0],V1=[0,0,0,0],V2=[0,0,0,0],V3=[0,0,0,0],
	R0=[0,0,0,0],R1=[0,0,0,0],R2=[0,0,0,0],R3=[0,0,0,0] ;

//vec2 functions 
let vset = (d,x,y) => (d[0]=x, d[1]=y, d) ,
	vcpy = (d,s) => (d[0]=s[0],d[1]=s[1],d),
	vswap = (a,b) => (vcpy(R0,a), vcpy(a,b), vcpy(b,R0)),
	vneg = (d,s) => (d[0]=-s[0],d[1]=-s[1],d),
	vadd = (d,a,b) => (d[0]=a[0]+b[0], d[1]=a[1]+b[1], d),
	vads = (d,a,b,s) => (d[0]=a[0]+b[0]*s, d[1]=a[1]+b[1]*s, d),
	vsub = (d,a,b) => (d[0]=a[0]-b[0], d[1]=a[1]-b[1], d),
	vdot = (a,b) => a[0]*b[0]+a[1]*b[1],
	vcross = (a,b) => a[0]*b[1]-a[1]*b[0],
	wcross = (d,v,s) => (d[0]=-v[1]*s, d[1]=v[0]*s,d),
	vscale = (d,v,s) => (d[0]=v[0]*s, d[1]=v[1]*s,d),
	vrot = (d,a,b) => (d[0] = a[0]*b[0] - a[1]*b[1],
					   d[1] = a[1]*b[0] + a[0]*b[1], d),
	vrotDX = (d,a,b) => (d[0]=vdot(a,b), d[1]=vcross(a,b),d) ;

/*

  SHAPES

*/


function giftwrapsort(v) //ensure shape is convex
{
	let best=0,q=V0,a=vset(V1,0,-1),sz,i ;
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

//calc mass, com, radius and adjust points
function shape_proc( v )
{
//	if(wrap)
		v.length = giftwrapsort(v);
	
	let i,A,tA=0,a=v[v.length-1],b=v[0],c=vset(V0,0,0),rmax=0 ; 
	for(i=0;i<v.length;++i,a=b,b=v[i])
	{
		A = vcross(a,b);
		tA += A ;
		vads(c,c,a,A);
		vads(c,c,b,A);
	}

	//adjust points to CoM
	vscale(c,c,1/(tA*3)) ;
	for(i=0;i<v.length;++i)
		vsub(v[i],v[i], c ) ;

	//find max radius
	for(i=0;i<v.length;++i)
		rmax = max(rmax,vdot(v[i],v[i]));
	
	v.r = sqrt(rmax)
	v.m = tA*.5;
	return v
}
let nrect = shape_proc([[-20,-10],[20,-10],[20,10],[-20,10]]),
	cube = shape_proc([[-12,-12],[12,-12],[12,12],[-12,12]]),
	octo = shape_proc([[10,0],[7,7],[0,10],[-7,7],[-10,0],[-7,-7],[0,-10],[7,-7]])

function c_SetHull(B,v){
	B.V = v;
	B.r = v.r
	B.m = v.m
//	B.im = im = 1./B.m
//	B.imoi = .5 / (B.r*B.r) ;???
}

/*

  rigid bodies

*/
let rb=[];
let plane=[[0,1,100]];
let gravity=[0,-.1];
//let objectify = (...) varialb

let _b,c_Add = () => (
	_b = {
		p:[0.,0.],
		v:[0.,0.],
		d:[1.,0.],
		a:0.,
		w:0.,//ran()*.1,
		pp:[0,0],
		locked:false },
	c_SetHull(_b,cube),
	rb.push(_b),
	_b);

let pin=[]
function c_Pin(b,x,y)
{
	let c = vset([],x,y)
	let m = vsub(V1, c, b.p)
	let P = {B:b, p:c, r:vrotDX([],b.d,m)};
	pin.push(P)
	return P
}
function c_PinRemove(p){ 
	let i = pin.indexOf(p)
	if( i>-1 )
		pin.splice(i,1)
}

function c_PinStep()
{
	for(let i=0;i<pin.length;++i)
	{
		let P = pin[i]
		let B = P.B
		let pt = vrot(V0, B.d, P.r)
		let v = wcross(V1, pt, B.w )
		vadd(v,v,B.v)
		
		let d = vadd(V2,pt,B.p) 
		vsub(d,P.p,d);
		//vads(B.p,B.p,d,.5);
		vsub(v,d,v)
		vscale(v,v,.5);

		c_Impulse(B,pt,v);
		
	}
}

function pt_hull(V,p)
{
	let a=V[V.length-1],b=V[0],j=0
	for( ;j < V.length &&
		 vcross(vsub(R1,p,a),vsub(R0,b,a)) < 0; ++j,a=b,b=V[j]){}
	return j == V.length;
}

function c_TryPin(x,y)
{
	let c = vset(V0,x,y);
	for( let i=0;i<rb.length;++i)
	{
		let B = rb[i]
		let m = vsub(V1, c, B.p)
		let r = vrotDX(V2,B.d,m)
		if(pt_hull(B.V,r))
			return c_Pin(B,x,y);
	}
	return undefined
}

function c_Remove(){}

function c_Impulse(	B,pt,F )
{
	vadd(B.v,B.v,F);
	let rr = B.r*B.r
	let iI = .5/rr ;
	B.w += iI * vcross(pt,F);//(x*Fy - y*Fx)
}

function closest_point( v, d, SMIN )
{
	let s,best=v[0];
	let smin=vdot(d,v[0])
	for(let i=1;i<v.length;++i)
		if( (s=vdot(d,v[i])) < smin )
			smin=s, best = v[i]
	SMIN[2] = smin
	return best
}

function c_Step()
{

	c_PinStep();

	for(let i=0;i<rb.length;++i)
	{
		let B = rb[i] ;

		vadd(B.p,B.p,B.v);
		/*
		let vv = vdot(B.v,B.v)
		if( isFinite(vv) && !isNaN(vv) )
		{
			vads(B.v,B.v,B.v,-vv *.001 );///B.m*.5 );
		}*/
		vscale(B.v,B.v,.99);
		if(B.m !== 0.)
			vadd(B.v,B.v,gravity);

		B.a+=B.w
		vset(B.d,cos(B.a),sin(B.a))
		/*vset(V0,cos(B.w),sin(B.w))//
		  vrot(V1,B.d,V0);
		  vscale(B.d,V1,1./sqrt(vdot(V1,V1)))*/

	}

	//rbrb
	for(let i=0;i<rb.length-1;++i)
		for(let j=i+1;j<rb.length;++j)
			collide_rbrb(rb[i],rb[j]);
	
	//rbp rb planes 
	for(let i=0;i<rb.length;++i)
	{
		let B = rb[i] ;
		if(B.m === 0.)
			continue;
			
		for(let j=0; j<plane.length; ++j)
		{
			let P = plane[j] ; 
			let Qs = vdot(B.p,P) + P[2] 
			if( Qs < B.r ) 
			{

				//unrotate
				vrotDX(V0,B.d,P)
				let best = closest_point( B.V, V0, V1 ),
					smin = V1[2] + Qs
				
				if( smin >= 0. )
					continue;
				
				let pt = vrot(V0,B.d,best);
				let v = wcross(V1,pt,B.w)
				vadd(v,v,B.v);
				let dp = vdot(P,v);
				
				//normal force
				let nf = -min(dp,0.);// - smin*.1

				//friction force
				vads(v,v,P,-dp);
				let ff = vdot(v,v) < .1 ? 1. : .05 ; //-1./(1.-smin);
				//ff *= 1. - 1./(1.-smin) ;

				//let ff = .25
				let F = vscale(V2,P,nf);
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
	let Q = vrotDX(V0,A.d,B.d);
	let Qp = vrotDX(V1,A.d,vsub(V2,B.p,A.p));//m

	//iterate B's planes
	for(let i=0,a=B.V[B.V.length-1],b=B.V[0]; i<B.V.length; ++i,a=b,b=B.V[i])
	{
		//normal
		let N = vset(V2, b[1]-a[1], a[0]-b[0] );
		//vscale(N,N,1./sqrt(vdot(N,N)) )
		let d = vrot(V3,Q,N);
		
		let cp = closest_point( A.V, d, V3 )
		let ds = vdot(N,a) + vdot(d,Qp)
		
		let smin = V3[2] - ds
		
		if( smin >= 0 )//gap found
			return 1.;

		//projecting
		let dd = vdot(N,N);
		let dv = vscale(V2, d, smin/dd );//overlap 
		let nn = vdot(dv,dv)

		if( nn < smax*smax )
		{
			let len = sqrt(nn)
			smax = -len 
			vscale(n_max,dv,1./-len );
				//vcpy(n_max,d);
			vcpy(v_max,cp);
		}
	}
	return smax
}


function yesmallest_axis(n_max,v_max,A,B,smax)
{
	//create A's frame 
	let Q = vrotDX(V0,A.d,B.d);
	let Qp = vrotDX(V1,A.d,vsub(V2,B.p,A.p));//m
	

	//iterate B's planes
	for(let i=0,a=B.V[B.V.length-1],b=B.V[0]; i<B.V.length; ++i,a=b,b=B.V[i])
	{
		//normal
		let N = vset(V2, b[1]-a[1], a[0]-b[0] );
		vscale(N,N,1./sqrt(vdot(N,N)) )
		let d = vrot(V3,Q,N);
		
		let cp = closest_point( A.V, d, V3 )
		let ds = vdot(N,a) + vdot(d,Qp)
		let smin = V3[2] - ds
		
		if( smin >= 0 )
			return 1.;

		if( smin > smax )
		{
			smax = smin;
			vcpy(n_max,d);
			vcpy(v_max,cp);
		}
	}
	return smax
}


function collide_rbrb(A,B)
{
	if( 0==A.m+B.m )
		return
	//radius check
	vsub(V0,B.p,A.p)
	if(vdot(V0,V0) >= (B.r+A.r)*(B.r+A.r) )
		return;
		
	let n=R0,v=R1,N=R2,p=R3,smax,bmax

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
	let ap = vsub(V0,p,A.p);
	let bp = vsub(V1,p,B.p);
	let av = vadd(V2,wcross(V2,ap,A.w),A.v);
	let bv = vadd(V3,wcross(V3,bp,B.w),B.v);
	v = vsub(V2,bv,av)

	let dp = vdot( N,v)
	let nf = -min(0.,dp) - .25*smax

	vads(v,v,N,-dp);

	//let ff = vdot(v,v) <.05 ? 1. : 1.-1./(1.-smax);
	let ff = vdot(v,v) < .1 ? 1. : .1 ;//-1./(1.-smin);
	ff *= 1 - 1./(1.-smax);

	let F = vscale(V3,N,nf);
	vads(F,F,v,-ff);
	
	if( A.m && B.m ){
		let mr = A.m / ( B.m+A.m)	
		c_Impulse(A,ap,vscale(V2,F, mr-1));
		c_Impulse(B,bp,vscale(V2,F, mr));
	//	vads(A.p,A.p,N,+smax*.5)//tele
	//	vads(B.p,B.p,N,-smax*.5)//tele
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
	
	for( let i=0;i<pin.length;++i)
	{
		let p = pin[i].p;
		ct.moveTo(p[0]-2,p[1]-2);
		ct.lineTo(p[0]+2,p[1]+2);
		ct.moveTo(p[0]+2,p[1]-2);
		ct.lineTo(p[0]-2,p[1]+2);
	}
	ct.stroke();
	
	ct.save();
	
	ct.strokeStyle = 'white'
	ct.fillStyle = '#993333'
	for(let i=0;i<rb.length;++i)
	{
		let B = rb[i] ;
		let vc = B.V.length
		
		ct.save();
		ct.transform( B.d[0],B.d[1], -B.d[1],B.d[0], B.p[0], B.p[1] )
		ct.beginPath();
		
		for(let j=0;j<vc;++j)
			ct.lineTo(B.V[j][0],B.V[j][1]);

	//	if(strok)ct.linemoveTo(B.V[vc-1][0],B.V[vc-1][1]);
		ct.fill();
		ct.restore()
	}
	/*
	  for(let i=0; i<plane.length; ++i){
	  let P = plane[i] ; 
	  let dx=P[1],dy=-P[0], x=P[0]*-P[2], y=P[1]*-P[2]
	  ct.beginPath();
	  ct.moveTo(x-dx*4000., y-dy*4000.);
	  ct.lineTo(x+dx*4000., y+dy*4000.);
	  ct.stroke();
	  }
	*/
}
