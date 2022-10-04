
/*

  math.js

*/

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
	max3 = (a,b,c) => (a>b?(a>c?a:c):(b>c?b:c)),
	dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
	cross = (d,a,b) => ( d[0]=a[1]*b[2] - a[2]*b[1],
						 d[1]=a[2]*b[0] - a[0]*b[2],
						 d[2]=a[0]*b[1] - a[1]*b[0],
						 d),
	norm = (d,s) => scale3(d,s, 1/sqrt(dot(s,s)) ),
	lerp3 = (d,a,b,t) => (d[0]=a[0]*(1-t) + b[0]*t,
						  d[1]=a[1]*(1-t) + b[1]*t,
						  d[2]=a[2]*(1-t) + b[2]*t,d),
	scale2 = (d,a,s) => (d[0]=a[0]*s,d[1]=a[1]*s,d),
	dot2 = (a,b) =>  a[0]*b[0] + a[1]*b[1],
	norm2 = (d,s) => scale2(d,s, 1/sqrt(dot2(s,s)) ),
	cross2 = (a,b) =>  (a[0]*b[1] - a[1]*b[0]),
	lerp2 = (d,a,b,t) => (d[0]=a[0]*(1-t) + b[0]*t,
						  d[1]=a[1]*(1-t) + b[1]*t,d)
						  




let rnd = (s) => ( s[0] = s[0]+(s[0]<<1)+(s[0]>>1) + 777, s[0])
	
//vec4
let set4 = (d,x,y,z,w) => (d[0]=x,d[1]=y,d[2]=z,d[3]=w,d); 
let cpy4 = (d,s) => (d[0]=s[0],d[1]=s[1],d[2]=s[2],d[3]=s[3],d); 

let V0=[0,0,0,0],V1=[0,0,0,0],V2=[0,0,0,0],V3=[0,0,0,0],
	R0=[0,0,0,0],R1=[0,0,0,0],R2=[0,0,0,0],R3=[0,0,0,0];


//vertex buffer 
let Rv=[]
for(let i=0;i<1024;++i)	Rv[i] = [0.,0.,0.,1.]

/*

  

*/
function texpol(image,A,B,C)
{
	//let A = vv[0], B = vv[1], C = vv[2]
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
	ct.lineTo(B[0],B[1])
	ct.lineTo(C[0],C[1])
	ct.clip();

	ct.transform(a, d,
				 b, e,
				 c, f ) ;
	ct.drawImage(image, 0, 0);
	ct.restore();
}

// let inn=[],out=[] ;//,inn_sz,out_sz;
// for(let i=0;i<16;++i)inn[i]=[0,0,0,0],out[i]=[0,0,0,0] ; 

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

function mmulv( d,M,v ) {	
	for(let i=0; i<3; ++i) 
		d[i] = M[0][i]*v[0] + M[1][i]*v[1] + M[2][i]*v[2] ;
	return d;
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
let focal = 1.;
let focspan = 0;
let foc_x = 0;
let foc_y = 0;

function setFocal( f )
{
	focal = f ; 

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

let zlist = []
let zsortf = ( a, b) =>  (a[0][4] - b[0][4]) 
//function zfunc( a, b ){	return a[3]-b[3] }
//let edgen=[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]

//TODO: probably tri's 
function zlist_draw()
{
	for( let i=0;i<zlist.length;++i)
	{
		let P = zlist[i] 
		//let Img = P[1][4];
		for( let k=2;k<P.length; ++k)
		{
			let a = P[0], b = P[k-1], c = P[k] ;
			//if( 0 ) // NOTE: edge fix / hack, dumbly scale from center
			{
				
				let x = (a[0]+b[0]+c[0])*(1/3) ; 
				let y = (a[1]+b[1]+c[1])*(1/3) ;
				

				let ax = a[0]-x, ay = a[1]-y
				let bx = b[0]-x, by = b[1]-y
				let cx = c[0]-x, cy = c[1]-y
				let aa = ax*ax + ay*ay ; 
				let bb = bx*bx + by*by ; 
				let cc = cx*cx + cy*cy ; 
				aa = max3(aa,bb,cc);
				if(aa > 0 )
					aa = 1. / sqrt(aa) ;

				texpol(suit,//Img,
					   set4( R0, a[0]+ax*aa,			a[1]+ay*aa,			a[2], a[3] ),
					   set4( R1, b[0]+bx*aa,			b[1]+by*aa,			b[2], b[3] ),
					   set4( R2, c[0]+cx*aa,			c[1]+cy*aa,			c[2], c[3] ))
			}
		}
	}
	zlist = []
}


function drawMesh( o, bias, image ) //meshDraw
{
	if( undefined === image )
		image = suit;//img;

	if( undefined === bias )
		bias = 0;
		

	image = suit;
	bias = 0;

	let Pv = o.Pv, Tv = o.Tv, /*Nv = o.Nv,*/ Iv = o.Iv 
	for( let i=0;i<Pv.length;++i)
		tmulv_DX( tp[i], DX, Pv[i] );

	for( let i=0;i<Pv.length;++i)
	{	
		//tmulv_DX( tp[i], DX, Pv[i] );
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
			pl.push([p[0],p[1],u[0],u[1]])
		}
		i += STRIDE * vc  ; 

		if( inn ){
			pl[0][4] = zmin + bias;
			//pl[1][4] = image //;zmin + bias;
			zlist.push(pl)
		}
	}
}


