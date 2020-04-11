/*

 main.js

*/

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
	ran = () => M.random()*2-1,
	now = () => window.performance.now()/1e3 ;


let vset = (d,x,y,z) => (d[0]=x,d[1]=y,d[2]=z,d),
	vcpy = (d,s) => (d[0]=s[0],d[1]=s[1],d[2]=s[2],d),
	vneg = (d,s) => (d[0]=-s[0],d[1]=-s[1],d[2]=-s[2],d),
	vadd = (d,a,b) => (d[0]=a[0]+b[0],d[1]=a[1]+b[1],d[2]=a[2]+b[2],d),
	vsub = (d,a,b) => (d[0]=a[0]-b[0],d[1]=a[1]-b[1],d[2]=a[2]-b[2],d),
	vmul = (d,a,b) => (d[0]=a[0]*b[0],d[1]=a[1]*b[1],d[2]=a[2]*b[2],d),
	vscale = (d,a,s) => (d[0]=a[0]*s,d[1]=a[1]*s,d[2]=a[2]*s,d),
	vmix = (d,a,b,t) => (d[0]=a[0]+(b[0]-a[0])*t,
						 d[1]=a[1]+(b[1]-a[1])*t,
						 d[2]=a[2]+(b[2]-a[2])*t,
						 d),
	vdot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
	vcross = (d,a,b) => ( d[0]=a[1]*b[2] - a[2]*b[1],
						  d[1]=a[2]*b[0] - a[0]*b[2],
						  d[2]=a[0]*b[1] - a[1]*b[0],
						  d),
	vnorm = (d,s) => vscale(d,s, 1/sqrt(vdot(s,s)) );


//object recycling 
let V0=[0,0,0,0],V1=[0,0,0,0],V2=[0,0,0,0],V3=[0,0,0,0],
	R0=[0,0,0,0],R1=[0,0,0,0],R2=[0,0,0,0],R3=[0,0,0,0];

/*

 draw.js

*/
function textri(image,A,B,C)
{
    let ax = B[0]-A[0], ay = B[1]-A[1];
    let bx = C[0]-A[0], by = C[1]-A[1];

	if( ax*by - ay*bx < 0 )//backface culling
		return;

    let au = B[2]-A[2], av = B[3]-A[3] ;
	let bu = C[2]-A[2], bv = C[3]-A[3] ;
	
	let r = 1./ (au*bv - av*bu) ;
	let a = ax*bv - av*bx ;
	let b = au*bx - ax*bu;
	let d = ay*bv - av*by;
	let e = au*by - ay*bu;

	ct.save();
	ct.beginPath();
	ct.moveTo(A[0],A[1]);
	ct.lineTo(B[0],B[1]);
	ct.lineTo(C[0],C[1]);
	//ct.closePath();
	ct.clip();
	ct.transform(a*r, d*r,
				 b*r, e*r,
				 A[0], A[1]);
	ct.drawImage(image, 0, 0);
	ct.restore();
}


let tick=0,last_time = 0.,last_frame = 0.,frame = 0 ;

let img = new Image();
img.src = "dos.png";

function r_update()
{
	rid = undefined;
	ct.setTransform(1,0, 0,1, 0,0);
	ct.clearRect(0,0,cv.width,cv.height);

	ct.imageSmoothingEnabled = false;

	ct.save();
	ct.setTransform(1,0,
					0,-1,
					0,cv.height);

	const a = now()*.5, d = PI*.5, tx=cv.width/2, ty=cv.height/2,
		  W=200+sin(now()*.33)*100,H=200+cos(now()*.5)*150,U = 64,V=64;
	let vv = [[ tx + W*cos(a+d*0), ty + H*sin(a+d*0),0,0],
			  [ tx + W*cos(a+d*1), ty + H*sin(a+d*1),U,0],
			  [ tx + W*cos(a+d*2), ty + H*sin(a+d*2),U,V],
			  [ tx + W*cos(a+d*3), ty + H*sin(a+d*3),0,V]];

	textri(img, vv[0],vv[1],vv[2]);
	textri(img, vv[0],vv[2],vv[3]);

//	xtextri(img, vv[0],vv[2],vv[3]);

	/*
	let s = sin(now()),c=cos(now());
	ct.transform(.1,0, 
				 0,1,
				 100,100);
	ct.drawImage(img,0,0);
	ct.restore();
	 */
	++frame ;
	++tick ;

	{
		let t = now();
 		let d = t-last_time;
		document.getElementById('framerate').innerHTML = (((d*1000)|0)/1000).toString();
		last_time = t ;
	}

	rid = requestAnimationFrame( r_update, cv ) ;
}

function resize()
{
	cv.width = cv.clientWidth;
	cv.height = cv.clientHeight;

}

//init
let cv = document.getElementById("cv");
let ct = cv.getContext('2d');
window.addEventListener('resize', resize, false);
resize();

//request 
let rid = requestAnimationFrame( r_update, cv ) ;
