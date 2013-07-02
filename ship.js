function createShipMesh(scale, primaryColor, secondaryColor){
    var shipMaterial = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors });

    var faceIndices = ['a','b','c','d'];

    var shipGeometry = new THREE.Geometry();
    shipGeometry.vertices.push(new THREE.Vector3(-1*scale, -1*scale, 0));
    shipGeometry.vertices.push(new THREE.Vector3(0, 0, -1*scale));
    shipGeometry.vertices.push(new THREE.Vector3(1*scale, -1*scale, 0));
    shipGeometry.vertices.push(new THREE.Vector3(0, 2*scale, 0));

    shipGeometry.faces.push( new THREE.Face3( 0,1,2 ) );
    shipGeometry.faces.push( new THREE.Face3( 3,2,1 ) );
    shipGeometry.faces.push( new THREE.Face3( 3,1,0) );
    shipGeometry.faces.push( new THREE.Face3( 0,2,3) );
    
    var primCol = new THREE.Color( 0xffffff );
    primCol.setHSL(primaryColor[0], primaryColor[1], primaryColor[2]);
    var secCol = new THREE.Color( 0xffffff );
    secCol.setHSL(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    shipGeometry.colors[0] = primCol;
    shipGeometry.colors[1] = secCol;
    shipGeometry.colors[2] = primCol;
    shipGeometry.colors[3] = primCol;

    for (var i = 0; i < shipGeometry.faces.length; i++){
        var face = shipGeometry.faces[i];
        var numberOfSides = (face instanceof THREE.Face3) ? 3 : 4;
        
        for (var j = 0; j < numberOfSides; j++){
            var vertexIndex = face[faceIndices[j]];
            face.vertexColors[j] = shipGeometry.colors[vertexIndex];
        }
    }


    var shipMesh = new THREE.Mesh( shipGeometry, shipMaterial );

    return shipMesh
}

function PlayerShip(scale, controls, primaryColor, secondaryColor){
    // A dictionary containing keys
    this.scale = scale;
    this.controls = controls;

    this.primCol = new THREE.Color( 0xffffff );
    this.primCol.setHSL(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.secCol = new THREE.Color( 0xffffff );
    this.secCol.setHSL(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    this.mesh = createShipMesh(scale, primaryColor, secondaryColor);
    
    this.spawnPoint = new THREE.Vector3(0.75, 0.75, 0);
    this.position = new THREE.Vector3(this.spawnPoint.x, this.spawnPoint.y,0);
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.accel = 0.0001;
    this.rotSpeed = 0.1;
    this.maxVel = 0.01;
    this.bulletShotSpeed = 0.02;
    this.timebetweenfiring = 1.0;
    this.timesincelastfire = 0;
    this.score = 0;

    this.bullets = [];

    scene.add(this.mesh);
}

var center = new THREE.Vector3(0,0,0);
var gravForce = 0.007;

PlayerShip.prototype.update = function(delta){

    this.updateBullets(delta);

    if (keyboard.pressed(this.controls["fire"])){
        if (this.timesincelastfire > this.timebetweenfiring){
            this.onFire();
            this.timesincelastfire = 0;
        }
    }
    
    this.timesincelastfire += delta;

    if (keyboard.pressed(this.controls["up"])){
        this.onAccel();
    }
    
    var gravVec = new THREE.Vector3();
    gravVec.copy(this.position);
    gravVec.normalize();
    
    //this.velocity.x = clamp(-this.maxVel, this.velocity.x, this.maxVel);
    //this.velocity.y = clamp(-this.maxVel, this.velocity.y, this.maxVel);
    
    var distance = (this.position.x === 0 && this.position.y === 0) ? 0.00000000000001 : center.distanceTo(this.position);
    
    this.velocity.x += (-gravVec.x * gravForce) / (distance*100);
    this.velocity.y += (-gravVec.y * gravForce) / (distance*100);

    if (keyboard.pressed(this.controls["left"])){
        this.rotation -= this.rotSpeed;
    }
    if (keyboard.pressed(this.controls["right"])){
        this.rotation += this.rotSpeed;
    }

    this.position.set(
            this.position.x + this.velocity.x,
            this.position.y + this.velocity.y,
            0);

    this.mesh.position.set(
            this.position.x,
            this.position.y,
            this.position.z)

    this.mesh.rotation.set(0, 0, this.rotation);

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

    if (this.position.distanceTo(center) < sun.radius){
        this.onSpawn();
    }
    
}

PlayerShip.prototype.onAccel = function(){
    this.velocity.x += Math.cos(this.rotation+90*Math.PI/180)*this.accel;
    this.velocity.y += Math.sin(this.rotation+90*Math.PI/180)*this.accel;
}

PlayerShip.prototype.updateBullets = function(delta){
    for (var i = 0; i < this.bullets.length; i++){
        this.bullets[i].update(delta);
    }
    
    this.deleteBullets();
}

PlayerShip.prototype.deleteBullets = function(){
    for (var i = 0; i < this.bullets.length; i++){
        if (
                this.bullets[i].lifetime < 0 ||
                this.bullets[i].position.distanceTo(center) < sun.radius){

            this.bullets[i].exit();
            this.bullet = 0;
            this.bullets.splice(i, 1);
            this.deleteBullets();
        }
    }
}

PlayerShip.prototype.onFire = function(){
    var bullet = new BasicBullet(this.primCol);
    bullet.position.copy(this.position);

    bullet.velocity.set(
            Math.cos(this.rotation+90*Math.PI/180)*this.bulletShotSpeed + this.velocity.x,
            Math.sin(this.rotation+90*Math.PI/180)*this.bulletShotSpeed + this.velocity.y,
            0
            );

    this.bullets.push(bullet);
    
}

PlayerShip.prototype.onSpawn = function(){
    this.position.set(this.spawnPoint.x, this.spawnPoint.y, 0);
    this.velocity.set(0,0,0);
}

PlayerShip.prototype.checkBulletsAgainst = function(ship){
    for (var i = 0; i < this.bullets.length; i++){
        if (this.bullets[i].position.distanceTo(ship.position) < ship.scale){
            ship.onSpawn();
            this.score += 1;
            updateScore();
        }
    }
}
