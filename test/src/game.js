/*

  game.js

*/
//no time for these... 
fogc = new Float32Array([0.,.025,.05,1.]);

var chunk;
var ship;

var cam = {
	p:[0,-100,20],
	fov:.5,

	//fps
	pitch:PI/2.,
	yaw:0.,
	
	//3p
	dis:16.,
	
	//
	mode:0,

	//track bound
	prev:0,
	next:1,
	t:0.,
	last_t:now()
};


//var db;
function gta_init()
{

	vset(CT[3],0,-40,20)

	//db = gen_depthbuffer();//put in engine init
	atlas_gen();
	G_init();
	GT_init();
		
	load_mesh(c_chunk);
	chunk = chunk_proc(c_chunk);

	load_mesh(Ico);
	load_mesh(Seal);
	load_mesh(Cube);
	/*
	{
		var b = rb_add()
		b.hull = box_hull;
		vset(b.t[3],10, 10,1 );
	}*/

}

function gta_update(){}

function recalc_MV_MVP()
{
	tpov( IC, CT, MT );//TODO: use dx style.
	Float32_from_tran( MV, IC ) ;
	Float32_mul(MVP,P,MV);
	Float32_from_tran( _M, MT ) ;

	//no.
	/*MV[3*4 + 0] = -IC[0][2];
	MV[3*4 + 1] = -IC[1][2];
	MV[3*4 + 2] = -IC[2][2];
	MV[3*4 + 3] = -IC[3][2];*/
}



function gta_render(ST)
{
	//render shadows
	//gl.bindFramebuffer(gl.FRAMEBUFFER, db ) ;
	//gl.bindFramebuffer(gl.FRAMEBUFFER, null ) ;

	//render main
	//gl.clearColor(.1, sin(now())*.05+.15 ,  .1+cos(now())*.1+.1, 1.);
	
	gl.clearColor(fogc[0],fogc[1],fogc[2],1.)
	gl_check('gta_render 1')
//	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.clear(gl.COLOR_BUFFER_BIT )//| gl.DEPTH_BUFFER_BIT);
	gl_check('gta_render 2')

	//gl.enable(gl.CULL_FACE);
	//gl.cullFace(gl.BACK);
	//gl.disable(gl.DEPTH_TEST);

	/*

	  Projection Matrix

	*/
	//near far
	var fov = cam.fov, n = .1
	var r = cv.width / cv.height  * n * fov ;
	Float32_frustum(P,
					-r,r,
					-n*fov,n*fov,
					n,1000.);
	
	/*

	  Camera Matrix

	*/
	var x = CT[0],y = CT[1],z = CT[2],p = CT[3], t = cam.t;
	var t = now()*.1;
	vset(p,cos(t)*25, sin(t)*25,-2.)
	len = vnorm(z,p)
	//cam.fov = .1+1./(1.+len*.01)
	//cam.fov = .5 
	//cam.fov = .2 + sin(cam.t)*.15;
	cam.fov = .25 + sin(cam.t)*.125;
	vset(y,0,0,1);
	vcross(x,y,z)
	vnorm(x,x)
	vcross(y,z,x)


	/*

	  GT BLOCK
	  
	*/
	//gl_check('gta_render 3')
	gl.useProgram( GT.program ) ;
	gl.uniform4fv(GT.u_Fog,fogc);
	gl.bindTexture( gl.TEXTURE_2D, atlas );//get_tex( "2d/atlas.png") );
	
	gl.enableVertexAttribArray(GT.a_pos);
	gl.enableVertexAttribArray(GT.a_N);
	gl.enableVertexAttribArray(GT.a_uv);
	//gl.cullFace(gl.BACK)

	//map
	tset( MT, 1,0,0, 0,1,0, 0,0,1, 0,0,0 )

	recalc_MV_MVP();
	gl.uniformMatrix4fv( GT.u_MVP, false, MVP ) ;
	gl.uniformMatrix4fv( GT.u_MV, false, MV ) ;
	gl.uniformMatrix4fv( GT.u_M, false, _M ) ;
	draw_mesh(c_chunk);

	draw_mesh(Seal);

	/*
	//dude
	mcpy(MT,ID);
	recalc_MV_MVP();
	gl.uniformMatrix4fv( GT.u_MVP, false, MVP ) ;
	gl.uniformMatrix4fv( GT.u_MV, false, MV ) ;
	gl.uniformMatrix4fv( GT.u_M, false, _M ) ;

	draw_mesh(Seal);
	*/
/* shadow
	vset(MT[2],0,0,0);
	recalc_MV_MVP();
	gl.uniformMatrix4fv( GT.u_MVP, false, MVP ) ;
	gl.uniformMatrix4fv( GT.u_MV, false, MV ) ;
	gl.uniformMatrix4fv( GT.u_M, false, _M ) ;
	draw_mesh(Seal);
*/
	gl.disableVertexAttribArray(GT.a_pos);
	gl.disableVertexAttribArray(GT.a_N);
	gl.disableVertexAttribArray(GT.a_uv);
	gl_check('gta_render 8')


	/*

	  G BLOCK

	*/

	
	//gl.disable(gl.DEPTH_TEST);
	//gl.enable(gl.BLEND);
	//gl.blendFunc(gl.ONE,gl.ONE);
	gl.useProgram( G.program ) ;

	mcpy(MT,ID);
	vset(MT[3],0,0,0);
	recalc_MV_MVP();
	gl.uniformMatrix4fv( G.u_M, false, MVP ) ;


	//grid
	if(1){
		
		for( var x=-10; x<=10;++x)
		{
			G_vtx( 10*x,-100,-10, .1,.3,.3)
			G_vtx( 10*x, 100,-10, .1,.3,.3)
			G_vtx(-100, 10*x,-10, .1,.3,.3)
			G_vtx( 100, 10*x,-10, .1,.3,.3)
		}
		G_draw(gl.LINES);

	}
	//gl.disable(gl.DEPTH_TEST)
	//rb_draw(ST);
	//gl.enable(gl.DEPTH_TEST)
	//rb_draw_origin(ST);
		
	//gl.enable(gl.DEPTH_TEST);
	//gl.disable(gl.BLEND);
	//track_draw_deb(track_points);

}


