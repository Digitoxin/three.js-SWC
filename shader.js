THREE.TheScreenShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"time": { type: "f", value: 0 },
		"resolution":   { type: "v2", value: new THREE.Vector2(320,240) },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
        "// Author unknown. Adapted from http://glsl.heroku.com/e#9690.0",

        "uniform float time;",
        "uniform vec2 resolution;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",
        
        "float hash(float x)",
        "{",
        "   return fract(sin(x) * 435797.59964);",
        "}",

        "vec2 hash2(vec2 v)",
        "{",
        "    return vec2(hash(v.x), hash(v.y));	",
        "}",

        "vec4 tv(vec4 col, vec2 pos)",
        "{	",
        "    float speed = 0.0;",
            
        "    // vibrating rgb-separated scanlines",
        "    col.r += sin(( pos.y + 0.001 + sin(time * 64.0) * 0.00012 ) * resolution.y * 2.0 + time * speed);",
        "    col.g += sin(( pos.y + 0.003 - sin(time * 70.0) * 0.00015 ) * resolution.y * 2.0 + time * speed);",
        "    col.b += sin(( pos.y + 0.006 + sin(time * 90.0) * 0.00017 ) * resolution.y * 2.0 + time * speed);",
        "    col += 0.0;",
        "    col *= 0.5;",
            
        "    //col = max(vec4(0.1), col);",
            
        "    // grain",
        "    float grain = hash( ( pos.x + hash(pos.y) ) * time ) * 0.2;",
        "    col += grain;",
                
        "    // flickering",
        "    float flicker = hash(time * 64.0) * 0.08;",
        "    col += flicker;",
        
        "// vignette",
        "vec2 t = 1.0 * ( pos*0.2 - vec2( 0.5 ) );",
        
        "t *= t;",
        
        "float d = 1.0 - clamp( length( t ), 0.0, 1.0 );",
        
        "col *= d;",
        
        "return col;",
    "}",

    "void main()",
    "{",
        "vec2 pos = gl_FragCoord.xy / resolution.xy;",
         
        "vec4 col = vec4(0.0);",
        
        "// start off with a background",
        "col += 0.2 + sin(time)*0.1;",
        
        "col = tv(col, pos);",

        "col.a = 1.0;",
        
        "vec4 screenCol = texture2D(tDiffuse, vUv);",
        "float d = distance(pos, vec2(0.5, 0.5));",
        "screenCol -= d*1.0;",

        "bool isScreen = false;",

        "if (screenCol.r >0.0 || screenCol.g > 0.0 || screenCol.g > 0.0){",
            "isScreen = true;",
        "}",

        "vec4 c;",

        "if (isScreen){",
            "c = screenCol + (col - 0.5*col);",
        "}else{",
            "c = screenCol + col;",
        "}",

        "gl_FragColor = vec4(vec3(c), 1.0);",
    "}	",

	].join("\n")

};

