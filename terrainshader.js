THREE.TerrainShader = {

	uniforms: {
        time: { type: "f", value: 1.0 },
        amplitude: { type: 'f', value: 1.0 },
    },


	vertexShader: [
        
        "uniform float amplitude;",
        "varying vec3 vNormal;",
        "uniform float time;",

		"void main() {",

            "vNormal = normal;",
			
            "vec3 newPosition = vec3( position.x, position.y, -(position.x*position.x + position.y*position.y)*0.15 );",
        
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

        "uniform float time;",
        "uniform vec2 resolution;",
        "varying vec3 vNormal;",
        
		"void main() {",
            "gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);",
		"}"

	].join("\n")

};
