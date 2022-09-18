/*

 draw.js

*/
function textri(image,A,B,C)
{
    let ax = B[0]-A[0], ay = B[1]-A[1];
    let bx = C[0]-A[0], by = C[1]-A[1];

	if( ax*by - ay*bx < 0 )//backface culling
		return;

    let au = B[2]-A[2], av = B[3]-A[3] ;
	let bu = C[2]-A[2], bv = C[3]-A[3] ;
	
	let r = 1.0 / (au*bv - av*bu) ;
	let a = r*(ax*bv - av*bx);
	let b = r*(au*bx - ax*bu);
	let d = r*(ay*bv - av*by);
	let e = r*(au*by - ay*bu);
	let c = A[0] + a*-A[2] + b*-A[3] ;
	let f = A[1] + d*-A[2] + e*-A[3] ;
	
	ct.save();
	ct.beginPath();
	ct.moveTo(A[0],A[1]);
	ct.lineTo(B[0],B[1]);
	ct.lineTo(C[0],C[1]);
	ct.clip();
	ct.transform(a, d,
				 b, e,
				 c, f ) ;
	ct.drawImage(image, 0, 0);
	ct.restore();
}
/*
function textri(image,A,B,C)
{
    let ax = B[0]-A[0], ay = B[1]-A[1];
    let bx = C[0]-A[0], by = C[1]-A[1];

	if( ax*by - ay*bx < 0 )//backface culling
		return;

    let au = B[2]-A[2], av = B[3]-A[3] ;
	let bu = C[2]-A[2], bv = C[3]-A[3] ;
	
	let r = 1.0 / (au*bv - av*bu) ;
	let a = r*(ax*bv - av*bx);
	let b = r*(au*bx - ax*bu);
	let d = r*(ay*bv - av*by);
	let e = r*(au*by - ay*bu);
	let c = A[0] + a*-A[2] + b*-A[3] ;
	let f = A[1] + d*-A[2] + e*-A[3] ;
	
	ct.save();
	ct.beginPath();
	ct.moveTo(A[0],A[1]);
	ct.lineTo(B[0],B[1]);
	ct.lineTo(C[0],C[1]); 
	ct.clip();
	ct.transform(a, d,
				 b, e,
				 c, f ) ;

	ct.drawImage(image, 0, 0);
	 

	 ct.strokeStyle = 'white'
	 ct.stroke()

	ct.restore();
}
*/
