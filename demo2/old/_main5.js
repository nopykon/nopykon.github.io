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

				 
function xtextri(image,A,B,C)
{

	let x0 = A[0], x1 = B[0], x2 = C[0];
    let y0 = A[1], y1 = B[1], y2 = C[1];
    let u0 = A[2], u1 = B[2], u2 = C[2];
	let v0 = A[3], v1 = B[3], v2 = C[3];

	
    
    //TODO: add some margin ??
    ct.save();

	ct.beginPath();
	ct.moveTo(x0,y0);
	ct.lineTo(x1,y1);
    ct.lineTo(x2,y2);
	//ct.closePath();
	ct.clip();

	//Compute matrix transform 
	let det = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
	
	let a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
	let b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
	let c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2
			- v0*u1*x2 - u0*x1*v2;
	
	let d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
	let e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
	let f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2
			- v0*u1*y2 - u0*y1*v2;

	// Draw the transformed image
	let r = 1./det ; 
	ct.transform(a*r, d*r,
				 b*r, e*r,
				 c*r, f*r);
	
	ct.drawImage(image, 0, 0);
	ct.restore();
}

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

let CT = [[1,0,0],[0,0,1],[0,-1,0],[0,-4,1]];
let MT = [[1,0,0],[0,1,0],[0,0,1],[0,0,0]];
let ID = [[1,0,0],[0,1,0],[0,0,1],[0,0,0]];
let DX = [[1,0,0,0],[0,1,0,0],[0,0,1,0]];



function tpovDX(d,a,b)
{
	vsub(b[3],b[3],a[3]);
	for(let i=0;i<3;++i)
		for(let j=0;j<4;++j)
			d[i][j]=vdot(a[i],b[j]);
	vadd(b[3],b[3],a[3]);
}
function tmulv_DX(d,m,s){
	for(let i=0;i<3;++i)
		d[i] = vdot(m[i],s) + m[i][3] ;
	return d;
}

let fov = 1.;
/*
fill draw colored polygon
draw textured with blend mode mul!
 */
function zdiv(d,s)
{
	if( s[2] >= -.01 )
		s[2]=-.01;

	let r = cv.width/(-s[2]*fov);
	//d[0] = s[0]*r + cv.width*.5;
	//d[1] = s[1]*r + cv.height*.5;
	d[0] = 0|(s[0]*r + cv.width*.5);
	d[1] = 0|(s[1]*r + cv.height*.5);
	
	return d;
}

function game_step()
{

}

function game_render()
{
	{
		let t = now()*.1;
		let c=cos(t), s=sin(t);
		vset(MT[0], c,s,0);
		vset(MT[1],-s,c,0);
		vset(MT[2], 0,0,1);
	}
	tpovDX(DX,CT,MT);

	let a=[0,0,0,0], b=[0,0,32,0],c=[0,0,32,32],d=[0,0,0,32]; 
	for(let y=0;y<20;++y){
		for(let x=0;x<10;++x){
			zdiv(a,tmulv_DX( V0, DX, vset(V1,x+0,y+0,0)));
			zdiv(b,tmulv_DX( V0, DX, vset(V1,x+1,y+0,0)));
			zdiv(c,tmulv_DX( V0, DX, vset(V1,x+1,y+1,0)));
			zdiv(d,tmulv_DX( V0, DX, vset(V1,x+0,y+1,0)));
			a[2] = x*32;
			b[2] = (x+1)*32;
			c[2] = (x+1)*32;
			d[2] = x*32;
			//zdiv
			textri(can,a,b,c);
			xtextri(can,a,c,d);
		}
	}
}


let tick=0,last_time = 0.,last_frame = 0.,frame = 0 ;

let img = new Image();
let can = document.createElement("canvas");
can.width = 1024;
can.height = 32;
function rgbf(r,g,b)
{
	return 'rgba('+(r*255)+','+(g*255)+','+(b*255)+',1.0)' ;
}
img.onload=function(){
	let c = can.getContext("2d");
	c.imageSmoothingEnabled = false;
	for(let i=0;i<1024;i+=32)
	{
		//c.globalAlpha = 1. - i / 1024. ;
		c.globalCompositeOperation = 'source-over';
		c.drawImage(img,i,0,32,32);
		c.globalCompositeOperation = 'multiply';
		let r = i/1024;
		let g = ran()*.5+.5;
		let b = ran()*.5+.5;
		c.fillStyle = rgbf(r,g,b);
		c.fillRect(i,0,32,32);
	}
};
img.src = "tex.png";


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
	/*
	const a = now()*.5, d = PI*.5, tx=cv.width/2, ty=cv.height/2,
		  W=200+sin(now()*.33)*100,H=200+cos(now()*.5)*150,U = 64,V=64;
	let vv = [[ tx + W*cos(a+d*0), ty + H*sin(a+d*0),0,0],
			  [ tx + W*cos(a+d*1), ty + H*sin(a+d*1),U,0],
			  [ tx + W*cos(a+d*2), ty + H*sin(a+d*2),U,V],
			  [ tx + W*cos(a+d*3), ty + H*sin(a+d*3),0,V]];

	textri(img, vv[0],vv[1],vv[2]);
	textri(img, vv[0],vv[2],vv[3]);
	*/

	game_render();

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
