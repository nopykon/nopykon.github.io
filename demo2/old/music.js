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
	sample += Saw(si,mid+2);//*fade;
	sample += Saw(si,high-2) * .8;//*fade;
	sample += Saw(si,mid) * Sine(si,mid+1)*.5;
	sample *= vol;
	//sample += Tri(si,high)*fade;
	//sample *= fade;
	//sample *= vol ;
	//sample += .5*ran()*fade;// * Sq(si,mid+1)*.5 ;

	//vol *= fade;
	
	//Sine(si,mid ) * Tri(si,mid);
	//sample += Saw(si-30,low+1)*.3;
	


	sample *= vol;
	return sample ;
}
function clav( si, k )
{
	let low = freq(k-24);
	let mid = freq(k-12);
	let high = freq(k-0);

	
	let fade_in = .01;
	let FIS = 0|fade_in*SR;
	let vol = min(FIS, si )/FIS ;

	//let fade_out = .1;
	let fade = 1/(1+si*.0005);
	//vol *= fade;

	//let sample = Sq(si*.996,fo+.01)*Sine(si,fo)*vol;
	let sample = Sine(si,low)*(1-Tri(si+100,low)*.1)*vol;
	sample *= Sq(si,mid)*vol*fade;
	sample += Sq(si,high)*fade*.5;

	return sample ;
}

function tune_play()
{
	const IDX_TICK = 0 ; 
	const IDX_KEY = 1 ; 
	const IDX_ON = 2 ; 


	let live = {};//live notes
	//let v=[];//samples, the entire tune
	const NUM_SAMPLES = SPT * notes[notes.length-1][IDX_TICK] ; //NOTE + space for Reverb
	let v = new Float32Array( NUM_SAMPLES ); 
	
	for(let tck=0,idx=0; idx < notes.length; ++tck)
	{
		//poll midi events
		for( ;idx < notes.length && notes[idx][IDX_TICK] <= tck; ++idx)
		{
			let n = notes[idx] ;
			//todo: try splice etc
			if( n[IDX_ON] )
			{
				
				live[ n[IDX_KEY] ] = n ;//alt push
				//console.log('added ', n[IDX_KEY], live);
				//;
			}
			else
			{
				//console.log('removed ', n[IDX_KEY]);
				delete live[ n[IDX_KEY] ];//alt. use arr and loop.

			}
		}
		//iterate live instruments
		let lc = Object.keys(live).length  ;
		if(lc > 0 )
		{
			//console.log('lc = ', lc, ' tck = ', tck );
			
			for( let k in live )
			{
				let n = live[k];
				//let f = freq(n[IDX_KEY]-12);
				//let fo = freq(n[IDX_KEY]-24);
				
				//process all the samples in this "tick"
				for( let i=SPT,qi = SPT*tck,si=(tck-n[IDX_TICK])*SPT; i--; ++si, ++qi )
				{
					//TODO: INSTRUMENTS
					v[qi]+=clav( si, n[IDX_KEY] );
					//v[qi]+=organ( si, n[IDX_KEY] )*.4;
					//find instrument
					/*
					 //fade in 
					let fade_in = .01;
					let FIS = 0|fade_in*SR;
					let vol = min(FIS, si )/FIS ;
					//let fade_out = .1;
					let fade = 1/(1+si*.0005);
					//vol *= fade;
					//fade out , hmm, need to know end time then....
					//how... pre-scan ?  store both start and end/dur
					//let vol = min(1024, si )/1024
					v[qi] += Sine(si,fo)*vol;
					v[qi] += Saw(si,f)*vol*.5;
					v[qi] += Sq(si,f)*vol*fade;
					//v[qi] += Tri(si+f*100,f)*vol*.5;
					 */
				}
			}
		}
		//append to whole 
		//v = v.concat(v,w);
	}
	
	if(0)
	for(let i=0;i<10;++i)
		rev(v,
			.0001 + i*.001,//delay
			.5/(1.+i*1.5) //decay
		   );

	amp(v,1.0);	



	

	//make a copy of v 
	//let ov = new Float32Array(v);
	
	for(let j=0;j<10; ++j){
		for(let i=0;i<10; ++i){	}
	}

	function revvv(delay, decay ){
		delay=0|delay*SR;
		let end=v.length-delay;
		for(let i=0; i<end-6; ++i )
			//v[i+delay] += v[i+ (0|M.random()*6)]*decay ;
			v[i+delay] += v[i]*decay ;
	}

	
	//gen primes

	let primes=[2],revs=1;
	for( let n=2,is;n<100;++n){
		for(is=2; is<n && (n%is);++is);
		if(is==n)
		{
			revvv( 4. / n, .5/n ) ;

		}
	}
	//console.log(primes);
	//for(let i=1;i<10;++i) 
	//revvv( (i*2)*.05, .5 );///(1+i*1.25) );




	
	//LPF(v,.15);		

	//acoustics
	//??bounce a in a box

	//fine
	if(0)
	for(let i=1;i<100;++i) 
		revvv(v,
			  .05+ i*.05,
			  .5/(1+i*4)
			 );
	//

	//echo
	if(0)
	for(let i=1;i<25;++i) 
		rev(v,
			i*.5,
			.5/(1+i*2)
		   );
	
	
	//LPF(v,.9);
	//xfade(v,.1);
	amp(v,1.0);
	
	playSound(v);

}



tune_play();
