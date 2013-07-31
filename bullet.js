function BasicBullet(color){
    this.radius = 0.01;
    this.segments = 6;
    this.rings = 4;
    
    this.startLifeTime = 160;
    this.lifetime = this.startLifeTime;

    this.position = new THREE.Vector3(0,0,0);
    this.velocity = new THREE.Vector3(0,0,0);

    this.gravityFactor = 0.0005;

    this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(
                this.radius,
                this.segments,
                this.rings),

            new THREE.MeshBasicMaterial({ color: color }));

    this.mesh.position = this.position;

    scene.add(this.mesh);
}

BasicBullet.prototype.update = function(){
    this.lifetime -= 1;
    
    this.position.set(this.position.x + this.velocity.x,
            this.position.y + this.velocity.y,
            -(this.position.x*this.position.x + this.position.y*this.position.y)*0.25 );
    
    this.mesh.scale.set(this.lifetime/this.startLifeTime + 0.8, this.lifetime/this.startLifeTime + 0.8, this.lifetime/this.startLifeTime + 0.8);

    var gravVec = new THREE.Vector3();
    gravVec.copy(this.position);
    gravVec.normalize();

    var distance = center.distanceTo(this.position);
    
    this.velocity.x += (-gravVec.x * this.gravityFactor) / distance;
    this.velocity.y += (-gravVec.y * this.gravityFactor) / distance;
 

   if (this.position.x > planeSize){
        this.position.x = -planeSize;
    }
    if (this.position.x < -planeSize){
        this.position.x = planeSize;
    }
    if (this.position.y > planeSize){
        this.position.y = -planeSize;
    }
    if (this.position.y < -planeSize){
        this.position.y = planeSize;
    } 
};

BasicBullet.prototype.exit = function(){
    scene.remove(this.mesh);
};
