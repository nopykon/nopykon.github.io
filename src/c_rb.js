
/*
  
  convex hulls 

*/


function convex_hull_volume_and_CoM( points, faces )
{
	var total_volume = 0.;
	var com = vset(V7,0,0,0)

	for( var i=0;i<faces.length;++i)
	{
		var f = faces[i], a,b,c
	
		a = points[f[0]]
		
		//for each triangle in face
		for( var j=2;j<f.length;++j)
		{
			b = points[f[j-1]]
			c = points[f[j]]
			vsub(V0, b,a)
			vsub(V1, c,a)
			var N = vcross(V2, V0,V1) 
			var len = sqrt(vdot(N,N));

			//var area = len/2.
			//calculate height (distance from face plane to origin of polyhedra)
			//NOTE: only works if origin actually is inside the polyhedra)

			//normalize 
			vscale(N,N,1./len)
			var height = vdot(a,N) ;//if normalized.
			var volume = height * len * 1./6. ;
			//var volume = height * area * 1./3. ;
			
			total_volume += volume ;
			for( var k=0;k<3;++k)
				com[k]+= (a[k]+b[k]+c[k])* volume *.25; 
		}
	}

	vscale(com,com,1./total_volume );
	
	//now translate 
	//console.log( 'Center of Mass at ', com[0],com[1],com[2], 'Volume at',total_volume );

	return com;
}

function make_hull(pv,iv, scale)
{
	var Ev=[], Nv=[],i,j,k,f,a,b,N

//	for( i=0;i<pv.length;++i)vmul1(pv[i],pv[i],.5)

	//adjust vertices to com if needed
	var cm = convex_hull_volume_and_CoM( pv,iv );
	if( cm[0]!=0. || cm[1]!=0. || cm[2]!=0. )
		for( i=0; i<pv.length;++i)
			vsub(pv[i],pv[i],cm);

	
	for( i=0;i<iv.length;++i)
	{
		//find edges 
		f=iv[i];
		var a = f[ f.length-1 ], b = f[0] ;
		for( j=0;j< f.length; ++j, a=b, b=f[j])
		{
			//add edge if not there already
			for( k=0 ; k<Ev.length && (a!=Ev[k+0] || b!=Ev[k+1]) &&
				 (a!=Ev[k+1]||b!=Ev[k+0]); k+=2);
			
			if( k == Ev.length ) // no dupe found
			{
				Ev.push(a);
				Ev.push(b);
			}
		}
		
		//calc plane 
		vsub( V0,pv[ f[1] ],pv[ f[0] ] )
		vsub( V1,pv[ f[2] ],pv[ f[0] ] )
		N = vcross(V2,V0,V1)
		vnorm(N,N);
		Nv.push( [ N[0],N[1],N[2], -vdot(N,pv[f[0]]) ] );
	}


	//minmax
	vcpy(V0,pv[0])
	vcpy(V1,pv[0])
	for( i=1;i<pv.length;++i)
		for(j=0;j<3;++j){
			V0[j] = min( V0[j], pv[i][j] );
			V1[j] = min( V0[j], pv[i][j] );
			V3[j] += pv[i][j]
		}

	

	return {points: pv, faces: iv, edges: Ev, planes: Nv,
			min: vcpy([],V0), max:vcpy([],V1)}
}

var box_hull = make_hull([[-1,-1,-1,0],
						  [-1,-1, 1,0],
						  [-1, 1, 1,0],
						  [-1, 1,-1,0],
						  [ 1, 1, 1,0],
						  [ 1, 1,-1,0],
						  [ 1,-1, 1,0],
						  [ 1,-1,-1,0]],
						 [[0,1,2,3],
						  [3,2,4,5],
						  [5,4,6,7],
						  [7,6,1,0],
						  [3,5,7,0],
						  [4,2,1,6]]);

var pyr_hull = make_hull( [[-1,-1,-.5], [ 1,-1,-.5],[ 0, 2,-.5], [0,0,.5] ],
						  [[2,1,0], [0,1,3], [1,2,3], [2,0,3]] )


/*
var box_hull = {

	points: [[-1,-1,-1],[+1,-1,-1],[+1,+1,-1],[-1,+1,-1],
			 [-1,-1,+1],[+1,-1,+1],[+1,+1,+1],[-1,+1,+1]],

	faces: [[3,2,1,0],
			[3,2,4+1,4+0],
			[3,2,4+1,4+0],
			[0,1,4+1,4+0],
			[0,1,2,3],
			[0,1,2,3],
			[0,1,2,3],
			[0,1,2,3],
			
	
	edges: [0,1, 1,5, 5,4,
			1,2, 2,6, 6,5,
			2,3, 3,7, 7,6,
			3,0, 0,4, 4,7 ],
	planes: [[-1, 0, 0, -1],
			 [ 1, 0, 0, -1],
			 [ 0, 1, 0, -1],
			 [ 0,-1, 0, -1],
			 [ 0, 0, 1, -1],
			 [ 0, 0,-1, -1]]
}*/



/*

  rigid bodies

*/


var rb=[]

function rb_add()
{
	rb.push({ 
		q:[0,0,0,1],
		t:tran(),
		//old_p:[0,0,0],
		//old_q:[0,0,0],
		v:[0,0,0],
		w:[.01*random(),.01*random(),.01*random()],

		F:[0,0,0],
		T:[0,0,0],
		imoi:1./3.,
		impulse_count:0,
		hull:box_hull
	});	
	return rb[rb.length-1]
}

var tpoints=[]
for( j=0;j<32;++j)tpoints[j]=[0,0,0,0]


//
function pop_tri(p,Pv,N)
{
	var a=Pv[ 2 ], b=Pv[ 0 ],k ;
	for( k=0;k<3; ++k, a=b, b=Pv[k] )
		if( vdot( vcross( V7, vsub( V6, b,a ), N ), vsub( V5, p,a ) ) > 0. )
			return 0;
	return 1;
}

//should probably accumulate all forces, and divide.
function rb_impulse(b, pt, F ){
	
	vadd(b.F,b.F,F)//linear
	var perp = vset(Q0,0,0,0);

	//var imoi = 1. / sqrt( rX*rX+rY*rY+rZ*rZ ) 
	var imoi = 1. /3.;
	
	
	for(var i=0;i<3;++i){
		
		vcross( perp, pt, b.t[i] );
		var dp =  vdot(perp,F);
		//some type of friction on every hit, among affected axi only
		//b.T[i] *= 1 - abs(dp)*(1.-.98) ; 
		b.T[i] -= dp*imoi//TAU
	}
	++b.impulse_count;
}

function rb_impulse_ID(b,pt,F)
{
	var imoi = 1. /3.;//( rX*rX+rY*rY+rZ*rZ ) 

	//linear (rotate to b.t)
	mmulv(V7,b.t,F);
	vadd(b.F,b.F,V7);

	//smells like cross product
	b.T[0] += (pt[1]*F[2] + pt[2]*F[1] )*imoi;
	b.T[1] += (pt[2]*F[0] + pt[0]*F[2] )*imoi;
	b.T[2] += (pt[0]*F[1] + pt[1]*F[0] )*imoi ;
	++b.impulse_count;
}


function rb_collide_map(B)
{
	h = B.hull

	//A, simple closest point thing
	var Ev = h.edges
	
	for( var i=0; i<h.points.length; ++i)
		tmulv(tpoints[i], B.t, h.points[i] );

	//TODO: probably sort out all tris that have a chance to collide.
	for( var k=0; k<Ev.length; k+=2 )
	{
		//clip edges a
		var a = tpoints[ Ev[k+0] ] ; 
		var b = tpoints[ Ev[k+1] ] ; 
		var d = vsub(V0, b,a );//so don't touch V0 after this

		//man... slow, optimize later
		for( var j=0; j<chunk.planes.length;++j) 
		{
			var N = chunk.planes[j];
			var s = vdot( a, N ) + N[3] ;
			var dp = vdot( d, N );
			
			if( dp == 0. )
				continue;
			
			var t = s / -dp ; 
			
			if( t < 0. || t > 1. ) //edge not crossing plane
				continue;
			

			//if it is though, which point is closer?
			var p = vads(V1,a,d,t) ; //also point on plane
			if( pop_tri( p, chunk.tris[j],N) )
			{
				//pick a point to apply force at... ?
				//var q = s>0 ? b : a ;
				
				//penetration depth, based on the vertex behind plane
				var depth = s < 0 ? s : vdot( b, N)+N[3] ;
				vsub( p, p, B.t[3] );
				var idp = V4
				var idv = V5
				mmulv_T(idp,B.t, p );//unrotate
				vcross( idv, B.w, idp ); //ang.v at pt id
				mmulv(V2,B.t,idv );//rotate back velocity
				vadd(V2,V2,B.v);//add linear
				var vdp = vdot(N, V2);
				vads(V2,V2,N,-vdp);//direction of friction force
				var ff = vdot(V2,V2) < .001  ? .25 : .01 ; 
				ff = (1.-depth)*ff
				//NORMAL FORCE
				var nf = max(0,-vdp );
				nf -= depth*.025 //separation boost (WARN: even if vtx is way out)
				//what's the closing velocity at this point?
				vscale(V3,N,nf);
				vads(V3,V3,V2,-ff);//NOTE: not unit
				rb_impulse(B,p,V3);
			}
		}
	}
}

/*
  TODO:

  have faces.
  -calculate planes and edges
  
  rb_rb :
  dist. check
  SAT
  clip shapes
  (clip each face of A, by B's planes from A's POV.)
  check for dupe verts, reconstruct edges. 

*/


//1 if overlap, 0 if gap
function find_gap(M,planes,points) //already calculated inv.
{
	//find a plane that all points are out of.
	for( var i=0; i<points.length;++i)
		tmulv( tpoints[i], M, points[i] );

	for( var i=0; i<planes.length;++i)
	{
		var P = planes[i], j = 0;
		
		for( ; j < points.length &&
			 (vdot( P, tpoints[j] ) + P[3]) > 0.
			 ;++j);

		if( j == points.length )//all point were out, gap found.
			return 1;
	}

	//no gap found
	return 0;
} 

var POV = tran()
function rb_rb(A,B)//transforms planes
{
	//radius test
	var d = vsub(V0, A.t[3], B.t[3] )
	if( vdot(d,d) > 9. )
		return 0;


	var ah = A.hull, bh = B.hull

	//B's planes, A's points  (A's frame)
	mmul_T( POV, A.t, B.t );	
	mmulv_T( POV[3], A.t, d );
	for( var i=0;i<bh.planes.length; ++i)
	{
		//transform plane
		var P = bh.planes[i], Q=V1, j = 0;
		mmulv( Q, POV, P );
		Q[3] = P[3] + vdot(Q,POV[3]);
		
		for(;j<ah.points.length && vdot(Q,ah.points[j])+Q[3]>0;++j);
		if( j==ah.points.length )
			return 1; //gap found
	}

	//A's planes, B's points 
	vneg(d,d);
	mmul_T( POV, B.t, A.t );	
	mmulv_T( POV[3], B.t, d );
	for( var i=0;i<ah.planes.length; ++i)
	{
		//transform plane
		var P = ah.planes[i], Q=V1, j = 0;
		mmulv( Q, POV, P );
		Q[3] = P[3] + vdot(Q,POV[3]);
		
		for(;j<bh.points.length && vdot(Q,bh.points[j])+Q[3]>0;++j);
		if( j==bh.points.length )
			return 1; //gap found
	}


	//find point of impact and penetration depth (but how?)
	//a, find good point inside all planes
	//b, use edges... average out all points of intersection 
	//c, clip convex hulls, take center point (same thing no?)
	



	//if no better way found, just use the center points 
	//apply impulse...
	var N = d;
	vnorm(N,N);
	var v = vsub( V1, B.v, A.v);
	var approach = min(-.01, vdot( N, v )) ;
	vscale(N,N,approach*.5);
	vsub(B.v,B.v,N);
	vadd(A.v,A.v,N);

	return 1;
}

function old_rb_rb(A,B)//transforms points
{
	//radius test
	var d = vsub(V0, A.t[3], B.t[3] )
	if( vdot(d,d) > 9. )
		return 0;

	//A's frame
	mmul_T( POV, A.t, B.t );	
	mmulv_T( POV[3], A.t, d );

	var ah = A.hull, bh = B.hull
	
	//A's planes, B's points 
	if( find_gap( POV,ah.planes, bh.points ) )
		return 0;
	
	//B's planes, A's points 
	vneg(d,d);
	mmul_T( POV, B.t, A.t );	
	mmulv_T( POV[3], B.t, d );
	if( find_gap( POV, bh.planes, ah.points ) )
		return 0;

	
	//find point of impact and penetration depth (but how?)
	
	//a, find good point inside all planes
	//b, use edges... average out all points of intersection 
	//c, clip convex hulls, take center point (same thing no?)
	



	//if no better way found, just use the center points 
	//apply impulse...
	var N = d;
	vnorm(N,N);
	var v = vsub( V1, B.v, A.v);
	var approach = min(-.01, vdot( N, v )) ;
	vscale(N,N,approach*.5);
	vsub(B.v,B.v,N);
	vadd(A.v,A.v,N);

	return 1;
}





function qqqqrb_rb(A,B)
{


	//pov translate B so that A's points are at id and B's point are at A's POV
	var ah = A.hull, bh = B.hull 
	var d = vsub(V0, A.t[3], B.t[3] )
	
	if( vdot(d,d) > 9 ) //radius test
		return 0;

	//from A's frame-matrix
	mmul_T( POV, A.t, B.t );	
	mmulv_T( POV[3], A.t, d );

	for( var i=0; i<bh.points.length;++i)
	{
		var p = tpoints[i]
		tmulv( p, POV, bh.points[i] );
		
		//is within all planes ?
		var smin=-999, si=0, j=0;
		for( ; j<ah.planes.length; ++j)
		{
			var s = vdot(ah.planes[j], p) + ah.planes[j][3] ; 
			if( s > 0 )
				break;

			if( s > smin ){
			 	smin = s;
				si = j;
			}
		}
		
		if( j == ah.planes.length )//B's point is inside all of A's planes 
		{
			//apply impulse to a and b at point p
			//best plane
			var P = ah.planes[si], depth = -smin ;
			
			//TODO: clever buttify 
			tmulv( p, B.t, bh.points[i] );
			var ap = vsub( V1, p, A.t[3] );
			var bp = vsub( V2, p, B.t[3] );//mad

			var N = V7;
			mmulv(N,A.t,P)
			vscale(N,N,depth*.5);
			rb_impulse(A,ap,N)
			vneg(N,N);
			rb_impulse(B,bp,N)
			
		}
	}
}

function rb_update()
{

	for( var i=0; i<rb.length; ++i)
	{
		B = rb[i] ;

		//this is naive.
		if( B.impulse_count)
		{
			var rec =  1./B.impulse_count;
			vads( B.w, B.w, B.T, rec );
			vads( B.v, B.v, B.F, rec );
//			for(var j=0;j<3;++j)
//				B.w[j] = clamp( B.w[j], -.01,.01);
			vset(B.T,0,0,0);
			vset(B.F,0,0,0);
			B.impulse_count = 0 ;
		}


		B.v[2] -= .005;//GRAVITY;

		//move forth
		vadd(B.t[3],B.t[3], B.v);
		vscale(B.v, B.v, .99 );//apply friction just after move

		//vsub(B.v, B.t[3], B.v );//store last position

		//apply rotation
		var qR=V0, w = B.w ;
		qrot(V0,1,0,0,w[0]);
		qrot(V1,0,1,0,w[1]);
		qrot(V2,0,0,1,w[2]);
		qmul(qR,qR,V1);
		qmul(qR,qR,V2);

		qmul(B.q,B.q,qR);
		qnorm(B.q,B.q);
		mat_from_quat( B.t, B.q );
	}

	//map collision
	for( var i=0; i<rb.length; ++i)
		rb_collide_map(rb[i]);
	
	/*

	for( var i=0; i<rb.length; ++i)
	{
		for(var j=i+1;j<rb.length;++j)
		{
			rb_rb(rb[i],rb[j]);
			rb_rb(rb[j],rb[i]);
		}
	}
	*/	
}

function rb_control(b)
{

}


function rb_draw_origin(ST)
{
	var i,j,t
	for( i=0; i<rb.length; ++i)
		for( t = rb[i].t, j = 0; j<3; ++j){
			G_vtx( t[3][0],t[3][1],t[3][2], 0,0,0);
			G_vtx( t[3][0]+t[j][0],
				   t[3][1]+t[j][1],
				   t[3][2]+t[j][2],
				   j == 0, j == 1, (j == 2)*2 )
		}
	G_draw(gl.LINES);
}



//literally only bodies use this.
function motion_transform( T, b, ST )//, keep quat )
{
	if(b.w[0]!=0.)
		qrot(V0,1,0,0,b.w[0]*ST);
	else
		qset(V0,0,0,0,1)
	
	if(b.w[1]!=0.)
	{
		qrot(V1,0,1,0,b.w[1]*ST);
		qmul(V0,V0,V1);
	}
	if(b.w[2]!=0.)
	{
		qrot(V1,0,0,1,b.w[2]*ST);
		qmul(V0,V0,V1);
	}
	
	qmul(V1,b.q,V0);
	qnorm(V1,V1);//don't?
	
	mat_from_quat( T, V1 );
	vads( T[3], b.t[3], b.v, ST);
}


function rb_draw(ST)
{
	//draw origins 
	for( var i=0; i<rb.length; ++i)
	{
		var b = rb[i]
		var h = b.hull;
		motion_transform(M0, b, ST );
		/*var t = b.t;
		vscale( V0, b.v, ST );
		vadd( b.t[3],b.t[3],V0)*/

		//transform
		for( var j=0;j<h.points.length;++j )
			tmulv(tpoints[j], M0, h.points[j]);
		
		//vsub( b.t[3],b.t[3],V0)

		for( var j=0;j<h.edges.length;j+=2 )
		{
			var a = tpoints[ h.edges[j+0] ]
			var b = tpoints[ h.edges[j+1] ]
			G_vtx( a[0],a[1],a[2], 1,1,1);
			G_vtx( b[0],b[1],b[2], 1,1,1);
		}
		G_draw(gl.LINES);
	}
}

