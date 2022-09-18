
function wave( p, x, y ){
	let c = cos( x*.6+ y*.3 + tick*.01 )
	p[0] = x
	p[1] = y
	p[2] = c
	return p
}
function checkered_flag()
{
	//checkered flag
	set3( MT[0], 2,0,0)
	set3( MT[1], 0,0,2)
	set3( MT[2], 0,-2,0)
	set3( MT[3], 0,16,0)
	tpovDX(DX,CT,MT);

	ct.fillStyle = 'rgba(0,0,0,.5)'
	ct.beginPath();

	const N = 8
	let W = 0|((cv.width * N) / cv.height) ;  
	for(let y=-N;y<=N; ++y){
		for(let x=-W+(y&1);x<=W;x+=2){
			let ta = tmulv_DX(V0, DX, wave(R0,x+0,	y+0,-1) )
			let tb = tmulv_DX(V1, DX, wave(R0,x+1,	y+0,-1) )
			let tc = tmulv_DX(V2, DX, wave(R0,x+1,	y+1,-1) )
			let td = tmulv_DX(V3, DX, wave(R0,x+0,	y+1,-1) )

			if( cull(ta) ||	cull(tb) ||	cull(tc) ||	cull(td) )//any in
			{
				let a = zdiv(R0, ta)
				let b = zdiv(R1, tb)
				let c = zdiv(R2, tc)
				let d = zdiv(R3, td)

				ct.moveTo( a[0],a[1] )
				ct.lineTo( b[0],b[1] )
				ct.lineTo( c[0],c[1] )
				ct.lineTo( d[0],d[1] )
			}
		}
	}
	ct.fill()
	
	//NOPY'S SEAL KART RACING TITLE
	let a = sin( tick*.005 )*.15
	let s = 5
	let C = cos(a)*s, S =sin(a)*s
	set3( MT[0], C,S,0)
	set3( MT[1], 0,0,s)
	set3( MT[2], S,-C,0)
	set3( MT[3], 0,16,10)
	tpovDX(DX,CT,MT);
	drawMesh(Nopy);
	zlist_draw();

}
