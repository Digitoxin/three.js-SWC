var sunShader = new THREE.ShaderMaterial( THREE.SunShader );

function Sun(){
    this.radius = 0.1;
    this.segments = 16;
    this.rings = 16;

    this.position = new THREE.Vector3(0,0,0);
    
    this.geom = new THREE.SphereGeometry(
            this.radius,
            this.segments,
            this.rings);

    this.mesh = new THREE.Mesh(this.geom, sunShader);

    this.mesh.position = this.position;
    
    var verts = this.mesh.geometry.vertices;

    var values = sunShader.attributes.displacement.value;

    for (var v = 0; v < verts.length; v++){
        values.push(this.radius);
    }

    scene.add(this.mesh);
}
