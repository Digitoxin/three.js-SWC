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

    return shipMesh;
}

function PlayerShip(scale, controls, primaryColor, secondaryColor){
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
    this.accel = 0.00023;
    this.rotSpeed = 0.115;
    this.bulletShotSpeed = 0.03;
    this.timebetweenfiring = 80;
    this.timesincelastfire = 0;
    this.score = 0;
    this.maxVel = 0.02;
    this.spawnRot = 0;
    this.spawnInvT = 120;
    this.spawnInvincibility = this.spawnInvT;

    this.lastAngle = 0;

    this.bullets = [];

    scene.add(this.mesh);

    this.flarePartMat = new THREE.MeshBasicMaterial({map:flareTex, transparent: true, blending: THREE.AdditiveBlending, doublesided: true, color: 0xffffff, opacity: 0.9});
    this.flarePartMat.color.setHSL(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.flarePartMat2 = new THREE.MeshBasicMaterial({map:flareTex, transparent: true, blending: THREE.AdditiveBlending, doublesided: true, color: 0xffffff, opacity: 0.9});
    this.flarePartMat2.color.setHSL(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    this.jet = new JetParticleSystem(particleGeom, this.flarePartMat, this.flarePartMat2, 3);
	
	this.mesh.position = this.position;
}

var center = new THREE.Vector3(0,0,0);
var gravForce = 0.01;

PlayerShip.prototype.update = function(){
    
    this.spawnInvincibility -= 1;

    if (this.spawnInvincibility > 0){
        this.mesh.visible = this.spawnInvincibility % 2;
    } else {
        this.mesh.visible = 1;
    }


    this.updateBullets();

    this.timesincelastfire += 1;
    
    this.jet.active = false;
    this.updateControls(); 
    this.jet.update();
    
    var gravVec = new THREE.Vector3();
    gravVec.copy(this.position);
    gravVec.normalize();
    
    var distance = (this.position.x === 0 && this.position.y === 0) ? 0.00000000000001 : center.distanceTo(this.position);
    
    this.velocity.x += (-gravVec.x * gravForce) / (distance*100);
    this.velocity.y += (-gravVec.y * gravForce) / (distance*100);
    
    this.velocity.x = clamp(-this.maxVel, this.velocity.x, this.maxVel);
    this.velocity.y = clamp(-this.maxVel, this.velocity.y, this.maxVel);

    this.position.set(
            this.position.x + this.velocity.x,
            this.position.y + this.velocity.y,
            -(this.position.x*this.position.x + this.position.y*this.position.y)*0.15);

    this.mesh.rotation.set(0, 0, this.rotation);

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

    if (this.position.distanceTo(center) < sun.radius){
        if (this.score > 0){
            this.score -= 1;
        }
        this.onSpawn();
    }

    this.jet.position.copy(this.position);

    var jvel = new THREE.Vector3();
    jvel.copy(this.velocity);

    jvel.x /= 2;
    jvel.y /= 2;
    jvel.z /= 2;

    this.jet.velocity.copy(jvel);
};

PlayerShip.prototype.updateControls = function(){
    if (keyboard.pressed(this.controls["left"])){
        this.rotation -= this.rotSpeed;
    }
    if (keyboard.pressed(this.controls["right"])){
        this.rotation += this.rotSpeed;
    }

    if (keyboard.pressed(this.controls["up"])){
        this.onAccel();
        this.jet.active = true;
    }
    if (keyboard.pressed(this.controls["fire"])){
        if (this.timesincelastfire > this.timebetweenfiring){
            this.onFire();
            this.timesincelastfire = 0;
        }
    }

};

PlayerShip.prototype.initGamepad = function(gamepad){
    this.gamepad = gamepad;
    this.updateControls = function(){

        if (gamepad.buttons[0]){
            if (this.timesincelastfire > this.timebetweenfiring){
                this.onFire();
                this.timesincelastfire = 0;
            }
        }

        if (gamepad.buttons[7]){
            this.velocity.x += (Math.cos(this.rotation+90*Math.PI/180)*this.accel)*gamepad.buttons[7];
            this.velocity.y += (Math.sin(this.rotation+90*Math.PI/180)*this.accel)*gamepad.buttons[7];
            this.jet.active = true;
        }

        var dirVec = new THREE.Vector2(gamepad.axes[0], -gamepad.axes[1]);
        if (dirVec.length() > 0.2){
            dirVec.normalize();
            this.rotation = (this.rotation - ( this.rotation - (Math.atan2( dirVec.x, dirVec.y ))));
        }

    };
};

PlayerShip.prototype.onAccel = function(){
    this.velocity.x += Math.cos(this.rotation+90*Math.PI/180)*this.accel;
    this.velocity.y += Math.sin(this.rotation+90*Math.PI/180)*this.accel;
};

PlayerShip.prototype.updateBullets = function(){
    for (var i = 0; i < this.bullets.length; i++){
        this.bullets[i].update();
    }
    
    this.deleteBullets();
};

PlayerShip.prototype.deleteBullets = function(){
    for (var i = 0; i < this.bullets.length; i++){
        if (
                this.bullets[i].lifetime < 0 ||
                this.bullets[i].position.distanceTo(center) < sun.radius){

            this.bullets[i].exit();
            this.bullets[i] = 0;
            this.bullets.splice(i, 1);
            this.deleteBullets();
        }
    }
};

PlayerShip.prototype.onFire = function(){
    var bullet = new BasicBullet(this.primCol);
    bullet.position.copy(this.position);
    bullet.position.x += Math.cos(this.rotation+90*Math.PI/180)*this.scale*2;
    bullet.position.y += Math.sin(this.rotation+90*Math.PI/180)*this.scale*2;

    bullet.velocity.set(
            Math.cos(this.rotation+90*Math.PI/180)*this.bulletShotSpeed + this.velocity.x,
            Math.sin(this.rotation+90*Math.PI/180)*this.bulletShotSpeed + this.velocity.y,
            0
            );

    this.bullets.push(bullet);
    
};

PlayerShip.prototype.onSpawn = function(){
    this.position.set(this.spawnPoint.x, this.spawnPoint.y, 0);
    this.velocity.set(0,0,0);
    this.rotation = this.spawnRot;
    updatePlayerScoreTexts();
    this.spawnInvincibility = this.spawnInvT;
};

PlayerShip.prototype.checkBulletsAgainst = function(theship){
    if (theship.spawnInvincibility <= 0){
        for (var i = 0; i < this.bullets.length; i++){
            if (this.bullets[i].position.distanceTo(theship.position) < theship.scale*2.0){
                this.bullets[i].exit();
                this.bullets.splice(i, 1);
                
                this.score += 1;
                
                theship.onSpawn();
            }
        }
    }
};

PlayerShip.prototype.clearBullets = function(){
    for (var i = 0; i < this.bullets.length; i++){
        this.bullets[i].exit();
    }

    this.bullets = new Array();
};
