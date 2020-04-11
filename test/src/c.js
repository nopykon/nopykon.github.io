/*
ddd
  c.js - collision

*/

function chunk_proc( m ) 
{
	var C = { tris: [],	planes: [] };

	var i,j,a,b,c,ai,bi,ci,N;
	for( i=0;i<m.icount; i+=3 )
	{
		ai = m.Iv[i+0]*3 ;
		bi = m.Iv[i+1]*3 ;
		ci = m.Iv[i+2]*3 ;
		a = [ m.Pv[ai+0], m.Pv[ai+1], m.Pv[ai+2] ];
		b = [ m.Pv[bi+0], m.Pv[bi+1], m.Pv[bi+2] ];
		c = [ m.Pv[ci+0], m.Pv[ci+1], m.Pv[ci+2] ];
		vsub( V0, b,a );
		vsub( V1, c,a );
		N = vcross(V2,V0,V1 );
		vnorm(N,N);
		C.tris.push([ a,b,c ] );
		C.planes.push( [ N[0],N[1],N[2], -vdot( N,a ) ]); 
	}
	return C;
}


/*

  closest point triangle


function cp_tri( cp, p, Pv, N )
{
	var a=Pv[ 2 ], b=Pv[ 0 ], k,m,e,dp,em,ee,t ;
	for( k=0;k<3; ++k, a=b, b=Pv[k] )
	{
		m = vsub( V0, p,a )
		e = vsub( V1, b,a )
		dp = vdot( vcross( V2, e, N ), m );
		
		if( dp > 0. )//outside edge
		{
			em = vdot(e,m);
			if( em <= 0. )
				return vcpy(cp,a),0;
			
			ee = vdot(e,e);
			if( em >= ee )
				return vcpy(cp,b),0;
			
			//edge
			t = em / ee ; 
			return vads( cp, a, e, t ), 1; 
		}
	}
	return 2;
}
*/
