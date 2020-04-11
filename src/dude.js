
var dude = {
	p: [0.,0.,0.5],
	v: [0.,0.,0.],
	m: tran(),
	r: .5,
	ground: 0,
	slope: [0,0,1.],
	dir: [1,0,0],
	acc: [0,0,0],
	jesus: 0
};



function dude_collide( d, chunk ) 
{
	d.ground = 0 ; 
	for( var i=0; i<chunk.planes.length; ++i ){
		var N = chunk.planes[i];
		var s = vdot( d.p, N ) + N[3] ; 

		//r = MAX(0,-.N[2])
		var magnet = N[2]>=.7 ? .01 : 0 ;

		if( s > 0. && s < d.r + magnet ){
			if( 2 == cp_tri(V7, d.p, chunk.tris[i], N ) ){ //plane
				vads( d.p, d.p, N, d.r-s );
				if( N[2]>.7 ){
					d.ground=1;
					vcpy(d.slope,N);
				}
				//d.ground |= N[2]>.7;
			}else{
				N = vsub( V7,d.p,V7 )
				s = vnorm( N,N );
				if( s < d.r )
				{
					vads( d.p, d.p, N, d.r-s );
					if( N[2]>.7 )
					{
						d.ground=1;
						vcpy(d.slope,N);
					}
				}
			}
		}
	}
}

const ACC =  .0025
const XY_MAX =  .05
const Z_MAX =  1.

//const GRAVITY = .0025
const JESUS = 16

function dude_control(d)
{

	if( keyd(KR) )
		//dude_reset()
		vset(d.p,0,0,20);
	//accelerate
	var u = key(KF) - key(KS) ;
	var v = key(KE) - key(KD) ;

	if( u || v )
	{
		var f = vset(V0, -CT[2][0], -CT[2][1], 0);
		if( vnorm(f,f) > 0. )
		{
			//TODO: compare f to current, vdot(f,d.dir)<0 = perform turn/break
			///
			var r = vset( V1, f[1],-f[0],0);
			if( u && v ) 
				u*=.707, v*=.707;

			var acc = vset( d.acc, r[0]*u + f[0]*v, r[1]*u + f[1]*v, 0 );
			
			if( d.ground ){//project onto slope
				var N = d.slope
				var dp = acc[0]*N[0]+ acc[1]*N[1];
				acc[2] = dp / -N[2] ; 
				if( 0. != vnorm( acc,acc ) )
					vads(d.v,d.v, acc, ACC );
			}else
				vads(d.v,d.v, acc, ACC*.25 );
			
			//limit
			var s = d.v[0]*d.v[0] + d.v[1]*d.v[1] ;
			if( s > XY_MAX*XY_MAX )
			{
				s = XY_MAX/s
				d.v[0] *= s
				d.v[1] *= s
			}
		}
	}
	else if( d.ground > 0 ) // on ground with no acc = break
	{
		d.v[0] *= .95;
		d.v[1] *= .95;
	}

	if(!d.ground){
		//jump-break
		if( d.v[2] > 0. && !(key(SPACE) || but(0)) )
			d.v[2]*=.9;

		//gravity
		d.v[2]-=GRAVITY;
		--d.jesus;
	}else 
		d.jesus = JESUS;

	//jump
	if( d.jesus > 0 && ( keyd(SPACE) || butd(0) ) )
			d.v[2] += GRAVITY*60, d.ground = d.jesus = 0;

}	
var dslopp=[0,0,1]
function dude_animate(d)
{
//	if( vdot( d.dir, d.acc ) < 0. )	return;
//	d.dir[0]+=d.v[0]*3;
//	d.dir[1]+=d.v[1]*3;
	
	if( vdot(d.acc,d.v) < .025 ){ //perform break, don't turn

	}else if( vdot(d.dir, d.acc) < -.707 ){//rotate toward 
		d.dir[0]+=d.acc[1]*.2;
		d.dir[1]-=d.acc[0]*.2;
	}else{
		d.dir[0]+=d.acc[0]*.2;
		d.dir[1]+=d.acc[1]*.2;
	}
	
	if( vnorm(d.dir,d.dir ) == 0. )
		vset(d.dir,1,0,0);
		
/*	if( d.slope[2]>.707 )
	{
		var Z = vcpy(d.m[2],d.slope)
		var X = vcross(d.m[0],d.dir,Z);
		var Y = vcross(d.m[1],Z,X);
		vnorm(X,X)
		vnorm(Y,Y)
	}*/

	//TODO: should be  [0,0,1] if running fast on slope, but not climbing...
	//>>>: use vertical acceleration * velocity for slop target then.
	var tN = vset(V0,0,0,1), N = d.slope;
	if( N[2]>.707 && d.ground>0 )
		vlerp(tN, tN, N, sqrt(vdot(d.v,d.v))*10 )

	vlerp(dslopp,dslopp,tN,.2)
	vnorm(dslopp,dslopp)

	//vads(dslopp,dslopp, d.slope[2] > .707 ? d.slope : [0,0,1], .05 )
	//vnorm(dslopp,dslopp);
	//if( d.slope[2]>.707 )
	{
		var Z = vcpy(d.m[2],dslopp)//d.slope)
		var X = vcross(d.m[0],d.dir,Z);
		var Y = vcross(d.m[1],Z,X);
		vnorm(X,X)
		vnorm(Y,Y)
	}


/*	vset(V0, d.v[0],d.v[1],0)
	if( vnorm(V0,V0) > .01 )
		vcpy(d.dir,V0);*/
}


function dude_update(d)
{
	dude_control(d)
	
	//apply
	vadd(d.p,d.p,d.v)
	vsub(d.v,d.p,d.v)
	dude_collide(d, chunk);
	vsub(d.v,d.p,d.v);
	
	//frikk
	vmul1(d.v,d.v,.99);

	dude_animate(d);

}




/*

  c   b

    a

function cp_tri( cp, p, a, b, c, N )
{
	var m = vsub( V0, p,a )
	var e = vsub( V1, b,a )
	//var bc = vsub( V2, c,b )
	//var ca = vsub( V3, a,c )
	
	var dp = vdot( vcross( V4, e, N ), m );
	
	if( dp > 0. )//outside edge
	{
		var em = vdot(e,m);
		if( em <= 0. )
			return vcpy(cp,a),0;
		
		var ee = vdot(e,e);
		if( em >= ee )
			return vcpy(cp,b),0;

		//edge
		var t = em / ee ; 
		vads( cp, a, e, t ); 
		return 1 ; 
	}
	
	return 2;
}
*/
