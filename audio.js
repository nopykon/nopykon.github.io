

/*

  audio.js
  
  author: Kristoffer Gustavsson aka. Nopy, @qristofer
  e-mail: nopykon@gmail.com
  twitter: @qristofer
  

*/
var source = null, context = null;


(function (){
	const M = Math,
		  PI = M.PI, 
		  TAU = M.PI*2, 
		  pow = M.pow,
		  sqrt = M.sqrt,
		  min = M.min,
		  max = M.max,
		  abs = M.abs,
		  sin = M.sin,
		  cos = M.cos
	;
	let ran =()=> M.random()*2-1;
	let clamp =(a,b,c) => a<b?b:a>c?c:a;
	let now =()=> window.performance.now()/1e3 ;
	let fract =(x) => x%1.;

	/*

	  wave and sample functions 

	*/

	let Sine = ( q, tone ) => sin( (TAU*q*tone)/SR ) ;
	let Saw = ( i, tone ) => -1 + fract( (i*tone)/SR) * 2 ;
	let Sq = (i, tone) => fract( (i*tone)/SR ) > .5 ? -1 : 1 ;

	function Tri( q, tone){//hmm, make nicer later ...
		let t = fract((q*tone)/SR);
		return ( t<.5 ? t : 1.-t ) *4-1 ;
	}
	
	function rev2( dst, from, delay, decay ){
		delay=0|delay*SR;
		from=max(1,0|from*SR); 
		let end=dst.length-delay;		
		for(let i=from;i<end; ++i )
			dst[i+delay] += dst[i]*decay ;
	}
	function rev3( v, 
				   samples,
				   delay, delay_incr,
				   decay, decay_incr )
	{
		for(let i=0;i<samples;++i)
			rev2(v,
				 0,
				 delay + i*delay_incr + ran()*delay_incr*.999,
				 decay/(1.+i*decay_incr));
	}
	
	function fadein(v,s){
		for(let i=0;i<s*SR && i<v.length;++i)
			v[i]*= i/(s*SR);
	}
	function fadeout(v,s){
		for(let i=v.length-s*SR,j=0; i < v.length; ++i,++j )
			v[i] *= 1. - j/(s*SR);
	}
	//silence!
	function sil( v, s ){ for(s = 0|s*SR;s--;)v[v.length]=0; }

	function xfade(v,s){
		s = s*SR|0;
		for(let i=0;i<s;++i)
			v[i]= v[i]*(i/s)+v[v.length-s+i]*(1-i/s);
		v.length-=s;
	}
	function LPF( v, lp ){//low pass filter
		v[0]*=lp;
		for(let i=1;i<v.length;++i)
			v[i] =  v[i-1] + lp * ( v[i]-v[i-1] );
	}
	function amp(dst, lim){
		let s = 0.;
		for(let i=0;i<dst.length;++i)
			if(dst[i])
				s = max( s, abs( dst[i] ) );
		s = 1./s * lim;
		for(let i=0;i<dst.length;++i)
			dst[i]*=s;
	}
	let freq = n => 440. * pow(2., (n-49.)/12. );
	
	/*

	  playback

	*/
	
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	let context = new AudioContext();
	const SR = context.sampleRate;

	function playSound(arr,loop) {
		let buf = new Float32Array(arr.length);

		for (let i = 0; i < arr.length; i++) 
			buf[i] = arr[i];//0|(arr[i]*30000);

		let buffer = context.createBuffer(1, buf.length, SR);
		buffer.copyToChannel(buf, 0);
		
		source = context.createBufferSource();
		source.buffer = buffer;
		source.loop = loop?true:false;

		var gainNode = context.createGain();
		gainNode.gain.setValueAtTime(.5, context.currentTime);
		source.connect(gainNode);
		gainNode.connect(context.destination);
		source.onended = on_stop_tune;//script.js
		source.start(context.currentTime);
	}
	function stop_tune(){ source.stop(context.currentTime); }	;
	
	/*

	  generate a repetetive tune
	  
	*/
	//if(1)
	{
		let v=[];
		//for(var verse=0;verse<2;++verse)
		for(let z=0;z<4;++z){
			for(let q=0; q<12;++q){
				let k =20 + 3*(z>>1)*(z>>1) + 7*(q<6?q:12-q);//24;
				let s = 1/freq(k)*SR;
				let rep = 0|((SR*.125)/s);
				let dur = s*rep;//(0|(SR*.3);
				let atk = 0|.01*SR;
				let fade = 0|.05*SR;
				let off=-1+ran();
				let nos = 0,tnos=ran()/128;
				
				for(let i=0;i<dur;++i){
					let avol = clamp(i/atk,0,1);
					let fvol = clamp((dur-i)/fade,0,1);
					let vol = min(avol,fvol);
					let w = 0;
					let t = 1-i/dur;
					let tt = t*t;

					if(!(q%3)){
						if(!(i&31))
							tnos=(ran()-nos)/32;
						nos+=tnos;
						w+=nos*tt*tt*vol*.4 ;
						w+= ran()*.1*tt*tt*tt;
					}
					if(!(q%6))
						w+=Tri(i,freq( k+12*2+7 ))*tt ;

					if((z&1)&& !(q&1))
						w+=Sine(i,freq( 2*12+(k>>1)-7+off*tt ))*tt ;
					//w+=(nos+sin(ran()*PI)*.125)*tt*tt*.23
					//w+=Saw(i,freq( k+offtune*t+12 )) *tt *.25;
					w+=Sine(i,freq( k+off*t )) *vol;
					//w+=Saw(i,freq( k+offtune*tt +7)) *vol*.3; 
					//w+=Tri(i,freq( k+off*t -5)) *vol*.5
					v[v.length]=w;
				}
				sil(v,.125);
			}
			//LPF(v,.9)
		}

		//add reverb
		for(let i=0;i<100;++i)
			rev2(v,
				 0,
				 .0025 + i*.005 +ran()*.005,
				 .5/(1.+i*.700000));

		xfade(v,.01);
		amp(v,1.);
		
		playSound(v,0);
	}

	//generate seawaves 
	/*
	if(0){
		let v=[];
		let S = 7
		let tS = 3*S
		let dur=tS*SR|0, r=ran()
		for(let i=0;i<dur;++i)
		{
			let w = 0;//Sine(i+ran()*4,sin(99*.0001+ran()*.001)*40+100)*.15 ; 
			w += ran() * (sin(i*TAU/(S*SR))*.40+.60) ; 
	
			if(0){//howling wind attempt
				let vol = 1.2+ cos(i*TAU/dur*3);
				vol *= .1025
				w += Tri(i,433+6*sin(i*TAU/dur*.6))*vol*.3
				w += Tri(i,432+7*sin(i*TAU/dur*.5))*vol*.6
				w += Tri(i,430+10*sin(i*TAU/dur*1.31))*vol*.9
			}
	
			v[i] = w;
		}
		LPF(v,.05);
		xfade(v,.2);
		amp(v,.2)
		playSound(v,1);
	}
	*/

})();

