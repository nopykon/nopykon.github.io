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

let inn=[],out=[] ;//,inn_sz,out_sz;
for(let i=0;i<16;++i)inn[i]=[0,0,0,0] ; 
for(let i=0;i<16;++i)out[i]=[0,0,0,0] ; 
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
		vset(CT[0], c,s,0);
		vset(CT[1], 0,0,1);
		vset(CT[2], s,-c,0);
		vset(CT[3], 0,0,1 );
	}

	tpovDX(DX,CT,ID);
	
	let a=qset(R0,0,0,0,0),
		b=qset(R1,0,0,32,0),
		c=qset(R2,0,0,32,32),
		d=qset(R3,0,0,0,32);

	for(let y=-8;y<8;++y){
		for(let x=-8;x<8;++x){
			zdiv(a,tmulv_DX( V0, DX, vset(V1,x+0,y+0,0)));
			zdiv(b,tmulv_DX( V0, DX, vset(V1,x+1,y+0,0)));
			zdiv(c,tmulv_DX( V0, DX, vset(V1,x+1,y+1,0)));
			zdiv(d,tmulv_DX( V0, DX, vset(V1,x+0,y+1,0)));
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


	//stars
	ct.fillStyle = 'white';
	let seed = 124;
	function star(){
		seed += (seed>>1)|(seed<<1)+4536;
		return ((seed&1023)-512)/512; 
	}
	for(let x=1000; x--; )
	{
		let a0 = star()*PI;
		let a1 = star()*PI;
		vset(V0, sin(a0)*sin(a1), -cos(a0)*sin(a1), .5+.5*cos(a1) );
		let p = R3;
		zdiv(p,mmulv_DX( V1, DX, V0 ));
		
		ct.fillRect(p[0]-1,p[1]-1,3,3);

	}

	
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












/*

 music.js

*/
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
const SR = context.sampleRate;

/*
 STEREOIDS
 var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

 // Create an empty three-second stereo buffer at the sample rate of the AudioContext
 var myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);

 // Fill the buffer with white noise;
 // just random values between -1.0 and 1.0
 for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
 // This gives us the actual array that contains the data
 var nowBuffering = myArrayBuffer.getChannelData(channel);
 for (var i = 0; i < myArrayBuffer.length; i++) {
 // Math.random() is in [0; 1.0]
 // audio needs to be in [-1.0; 1.0]
 nowBuffering[i] = Math.random() * 2 - 1;
 }
 }

 // Get an AudioBufferSourceNode.
 // This is the AudioNode to use when we want to play an AudioBuffer
 var source = audioCtx.createBufferSource();

 // set the buffer in the AudioBufferSourceNode
 source.buffer = myArrayBuffer;

 // connect the AudioBufferSourceNode to the
 // destination so we can hear the sound
 source.connect(audioCtx.destination);

 // start the source playing
 source.start();
*/

function playSound(buf,loop) {
	let buffer = context.createBuffer(1, buf.length, SR);
	buffer.copyToChannel(buf, 0);
	
	let source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = loop?true:false;

	//skip this in release
	var gainNode = context.createGain();
	gainNode.gain.setValueAtTime(.75, context.currentTime);
	source.connect(gainNode);
	gainNode.connect(context.destination);
	//source.onended = on_stop_tune;//script.js
	source.start(context.currentTime);
}


let freq = n => 440. * pow(2., (n-57.)/12. );
//let freq = n => 440. * pow(2., (n-49.)/12. );
let Sine = ( q, tone ) => sin( (TAU*q*tone)/SR ) ;
let Saw = ( i, tone ) => -1 + fract( (i*tone)/SR) * 2 ;
let Sq = (i, tone) => fract( (i*tone)/SR ) > .5 ? -1 : 1 ;
function Tri( q, tone){//hmm, make nicer later ...
	let t = fract((q*tone)/SR);
	return ( t<.5 ? t : 1.-t ) *4-1 ;
}

function LPF( v, lp ){//low pass filter
	v[0]*=lp;
	for(let i=1;i<v.length;++i)
		v[i] =  v[i-1] + lp * ( v[i]-v[i-1] );
}

function xfade(v,s){
	s = 0|s*SR;
	for(let i=0;i<s;++i)
		v[i]= v[i]*(i/s)+v[v.length-s+i]*(1-i/s);
	v.length-=s;
}

function rev( dst, delay, decay ){
	delay=0|delay*SR;
	let end=dst.length-delay;
	for(let i=1;i<end; ++i )
		dst[i+delay] += dst[i]*decay ;
}

function amp(dst, lim){
	let s = 0.;
	for(let i=0;i<dst.length; s=max(s,abs(dst[i])), ++i){};

	s = 1./s * lim;
	for(let i=0;i<dst.length;++i)
		dst[i]*=s;
}
let s0=124,r0;
function drum(si,f )
{
	if((si&15)==0)
		s0 = pr(s0);
	let r0 = ((s0&1023)-512)/512;
	let vol = 1-si/SR ;
	let smp = 0;
	smp += Sine(si,60)*Sine(si,45);
	smp += r0*.25 + ran()*.01;
	return smp*vol*vol*vol;
}

//duration of a tick (higher = slower speed). "Samples Per Tick"
const SPT = 200;
function simple( si, k )
{
	let f = freq(k);
	let atk = min(1,si/(.05*SR));
	let drop = 1-min(1, si / (SR*.4));
	//let slowdrop = 1-min(1, si / (SR*.25));
	let sample = ran()*.01;

	sample += Tri( si, f + sin(si/1000)*.5 )*drop*atk;
	sample += Saw( si, f + cos(si/1100)*.5 )*drop*drop;
	sample += Sq( si, f + cos(si/900)*.5 )*drop*drop;
	sample += Sine( si, f*.5 )*drop*2*atk;
	return sample;
}
function nasty( si, k )
{
	let tone_in = .998 + .002 * min(1.,si/(SR*.6) ) ;
	k = k*tone_in - 12 + .015*sin(si/SR*TAU*9) ;
	let low = freq(k);

	let fade_in = .005;
	let FIS = 0|fade_in*SR;
	fade_in = min(FIS, si )/FIS ;

	let drop = 1-min(1, si / (SR*.1));
	let sample = 0;
	sample += Saw( si, low*1.0015 )*Sine(si,low*1.998)*fade_in ; 
	sample += Saw( si, low*.992 )*drop ; 
	//sample += Sine( si, low*1.995 )*.5 ; 
	sample += Sine( si, low*.5 )*.6;
	return sample;
}

function tune_play(barr)
{
	let notes = [];
	for( let i=0;i<barr.length;i+=4)
		notes.push({ tick: barr[i+0] | (barr[i+1]<<8),
					 key:barr[i+2],
					 dur:barr[i+3] });

	let live = {};//live notes
	const NUM_SAMPLES = SPT * notes[notes.length-1].tick ; //NOTE + space for Reverb
	let v = new Float32Array( NUM_SAMPLES ); 
	
	for(let tck=0,idx=0; idx < notes.length; ++tck)
	{
		//poll midi events
		for( ;idx < notes.length && notes[idx].tick <= tck; ++idx)
			live[ notes[idx].key ] = notes[idx];//just push and search later instead of mapping? 

		//iterate live instruments
		for( let k in live )
		{
			//scan for removal
			let n = live[k];
			if( tck == n.tick+n.dur  )
				delete live[k];
			else
				for( let i=SPT,qi = SPT*tck,si=(tck-n.tick)*SPT; i--;++si,++qi){
					v[qi]+=simple( si, n.key );
					//if( n.key < 50 )
					//v[qi]+=drum( si, n.key );
				}
		}
	}

	amp(v,1.0);
	
	//	REVERB
	let ov = new Float32Array(v);
	function revvv(delay, decay ){
		delay=0|delay*SR;
		let end=v.length-delay;
		for(let i=0; i<end; ++i )
			v[i+delay] += ov[i]*decay ;
	}

	//todo:stereo
	//iterate primes to avoid bad interference 
	for( let n=2,is,pass=1;n<50;++n){
		for(is=2; is<n && (n%is);++is);
		if(is==n){
			if( ++pass > 3 )//blur background echo
			{
				rev(ov,.1*n,.75/pass);
				LPF(ov,.9);
			}
			//revvv( n*.234, .5/pass );//(pass++) ) ;
			revvv( 1/n, .5/pass );//(pass++) ) ;
		}
	}
	
	amp(v,1.5);
	LPF(v,.965);
	for(let i=0;i<v.length;++i)
		v[i]=clamp(v[i],-1,1);

	//xfade(v,.1);
	playSound(v,true);

	//
	init_game();
}

function click_to_play()
{
	document.getElementById("cv").onclick = function(){};
	document.getElementById("fps").innerHTML="<p>Generating audio...</p>";
	setTimeout(function(){
		//in order for DOM to update 
		var oReq = new XMLHttpRequest();
		oReq.open("GET", "jap", true);
		oReq.responseType = "arraybuffer";
		oReq.onload = function (oEvent) {
			var arrayBuffer = oReq.response; // Note: not oReq.responseText
			if (arrayBuffer) {
				tune_play(new Uint8Array(arrayBuffer));
			}else{
				document.getElementById("fps").innerHTML="<p>Failed to load audio.</p>";
			}
		};
		oReq.send(null);
	},1000);
}
