
/*

  gouraud shader

*/

var G_src = `
precision lowp float;

varying vec3 rgb;

#ifdef VERTEX_SHADER
attribute vec3 a_pos;
attribute vec3 a_rgb;
uniform mat4 u_M ;
void main(){
	rgb = a_rgb;
	gl_Position = u_M*vec4(a_pos,1.);
}
#else
void main()
{
	gl_FragColor = vec4(rgb,1.);
}
#endif
`;

var G_buf=new Float32Array(1024*6);
var G_vb;
var G_sz = 0;
function G_vtx(x,y,z,r,g,b)
{
	if( G_sz >= 1023 )
	{
		console.log('G_buf full')
		return
	}

	var i = 6*G_sz++;
	G_buf[i++] = x;
	G_buf[i++] = y;
	G_buf[i++] = z;
	G_buf[i++] = r;
	G_buf[i++] = g;
	G_buf[i++] = b;
	
		
		
}
function G_draw(mode)
{
	
	gl.bindBuffer(gl.ARRAY_BUFFER,G_vb);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, G_buf.slice(0,G_sz*6) ) ;
	
	gl.enableVertexAttribArray(G.a_pos);
	gl.enableVertexAttribArray(G.a_rgb);
	gl.vertexAttribPointer(G.a_pos, 3, gl.FLOAT, false, 6*4, 0 );
	gl.vertexAttribPointer(G.a_rgb, 3, gl.FLOAT, false, 6*4, 3*4 );

	//gl.bufferSubData(gl.ARRAY_BUFFER, 0, G_buf,0,G_sz*4);
	gl.drawArrays(mode,0,G_sz);

	gl.disableVertexAttribArray(G.a_pos);
	gl.disableVertexAttribArray(G.a_rgb);

	G_sz = 0 ;
}


function G_init()
{
	var h = glsl_compile(
		"#version 100\n"+	"#define VERTEX_SHADER\n" + G_src, 
		"#version 100\n"+	G_src ) ;

	G = {program: h,
		 u_M : gl.getUniformLocation(h,"u_M"),
		 a_pos : gl.getAttribLocation(h,"a_pos"),
		 a_rgb : gl.getAttribLocation(h,"a_rgb") }
	
	G_vb = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, G_vb );
	gl.bufferData(gl.ARRAY_BUFFER, 1024*6*4, gl.DYNAMIC_DRAW);
	gl_check("G init");
}
