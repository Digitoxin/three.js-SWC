// I'll do DRY next time, I swear...

var ParticleGeom = new THREE.PlaneGeometry(1,1);
var fireTex = THREE.ImageUtils.loadTexture("fire.png");
var fireParticleMaterial = new THREE.MeshBasicMaterial({map:fireTex});

function Particle(geometry, material){
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.lifetime = 100;
    
    this.scaleInc = 0.01;
    this.scale = 1.0;
    
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
}

Particle.prototype.update = function(){
    this.lifetime -= 1;
    this.position.set( this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.position.z + this.velocity.z );
    this.scale += scaleInc;
};

Particle.prototype.exit = function(){
    scene.remove(this.mesh);
};

function ParticleSystem(particleType, particleInterval){
    this.particles = [];
    this.particleInterval = particleInterval;
    this.sinceLastParticle = 0;
    this.MakeParticle = particleType;
    this.active = false;
}

ParticleSystem.prototype.update = function(){
    this.sinceLastParticle -= 1;

    if (this.active){
        if (this.sinceLastParticle <= 0){
            this.particles.push( this.MakeParticle() );
            this.sinceLastParticle = 0;
        }
    }

    this.updateParticles();
    this.checkDeleteParticles();
};

ParticleSystem.prototype.updateParticles = function(){
    for (var i = 0; i < this.particles.length; i++){
        this.particles[i].update();
    }
}

ParticleSystem.prototype.checkDeleteParticles = function(){
    for (var i = 0; i < this.particles.length; i++){
        if (this.particles[i].lifetime < 0){
            this.particles[i].exit();
            this.particles.splice(i, 1);
            this.deleteParticles();
        }
    }
};
