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

//vec4
let qset = (d,x,y,z,w) => (d[0]=x,d[1]=y,d[2]=z,d[3]=w,d); 
let qcpy = (d,s) => (d[0]=s[0],d[1]=s[1],d[2]=s[2],d[3]=s[3],d); 


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



function qlerp(d,a,b,t)
{
	for(let i=0;i<4;++i)
		d[i] = a[i] + (b[i]-a[i])*t ; 
	return d; 
}

let inn=[],out=[],inn_sz,out_sz;
for(let i=0;i<16;++i)inn[i]=[0,0,0,0] ; 
for(let i=0;i<16;++i)out[i]=[0,0,0,0] ; 
//clip and draw a 2D-poly
function clip_n_paint( vv, vc ) //[x,y,u,v,L]
{
	inn_sz=0 ; 
	out_sz=0 ;
	const cutoff = .5 ;
	/*
	for(let i=0,a=vv[vc-1],b=vv[0]; i<vc;a=b,b=vv[++i])	{
		let as = a[4]-cutoff, bs = b[4]-cutoff;
		if( as > 0 ){//hmm, why not just use 0.
			if( bs > 0 )
				qcpy(inn[inn_sz++],b);
			else
				qlerp(inn[inn_sz++], a,b, as/(as-bs));
		} else if( bs > 0 ){
			qlerp(inn[inn_sz++], b,a, bs/(bs-as));
			qcpy(inn[inn_sz++], b);
		}
	}*/

	for(let i=0,a=vv[vc-1],b=vv[0]; i<vc;a=b,b=vv[++i])	{
		let as = a[4]-cutoff, bs = b[4]-cutoff;

		if( as > 0 )
		{
			if( bs > 0 )
				qcpy(inn[inn_sz++],b);
			else
			{
				qlerp(inn[inn_sz++], a,b, as/(as-bs));
				
				qcpy(out[out_sz++],inn[inn_sz-1]);
				qcpy(out[out_sz++],b);				
			}
			
		} 
		else if( bs > 0 )
		{
			qlerp(inn[inn_sz++], b,a, bs/(bs-as));
			qcpy(inn[inn_sz++], b);
			
			//qcpy(out[out_sz++], a);
			qcpy(out[out_sz++],inn[inn_sz-2]);

		}
		else
		{
			qcpy(out[out_sz++],b );

		}
	}


	console.log(inn_sz, out_sz);

	//draw inn

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
	d[0] = s[0]*r + cv.width*.5;
	d[1] = s[1]*r + cv.height*.5;
	//d[0] = 0|(s[0]*r + cv.width*.5);
	//d[1] = 0|(s[1]*r + cv.height*.5);
	
	return d;
}

/*

 game.js

*/

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
		vset(MT[3], 0,0,s*.5);
	}
	tpovDX(DX,CT,MT);
	
	let a=qset(R0,0,0,0,0),
		b=qset(R1,0,0,32,0),
		c=qset(R2,0,0,32,32),
		d=qset(R3,0,0,0,32);
	let uv = [[0,0],[32,0],[32,32],[0,32]]; 
	let vv = [[],[],[],[]]; 
	for(let y=0;y<32;++y){
		for(let x=0;x<16;++x){
			
			for(let i=0;i<4;++i)
			{
			}
			zdiv(a,tmulv_DX( V0, DX, vset(V1,x+0,y+0,0)));
			zdiv(b,tmulv_DX( V0, DX, vset(V1,x+1,y+0,0)));
			zdiv(c,tmulv_DX( V0, DX, vset(V1,x+1,y+1,0)));
			zdiv(d,tmulv_DX( V0, DX, vset(V1,x+0,y+1,0)));
			/*a[2] = (x+16&31)*32;
			b[2] = a[2]+32;
			c[2] = a[2]+32;
			d[2] = a[2];*/
			//zdiv
			textri(can,a,b,c);
			textri(can,a,c,d);
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
	
}


let tick=0,last_time = 0.,last_frame = 0.,frame = 0 ;
let can = document.createElement("canvas");
can.width = 64;
can.height = 32;

{
	let img = new Image();
	function rgbf(r,g,b)
	{
		return 'rgba('+(r*255)+','+(g*255)+','+(b*255)+',1.0)' ;
	}
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
	};
	img.src = "tex.png";
}



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

	game_render();
	
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
