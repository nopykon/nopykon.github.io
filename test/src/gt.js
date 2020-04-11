/*

  TODO: this but for characters, no atlas
  textured gouraud shader

  TODO: wind factor
  we really need to jam this ...

  god give me energy

*/
var GT_src = `

#if GL_OES_standard_derivatives 
#extension GL_OES_standard_derivatives : enable
#endif

precision lowp float;

varying vec4 v_rgba;
varying vec3 v_uv;
varying float v_rim;

#ifdef VERTEX_SHADER
attribute vec3 a_pos;
attribute vec4 a_N;
attribute vec2 a_uv;

#define FOG_FAR 1000.
#define FOG_NEAR 1.

uniform mat4 u_MVP ;
uniform mat4 u_MV ;
uniform mat4 u_M ;
//uniform mat4 u_LM ;

const vec4 tool = vec4(0., 1., .5, 1./256. );
const vec3 sund = vec3(-.7,.7,.2) ;

//const vec3 sund = vec3(0.,0.,1.) ;
const vec3 sunc = vec3(1.,.9,.7) ;
const vec3 rimc = vec3(1.,1.,1.) ;
const vec3 ambc = vec3(.5,.5,.5) ;

void main(){
	v_uv.xy = a_uv;
	v_uv.z = floor(a_N.w*128.);
	
	vec4 rp = u_MV * vec4(a_pos,1.);
	vec4 rN = u_MV * vec4(a_N.xyz,0.);
	float rim = 1.0 - abs( dot( normalize(rp.xyz),rN.xyz ));
	//rim *= abs(rN.y);
	rim = rim*rim* 0.5 ;
	v_rim = rim;//*rim*0.5 ;
	
	//float rim = 1.0 - abs( dot( normalize(u_MV[3].xyz),rN.xyz ));
	//rim*=rim;
	//float rim = 1.0 - abs( dot( normalize(u_MV[3].xyz),rN.xyz ));
	vec4 N = u_M * a_N ;//TODO: Inv. sun instead of rotating each normal ?
	//float dp = dot( u_MV[3].xyz , iN.xyz ) ;
	float dp = max(0., dot( N.xyz, sund ) );
	v_rgba.xyz = clamp( sunc*dp + rimc*rim, ambc, vec3(1.0) ) ;
	//v_rgba.xyz = min(vec3(1.),sunc*dp +  rimc*rim + ambc);

	//v_rgba.w = 0.;//fog;
	
	gl_Position = u_MVP*vec4(a_pos,1.);
}

#else //FRAGMENT SHADER

uniform sampler2D u_D ;
uniform vec4 u_Fog ;

void main()
{
	//<texture sampling>
#if GL_OES_standard_derivatives 

#define BIAS 0.
	//calc mipmap level
	vec2 dx = dFdx(v_uv.xy)*224. ;
	vec2 dy = dFdy(v_uv.xy)*224. ;
	float dd = max( dot( dx,dx),dot(dy,dy) );
	float lod = clamp(.5 * log2(dd) + BIAS,0.,6.);
	
#if 0 //MIPMAPPING, BASIC, downright, rightwise
	vec2 ofs = vec2( fract(v_uv.z*.25) * 4.*( 224.+10.+2.)/1024.,
					 floor(v_uv.z*.25 ) * ( 224.+112.+4.)/1024. );
	float L = floor(lod);
	//mip lod scale
	vec2 uv = fract( v_uv.xy ) * pow(.5, L ) ;
	//mip ofs
	uv.y += min(1., L) * 226./224. ;

	float Fm1 = max(0., L - 1.) ;
	uv.x += 1.-pow(.5, Fm1 ) + (Fm1*2.)/224. ; //+ x borders

	uv *= 224./1024. ; //subtexture scale
	uv.xy += vec2( .5 / 1024. );
	vec4 c = texture2D(u_D, uv + ofs );

#elif 1 //MIPMAPPING, BASIC, downright, rightwise
	vec2 ofs = vec2( fract(v_uv.z*.25) * 4.*( 224.+10.+2.)/1024. + .5/1024.,
					 floor(v_uv.z*.25 ) * ( 224.+112.+4.)/1024. + .5/1024.);

	float L = floor(lod);
	float P = pow(.5, L );
	float Fm1 = max(0., L - 1.) ;

	//mip lod scale
	vec2 fuv = fract( v_uv.xy ) * P ;
	vec2 uv0 = fuv ;
	
	//mip ofs
	uv0.y += min(1., L) * 226./224. ;
	uv0.x += 1.-pow(.5, Fm1 ) + (Fm1*2.)/224. ; //+ x borders
	
	//subtexture scale
	uv0 = uv0 * 224./1024. + ofs ;
	
	//next level
	vec2 uv1 = fuv*.5;
	
	//mip ofs
	uv1.y += 226./224. ;	
	uv1.x += 1.-P + (L*2.)/224. ; //+ x borders

	//subtexture scale 
	uv1 = uv1 * 224./1024. + ofs ;
	
	//
	vec4 a = texture2D(u_D, uv0 );
	vec4 b = texture2D(u_D, uv1 );
	vec4 c = mix(a,b,fract(lod));
#endif

#else //NO MIPMAPPING
	vec2 ofs = vec2( fract(v_uv.z*.25) * 4.*( 224.+10.+2.)/1024. + .5/1024.,
					 floor(v_uv.z*.25 ) * ( 224.+112.+4.)/1024. + .5/1024.);
	vec2 uv = fract(v_uv.xy)*vec2(.25) + ofs;
    //vec2 uv = fract(v_uv.xy)*vec2(.25) + vec2( v_uv.z*.25, 0. );
	vec4 c = texture2D(u_D, uv );
#endif // texture read

	
	//</texture sampling>
	if( c.a < .5 )
		discard ;
	
	c*= v_rgba;
	c += v_rim;//vec4(v_rim);
	//c = mix(c,vec4(1.),v_rim);
	//c = clamp(c,vec4(0.),vec4(1.));
	//c.xyz = mix( c.xyz, u_Fog.xyz, v_rgba.w ) ;
	//c.w = 1.-v_rgba.w;
	//c = 3.*c*c - 2.*c*c*c;//s-curve
	//c.xyz += (u_Fog.xyz-c.xyz)*v_rgba.w;

	//FOG
	//c.xyz += v_rgba.w;//mix( c.xyz, u_Fog.xyz, v_rgba.w ) ;
	gl_FragColor = vec4(c.xyz,1.);

}
#endif
`;

var GT ;
function GT_init(){


	var h = glsl_compile(
		/*"#version 100\n"+	*/"#define VERTEX_SHADER\n" + GT_src, 
		/*"#version 100\n"+	*/GT_src ) ;

	GT = {program: h,
			  u_MVP: gl.getUniformLocation(h,"u_MVP"),
			  u_MV: gl.getUniformLocation(h,"u_MV"),
			  u_M: gl.getUniformLocation(h,"u_M"),
			  u_D: gl.getUniformLocation(h,"u_D"),
			  u_Fog: gl.getUniformLocation(h,"u_Fog"),
			  a_pos: gl.getAttribLocation(h,"a_pos"),
			  a_N: gl.getAttribLocation(h,"a_N"),
			  a_uv: gl.getAttribLocation(h,"a_uv")
		 }
	gl_check()
}
