// I'll do DRY next time, I swear...

var particleGeom = new THREE.PlaneGeometry(0.1, 0.1);
var flareTex = THREE.ImageUtils.loadTexture("images/flare.png");
var flareParticleMaterial = new THREE.MeshBasicMaterial({map:flareTex, transparent: true, blending: THREE.AdditiveBlending, doublesided: true, color: 0xffff00, opacity: 0.9});

function Particle(geometry, material){
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.rotInc = Math.random()*0.2-0.1;
    this.startLifeTime = 240;
    this.lifetime = this.startLifeTime;
    
    this.scale = 0.3;
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.lookAt(camera.position);
	
	this.mesh.position = this.position;

    this.gravityFactor = 0.01;
}

Particle.prototype.update = function(){
    this.lifetime -= 1;
    
    this.position.set( this.position.x + this.velocity.x,
            this.position.y + this.velocity.y,
            -(this.position.x*this.position.x + this.position.y*this.position.y)*0.15 + Math.random()*0.03 );
    
    this.rotation += this.rotInc;

    this.mesh.lookAt(camera.position);
    this.mesh.rotation.z = this.rotation;

    this.scale = Math.max( this.lifetime/this.startLifeTime*this.scale, 0.3 ) + Math.random()*0.2;
    this.mesh.scale.set(this.scale, this.scale, this.scale);
    
    var gravVec = new THREE.Vector3();
    gravVec.copy(this.position);
    gravVec.normalize();
    
    var distance = center.distanceTo(this.position);
    
    this.velocity.x += (-gravVec.x * this.gravityFactor) / (distance*100);
    this.velocity.y += (-gravVec.y * this.gravityFactor) / (distance*100);

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

    if (distance < sun.radius){
        this.exit();
    }

};

Particle.prototype.exit = function(){
    scene.remove(this.mesh);
};

function makeParticle(geo, mat){
    var part = new Particle(geo, mat);
    scene.add(part.mesh);
    return part;
}

function JetParticleSystem(geo, mat1, mat2, particleInterval){
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.particles = [];
    this.particleInterval = particleInterval;
    this.sinceLastParticle = 0;
    this.geo = geo;
    this.mat = mat1;
    this.mat2 = mat2;
    this.active = false;
}

JetParticleSystem.prototype.update = function(){
    this.sinceLastParticle += 1;

    if (this.active){
        if (this.sinceLastParticle > this.particleInterval){
            var part;
            if (Math.random() > 0.5){
                part = makeParticle(this.geo, this.mat);
            } else {
                part = makeParticle(this.geo, this.mat2);
            }
            part.position.copy(this.position);
            part.position.z = Math.random()*0.1;
            part.velocity.copy(this.velocity);
            part.velocity.x += Math.random()*0.005-0.0025;
            part.velocity.y += Math.random()*0.005-0.0025;
            this.particles.push( part );
            this.sinceLastParticle = 0;
        }
    }

    this.updateParticles();
    this.checkDeleteParticles();
};

JetParticleSystem.prototype.updateParticles = function(){
    for (var i = 0; i < this.particles.length; i++){
        this.particles[i].update();
    }
};

JetParticleSystem.prototype.checkDeleteParticles = function(){
    for (var i = 0; i < this.particles.length; i++){
        if (this.particles[i].lifetime < 0){
            this.particles[i].exit();
            this.particles.splice(i, 1);
            this.checkDeleteParticles();
        }
    }
};

JetParticleSystem.prototype.clearParticles = function(){
    for (var i = 0; i < this.particles.length; i++){
        this.particles[i].exit();
    }
    this.particles = [];
};

function makeFlarePartSys(){
    var pSys = new JetParticleSystem(particleGeom, flareParticleMaterial, 2, new THREE.Vector3(0,0,0));

    return pSys;
}
