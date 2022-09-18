/*

  main.js

*/
let mouse_x = 0;
let mouse_y = 0;
let mouse_nx = 0;
let mouse_ny = 0;
let mouse_down = false;

let M = Math,sqrt = M.sqrt, cos = M.cos,sin = M.sin,abs = M.abs,min = M.min,max = M.max,pow = M.pow,PI = M.PI,
	TAU = M.PI*2,fract = a => a%1.,	floor = a => M.floor(a),clamp = (a,b,c) => a<b?b:a>c?c:a,
	ran = () => M.random()*2-1,	now = () => window.performance.now()/1e3 ;
	
let set3 = (d,x,y,z) => (d[0]=x,d[1]=y,d[2]=z,d),
	cpy3 = (d,s) => (d[0]=s[0],d[1]=s[1],d[2]=s[2],d),
	neg3 = (d,s) => (d[0]=-s[0],d[1]=-s[1],d[2]=-s[2],d),
	add3 = (d,a,b) => (d[0]=a[0]+b[0],d[1]=a[1]+b[1],d[2]=a[2]+b[2],d),
	sub3 = (d,a,b) => (d[0]=a[0]-b[0],d[1]=a[1]-b[1],d[2]=a[2]-b[2],d),
	mul3 = (d,a,b) => (d[0]=a[0]*b[0],d[1]=a[1]*b[1],d[2]=a[2]*b[2],d),
	ads3 = (d,a,b,t) => (d[0]=a[0]+b[0]*t,d[1]=a[1]+b[1]*t,d[2]=a[2]+b[2]*t,d),
	scale3 = (d,a,s) => (d[0]=a[0]*s,d[1]=a[1]*s,d[2]=a[2]*s,d),
	dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
	cross = (d,a,b) => ( d[0]=a[1]*b[2] - a[2]*b[1],
						 d[1]=a[2]*b[0] - a[0]*b[2],
						 d[2]=a[0]*b[1] - a[1]*b[0],
						 d),
	norm = (d,s) => scale3(d,s, 1/sqrt(dot(s,s)) )


let rnd = (s) => ( s[0] = s[0]+(s[0]<<1)+(s[0]>>1) + 777, s[0])
	
//vec4
let set4 = (d,x,y,z,w) => (d[0]=x,d[1]=y,d[2]=z,d[3]=w,d); 
let cpy4 = (d,s) => (d[0]=s[0],d[1]=s[1],d[2]=s[2],d[3]=s[3],d); 

let V0=[0,0,0,0],V1=[0,0,0,0],V2=[0,0,0,0],V3=[0,0,0,0],
	R0=[0,0,0,0],R1=[0,0,0,0],R2=[0,0,0,0],R3=[0,0,0,0];


let Rv=[]
for(let i=0;i<1024;++i)	Rv[i] = [0.,0.,0.,1.]


function textri(image, vv)
{
	let A = vv[0], B = vv[1], C = vv[2]

    let ax = B[0]-A[0], ay = B[1]-A[1];
    let bx = C[0]-A[0], by = C[1]-A[1];

	if( ax*by - ay*bx < 0 )//cull backface
		return;

    let au = B[2]-A[2], av = B[3]-A[3] ;
	let bu = C[2]-A[2], bv = C[3]-A[3] ;
	
	let r = 1.0 / (au*bv - av*bu) ;
	let a = r*(ax*bv - av*bx);
	let b = r*(au*bx - ax*bu);
	let d = r*(ay*bv - av*by);
	let e = r*(au*by - ay*bu);
	let c = A[0] + a*-A[2] + b*-A[3] ;
	let f = A[1] + d*-A[2] + e*-A[3] ;
	
	ct.save();
	ct.beginPath();
	ct.moveTo(A[0],A[1]);
	for( let i=1;i<vv.length;++i)
		ct.lineTo(vv[i][0],vv[i][1])
	ct.clip();

	ct.transform(a, d,
				 b, e,
				 c, f ) ;
	ct.drawImage(image, 0, 0);
	ct.restore();
}

let inn=[],out=[] ;//,inn_sz,out_sz;
for(let i=0;i<16;++i)inn[i]=[0,0,0,0],out[i]=[0,0,0,0] ; 

let CT = [[1,0,0],[0,0,1],[0,-1,0],[0,-5,1]];
let MT = [[1,0,0],[0,1,0],[0,0,1],[0,0,0]];
let ID = [[1,0,0],[0,1,0],[0,0,1],[0,0,0]];
let DX = [[1,0,0,0],[0,1,0,0],[0,0,1,0]];

function tpovDX(d,a,b)
{
	sub3(b[3],b[3],a[3]);
	for(let i=0;i<3;++i)
		for(let j=0;j<4;++j)
			d[i][j]=dot(a[i],b[j]);
	add3(b[3],b[3],a[3]);
}

function tmulv_DX(d,m,s){
	for(let i=0;i<3;++i)
		d[i] = dot(m[i],s) + m[i][3] ;
	return d;
}

function mmul( D,A,B ) 
{
	
	for(let i=0; i<3; ++i) 
		for(let j=0; j<3; ++j) 
	{
		let t = 0.;
		for(let k=0; k<3; ++k)
			t += A[k][j] * B[i][k];
		D[i][j] = t;
	}
}

function mmulv_DX(d,m,s){
	for(let i=0;i<3;++i)
		d[i] = dot(m[i],s) ;
	return d;
}


function tmulv(d,m,s){

	for(let i=0;i<3;++i)
		d[i]=m[3][i];
	
	for(let i=0;i<3;++i)
		for(let j=0;j<3;++j)
			d[i] += m[j][i] * s[j]  
	return d;
}


function mmulv_DX(d,m,s){
	for(let i=0;i<3;++i)
		d[i] = dot(m[i],s);
	return d;
}


/*

  field of view

*/
let xfoc = 0;
let yfoc = 0;
let focspan = 0;
let foc_x = 0;
let foc_y = 0;

function setFocal( f )
{
	yfoc = 2*f; 
	xfoc = 2*cv.height*f / cv.width;
	focspan = cv.height*f //*.5
	foc_x = cv.width * .5;
	foc_y = cv.height * .5;
}
function cull(p)//inside_frustum( p ) 
{
	if( p[2] > -.1 ||
		//p[2] < -8 ||
		abs(p[0])*xfoc > -p[2] ||
		abs(p[1])*yfoc > -p[2] )
		return false;
	return true;
}

//let focw cv.width*foc /  
function zdiv(d,s)
{
	let r = focspan / max(-s[2],.01)
	d[0] = s[0]*r + foc_x;
	d[1] = s[1]*r + foc_y;
	//snap to pixel 
	// d[0] |= 0 
	// d[1] |= 0 
	return d;
}


/* 

   Mesh drawing...

*/
var tp = []
for( let i=0 ; i<2048; ++i )
	tp[i]=[1.,1.,1.,false]

const SCALE = 1. / 768
function scalepos( Pv ){
	for(let i=0;i<Pv.length;++i)
		for(let j=0;j<3;++j)
			Pv[i][j] *= SCALE
}

scalepos(Dude.Pv);
scalepos(Head.Pv);
scalepos(Nopy.Pv);
scalepos(Birb.Pv);
scalepos(Seal.Pv);
scalepos(Cheke.Pv);
scalepos(Kart.Pv);
scalepos(Terrain.Pv);
scalepos(Shadow.Pv);

let zlist = []
let zsortf = ( a, b) =>  (a[0][4] - b[0][4])  
let edgen=[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]

function zlist_draw()
{
	for( let i=0;i<zlist.length;++i)
	{
		let P = zlist[i] 
		if( 0 ) {// edge fix
			let x = 0, y =0 ;
			for( let j=0;j<P.length; ++j )
			{
				x += P[j][0]
				y += P[j][1]
			}
			x *= 1/P.length
			y *= 1/P.length
			for( let j=0;j<P.length; ++j)
			{ 
				let dx = P[j][0]-x ;
				let dy = P[j][1]-y ;
				let d = dx*dx +dy*dy ;
				if( d > 0 ){
					d = 1/sqrt(d);
					P[j][0] += dx*d;
					P[j][1] += dy*d;
				}
			}
		}
		textri(img, P )
	}
	zlist = []
}


function drawMesh( o, bias ) //meshDraw
{

	if( !bias )
		bias = 0;
		
	let Pv = o.Pv, Tv = o.Tv, Nv = o.Nv, Iv = o.Iv 
	for( let i=0;i<Pv.length;++i)
		tmulv_DX( tp[i], DX, Pv[i] );

	for( let i=0;i<Pv.length;++i)
	{	
		tmulv_DX( tp[i], DX, Pv[i] );
		tp[i][3]=cull( tp[i])
		zdiv(tp[i],tp[i])
	}

	const STRIDE = 2

	//ngons
	for(let i=0;i<Iv.length;)
	{
		let vc = Iv[i++], inn = false, zmin = 9999999 ;
		let pl = []
		for( let j=0; j<vc;++j)
		{
			let p = tp[ Iv[ i + STRIDE*j	+ 0 ]  ]
			
			if( p[3] )
				inn = true;
			let u = Tv[ Iv[ i + STRIDE*j	+ 1 ]  ]
			zmin = min(zmin, p[2])
			pl.push([p[0],p[1],u[0],u[1],0])
		}
		i += STRIDE * vc  ; 

		if( inn ){
			pl[0][4] = zmin + bias;
			zlist.push(pl)
		}
	}
}

/*

 game.js

*/

let cz = 0, czv = 0 ;
let cx = 0, cxv = 0
let cy = 0, cyv = 0
function game_step()
{
	cx += cxv
	cy += cyv
	cz += czv
	if( mouse_down )
	{
		cxv = ((mouse_nx*2-1) - cx) * .1
		cyv = ((mouse_ny*2-1) - cy) * .1
		czv = (1 - cz )*.1
	}
	else
	{
		cxv = (0 - cx) * .1
		cyv = (0 - cy) * .1
		czv = (0 - cz )*.1
	}
}

function noise(p)
{
	if( abs(p[0])>3 )
		p[2] = ( sin( p[0]*1.442 ) + sin(p[1]*2.233) ) * .2 ;
	return p;
}

function wave( p, x, y ){

	let c = cos( x*.6+ y*.3 + tick*.01 )
	
	p[0] = x
	p[1] = y
	p[2] = c
	return p
}


function game_render(ST)
{
	

	ct.setTransform(1,0, 0,1, 0,0);
	
	{
		let grd = ct.createLinearGradient(0, 0, 0, cv.height/1.8);
		grd.addColorStop(0, "#0af");
		grd.addColorStop(1, "#000");
		ct.fillStyle = grd;
		ct.fillRect(0, 0, cv.width,cv.height )///2 )
	}
	
	ct.imageSmoothingEnabled = false;

	ct.save();
	ct.setTransform(1,0,
					0,-1,
					0,cv.height);

	/*

	  cam setup

	*/

	let f = cz + czv*ST
	setFocal( 1. * (1-f) + 3 * f )
	set3(CT[3],.5,-5,.75 )

	let yaw =  -(cx+cxv*ST)*.5
	let pit =  -(cy+cyv*ST)*.5

	yaw += cos((tick + ST)*.0025 ) *.01
	pit += .175+cos((tick + ST)*.0025 ) *.01
	
	let P = [[1,0,0], [0,cos(pit),sin(pit)],[0,-sin(pit),cos(pit)]]
	let Q = [[cos(yaw),sin(yaw),0],[0,0,1],[sin(yaw),-cos(yaw),0]]
	mmul(CT,Q,P)
	
	tpovDX(DX,CT,ID);


	if(1)
	{

		//checkered flag
		set3( MT[0], 2,0,0)
		set3( MT[1], 0,0,2)
		set3( MT[2], 0,-2,0)
		set3( MT[3], 0,16,0)
		tpovDX(DX,CT,MT);


		ct.fillStyle = 'rgba(0,0,0,.5)'
		ct.beginPath();

		const N = 8
		let W = 0|((cv.width * N) / cv.height) ;  
		for(let y=0;y<=N; ++y){
			for(let x=-W+(y&1);x<=W;x+=2){
				let ta = tmulv_DX(V0, DX, wave(R0,x+0,	y+0,-1) )
				let tb = tmulv_DX(V1, DX, wave(R0,x+1,	y+0,-1) )
				let tc = tmulv_DX(V2, DX, wave(R0,x+1,	y+1,-1) )
				let td = tmulv_DX(V3, DX, wave(R0,x+0,	y+1,-1) )

				if( cull(ta) ||	cull(tb) ||	cull(tc) ||	cull(td) )//any in
				{
					let a = zdiv(R0, ta)
					let b = zdiv(R1, tb)
					let c = zdiv(R2, tc)
					let d = zdiv(R3, td)

					ct.moveTo( a[0],a[1] )
					ct.lineTo( b[0],b[1] )
					ct.lineTo( c[0],c[1] )
					ct.lineTo( d[0],d[1] )
				}
			}
		}
		ct.fill()

	
		//NOPY'S SEAL KART RACING TITLE
		let a = sin( tick*.005 )*.15
		let s = 5
		let C = cos(a)*s, S =sin(a)*s
		set3( MT[0], C,S,0)
		set3( MT[1], 0,0,s)
		set3( MT[2], S,-C,0)
		set3( MT[3], 0,16,10)
		tpovDX(DX,CT,MT);
		drawMesh(Nopy);
		zlist_draw();

	}
	
	//draw meshi
	{
		
		tpovDX(DX,CT,ID);
		drawMesh(Terrain, -1);

		let a=-tick*.0025, s = 1
		let C = cos(a), S =sin(a)

		let q = sin(tick*.05)*.025 
		s -= q
		q+=1

		set3( MT[0], C*s,S*s,0)
		set3( MT[1],-S*s,C*s,0)
		set3( MT[2], 0,0,q)
		set3( MT[3], -.5,0,0)
		tpovDX(DX,CT,MT);
		drawMesh(Seal);
		drawMesh(Shadow);
		
		set3( MT[3], .5,-1,0)
		tpovDX(DX,CT,MT);
		drawMesh(Birb);
		drawMesh(Shadow);

		set3( MT[3], +1.5,0,0)
		tpovDX(DX,CT,MT);
		drawMesh(Cheke);
		drawMesh(Shadow);


		s = 1
		a = 5
		C = cos(a), S =sin(a)*s
		set3( MT[0], C*s,S*s,0)
		set3( MT[1],-S*s,C*s,0)
		set3( MT[2], 0,0,s)
		set3( MT[3],-1,-1.5,0)
		tpovDX(DX,CT,MT);
		drawMesh(Kart);
		drawMesh(Shadow);

		a = tick*.005
		C = cos(a), S =sin(a)*s
		set3( MT[0], C*s,S*s,0)
		set3( MT[1],-S*s,C*s,0)
		set3( MT[2], 0,0,s)
		set3( MT[3],2,-1.5,0)
		tpovDX(DX,CT,MT);
		drawMesh(Kart);
		drawMesh(Shadow);


		//
		zlist.sort( zsortf )
		zlist_draw();
	}
}



/*


  

*/

let cv,ct,rid;
let tick=0,last_time = 0.,last_frame = 0.,frame = 0 ;

let img = new Image();
img.src = "tex.png";

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

function init_game()
{
	cv = document.getElementById("cv");
	ct = cv.getContext('2d');
	ct.imageSmoothingEnabled = false;
	

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
		if( false ) // low-rez mode  
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

	rid = requestAnimationFrame( r_update, cv ) ;
}

init_game();

