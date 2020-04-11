/*
  
  m.js

*/
'use strict';

var cv = document.getElementById('cv3D') ;

function now(){ return window.performance.now()/1000. ; }

var sqrt=Math.sqrt,
	abs=Math.abs,
	min=Math.min,
	max=Math.max,
	sin=Math.sin,
	cos=Math.cos,
	pow=Math.pow,
	sign=Math.sign,
	floor=Math.floor,
	round=Math.round,
	random=Math.random,
	PI = Math.PI,
	TAU = PI*2; 

//for use anywhere
var V0=[0,0,0,0],
	V1=[0,0,0,0],
	V2=[0,0,0,0],
	V3=[0,0,0,0],
	V4=[0,0,0,0],
	V5=[0,0,0,0],
	V6=[0,0,0,0],
	V7=[0,0,0,0];

var VV=[V0,V1,V2,V3,V4,V5,V6];



//used by quat, spline and collision
var Q0=[0,0,0,0],
	Q1=[0,0,0,0],
	Q2=[0,0,0,0],
	Q4=[0,0,0,0] ;



function clamp(v,b,e){return v<b?b:v>e?e:v;}


//vector 3d stuff
function vdot(a,b){	return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];	}

function vcross(xp,a,b){
	xp[0]=a[1]*b[2] - a[2]*b[1];
	xp[1]=a[2]*b[0] - a[0]*b[2];
	xp[2]=a[0]*b[1] - a[1]*b[0];
	return xp;
}

function vlerp(d,a,b,t,n){
	n=n?n:3;
	for(var i=0;i<n;++i)
		d[i]=a[i]+(b[i]-a[i])*t
}

//Didn't I write a faster version of this???
function vspline4(r,a,b,c,d,t)
{
	vlerp(Q0,a,b,t);
	vlerp(Q1,b,c,t);
	vlerp(Q0,Q0,Q1,t);
	vlerp(Q2,c,d,t);
	vlerp(Q1,Q1,Q2,t);
	vlerp(r,Q0,Q1,t);
	return r
}

function vnorm(n,v, str){
	var len = sqrt( vdot(v,v) )
	if(!len){
		console.log('ZERO LEN ' + str );
	}else
		vscale( n,v,1/len );
	return len;
}
function vset(v,x,y,z){	v[0]=x,v[1]=y,v[2]=z; return v; }
function vcpy(d,s){ d[0]=s[0],d[1]=s[1],d[2]=s[2]; return d; }
function vneg(d,s){ d[0]=-s[0],d[1]=-s[1],d[2]=-s[2]; return d; }

function vsub( d, a, b){return d[0]=a[0]-b[0],d[1]=a[1]-b[1],d[2]=a[2]-b[2],d ;}

function vadd(d,a,b){
	d[0]=a[0]+b[0];
	d[1]=a[1]+b[1];
	d[2]=a[2]+b[2];
	return d;
}
function vads(r,a,b,s){
	r[0]=a[0]+b[0]*s
	r[1]=a[1]+b[1]*s
	r[2]=a[2]+b[2]*s
	return r
}
function vscale(d,v,f){ d[0]=v[0]*f, d[1]=v[1]*f, d[2]=v[2]*f; return d }
function vmul(d,a,b){ d[0]=a[0]*b[0], d[1]=a[1]*b[1], d[2]=a[2]*b[2]; return d }

/*

  TODO: use mat4 for everything
  mat3

*/
function mcpy(d,s){for(var i=0;i<3;++i)vcpy(d[i],s[i]);}
function tcpy(d,s){for(var i=0;i<4;++i)vcpy(d[i],s[i]);}

function mset(t,rx,ry,rz,ux,uy,uz,bx,by,bz){
	vset(t[0],rx,ry,rz);
	vset(t[1],ux,uy,uz);
	vset(t[2],bx,by,bz);
}

function tset(t,Xx,Xy,Xz, Yx,Yy,Yz, Zx,Zy,Zz,Wx,Wy,Wz){
	vset(t[0],Xx,Xy,Xz);
	vset(t[1],Yx,Yy,Yz);
	vset(t[2],Zx,Zy,Zz);
	vset(t[3],Wx,Wy,Wz);
}
function mmulv(d,m,v ){
	for(var i=0;i<3;++i)
		d[i]=m[0][i]*v[0] + m[1][i]*v[1] + m[2][i]*v[2] 
}
function mmulv_T(d,m,v ){
	for(var i=0;i<3;++i)
		d[i]= m[i][0]*v[0] + m[i][1]*v[1] + m[i][2]*v[2]   ;
}

function tmulv(d,t,v ){
	for(var i=0;i<3;++i)
		d[i]=t[0][i]*v[0] + t[1][i]*v[1] + t[2][i]*v[2] + t[3][i];
}
/*function tmulv_T(d,t,v ){
	vsub( Q0, v, t.p );
	mmulv_T( d,t.m, Q0)
}*/
function mmul(m,a,b){
	var i,j,k;
	for( i=0;i<3;++i)
		for( j=0;j<3;++j)
			for( k=0, m[i][j]=0. ; k<3; ++k )
				m[i][j]+=a[k][j]*b[i][k];
}
function mmul_T( m, a, b){
	var i,j,k;
	for( i=0;i<3;++i)
		for( j=0; j<3; ++j)
			for( k=0, m[i][j]=0.;k<3;++k)
				m[i][j]+=a[j][k]*b[i][k];
}

/*


  transform


*/
//transforms
//w is never used 
function tran(){return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];}
const ID = tran();
var MT=tran(),CT=tran(),IC=tran(),M0=tran(),M1=tran(),M2=tran() ;

function tpov(t,a,b){
	mmul_T( t, a, b );	
	vsub(Q0,b[3],a[3]);
	mmulv_T( t[3], a, Q0 );
}

/*

  Float32Array(16)
  
*/
var _M = new Float32Array(16);//model
var MV = new Float32Array(16);//modelview
var MVP = new Float32Array(16);//
var P = new Float32Array(16);//projection

function Float32_from_tran( M, t ){ for( var i=0;i<16;++i)	M[i]=t[i>>2][i&3] ;}

function Float32_frustum(dst, left, right, bottom, top, nr, fr) {
	var rl = 1 / (right - left);
	var tb = 1 / (top - bottom);
	var nf = 1 / (nr - fr);
	dst[0] = (nr * 2) * rl;
	dst[1] = 0;
	dst[2] = 0;
	dst[3] = 0;
	dst[4] = 0;
	dst[5] = (nr * 2) * tb;
	dst[6] = 0;
	dst[7] = 0;
	dst[8] = (right + left) * rl;
	dst[9] = (top + bottom) * tb;
	dst[10] = (fr + nr) * nf;
	dst[11] = -1;
	dst[12] = 0;
	dst[13] = 0;
	dst[14] = (fr * nr * 2) * nf;
	dst[15] = 0;
	return dst;
}

function Float32_mul(m,a,b)
{
	var i,j,k;
	for( i=0;i<4;++i)
		for( j=0;j<4;++j)
			for(m[i*4+j] = 0, k=0;k<4;++k)
				m[i*4+j]+=a[k*4+j]*b[i*4+k];
}

function Float32_mul_T(m,a,b)
{
	var i,j,k;
	for( i=0;i<4;++i)
		for( j=0;j<4;++j)
			for(m[i*4+j] = 0, k=0;k<4;++k)
				m[i*4+j]+=a[j*4+k]*b[i*4+k];
}

/*

  quat

*/
function qset(v,x,y,z,w){return v[0]=x,v[1]=y,v[2]=z,v[3]=w,v;}
function qsub(d,a,b){return d[0]=a[0]-b[0],d[1]=a[1]-b[1],d[2]=a[2]-b[2],d[3]=a[3]-b[3],d;}
function qadd(d,a,b){return d[0]=a[0]+b[0],d[1]=a[1]+b[1],d[2]=a[2]+b[2],d[3]=a[3]+b[3],d;}
//function qmul(d,a,b){return d[0]=a[0]*b[0],d[1]=a[1]*b[1],d[2]=a[2]*b[2],d[3]=a[3]*b[3],d;}
function qscale(d,a,f){return d[0]=a[0]*f,d[1]=a[1]*f,d[2]=a[2]*f,d[3]=a[3]*f,d;}
function qrsh(d,a,f){return d[0]=a[0]>>f,d[1]=a[1]>>f,d[2]=a[2]>>f,d[3]=a[3]>>f,d;}
function qlsh(d,a,f){return d[0]=a[0]<<f,d[1]=a[1]<<f,d[2]=a[2]<<f,d[3]=a[3]<<f,d;}
function qdot(a,b){return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3]; }
function qcpy(d,s){return d[0]=s[0], d[1]=s[1], d[2]=s[2], d[3]=s[3],d;} 

function qrot( q, x,y,z,a ){
	var s=sin(a/2),c=cos(a/2);
	qset(q, x*s, y*s, z*s, c);
}

function qnorm( d ,s )
{
	var q = sqrt( vdot(s,s) + s[3]*s[3] ) ;
	qset(d,
		 s[0]/q,
		 s[1]/q,
		 s[2]/q,
		 s[3]/q);
}

function qmul( r,_p_,q )
{
	var p = qcpy(Q0,_p_), w=Q1
	vcross(r,p,q);
	vscale(w,p,q[3]);
	vadd(r,r,w);
	vscale(w,q,p[3]);
	vadd(r,r,w);
	r[3] = p[3]*q[3] - vdot(p, q);
}

function mat_from_quat(m,q)
{
	var a = q[3], b = q[0], c = q[1], d = q[2];
	var a2 = a*a;
	var b2 = b*b;
	var c2 = c*c;
	var d2 = d*d;

	m[0][0] = a2 + b2 - c2 - d2;
	m[0][1] = (b*c + a*d )*2
	m[0][2] = (b*d - a*c )*2

	m[1][0] = (b*c - a*d )*2
	m[1][1] = a2 - b2 + c2 - d2;
	m[1][2] = (c*d + a*b )*2

	m[2][0] = (b*d + a*c )*2
	m[2][1] = (c*d - a*b )*2
	m[2][2] = a2 - b2 - c2 + d2;
}






//Stolen from id software, who stole and modified it from shoemaker,
//converted to JS and modified by me, Nopy
var __m=tran();
function xquat_from_mat(q,M)
{
	console.log('quat_from_mat')

	//transpose to DX
	var m = __m;
	for( var i=0; i<3;++i)
		vset(m[i],M[0][i],M[1][i],M[2][i]);

	var tr,t,s;
	tr = m[0][0] + m[1][1] + m[2][2] ;
	if( tr > 0. )
	{ 
		t =  m[0 * 4 + 0] + m[1 * 4 + 1] + m[2 * 4 + 2] + 1.; 
		s = 1./sqrt(t) * .5; 
		q[3] = s * t; 
		q[2] = (m[0][1] - m[1][0]) * s; 
		q[1] = (m[2][0] - m[0][2]) * s; 
		q[0] = (m[1][2] - m[2][1]) * s; 
	}
	else if(m[0][0] > m[1][1] && m[0][0] > m[2][2])
	{ 
		t = m[0 * 4 + 0] - m[1 * 4 + 1] - m[2 * 4 + 2] + 1.; 
		s = 1./sqrt(t) * .5; 
		q[0] = s * t; 
		q[1] = (m[0][1] + m[1][0] ) * s; 
		q[2] = (m[2][0] + m[0][2] ) * s; 
		q[3] = (m[1][2] - m[2][1] ) * s; 
	}
	else if(m[1][1] > m[2][2])
	{ 
		t = - m[0][0] + m[1][1] - m[2][2] + 1.; 
		s = 1./sqrt(t) * .5; 
		q[1] = s * t; 
		q[0] = (m[0][1] + m[1][0]) * s; 
		q[3] = (m[2][0] - m[0][2]) * s; 
		q[2] = (m[1][2] + m[2][1]) * s; 
	}
	else
	{ 
		t = - m[0][0] - m[1][1] + m[2][2] + 1.; 
		s = 1./sqrt(t) * .5; 
		q[2] = s * t; 
		q[3] = (m[0][1] - m[1][0]) * s; 
		q[0] = (m[2][0] + m[0][2]) * s; 
		q[1] = (m[1][2] + m[2][1]) * s; 
	}
	//joint translation, not needed atm.
	//(and I'm probably just going to use matrices for joints in the shaders)
	/*
	q[4] = m[0][3]; 
	q[5] = m[1][3]; 
	q[6] = m[2][3]; 
	q[7] = 0.; 
	*/
}


//0,1,2,
//3,4,5,
//6,7,8

/*

  fucking jay

*/

function quat_from_mat(q, m) {
	// Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	// article "Quaternion Calculus and Fast Animation".
	//let fTrace = m[0] + m[4] + m[8];
	let fTrace = m[0][0] + m[1][1] + m[2][2];

	let fRoot;

	if ( fTrace > 0.0 ) {
		// |w| > 1/2, may as well choose w > 1/2
		fRoot = Math.sqrt(fTrace + 1.0);  // 2w
		q[3] = 0.5 * fRoot;
		fRoot = 0.5/fRoot;  // 1/(4w)
		q[0] = (m[1][2]-m[2][1])*fRoot;
		q[1] = (m[2][0]-m[0][2])*fRoot;
		q[2] = (m[0][1]-m[1][0])*fRoot;
	} else {
		// |w| <= 1/2
		let i = 0;
		if ( m[1][1] > m[0][0] )
			i = 1;
		if ( m[2][2] > m[i][i] )
			i = 2;
		let j = (i+1)%3;
		let k = (i+2)%3;

		fRoot = Math.sqrt(m[i][i]-m[j][j]-m[k][k] + 1.0);
		q[i] = 0.5 * fRoot;
		fRoot = 0.5 / fRoot;
		q[3] = (m[j][k] - m[k][j]) * fRoot;
		q[j] = (m[j][i] + m[i][j]) * fRoot;
		q[k] = (m[k][i] + m[i][k]) * fRoot;
	}
	return q;
}
