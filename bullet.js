var bulletMaterial = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors, wireframe:true });

function BasicBullet(primaryColor, secondaryColor){
    this.radius = 0.01;
    this.segments = 6;
    this.rings = 4;

    this.lifetime = 3;

    this.position = new THREE.Vector3(0,0,0);
    this.velocity = new THREE.Vector3(0,0,0);

    this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(
                radius,
                segments,
                rings),

            bulletMaterial);

    this.mesh.position = this.position;

    scene.add(this.mesh);
}

BasicBullet.prototype.update = function(delta){
    this.lifetime -= delta;
    
    this.position.set(this.position.x + this.velocity.x, this.position.y + this.velocity.y, 0);


    var gravVec = new THREE.Vector3();
    gravVec.copy(this.position);
    gravVec.normalize();

    var distance = (this.position.x === 0 && this.position.y === 0) ? 0.00000000000001 : center.distanceTo(this.position);
    
    this.velocity.x += (-gravVec.x * 0.1) / (distance*100);
    this.velocity.y += (-gravVec.y * 0.1) / (distance*100);
 

   if (this.position.x > 1){
        this.position.x = -1;
    }
    if (this.position.x < -1){
        this.position.x = 1;
    }
    if (this.position.y > 1){
        this.position.y = -1;
    }
    if (this.position.y < -1){
        this.position.y = 1;
    } 
}

BasicBullet.prototype.exit = function(){
    scene.remove(this.mesh);
}
