/*

 input


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
	  KZ = 90, KX = 88;

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
*/

	//terrain
	if( 0 ) 
	{
		ct.beginPath()
		
		let bx = 0|CT[3][0];
		let by = 0|CT[3][1];

		for(let y=-4;y<8;++y)
		{
			//for(let x=-N+(y&1);x<N;x+=2)
			//for(let x=-N;x<N;++x)
			for(let x=-4;x<=4;++x)
			{
				x += bx 
				y += by
				
				let ta = tmulv_DX(V0, DX, set3(R0,x+0,	y+0,0) )
				let tb = tmulv_DX(V1, DX, set3(R0,x+1,	y+0,0) )
				let tc = tmulv_DX(V2, DX, set3(R0,x+1,	y+1,0) )
				let td = tmulv_DX(V3, DX, set3(R0,x+0,	y+1,0) )
				
				if( cull(ta) ||	cull(tb) ||	cull(tc) ||	cull(td) )//any in
				//if( cull(ta) &&	cull(tb) &&	cull(tc) &&	cull(td) )//all in
				{
					let a = zdiv(R0, ta)
					let b = zdiv(R1, tb)
					let c = zdiv(R2, tc)
					let d = zdiv(R3, td)

					let avg = (ta[2] + tb[2] + tc[2] + td[4])*.25 
					//if( x < -2 || x > 2 )
					// {
					// 	zlist.push([ [a[0],a[1],1,65, avg],
					// 				 [b[0],b[1],65,65],
					// 				 [c[0],c[1],65,65+64],
					// 				 [d[0],d[1],1,65+64]])
					// }
					// else
					// {
						// zlist.push([ [a[0],a[1],130,		131, avg],
						// 			 [b[0],b[1],130+64,		131],
						// 			 [c[0],c[1],130+64,		131+64],
						// 			 [d[0],d[1],130,		131+64]])


						zlist.push([ [a[0],a[1],130,		131, avg],
									 [b[0],b[1],130+64,		131],
									 [c[0],c[1],130+64,		131+64]] )

						zlist.push([ [a[0],a[1],130,		131, avg],
									 [c[0],c[1],130+64,		131+64],
									 [d[0],d[1],130,		131+64]])

					// }
					
					//zlist.push([ [a[0],a[1],0,0],[c[0],c[1],4,4],[d[0],d[1],0,4], avg ])

					
					// ct.moveTo(a[0],a[1])
					// ct.lineTo(b[0],b[1])
					// ct.lineTo(c[0],c[1])
					// ct.lineTo(d[0],d[1])
				}
				x-=bx
				y-=by
			}
		}
		ct.fillStyle = rgbf(0,.5,.1)
		ct.fill()
	}

function exzlist_draw()
{
	zlist.sort( zsortf )

	for( let i=0;i<zlist.length;++i)
	{

		let a = zlist[i][0], b = zlist[i][1], c = zlist[i][2];

		if(0)
		{
			let ax = b[1]-a[1]
			let ay = a[0]-b[0]
			let aa = ax*ax + ay*ay ; 
			
			let bx = c[1]-b[1]
			let by = b[0]-c[0]
			let bb = bx*bx + by*by ; 

			let cx = a[1]-c[1]
			let cy = c[0]-a[0]
			let cc = cx*cx + cy*cy ; 
			
			if( !( aa && bb && cc ) )
				continue;

			const R = .5
			aa = R/sqrt(aa)
			bb = R/sqrt(bb)
			cc = R/sqrt(cc)

			ax *= aa
			ay *= aa

			bx *= bb
			by *= bb

			cx *= cc
			cy *= cc


			a[0] += ax
			a[1] += ay
			b[0] += ax
			b[1] += ay
			
			b[0] += bx
			b[1] += by
			c[0] += bx
			c[1] += by

			c[0] += cx
			c[1] += cy
			a[0] += cx
			a[1] += cy
		}
		else if(0)
		{

			let tx = (a[0] + b[0] + c[0]) * (1./3.) ;
			let ty = (a[1] + b[1] + c[1]) * (1./3.) ;

			let Ax = a[0] - tx ;
			let Ay = a[1] - ty ;
			let Bx = b[0] - tx ;
			let By = b[1] - ty ;
			let Cx = c[0] - tx ;
			let Cy = c[1] - ty ;
			let aa = Ax*Ax + Ay*Ay ;
			let bb = Bx*Bx + By*By ;
			let cc = Cx*Cx + Cy*Cy ;
			
			if( !( aa && bb && cc ) )
				continue;
			
			const R = 1.5 ;
			aa = R/sqrt(aa) ; // R * rsqrt(aa) 
			bb = R/sqrt(bb) ;
			cc = R/sqrt(cc) ;

			a[0] += Ax * aa ; 
			a[1] += Ay * aa ;
			b[0] += Bx * bb ; 
			b[1] += By * bb ;
			c[0] += Cx * cc ; 
			c[1] += Cy * cc ;
		}

		textri( tcan, a,b,c )


		/*
		  works, but drawing a single one is slow enought as it is...
		  a[0]+=.5, a[1]+=.5;
		  b[0]+=.5, b[1]+=.5;
		  c[0]+=.5, c[1]+=.5;
		  textri( tcan, a,b,c )
		*/
	}
	
	zlist = []

}


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
				cpy4(inn[inn_sz++],b);
			} else {
				lerp4(inn[inn_sz++], a,b, as/(as-bs));
				cpy4(out[out_sz++],inn[inn_sz-1]);
				cpy4(out[out_sz++],b);				
			}
		} else if( bs > 0 )	{
			lerp4(inn[inn_sz], b,a, bs/(bs-as));
			cpy4(out[out_sz++],inn[inn_sz++]);
			cpy4(inn[inn_sz++], b);
		} else {
			cpy4(out[out_sz++],b );
		}
	}

	//console.log(inn_sz, out_sz);
	for(let i=2;i<inn_sz;++i)
		textri( tcan, inn[0], inn[i-1], inn[i] );
	
	//draw out
	for(let i=0;i<out_sz;++i)
		out[i][2]+=32;
	for(let i=2;i<out_sz;++i)
		textri( tcan, out[0], out[i-1], out[i] );

}


			//if(  0 )
			{
				let tx = (a[0] + b[0] + c[0]) * (1./3.) ;
				let ty = (a[1] + b[1] + c[1]) * (1./3.) ;

				a[0] += ( a[0] - tx )*.04 ; 
				a[1] += ( a[1] - ty )*.04 ; 
				
				b[0] += ( b[0] - tx )*.04 ; 
				b[1] += ( b[1] - ty )*.04 ; 

				c[0] += ( c[0] - tx )*.04 ; 
				c[1] += ( c[1] - ty )*.04 ; 


				// let Ax = a[0] - tx ;
				// let Ay = a[1] - ty ;
				// let Bx = b[0] - tx ;
				// let By = b[1] - ty ;
				// let Cx = c[0] - tx ;
				// let Cy = c[1] - ty ;
				// let aa = Ax*Ax + Ay*Ay ;
				// let bb = Bx*Bx + By*By ;
				// let cc = Cx*Cx + Cy*Cy ;
				
				// if( !( aa && bb && cc ) )
				// 	continue;
				
				// aa = 1./sqrt(aa) ;
				// bb = 1./sqrt(bb) ;
				// cc = 1./sqrt(cc) ;

				// a[0] += Ax * aa ; 
				// a[1] += Ay * aa ;
				// b[0] += Bx * bb ; 
				// b[1] += By * bb ;
				// c[0] += Cx * cc ; 
				// c[1] += Cy * cc ;

				
				// a[0] += a[0]-tx<0 ? -4 : +4 ;
				// a[1] += a[1]-ty<0 ? -4 : +4 ;
				// b[0] += b[0]-tx<0 ? -4 : +4 ;
				// b[1] += b[1]-ty<0 ? -4 : +4 ;
				// c[0] += c[0]-tx>0 ? -4 : +4 ;
				// c[1] += c[1]-ty>0 ? -4 : +4 ;

			}

	/*
	//xyz uv
	let Pv = [[ -1, -1,  -.5,	0,0 ],
			  [ +1, -1,  -.5,	64,0 ],
			  [  0, +3,  -.5,	64,0 ],
			  [  0, -0,  +.5,   32,32]]
	
	let Iv = [ 0,1,3, //back
			   1,2,3, //r
			   2,0,3, //l,
			   0,2,1] //bot
		
		let Uv = [ [0,0],[32,0],[32,32]]
		
		//poly assemly
		for(let i=0; i < Iv.length; i+=3 )
		{
			for(let j=0; j<3; ++j)
			{
				let s= Pv[ Iv[i+j] ]
				let r= Rv[i+j]
				tmulv_DX(r, DX, s )
				zdiv(r,r)
				r[2]=Uv[j][0]
				r[3]=Uv[j][1]
			}
			//textri(can, Rv[i+0],Rv[i+1], Rv[i+2])
		}
		for(let i=0; i< Iv.length; i+=3 )
			textri(tcan, Rv[i+0],Rv[i+1], Rv[i+2])

		// let c = tmulv(V0, CT, s );
		
		// c = tmulv_DX( V1, DX, c)
		// zdiv(c, c )
		
		// textri(can,
		// 	   set4(R0, c[0]-32, c[1]-32, -16,-16),
		// 	   set4(R1, c[0]+32, c[1]-32, +16,-16),
		// 	   set4(R2, c[0]+0,  c[1]+32, +0, +16) )
	}
	*/


	//clipping experiment
	/*
	{
		let A = [0,		0,		0, 0,  .5 - sin(now())*.25];
		let B = [100,	0,		32,0,  .5 - cos(now())*.25];
		let C = [100,	100,	32,32, .5 + sin(now())*.25];
		let D = [0,		100,	0,32,  .5 + cos(now())*.25];
		clip_n_paint([A,B,C,D],4 );
	}
	*/
	
