/*

 music.js

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
	now = () => window.performance.now()/1e3 ;



//window.AudioContext = window.AudioContext || window.webkitAudioContext;
let context = new AudioContext();
const SR = context.sampleRate;

function playSound(buf,loop) {

	let buffer = context.createBuffer(1, buf.length, SR);
	buffer.copyToChannel(buf, 0);
	
	let source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = loop?true:false;

	var gainNode = context.createGain();
	gainNode.gain.setValueAtTime(.75, context.currentTime);
	source.connect(gainNode);
	gainNode.connect(context.destination);
	//source.onended = on_stop_tune;//script.js
	source.start(context.currentTime);
}

function playStereo(arr,loop) {

	let buf = new Float32Array(arr.length);

	for (let i = 0; i < arr.length; i++) 
		buf[i] = arr[i];//0|(arr[i]*30000);

	let buffer = context.createBuffer(1, buf.length, SR);
	buffer.copyToChannel(buf, 0);
	
	let source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = loop?true:false;

	var gainNode = context.createGain();
	gainNode.gain.setValueAtTime(.75, context.currentTime);
	source.connect(gainNode);
	gainNode.connect(context.destination);
	//source.onended = on_stop_tune;//script.js
	source.start(context.currentTime);
}


let freq = n => 440. * pow(2., (n-49.)/12. );


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


function xrev( dst, delay, decay ){
	delay=0|delay*SR;
	//from=max(1,0|from*SR); 

	let end=dst.length;//-delay;
	//expand for echo
	for(let i=end; i< end+delay; ++i) dst[i]=0;
	//
	for(let i=1;i<end; ++i )
		dst[i+delay] += dst[i]*decay ;
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


const SPT = 200;//|(SR/10000);

/*

 instruments

*/
function organ( si, k )
{
	let low = freq(k-36);
	let vib = .01*sin(TAU*si/SR*4);
	let mid = freq(k-24 + vib );
	let high = freq(k-12 + vib );

	
	let fade_in = .025;
	let FIS = 0|fade_in*SR;
	let vol = min(FIS, si )/FIS ;

	let FIS2 = 0|.25*SR;

	let vol_slow = min(FIS2, si )/FIS2 ;

	//let fade_out = .1;
//	let fade = 1 - min(SR,si)/(SR);
	let fade = 1/(1+si*.01);// - min(SR,si)/(SR);

	//let sample = Sq(si*.996,fo+.01)*Sine(si,fo)*vol;
	let sample = 0;
	sample += Sine(si,mid+2);//*fade;
	sample += Sq(si,high-2) * .8;//*fade;
	sample += Saw(si,mid) * Sine(si,mid+1)*.5;
	sample *= vol;
	
	sample += Tri(si,high)*fade;
	sample *= fade;
	sample *= vol ;
	sample *= vol;
	return sample ;
}

function simple( si, k )
{
	let tone_in = .998 + .002 * min(1.,si/(SR*.6) ) ;
	let low2 = freq(k - 20+12);
	
	k = k*tone_in - 20+12 + .015*sin(si/SR*TAU*9) ;
	let low = freq(k);

	let fade_in = .005;
	let FIS = 0|fade_in*SR;
	fade_in = min(FIS, si )/FIS ;

	let drop = 1-min(1, si / (SR*.1));
	let sample = 0;
	sample += Saw( si, low*1.0015 )*Sine(si,low*1.998)*fade_in ; 
	sample += Saw( si, low*.992 )*drop ; 
	//sample += Sine( si, low*1.995 )*.5 ; 
	sample += Sine( si, low2*.5 )*.6;
	return sample;
}


function clav( si, k )
{
	let tone_in = .998 + .002 * min(1.,si/(SR*.6) ) ;
	k = k*tone_in - 20 + .015*sin(si/SR*TAU*9) ;
	let low = freq(k);

	let fade_in = .02;
	let FIS = 0|fade_in*SR;
	fade_in = min(FIS, si )/FIS ;
	let drop = 1-min(1, si / (SR*.6));
	
	let SinePhase = ( q, tone,phase ) => sin( ((TAU*q+TAU*phase)*tone)/SR ) ;
	
	//let A = Saw(si,mid * .5 *.992) ;
	let A = Saw(si,low*.5 *1.992)*drop;
	let B = Saw(si,low)*.95;
	let C = Saw(si,low * 1.008)*.7 ;
	let D_atk = min(1.,(si/SR) / .016) ;
	let D = Sine(si,low ) * .5*drop;//D_atk *.25 ;
	let sample = A + C + B*D;
	return sample; //*fade_in;
}



function tune_play(barr)
{
	let notes = [];
	for( let i=0;i<barr.length;i+=4)
		notes.push({ tick: barr[i+0] | (barr[i+1]<<8),
					 key:barr[i+2],
					 dur:barr[i+3] });

	let live = {};//live notes
	//let v=[];//samples, the entire tune
	const NUM_SAMPLES = SPT * notes[notes.length-1].tick ; //NOTE + space for Reverb
	let v = new Float32Array( NUM_SAMPLES ); 
	
	for(let tck=0,idx=0; idx < notes.length; ++tck)
	{
		//poll midi events
		for( ;idx < notes.length && notes[idx].tick <= tck; ++idx)
			live[ notes[idx].key ] = notes[idx];//just push and search later instead of mapping? 
		
		//iterate live instruments
		let lc = Object.keys(live).length  ;
		if(lc > 0 )
		{
			//console.log('lc = ', lc, ' tck = ', tck );
			for( let k in live )
			{
				//scan for removal
				let n = live[k];
				if( tck == n.tick+n.dur  )
					delete live[k];
				else
					for( let i=SPT,qi = SPT*tck,si=(tck-n.tick)*SPT; i--; ++si, ++qi )
						v[qi]+=simple( si, n.key );
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

	//gen primes
	if(1)
	for( let n=2,is,pass=1;n<100;++n){
		for(is=2; is<n && (n%is);++is);
		if(is==n)
		{
			if( ++pass > 3 )
			{
				//blur background
				rev(ov,.1*n,.5/pass);
				//rev(ov,.5,.5);
				LPF(ov,.7);
				amp(ov,1);
			}
			//revvv( n*.234, .5/n );//(pass++) ) ;
			revvv( 1/n, .5/pass );//(pass++) ) ;
			amp(v,1);
		}
	}	
	amp(v,1.0);
	LPF(v,.65);

	playSound(v);

}


var oReq = new XMLHttpRequest();
oReq.open("GET", "jap", true);
oReq.responseType = "arraybuffer";

oReq.onload = function (oEvent) {
  var arrayBuffer = oReq.response; // Note: not oReq.responseText
  if (arrayBuffer) {
	  tune_play(new Uint8Array(arrayBuffer));
  }
};
oReq.send(null);


//tune_play();
