/*
  
  gl.js 

*/
//doo("ape");

var gl;
var tex_map = [];
var tex_hot = new Uint8Array([255,255,255,255]);

//return gl handle, load texture unless already loaded 
//uhm... move to glsl.js ? 
function get_tex( str )
{
	if( tex_map[ str ] ){
		//gl.bindTexture(gl.TEXTURE_2D, tex_map[ str ] ) ; 
		return tex_map[ str ] ; 
	}
	var h = tex_map[ str ] = gl.createTexture() ; 
	gl.bindTexture(gl.TEXTURE_2D, h ) ;
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,
				  1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,tex_hot) ;
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	console.log( 'attempt to load: ', str );

	if( 1 )
	{
		var img = new Image();
		img.onload = function( e ) {
			// Obtain a blob: URL for the image data.
			//console.log( 'Buf size = ', buf.length )
			gl.bindTexture( gl.TEXTURE_2D, h );
			gl.texImage2D(gl.TEXTURE_2D, 
						  0,
						  gl.RGBA,
						  gl.RGBA,
						  gl.UNSIGNED_BYTE,
						  img ) ;

			/*if(1) //already set ^^^
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			}
			else
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
								 gl.LINEAR_MIPMAP_NEAREST);
				gl.generateMipmap(gl.TEXTURE_2D);
			}*/
			
			//delete img
		}
		img.src = str;
	}
	return h ; //
}

function gl_check(where){
	var x = gl.getError();
	while( x !== 0  )
	{
		console.log( "GL ERROR:", x, where ), x = gl.getError();
	}
}

function glsl_compile(vsrc, fsrc )
{

	gl_check('pre shader compile');
	var vsh = gl.createShader(gl.VERTEX_SHADER);
	var fsh = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(vsh, vsrc);
	gl.compileShader(vsh);
	if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!',
					  gl.getShaderInfoLog(vsh));
		return;
	}
	gl.shaderSource(fsh, fsrc);
	gl.compileShader(fsh);
	if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!',
					  gl.getShaderInfoLog(fsh));
		return;
	}

	var prg = gl.createProgram();
	gl.attachShader(prg, vsh);
	gl.attachShader(prg, fsh);
	gl.linkProgram(prg);

	if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(prg));
		return;
	}

	//TESTING ONLY
	gl.validateProgram(prg);
	if (!gl.getProgramParameter(prg, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(prg));
		return;
	}

	gl_check("post shader compile");
	return prg ; 
}



function load_mesh( m )
{
	var vb = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vb );
	gl.bufferData(gl.ARRAY_BUFFER, 
				  m.vcount*3*4 +//pv
				  m.vcount*2*4 +//uv
				  m.vcount*4*1//n
				  ,
				  gl.STATIC_DRAW ) ;

	gl.bufferSubData(gl.ARRAY_BUFFER, 
					 0, //offset
					 m.Pv );

	gl.bufferSubData(gl.ARRAY_BUFFER, 
					 m.Pv.length*4,//offse
					 m.Nv );

	gl.bufferSubData(gl.ARRAY_BUFFER, 
					 m.Pv.length*4+ //offset
					 m.Nv.length,
					 m.Tv );


	var ib = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib );
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.icount*2, gl.STATIC_DRAW ) ;
	gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 
					 0, //offset
					 m.Iv );//new Uint16Array([0,1,2, 0,2,3]));
	gl_check('load_mesh')
	
	m.vb = vb;
	m.ib = ib;
}

function draw_mesh(Mesh) // must be used in GT section of code (GT pass)
{
	gl.bindBuffer( gl.ARRAY_BUFFER, Mesh.vb ) ; 
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Mesh.ib ) ;

	

	gl.vertexAttribPointer(GT.a_pos, 3, gl.FLOAT, false, 0, 0 );
	gl.vertexAttribPointer(GT.a_N, 4, gl.BYTE, true, 0,
						   Mesh.vcount*3*4 );
	gl.vertexAttribPointer(GT.a_uv, 2, gl.FLOAT, false, 0,
						   Mesh.vcount*3*4+
						   Mesh.vcount*4 );

	gl.drawElements(gl.TRIANGLES, Mesh.icount, gl.UNSIGNED_SHORT, 0 ) ;
	gl_check('draw_mesh')
}




function gen_offscreen(w,h)
{
    // create to render to texture
    const targetTextureWidth = 256;
    const targetTextureHeight = 256;
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
     
	gl.texImage2D(gl.TEXTURE_2D,
				  0,
				  gl.RGBA,
                  targetTextureWidth,
				  targetTextureHeight,
				  0,
                  gl.RGBA,
				  gl.UNSIGNED_BYTE,
				  null);
    
    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create and bind the framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
     
    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, tex, level);

	

	    // create a depth texture
    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
     
    // make a depth buffer and the same size as the targetTexture
    {
		// define size and format of level 0
		const level = 0;
		const internalFormat = gl.DEPTH_COMPONENT24;
		const border = 0;
		const format = gl.DEPTH_COMPONENT;
		const type = gl.UNSIGNED_INT;
		const data = null;
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      targetTextureWidth, targetTextureHeight, border,
                      format, type, data);
		
		// set the filtering so we don't need mips
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		// attach the depth texture to the framebuffer
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, level);
    }
	return { framebuffer: fb, texture:targetTexture };
}


function gen_depthbuffer(w,h)
{
	//fb
	const fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	//needn't a color buffer 
	
	//rb
	const db = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, db );
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h );

	gl.framebufferRenderbuffer(gl.FRAMEBUFFER,
							   gl.DEPTH_ATTACHMENT,
							   gl.RENDERBUFFER,
							   db);


	//texture
	// attach the texture as the first color attachment
	//const attachmentPoint = gl.COLOR_ATTACHMENT0;
	var dbt = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, dbt ) ;
	gl.framebufferTexture2D(gl.FRAMEBUFFER, 
							//attachmentPoint,
							gl.DEPTH_ATTACHMENT,
							gl.TEXTURE_2D, dbt, 0);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	//bind to og...
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);


	return fb;
}

var hotswap = new Uint8Array([255,255,255,255])
var atlas; //gl texture handle 
function atlas_gen()
{
	var h = atlas = gl.createTexture() ; 
	gl.bindTexture(gl.TEXTURE_2D, h ) ;
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,
				  1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,
				  hotswap) ;
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	var img = new Image();
	img.onload = function(e){

		var c = document.createElement("canvas");
		var ctx = c.getContext("2d");
		c.width = 1024;
		c.height = 1024;

		//this is fine
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0,c.width,c.height);
		ctx.fill(); 

		//this used to be NOT fine
		if( 1 ){

			//create mipmaps
			
			function borderblit(img,sx,sy,sw,sh, dx,dy,dw,dh){
				ctx.drawImage(img,sx,sy,sw,sh, dx,dy,dw,dh );
				ctx.drawImage(c,dx,dy,		dw,1,	dx,dy+dh,	dw,1);
				ctx.drawImage(c,dx,dy+dw-1,	dw,1,	dx,dy-1,	dw,1);
				ctx.drawImage(c,dx,dy-1,		1,dh+2,	dx+dw,dy-1,	1,dh+2);
				ctx.drawImage(c,dx+dw-1,dy-1,	1,dh+2,	dx-1,dy-1,	1,dh+2);
			}

			var IW = img.width, SZ = 224, AW = 0| (1024/(SZ+2));
			
			for( var x=0,y=0,sY = 0; sY < img.height; sY+=IW )//, y+=x, x=(x+1)&1 ){
			{
				var xoff = x*(SZ+2+10), yoff = y*(4+SZ+(SZ>>1));
				//L0,L1
				borderblit(img,0,sY,IW,IW,  xoff+1,yoff+1,SZ,SZ);
				borderblit(c, xoff+1,yoff+1,SZ,SZ, xoff+1,yoff+SZ+2+1,SZ>>1,SZ>>1)
				yoff+=SZ+2+1;
				//L2,3....
				for( var x0=xoff+1, sz=SZ>>1; sz>1; x0+=sz+2, sz>>=1 ) 
					borderblit(c, x0,yoff,sz,sz, x0+sz+2,yoff,sz>>1,sz>>1)
				
				if( ++x ===  AW )
					x=0,++y;
			}

		}

		gl.bindTexture(gl.TEXTURE_2D, h ) ;//rebind (something may interfere)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
		c.remove();
		
		//document.body.appendChild(c); //uncomment to view the generated image
		//delete c;
		//delete img;
	}

	img.src = "2d/stack.png";
}

var quad = new Float32Array([-1.,-1.,0.,0.,
							 1.,-1.,1.,0.,
							 1.,1.,1.,1.,
							 -1.,1.,0.,1.]);
var init = false;
function overscreen()
{

	if( !init )
	{
		init = true;

		var vb = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vb );
		gl.bufferData(gl.ARRAY_BUFFER, 4*4*4,  gl.STATIC_DRAW ) ;
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, quad );

		gl.bufferSubData(gl.ARRAY_BUFFER, 
						 m.Pv.length*4,//offse
						 m.Nv );

		gl.bufferSubData(gl.ARRAY_BUFFER, 
						 m.Pv.length*4+ //offset
						 m.Nv.length,
						 m.Tv );


		var ib = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib );
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.icount*2, gl.STATIC_DRAW ) ;
		gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 
						 0, //offset
						 m.Iv );//new Uint16Array([0,1,2, 0,2,3]));
		gl_check('load_mesh')
		
		m.vb = vb;
		m.ib = ib;


	}
	
	

}


