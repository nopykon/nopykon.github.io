//12:01:59,55  
/*

  crazygames interface

*/
const crazysdk = window.CrazyGames.CrazySDK.getInstance(); // getting the SDK
crazysdk.init(); // initializing the SDK, call as early as possible


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


//NoPy
//meshes
var Shadow={ //fc:2
	Pv:[[-256,-256,0],[256,256,0],[-256,256,0],[256,-256,0]],
	Tv:[[17,56],[25,48],[17,48],[25,56]],
	Iv:[3,0,0,1,1,2,2,3,0,0,3,3,1,1]
}
var Terrain={ //fc:70
	Pv:[[2560,2560,0],[2560,5120,0],[0,5120,0],[0,2560,0],[5120,2560,0],[5120,5120,0],[5120,0,0],[2560,0,0],[0,0,0],[5120,7680,0],[2560,7680,0],[0,7680,0],[5120,7680,1280],[2560,7680,1280],[2560,10240,1280],[2560,12800,1280],[2560,12800,0],[2560,10240,0],[5120,7936,1280],[2816,7936,1280],[5120,2560,1280],[5120,5120,1280],[2816,10240,1280],[2816,12800,1280],[5376,2560,1280],[5376,5120,1280],[5376,7680,1280],[5120,0,1280],[5376,0,1280],[5376,7936,1280],[0,-2560,0],[2560,-2560,0],[-2560,-2560,0],[-2560,0,0],[-5120,-2560,0],[-5120,0,0],[5120,-2560,0],[2560,15360,1280],[2560,17920,1280],[2560,17920,0],[2560,15360,0],[5120,-2560,1280],[2816,15360,1280],[2816,17920,1280],[5376,-2560,1280],[0,-2560,1280],[2560,-2560,1280],[0,17920,1280],[0,15360,1280],[0,15360,0],[0,17920,0],[0,-2816,1280],[2560,-2816,1280],[5120,-2816,1280],[-5120,-2560,1280],[-2560,-2560,1280],[-5120,-2816,1280],[-2560,-2816,1280],[5376,-2816,1280],[-2560,2560,0],[-2560,5120,0],[-5120,2560,0],[-5120,5120,0],[-256,17920,1280],[-256,15360,1280],[0,12800,0],[-2560,7680,0],[-5120,7680,0],[-5120,7680,1280],[-2560,7680,1280],[0,7680,1280],[-5120,7936,1280],[-2560,7936,1280],[-5120,2560,1280],[-5120,5120,1280],[-256,7936,1280],[-5376,2560,1280],[-5376,5120,1280],[-5376,7680,1280],[-256,12800,1280],[0,12800,1280],[-5120,0,1280],[-5376,0,1280],[-5376,7936,1280],[-5376,-2560,1280],[-5376,-2816,1280],[0,10240,1280],[0,10240,0],[-256,10240,1280]],
	Tv:[[48,33],[32,33],[32,48],[48,48],[31,20],[17,20],[17,25],[31,25],[31,17],[17,17],[17,19],[31,19],[31,18],[17,18],[26,20],[28,20],[28,18],[26,18],[31,16],[17,16]],
	Iv:[4,0,0,1,1,2,2,3,3,4,4,0,5,1,1,2,0,3,4,6,0,4,1,0,2,7,3,4,7,0,0,1,3,2,8,3,4,5,0,9,1,10,2,1,3,4,1,0,10,1,11,2,2,3,4,12,4,13,5,10,6,9,7,4,14,4,15,5,16,6,17,7,4,18,8,19,9,13,10,12,11,4,20,4,21,5,5,6,4,7,4,22,8,23,9,15,10,14,11,4,21,4,12,5,9,6,5,7,4,24,12,25,13,21,5,20,4,4,25,12,26,13,12,5,21,4,4,27,4,20,5,4,6,6,7,4,28,12,24,13,20,5,27,4,4,26,14,29,15,18,16,12,17,4,30,0,31,1,7,2,8,3,4,32,0,30,1,8,2,33,3,4,34,0,32,1,33,2,35,3,4,31,0,36,1,6,2,7,3,4,37,4,38,5,39,6,40,7,4,41,4,27,5,6,6,36,7,4,42,8,43,9,38,10,37,11,4,44,12,28,13,27,5,41,4,4,45,4,46,5,31,6,30,7,4,47,4,48,5,49,6,50,7,4,46,4,41,5,36,6,31,7,4,51,12,52,13,46,5,45,4,4,52,12,53,13,41,5,46,4,4,54,4,55,5,32,6,34,7,4,55,4,45,5,30,6,32,7,4,56,12,57,13,55,5,54,4,4,57,12,51,13,45,5,55,4,4,53,14,58,15,44,16,41,17,4,59,0,3,3,2,2,60,1,4,61,0,59,3,60,2,62,1,4,35,0,33,3,59,2,61,1,4,33,0,8,3,3,2,59,1,4,63,8,64,9,48,10,47,11,4,16,0,40,1,49,2,65,3,4,62,0,60,3,66,2,67,1,4,60,0,2,3,11,2,66,1,4,68,4,67,7,66,6,69,5,4,69,4,66,7,11,6,70,5,4,71,18,68,11,69,10,72,19,4,73,4,61,7,62,6,74,5,4,72,8,69,11,70,10,75,9,4,74,4,62,7,67,6,68,5,4,76,12,73,4,74,5,77,13,4,77,12,74,4,68,5,78,13,4,64,8,79,9,80,10,48,11,4,81,4,35,7,61,6,73,5,4,48,4,80,5,65,6,49,7,4,82,12,81,4,73,5,76,13,4,78,14,68,15,71,16,83,17,4,23,8,42,9,37,10,15,11,4,81,4,54,5,34,6,35,7,4,15,4,37,5,40,6,16,7,4,82,12,84,13,54,5,81,4,4,84,14,85,15,56,16,54,17,4,13,4,14,5,17,6,10,7,4,19,8,22,9,14,10,13,11,4,86,4,70,5,11,6,87,7,4,88,8,75,9,70,10,86,11,4,10,0,17,1,87,2,11,3,4,80,4,86,5,87,6,65,7,4,79,8,88,9,86,10,80,11,4,17,0,16,1,65,2,87,3,4,40,0,39,1,50,2,49,3]
}
var Dude={ //fc:172
	Pv:[[0,-63,450],[0,-40,395],[100,-38,445],[0,74,409],[0,88,450],[81,74,450],[-100,-38,445],[-81,74,450],[24,-30,220],[88,-30,220],[83,38,242],[33,39,242],[-24,-30,220],[-88,-30,220],[29,-58,-2],[85,-56,-2],[88,-46,38],[26,-48,38],[82,31,192],[89,-33,562],[35,32,46],[34,32,192],[32,99,-2],[85,99,-2],[0,79,592],[81,32,46],[-33,39,242],[-83,38,242],[-89,-33,562],[79,43,655],[0,-49,552],[-29,-58,-2],[-26,-48,38],[-88,-46,38],[-85,-56,-2],[-82,31,192],[-35,32,46],[-34,32,192],[-85,99,-2],[-32,99,-2],[-79,43,655],[-81,32,46],[130,-33,716],[0,-58,655],[104,-30,642],[69,43,719],[49,0,747],[125,35,716],[0,46,732],[0,-30,755],[0,48,740],[32,42,747],[32,48,719],[0,52,721],[-130,-33,716],[-104,-30,642],[-69,43,719],[-125,35,716],[-49,0,747],[-32,48,719],[-32,42,747],[0,-20,780],[35,6,773],[-35,6,773],[138,-33,657],[0,46,750],[110,28,563],[107,-33,517],[26,-16,816],[36,56,854],[34,56,824],[0,74,825],[0,73,791],[8,74,791],[8,71,755],[0,71,755],[0,74,853],[0,84,795],[0,56,875],[28,56,771],[48,9,860],[0,-7,885],[0,-36,847],[-138,-33,657],[-110,28,563],[-107,-33,517],[-26,-16,816],[-36,56,854],[-34,56,824],[-8,71,755],[-8,74,791],[-28,56,771],[-48,9,860],[143,23,558],[143,25,404],[115,25,407],[158,-30,514],[117,-17,407],[145,-15,407],[151,-20,363],[156,30,353],[107,-23,355],[110,30,345],[-143,23,558],[-115,25,407],[-143,25,404],[-158,-30,514],[-145,-15,407],[-117,-17,407],[-156,30,353],[-151,-20,363],[-107,-23,355],[-110,30,345]],
	Tv:[[1,24],[1,28],[8,24],[23,28],[23,24],[14,24],[27,28],[27,42],[7,42],[13,41],[19,41],[1,42],[1,63],[4,63],[5,56],[1,56],[12,44],[45,63],[36,54],[36,63],[1,54],[7,54],[19,54],[27,54],[19,44],[20,57],[20,62],[27,62],[27,57],[29,63],[51,63],[51,53],[12,54],[11,57],[11,63],[18,63],[18,57],[45,47],[29,55],[39,42],[29,47],[39,47],[34,35],[33,38],[39,35],[54,43],[45,43],[29,38],[63,41],[57,41],[57,45],[63,45],[47,38],[47,34],[54,34],[54,38],[1,17],[8,12],[1,12],[55,37],[57,34],[51,34],[1,6],[36,28],[28,34],[45,34],[21,17],[1,22],[1,1],[17,1],[46,26],[40,19],[36,26],[55,1],[55,10],[63,10],[63,20],[61,20],[61,28],[63,28],[47,30],[47,32],[63,1],[58,37],[60,34],[62,37],[46,1],[36,1],[36,5],[55,24],[61,32],[46,12],[36,13],[36,15],[47,1],[47,24],[17,22],[17,5],[34,5],[34,1],[21,12],[34,17],[34,12],[63,53],[63,47],[57,47],[57,53],[57,59],[63,59],[63,61],[57,61],[63,63],[34,22],[57,63]],
	Iv:[3,0,0,1,1,2,2,3,3,3,4,4,5,5,3,0,0,6,2,1,1,3,3,3,7,5,4,4,3,1,6,3,3,8,7,3,5,5,2,2,9,8,4,3,3,5,5,10,9,11,10,4,8,11,9,8,2,2,1,1,3,3,3,11,10,8,7,3,10,9,5,5,9,8,3,1,6,12,7,3,3,3,7,5,13,8,6,2,4,14,12,15,13,16,14,17,15,3,9,8,18,16,10,9,3,5,17,19,18,2,19,4,17,20,16,21,9,8,8,11,4,20,22,17,23,8,7,21,24,4,15,25,14,26,22,27,23,28,3,2,19,19,18,0,29,3,5,17,4,30,24,31,3,21,24,8,7,11,10,4,18,16,25,32,20,22,21,24,4,10,9,18,16,21,24,11,10,4,16,21,25,32,18,16,9,8,3,20,33,22,34,17,14,3,16,14,15,13,23,34,3,22,34,14,13,17,14,4,22,35,20,36,25,33,23,34,3,25,33,16,14,23,34,4,3,3,26,10,27,9,7,5,4,12,11,1,1,6,2,13,8,3,7,17,6,19,28,18,3,6,19,0,29,28,18,3,7,17,24,31,4,30,3,3,3,12,7,26,10,3,27,9,13,8,7,5,3,24,31,29,37,5,17,3,19,18,5,17,29,37,3,19,18,30,38,0,29,4,31,12,32,15,33,14,34,13,3,13,8,27,9,35,16,4,32,20,12,11,13,8,33,21,4,36,22,37,24,12,7,32,23,4,34,25,38,28,39,27,31,26,3,24,31,7,17,40,37,3,37,24,26,10,12,7,3,28,18,40,37,7,17,3,28,18,0,29,30,38,4,35,16,37,24,36,22,41,32,4,27,9,26,10,37,24,35,16,4,33,21,13,8,35,16,41,32,3,36,33,32,14,39,34,3,33,14,38,34,34,13,3,39,34,32,14,31,13,4,39,35,38,34,41,33,36,36,3,41,33,38,34,33,14,3,42,39,43,40,44,41,3,45,42,46,43,47,44,3,48,45,45,46,24,31,3,47,44,46,43,42,39,3,45,46,29,37,24,31,3,43,40,19,18,44,41,3,46,43,49,47,42,39,3,49,47,43,40,42,39,3,44,41,19,18,29,37,4,50,48,51,49,52,50,53,51,3,19,18,43,40,30,38,3,45,46,48,45,46,52,3,54,39,55,41,43,40,3,56,42,57,44,58,43,3,48,45,24,31,56,46,3,57,44,54,39,58,43,3,56,46,24,31,40,37,3,43,40,55,41,28,18,3,58,43,54,39,49,47,3,49,47,54,39,43,40,3,55,41,40,37,28,18,4,50,48,53,51,59,50,60,49,3,28,18,30,38,43,40,3,56,46,58,52,48,45,3,49,53,46,52,61,54,3,48,45,62,55,46,52,3,49,53,61,54,58,52,3,48,45,58,52,63,55,3,44,56,64,57,42,58,3,65,59,62,60,48,61,3,42,58,64,57,47,62,3,29,63,45,64,66,65,3,67,66,44,56,29,67,3,45,68,47,62,66,69,3,46,52,62,55,61,54,3,65,59,48,61,63,60,3,58,52,61,54,63,55,3,62,70,68,71,61,72,3,69,73,70,74,71,75,4,72,76,73,77,74,78,75,79,3,74,78,62,80,65,81,3,71,75,76,82,69,73,3,77,76,71,75,73,77,3,73,83,72,84,77,85,3,69,86,76,87,78,88,3,79,89,74,78,73,77,3,65,81,75,90,74,78,4,80,91,69,86,78,88,81,92,3,74,78,79,89,62,80,3,82,93,80,91,81,92,3,70,74,69,73,80,94,3,73,77,71,75,70,74,3,70,74,62,95,79,89,3,82,93,61,72,68,71,3,68,71,80,91,82,93,3,68,71,62,70,80,91,3,62,95,70,74,80,94,3,79,89,73,77,70,74,3,55,56,54,58,83,57,3,54,58,57,62,83,57,3,40,63,84,65,56,64,3,85,66,40,67,55,56,3,56,68,84,69,57,62,3,63,70,61,72,86,71,3,87,73,71,75,88,74,4,72,76,75,79,89,78,90,77,3,89,78,65,81,63,80,3,71,75,87,73,76,82,3,77,76,90,77,71,75,3,90,83,77,85,72,84,3,87,86,78,88,76,87,3,91,89,90,77,89,78,3,65,81,89,78,75,90,4,92,91,81,92,78,88,87,86,3,89,78,63,80,91,89,3,82,93,81,92,92,91,3,88,74,92,94,87,73,3,90,77,88,74,71,75,3,88,74,91,89,63,95,3,82,93,86,71,61,72,3,86,71,82,93,92,91,3,86,71,92,91,63,70,3,63,95,92,94,88,74,3,91,89,88,74,90,77,3,66,96,67,66,29,67,3,64,57,93,97,47,62,3,47,62,93,97,66,69,3,64,57,44,56,67,66,4,66,69,93,97,94,98,95,99,4,96,100,67,66,97,101,98,102,4,93,97,96,100,98,102,94,98,4,94,103,98,104,99,105,100,106,4,98,107,97,108,101,109,99,110,4,102,111,101,109,97,108,95,108,3,95,112,67,66,66,96,3,97,101,67,66,95,112,4,100,106,102,107,95,108,94,103,4,99,110,101,109,102,111,100,113,3,64,57,96,100,93,97,3,96,100,64,57,67,66,3,84,96,40,67,85,66,3,83,57,57,62,103,97,3,57,62,84,69,103,97,3,83,57,85,66,55,56,4,84,69,104,99,105,98,103,97,4,106,100,107,102,108,101,85,66,4,103,97,105,98,107,102,106,100,4,105,103,109,106,110,105,107,104,4,107,107,110,110,111,109,108,108,4,112,111,104,108,108,108,111,109,3,104,112,84,96,85,66,3,108,101,104,112,85,66,4,109,106,105,103,104,108,112,107,4,110,110,109,113,112,111,111,109,3,83,57,103,97,106,100,3,106,100,85,66,83,57]
}

/*

  assets.js


*/
const SCALE = 1. / 768
function scalepos( Pv ){
	for(let i=0;i<Pv.length;++i)
		for(let j=0;j<3;++j)
			Pv[i][j] *= SCALE
}

scalepos(Shadow.Pv);
scalepos(Dude.Pv);
//scalepos(Seal.Pv);
scalepos(Terrain.Pv);




/*

 game.js

 DESIGN

 touch & mouse gameplay 

 ads between levels 

*/



//math-ish
function project_PixelToWorld( w, x,y){
	let d = mmulv(V0,CT, [(2*x - cv.width) / (2*cv.height),
						  -(2*y - cv.height) / (2*cv.height),
						  -1 ] )//-focal
	let t = CT[3][2] / -d[2] ; 
	ads3(w, CT[3], d, t );
	return w; 
}



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


	let last_touch
	let dam = dude.aim_amount + dude.aim_amountv*ST ;
	//ads3(CT[3], dude.p, dude.d, dude.vel*ST + dude.vel*16. + dam )
	ads3(CT[3], dude.p, dude.d, dude.vel*ST+dam );//+ dude.vel*16. + dam )
	

	let m = sub3(V0, dude.dst, CT[3] );
	ads3(CT[3],CT[3], m, .25 );
	

	//ads3(CT[3], CT[3], dude.d, .5 + .5*sin(now()))
	ads3(CT[3], CT[3], CT[2], 12 );



	tpovDX(DX,CT,ID);
	
	//draw meshi
	{
		tpovDX(DX,CT,ID);
		drawMesh(Terrain);//, -1);

		// let a=-tick*.0025, s = 1
		// let C = cos(a), S =sin(a)

		// let q = sin(tick*.05)*.025 
		// s -= q
		// q+=1
		
		let d = dude.d
		MTY(d);
		ads3( MT[3], dude.p,dude.dst_dir, dude.vel );

		tpovDX(DX,CT,MT);
		drawMesh(Dude )//, 0, suit);
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

let suit = new Image();
suit.src = "suit.png";


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

