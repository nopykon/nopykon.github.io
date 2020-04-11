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

//stack overflow version
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

function haxtri(image,A,B,C)
{
    ct.save();
	
	ct.beginPath();
	ct.moveTo(A[0],A[1]);
	ct.lineTo(B[0],B[1]);
	ct.lineTo(C[0],C[1]);
	//ct.closePath();
	ct.clip();

    let x1 = B[0]-A[0], x2 = C[0]-A[0];
    let y1 = B[1]-A[1], y2 = C[1]-A[1];
    let u1 = B[2]-A[2], u2 = C[2]-A[2];
	let v1 = B[3]-A[3], v2 = C[3]-A[3];

	let r = 1./ (u1*v2 - v1*u2) ;
	let a = x1*v2 - v1*x2 ;
	let b = u1*x2 - x1*u2;
	let d = y1*v2 - v1*y2;
	let e = u1*y2 - y1*u2;
	
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
	//300,cv.height-300);
	
	//ct.drawImage(img,0,0,400,400);
	const a = now()*.5, d = PI*.5, tx=cv.width/2, ty=cv.height/2,
		  W=200+sin(now()*.33)*100,H=200+cos(now()*.5)*150,U = 64,V=64;
	let vv = [[ tx + W*cos(a+d*0), ty + H*sin(a+d*0),0,0],
			  [ tx + W*cos(a+d*1), ty + H*sin(a+d*1),U,0],
			  [ tx + W*cos(a+d*2), ty + H*sin(a+d*2),U,V],
			  [ tx + W*cos(a+d*3), ty + H*sin(a+d*3),0,V]];

	let odvv = [[ 0,0,0,0],
			  [ W*cos(a+d*0), H*sin(a+d*0),U,0],
			  [ W*cos(a+d*1), H*sin(a+d*1),U*.5,V],
			  [ W*cos(a+d*2), H*sin(a+d*2),0,V]];

	let func = haxtri;//frame&1 ? haxtri : xtextri;
	func(img, vv[0],vv[1],vv[2]);
	func(img, vv[0],vv[2],vv[3]);

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
