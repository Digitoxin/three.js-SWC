#ifdef GL_ES
precision lowp float;
#endif

// Author unknown. From http://glsl.heroku.com/e#9690.0
// I'll probably try to implement this later

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float hash(float x)
{
	return fract(sin(x) * 43758.5453);
}

vec2 hash2(vec2 v)
{
	return vec2(hash(v.x), hash(v.y));	
}

vec4 tv(vec4 col, vec2 pos)
{	
	float speed = 0.0;
	
	// vibrating rgb-separated scanlines
	col.r += sin(( pos.y + 0.001 + sin(time * 64.0) * 0.00012 ) * resolution.y * 2.0 + time * speed);
	col.g += sin(( pos.y + 0.003 - sin(time * 70.0) * 0.00015 ) * resolution.y * 2.0 + time * speed);
	col.b += sin(( pos.y + 0.006 + sin(time * 90.0) * 0.00017 ) * resolution.y * 2.0 + time * speed);
	col += 1.0;
	col *= 0.5;
	
	//col = max(vec4(0.1), col);
	
	// grain
	float grain = hash( ( pos.x + hash(pos.y) ) * time ) * 0.15;
	col += grain;
		
	// flickering
	float flicker = hash(time * 64.0) * 0.05;
	col += flicker;
	
	// vignette
	vec2 t = 2.0 * ( pos - vec2( 0.5 ) );
	
	t *= t;
	
	float d = 1.0 - clamp( length( t ), 0.0, 1.0 );
	
	col *= d;
	
	return col;
}

void main( void )
{
	vec2 pos = gl_FragCoord.xy / resolution.xy;
	 
	vec4 col = vec4(0.0);
	
	// start off with a background
	col.r += sin(time * 0.0 + 4.0);
	col.g += sin(time * 0.0 + 4.0);
	col.b += sin(time * 0.0 + 5.0);
	col += 0.5;
	col *= 0.5;
	
	col = tv(col, pos);
	
	gl_FragColor = col;
}
