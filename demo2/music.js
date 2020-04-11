/*

 music.js

*/
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
const SR = context.sampleRate;

function playStereo(left,right,loop)
{
	let buffer = context.createBuffer(2, left.length, SR);
	buffer.copyToChannel(left, 0);
	buffer.copyToChannel(right, 1);
	var source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	source.loop = loop?true:false;
	source.start();
	//..
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
//const SPT = 204;//192;
//const SPT = 220;//192;
const SPT = 812;

function harp( si, n )
{

	let f = freq(n.key  +12+ .01*sin(si/SR*TAU*7));
	let atk = min(1,si/(.01*SR));
	let fde = min(1,(n.dur*SPT-si)/(.01*SR));
	let prg = si/(n.dur*SPT);

	let s =  Sine(si,f*(1.+ sin(si*.0009)*.0012) );
	s*= 1+.75*Sine(si,f*(.5 + sin(si*.001)*.001)); 
	s*= 1+ .3 *Sine(si,f*(2.505 + sin(si*.0005)*.001));
	s*= 1+ .0125 *Sq(si,f*(6.480 + sin(si*.0007)*.001));
	s*= 1+ .009*Saw(si,f*(11.509 + sin(si*.0013)*.0007)); 

	s*= 1 - prg*prg*prg;
	//s*=pow(1-prg,5);
	return s*atk*.9 ;
}

function organ( si, n )
{
	let f = freq(n.key -12 + .001*sin(si/SR*TAU*3));
	let atk = min(1,si/(.01*SR));
	let fde = min(1,(n.dur*SPT-si)/(.001*SR));
	let prg = si/(n.dur*SPT);

	let s =  0;//Sine(si,f*(.5+ sin(si*.0009)*.001) );
	s += .5*Sine(si,f*(1.));// + sin(si*.000175)*.001));
	s += .5*Sine(si,f*(2.));// + sin(si*.00075)*.001));
	s += .5*Sine(si,f*(4.));// + sin(si*.00035)*.001));
	s += .25*Sine(si,f*(8.));// + sin(si*.00055)*.001));
	s *= 1 + .025*Sine(si,f*(4.499 + sin(si*.001)*.00125)); 
	s *= 1 + .0125*Sine(si,f*(7.503 + sin(si*.0005)*.00125)); 
	s *= 1 + .00625*Saw(si,f*(9.6 + sin(si*.0003)*.00125)); 
	s*= 1-prg*prg*prg*prg;
//	s += .1*ran()*pow(1-prg,14);
	//s*=(1-prg)*(1-prg);
	return s*atk;
}

function base(si,n)
{
	let f = freq(n.key);
	let atk = min(1,si/(.01*SR));
	let fde = min(1,(n.dur*SPT-si)/(.001*SR));
	let prg = si/(n.dur*SPT);
	let rem = 1-prg;

	let s = 0;
	s += Sine(si,f*(3 + sin(si*.00079)*.001) );
	s += Sine(si,f*(2 + sin(si*.0009)*.001) );
	s *= 1 +Sine(si,f*(1. + sin(si*.0004)*.0015))*atk; 
	s *= 1 +Tri(si,f*(.5 + sin(si*.0008)*.0025))*atk; 
	s += .1*Saw(si,f*(1. + sin(si*.00068)*.005))*rem*rem*rem*rem; 
	s*= 1-prg*prg*prg*prg;
 	return s*atk;
}


function tune_play(barr)
{
	notes = [];
	let instr = 0, pt=0;
	for( let i=0;i<barr.length;i+=4)
	{
		let t = barr[i+0] | (barr[i+1]<<8);
		if( t<pt )
			instr=1;

		pt=t;
		notes.push({ tick: t + 0|(M.random()*5),
					 key:barr[i+2],
					 dur:barr[i+3],
					 ins: instr});
	}
	notes.sort( function(a,b){ return a.tick - b.tick; });
	
	let ln =  notes[notes.length-1];
	let end_tick = ln.tick + ln.dur + 100;
	const NUM_SAMPLES = SPT * end_tick;

	let left = new Float32Array( NUM_SAMPLES ); 
	let right = new Float32Array( NUM_SAMPLES );

	let instruments = [organ,organ];//,organ,harp,harp];
	
	let live = {};//live notes

	for(let tck=0,idx=0; tck < end_tick; ++tck)
	{

		//poll midi events
		for( ; idx < notes.length && notes[idx].tick <= tck; ++idx)
		{
			let n = notes[idx] ; 
			live[ n.key << (n.ins*8)] = n;//just push and search later instead of mapping? 
		}

		let balance = [.45+sin(tck*.005)*.075,
					   .55-sin(tck*.005)*.075 ];

		//iterate live instruments
		for( let k in live )
		{
			//scan for removal
			let n = live[k];
			if( tck == n.tick+n.dur  )
				delete live[k];
			else
				for( let i=SPT,qi = SPT*tck,si=(tck-n.tick)*SPT; i--;++si,++qi){
					let s =  instruments[ n.ins ] (si,n);
					
					let b = balance[n.ins];
					left[qi]+= s * (1-b);
					right[qi]+= s * b;
					//v[qi] += instruments[ n.ins ] (si,n);
					//v[qi]+= nasty( si, n.key );
					//if( n.key < 50 )
					//v[qi]+=drum( si, n.key );
				}
		}
	}

	amp(left,.8);
	amp(right,.8);	
	let LR = new Float32Array(left);
	for(let i=0;i<LR.length;++i)
		LR[i]+=right[i];

	//	REVERB
	function RRR(v,delay,decay){
		
		let ov = new Float32Array(LR);
		
		function revvv(delay, decay ){
			delay=0|delay*SR;
			let end=v.length;//-delay;
			for(let i=0; i<end; ++i )
				v[(i+delay) % v.length] += ov[i]*decay ;
		}
		//todo:stereo
		//iterate primes to avoid bad interference 
		//if(1)
		
		for( let n=2,is,pass=1;n<50;++n){
			for(is=2; is<n && (n%is);++is);
			if(is==n){
				if( ++pass > 2 )//blur background echo
				{
					rev(ov,.01*n,.5/pass);
					LPF(ov,.85);
				}
				//revvv( n*.1, 1./pass);//(pass*pass) );//(pass++) ) ;
				//revvv( n*.01, 1./n );//(pass++) ) ;
				revvv( delay*n, decay/n );//(pass++) ) ;
			}
		}

	}
	
	RRR(left, .100, .58 );
	RRR(right,.111, .63 );

	LPF(left,.99);
	LPF(right,.99);
	xfade(left,.001);
	xfade(right,.001);
	playStereo(left,right,true);

	init_game();
}


function click_to_play()
{
	document.getElementById("cv").onclick = function(){};
	document.getElementById("fps").innerHTML="<p>Generating audio...</p>";
	setTimeout(function(){
		//in order for DOM to update 
		var oReq = new XMLHttpRequest();

		oReq.open("GET", "amfiog", true);
		//oReq.open("GET", "hot_mel", true);
		oReq.responseType = "arraybuffer";
		oReq.onload = function (oEvent) {
			var arrayBuffer = oReq.response; // Note: not oReq.responseText
			if (arrayBuffer)
				tune_play(new Uint8Array(arrayBuffer));
			else
				init_game();
		};

		//oReq.timeout = 2000;
		
		oReq.onerror = function(){
			document.getElementById("fps").innerHTML="<p>Failed to load audio.</p>";
			init_game();
		};

		oReq.send(null);
	},100);
}


/*function playSound(buf,loop) {
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
}*/
