function xtune_play()
{
	let v=[];//samples, the entire tune
	
	for(let j=30;j<40;++j)
	{
		let f = freq(j-12);
		let fo = freq(j+12);
		let len = SR/4  |0;
		for(let i=0;i< len; ++i)
		{
			let s = 0;
			s += Sine(i,f) * (1-i/len);
			s += Sq(i,fo) * (1-i/len);
			//s += ran() * (1-i/len);
			v.push(s);
		}
	}
	LPF(v,.5);
	for(let i=0;i<10;++i)
		rev(v,
			 .01 + i*.1,//delay
			 .5/(2.+i) //decay
			);
	//xfade(v,.5);
	amp(v,1.);

	playSound(v);
}

function rem()
{
	ct.beginPath();
	ct.moveTo(ax, ay);
	ct.lineTo(bx, by);
    ct.lineTo(cx, cy);
    ct.clip();
	
	//q,r,l,n
	//must be.. uv0, and uv1, cleverly starting out knowing
	//which one is A.
	//let q = bu;
	//let r = bv;

	//????
    let w = 1 / ((q -= au) * (r -= av) - (n -= au) * (u -= av));
    let Xx = w * (r * (bx -= ax) - u * (cx -= ax)) ;
	let z = w * (r * (by -= ay) - u * (cy -= ay)) ;
	let Xy = w * (q * cx - n * bx) ;

	w *= q * cy - n * by;//== ?? wtf is n ? wtf is cy???
	
	//m must be AU
	//l must be AV
	let tx = ax - Xx * au - Xy * av ;
	let ty = ay - z * au - w * av ; //huh??
	
    ct.setTransform(D, z,
					S, w,
					tx,
					ty);
    ct.drawImage(img, 0, 0);
}


/*


function textureMap(texture, pts) {
    let tris = [[0, 1, 2], [2, 3, 0]]; // Split in two triangles (aka indices)
	
    for (let t=0; t<2; t++) {
        let pp = tris[t];
        let x0 = pts[pp[0]].x, x1 = pts[pp[1]].x, x2 = pts[pp[2]].x;
        let y0 = pts[pp[0]].y, y1 = pts[pp[1]].y, y2 = pts[pp[2]].y;
        let u0 = pts[pp[0]].u, u1 = pts[pp[1]].u, u2 = pts[pp[2]].u;
        let v0 = pts[pp[0]].v, v1 = pts[pp[1]].v, v2 = pts[pp[2]].v;

        // Set clipping area so that only pixels inside the triangle will
        // be affected by the image drawing operation
        ct.save();
		ct.beginPath();
		ct.moveTo(x0, y0);
		ct.lineTo(x1, y1);
        ct.lineTo(x2, y2);
		ct.closePath();
		ct.clip();

		

        // Compute matrix transform
        let delta = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
        let delta_a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
        let delta_b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
        let delta_c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2
                      - v0*u1*x2 - u0*x1*v2;
        let delta_d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
        let delta_e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
        let delta_f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2
                      - v0*u1*y2 - u0*y1*v2;

		let r = 1./delta; 
        // Draw the transformed image
        ct.transform(delta_a*r, delta_d*r,
                     delta_b*r, delta_e*r,
                     delta_c*r, delta_f*r);
        ct.drawImage(texture, 0, 0);
        ct.restore();
    }
}

*/
