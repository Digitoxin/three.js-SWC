// I'll do DRY next time, I swear...

function ParticleSystem(mesh){
    this.particles = [];
}


function addNewParticle(mesh, pos){
    var part = new Particle(mesh);
    part.position = pos;
    this.particles.append(part);
}

ParticleSystem.prototype.update = function(){
    this.checkDeleteParticles();
};

ParticleSystem.prototype.checkDeleteParticles = function(){
    for (var i = 0; i < this.particles.length; i++){
        if (this.particles[i].lifetime < 0){
            this.particles[i].exit();
            this.particles.splice(i, 1);
            this.deleteParticles();
        }
    }
};
