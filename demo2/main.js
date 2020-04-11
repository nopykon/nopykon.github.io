/*

 main.js

 get >back< at your neighbours?

 */
let M = Math,
	sqrt = M.sqrt, 
	cos = M.cos,
	sin = M.sin,
	abs = M.abs,
	min = M.min,
	max = M.max,
	pow = M.pow,
	PI = M.PI,
	TAU = M.PI*2,
	fract = a => a%1.,
	clamp = (a,b,c) => a<b?b:a>c?c:a,
	ran = () => M.random()*2-1,
	now = () => window.performance.now()/1e3,
	pr = (s) => (s+=(s<<1)+(s>>1),s)
;

let vset = (d,x,y,z) => (d[0]=x,d[1]=y,d[2]=z,d),
	vcpy = (d,s) => (d[0]=s[0],d[1]=s[1],d[2]=s[2],d),
	vneg = (d,s) => (d[0]=-s[0],d[1]=-s[1],d[2]=-s[2],d),
	vadd = (d,a,b) => (d[0]=a[0]+b[0],d[1]=a[1]+b[1],d[2]=a[2]+b[2],d),
	vsub = (d,a,b) => (d[0]=a[0]-b[0],d[1]=a[1]-b[1],d[2]=a[2]-b[2],d),
	vmul = (d,a,b) => (d[0]=a[0]*b[0],d[1]=a[1]*b[1],d[2]=a[2]*b[2],d),
	vscale = (d,a,s) => (d[0]=a[0]*s,d[1]=a[1]*s,d[2]=a[2]*s,d),
	vads = (d,a,b,t) => (d[0]=a[0]+b[0]*t,d[1]=a[1]+b[1]*t,d[2]=a[2]+b[2]*t,d),
	vdot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
	vcross = (d,a,b) => ( d[0]=a[1]*b[2] - a[2]*b[1],
						  d[1]=a[2]*b[0] - a[0]*b[2],
						  d[2]=a[0]*b[1] - a[1]*b[0],
						  d),
	vnorm = (d,s) => vscale(d,s, 1/sqrt(vdot(s,s)) );

//vec4
let qset = (d,x,y,z,w) => (d[0]=x,d[1]=y,d[2]=z,d[3]=w,d); 
let qcpy = (d,s) => (d[0]=s[0],d[1]=s[1],d[2]=s[2],d[3]=s[3],d); 


//object recycling 
let V0=[0,0,0,0],V1=[0,0,0,0],V2=[0,0,0,0],V3=[0,0,0,0],
	R0=[0,0,0,0],R1=[0,0,0,0],R2=[0,0,0,0],R3=[0,0,0,0];



/*

 input

*/
let keys=[],keys_tick=[];
let onkeyup,onkeydown; //poll key functions to overload
function key(i){return keys[i]?1:0;}
function keyp(i){return keys[i]==tick?1:0;}
const default_keys=[27,8,9,13,32,37,38,39,40,16,17,18,87];//prevent default
const SHIFT = 16,	CTRL = 17,	ALT = 18,	SPACE = 32,	RETURN = 13, ESCAPE=27,
	  LEFT = 37,	RIGHT = 39,	DOWN = 40,	UP = 38,
	  KA = 65,	KD = 68,	KS = 83,	KW = 87, 
	  KQ = 81,	KE = 69,	KR = 82,	KG = 71,    KH = 72,
	  KJ = 74,	KL = 76,	KM = 77,	KK = 75,	KI = 73	,
	  KU = 85,	KO = 79,	KP = 80, KC = 67,	KF = 70, 
	  KZ = 90, KX = 88
;
function kbd(e){
	if(default_keys.indexOf(e.keyCode)>-1)
		e.preventDefault();
	if( e.repeat )
		return;
	if(!keys[e.keyCode] && onkeydown)
		onkeydown( e.keyCode );
	keys[e.keyCode]=tick;
}
function kbu(e){
	if(default_keys.indexOf(e.keyCode)>-1)
		e.preventDefault();
	if(keys[e.keyCode] && onkeyup)
		onkeyup( e.keyCode );
	keys[e.keyCode]=0;
}
window.addEventListener('keydown', kbd, false);
window.addEventListener('keyup', kbu, false);


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
	let a = r*(ax*bv - av*bx);
	let b = r*(au*bx - ax*bu);
	let d = r*(ay*bv - av*by);
	let e = r*(au*by - ay*bu);
	let c = A[0] + a*-A[2] + b*-A[3] ;
	let f = A[1] + d*-A[2] + e*-A[3] ;
	
	ct.save();
	ct.beginPath();
	ct.moveTo(A[0],A[1]);
	ct.lineTo(B[0],B[1]);
	ct.lineTo(C[0],C[1]);
	//ct.closePath();
	ct.clip();
	ct.transform(a, d,
				 b, e,
				 c, f ) ;
	ct.drawImage(image, 0, 0);
	ct.restore();
}


//let vlerp = (d,a,b,t) => (vsub(R0,b,a),vads(d,a,R0,t),d);

function qlerp(d,a,b,t)
{
	for(let i=0;i<4;++i)
		d[i] = a[i] + (b[i]-a[i])*t ; 
	return d; 
}

let inn=[],out=[] ;//,inn_sz,out_sz;
for(let i=0;i<16;++i)inn[i]=[0,0,0,0],out[i]=[0,0,0,0] ; 

//clip and draw a 2D-poly
function clip_n_paint( vv, vc ) //[x,y,u,v,L]
{
	const cutoff = .5 ;
	let inn_sz=0 ; 
	let out_sz=0 ;
	for(let i=0,a=vv[vc-1],b=vv[0]; i<vc;a=b,b=vv[++i])	{
		let as = a[4]-cutoff, bs = b[4]-cutoff;

		if( as > 0 ) {
			if( bs > 0 ) {
				qcpy(inn[inn_sz++],b);
			} else {
				qlerp(inn[inn_sz++], a,b, as/(as-bs));
				qcpy(out[out_sz++],inn[inn_sz-1]);
				qcpy(out[out_sz++],b);				
			}
		} else if( bs > 0 )	{
			qlerp(inn[inn_sz], b,a, bs/(bs-as));
			qcpy(out[out_sz++],inn[inn_sz++]);
			qcpy(inn[inn_sz++], b);
		} else {
			qcpy(out[out_sz++],b );
		}
	}
	//console.log(inn_sz, out_sz);
	for(let i=2;i<inn_sz;++i)
		textri( can, inn[0], inn[i-1], inn[i] );
	
	//draw out
	for(let i=0;i<out_sz;++i)
		out[i][2]+=32;
	for(let i=2;i<out_sz;++i)
		textri( can, out[0], out[i-1], out[i] );

}

let CT = [[1,0,0],[0,0,1],[0,-1,0],[0,-5,1]];
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
function mmulv_DX(d,m,s){
	for(let i=0;i<3;++i)
		d[i] = vdot(m[i],s);
	return d;
}



let fov = 1.;
function zdiv(d,s)
{
	let r = cv.width/ max(-s[2],.01)*fov;
	d[0] = s[0]*r + cv.width*.5;
	d[1] = s[1]*r + cv.height*.5;
	//d[0] = 0|(s[0]*r + cv.width*.5);
	//d[1] = 0|(s[1]*r + cv.height*.5);
	return d;
}

/*

 game.js

*/

let camp=[0,-1,1],camv=[0,0,0] ;
let dudep=[0,0,0];
function game_step()
{
	dudep[0]+=keyp(RIGHT)-keyp(LEFT);
	let ay=keyp(UP)-keyp(DOWN);
	dudep[1]+=ay;
	dudep[2]+=ay;
	
	
	//const move_target = [((tick>>6)&1)*10,-10,10];
	vadd(camp,camp,camv);
	let dis = 7;
	let tgt = vset(V0,dudep[0],dudep[1]-dis,dudep[2]+dis);
	vsub(camv,tgt,camp );
	vscale(camv,camv,.1);
	//vsub(V0,pt,cam.p);

}


let notes;
function tune_draw()
{
	const y = cv.height-128-64;
	let l = notes[ notes.length-1]; 
	let r = cv.width/(l.tick+l.dur);
	//draw entire tune...
	for( let i=0;i<notes.length;++i)
	{
		let n = notes[i];
		let y0 = y +n.ins * 64;
		ct.fillRect( n.tick*r, y0+(n.key-32)*2, n.dur*.1, 2 );  
	}
}

let sid = 11244;
let raan = () => (sid+=(sid<<2)+(sid>>1),sid);

function draw_stars()
{
	ct.fillStyle = 'white';
	sid = 123456;
	const cw=cv.width,ch = cv.height, cx = cv.width/fov ;

	for(let i=400; i--; )
	{
		/*vset(V0,
			 (raan()&255)-128,
			 (raan()&255)-128,
			 (raan()&255));*/
		
		let A0 = (raan()&255)-128 * .01;
		let A1 = (raan()&255)-128 * .01;
		vset(V0,
			 sin(A1)*cos(A0),
			 -cos(A1)*cos(A0),
			 sin(A0)*.5 );
		
		let s = mmulv_DX( V1, DX, V0 );
		if( s[2] < -.5 )
		{
			let r = cx / -s[2];
			let x = s[0]*r + cv.width*.5;
			let y = s[1]*r + cv.height*.5;
			if(x>0&&x<cw&&y>0&&y<ch)
				ct.fillRect(x,y,3,3);
		}

		
	}

}

function game_render(ST)
{
	ct.setTransform(1,0, 0,1, 0,0);
	ct.clearRect(0,0,cv.width,cv.height);

	ct.imageSmoothingEnabled = false;

	ct.save();
	ct.setTransform(1,0,
					0,-1,
					0,cv.height);


	//setup camera matrix
	vads(CT[3],camp,camv,ST);
	//vsub(CT[2],camp,dudep);
	vset(CT[2],0,-1,1);
	vnorm(CT[2],CT[2]);
	vcross(CT[0],vset(V0,0,0,1),CT[2]);
	vnorm(CT[0],CT[0]);
	vcross(CT[1],CT[2],CT[0]);
	/*{
		let t = now()*.1;
		let c=cos(t), s=sin(t);
		vset(CT[0], c,s,0);
		vset(CT[1], 0,0,1);
		vset(CT[2], s,-c,0);
		vset(CT[3], 0,0,1 );
	}*/
	tpovDX(DX,CT,ID);
	
	let a=qset(R0,0,0,0,0),
		b=qset(R1,0,0,32,0),
		c=qset(R2,0,0,32,32),
		d=qset(R3,0,0,0,32);

	//grid
	for(let y=-4;y<4;++y){
		for(let x=-4;x<4;++x){
			zdiv(a,tmulv_DX( V0, DX, vset(V1,x+0,y,y+0)));
			zdiv(b,tmulv_DX( V0, DX, vset(V1,x+1,y,y+0)));
			zdiv(c,tmulv_DX( V0, DX, vset(V1,x+1,y,y+1)));
			zdiv(d,tmulv_DX( V0, DX, vset(V1,x+0,y,y+1)));
			textri(can,a,b,c);
			textri(can,a,c,d);

			zdiv(b,tmulv_DX( V0, DX, vset(V1,x+1,y+1,y+1)));
			zdiv(a,tmulv_DX( V0, DX, vset(V1,x+0,y+1,y+1)));
			textri(can,d,c,b);
			textri(can,d,b,a);
		}
	}

	//clipping experiment
	{
		let A = [100,100, 0, 0,  .5 - sin(now())*.25];
		let B = [200,100, 32,0,  .5 - cos(now())*.25];
		let C = [200,200, 32,32, .5 + sin(now())*.25];
		let D = [100,200, 0,32,  .5 + cos(now())*.25];
		clip_n_paint([A,B,C,D],4 );
	}


	//stars
	draw_stars();
	tune_draw();
}

let rgbf = (r,g,b) => 'rgba('+(r*255)+','+(g*255)+','+(b*255)+',1.0)' ;

let tick=0,last_time = 0.,last_frame = 0.,frame = 0 ;
let can = document.createElement("canvas");
can.width = 64;
can.height = 32;

{
	let img = new Image();
	img.onload=function(){
		let c = can.getContext("2d");
		c.imageSmoothingEnabled = false;
		c.drawImage(img,0,0,32,32);
		c.globalCompositeOperation = 'source-over';
		c.drawImage(img,32,0,32,32);
		c.globalCompositeOperation = 'multiply';
		c.fillStyle = rgbf(.1,.3,.35);
		c.fillRect(32,0,32,32);
		img = undefined;
		//signal asset loaded
	};
	img.src = "tex.png";
}


let last_t=now();

function r_update()
{
	rid = undefined;

	const pHz = 200;//144
	const ONE_TICK = 1./pHz;
	let cur = now();
	let pass = cur - last_t;
	let num = M.floor(pass*pHz);///ONE_TICK);
	let rest = pass-num*ONE_TICK;
	if( num > 0 )//?? REMOVE BS?
	{
		last_t = cur - rest ;
		for( num = min( num, 3 ); num--; ++tick )
			game_step();
	}

	game_render( rest * pHz);
	++frame;

	/*
	{
		let t = now();
 		let d = t-last_time;
	 document.getElementById('fps').innerHTML = (((d*1000)|0)/1000).toString();
		last_time = t ;
	}
	*/
	rid = requestAnimationFrame( r_update, cv ) ;
}


	
let cv,ct,rid;

function init_game()
{
	let e=document.getElementById('fps');
	e.parentNode.removeChild(e);

	
	cv = document.getElementById("cv");
	ct = cv.getContext('2d');
	
	function resize()
	{
		cv.width = cv.clientWidth;
		cv.height = cv.clientHeight;
	}

	//init
	window.addEventListener('resize', resize, false);
	resize();

	//request 
	rid = requestAnimationFrame( r_update, cv ) ;
}



//Generating audio
//init_game();

/*var oReq = new XMLHttpRequest();
oReq.open("GET", "3d/hero", true);
oReq.responseType = "arraybuffer";

oReq.onload = function (oEvent) {
  var arrayBuffer = oReq.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    var byteArray = new Int8Array(arrayBuffer);
	  for (var i = 0; i < byteArray.byteLength; i+=4) {
		  // do something with each byte in the array
		  console.log( byteArray[i+0],byteArray[i+1],byteArray[i+2],byteArray[i+3] ) ;
      }
  }
};
oReq.send(null);*/












