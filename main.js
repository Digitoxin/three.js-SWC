"use strict";

// 1 for 1:1 rendering, 2 for resolution/2 rendering, 0.5 for 2*resolution rendering (supersampling)...
var sFactor = 2;

var WIDTH = window.innerWidth/sFactor;
var HEIGHT = window.innerHeight/sFactor;

var updatesPerSecond = 1.0 / 60.0;

var statsOn = false;

//var WIDTH = 512;
//var HEIGHT = 240;

// for the TV shader effect
var shaderEnabled = false;

var RATIO = WIDTH / HEIGHT,
    VIEW_ANGLE = 45,
    NEAR = 0.1,
    FAR = 10000;

var camera, scene, clock, controls, renderer, stats, container, keyboard;
var composer, effect;

var ship, ship2, sun;

var gridMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
function MakeGrid(planeW, planeH, numW, numH){
    var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeW*numW, planeH*numH, planeW, planeH),
            gridMaterial );

    scene.add(plane);
}

var ship1ScoreText, ship2ScoreText;

function createPlayerScoreTexts(){
    ship1ScoreText = document.createElement("div");
    ship2ScoreText = document.createElement("div");
    
    ship1ScoreText.style.color = HSL2CSS(ship1Opts.hue1, ship1Opts.sat1, ship1Opts.lit1);
    ship2ScoreText.style.color = HSL2CSS(ship2Opts.hue1, ship2Opts.sat1, ship2Opts.lit1);

    ship1ScoreText.style.position = "fixed";
    ship1ScoreText.style.top = "0%";


    ship2ScoreText.style.position = "fixed";
    ship2ScoreText.style.top = "0%";
    ship2ScoreText.style.right = "0%";

    ship1ScoreText.style.fontSize = "24px";
    ship2ScoreText.style.fontSize = "24px";

    document.body.appendChild(ship1ScoreText);
    document.body.appendChild(ship2ScoreText);

    updatePlayerScoreTexts();
}

function updatePlayerScoreTexts(){
    ship1ScoreText.textContent = ship1Opts.name + ": " + ship.score;
    ship2ScoreText.textContent = ship2Opts.name + ": " + ship2.score;
}

function init(){
    container = document.getElementById( 'container' );
    document.body.appendChild( container );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x00);
    container.appendChild( renderer.domElement );

    clock = new THREE.Clock();
    clock.start();

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, RATIO, NEAR, FAR);
    camera.position.z = -2.6;

    keyboard = new THREEx.KeyboardState();
    
    if (statsOn){
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild( stats.domElement );
    }

    controls = new THREE.TrackballControls(camera);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];

    scene = new THREE.Scene();
    scene.add(camera);

        
    var pointLight = new THREE.PointLight(0xffffff,1.0,100.0);
    pointLight.position = camera.position;

    scene.add( pointLight );
    
    MakeGrid(10,10,.2,.2);

    scene.add(new THREE.AmbientLight(0xffffff));

    sun = new Sun();
    
    ship = new PlayerShip(
                0.03,
                {up:"W", left:"A", right:"D",fire:"S"},
                [(ship1Opts.hue1)/360, ship1Opts.sat1/100,ship1Opts.lit1/100],
                [ship1Opts.hue2/360, ship1Opts.sat2/100,ship1Opts.lit2/100]);

    ship.position.x = 0.75;
    ship.position.y = 0.75;
    
    ship2 = new PlayerShip(
                0.03,
                {up:"up", left:"left", right:"right", fire:"down"},
                [ship2Opts.hue1/360, ship2Opts.sat1/100,ship2Opts.lit1/100],
                [ship2Opts.hue2/360, ship2Opts.sat2/100,ship2Opts.lit2/100]);

    ship2.position.x = -0.75;
    ship2.position.y = -0.75;

    ship2.spawnPoint.set(-0.75, -0.75);

    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );
    composer.setSize(WIDTH, HEIGHT);
    
    if (!shaderEnabled){
        var e = new THREE.ShaderPass( THREE.CopyShader );
        e.renderToScreen = true;
        composer.addPass(e);
    } else {
        effect = new THREE.ShaderPass( THREE.TheScreenShader );
        effect.uniforms.resolution.value.x = WIDTH;
        effect.uniforms.resolution.value.y = HEIGHT;
        effect.renderToScreen = true;
        composer.addPass( effect );
    }
    window.addEventListener("resize", onWindowResize, false);

    createPlayerScoreTexts();
}

function onWindowResize() {
    WIDTH = window.innerWidth/sFactor;
    HEIGHT = window.innerHeight/sFactor;
    RATIO = WIDTH/HEIGHT;

    camera.aspect = RATIO;
    camera.updateProjectionMatrix();

    if (shaderEnabled){
        effect.uniforms["resolution"].value.x = WIDTH;
        effect.uniforms["resolution"].value.y = HEIGHT;
    }

    composer.setSize(WIDTH,HEIGHT);
    renderer.setSize(WIDTH,HEIGHT);
}

var curTime = 0, fDelta = 0;

var ct = 0;

function animate(){
    
    fDelta = clock.getDelta();
    curTime += fDelta;
    
    ct += fDelta;

    while (ct > updatesPerSecond){
        update();
        ct -= updatesPerSecond;
    }

    sunShader.uniforms.time.value = curTime;

    sunShader.uniforms.amplitude.value = Math.sin(curTime*10);
    
    if (shaderEnabled){
        effect.uniforms.time.value = curTime;
    }
    
    render();
    
    if (statsOn){
        stats.update();
    }
    
    requestAnimationFrame(animate);
}

var camPanSpeed = 0.5;
var camPanStrength = 1.0;

var camTarget = new THREE.Vector3(0,0,0);
var curCamTarget = new THREE.Vector3(0,0,0);
function update(aDelta){
    var curTime = clock.getElapsedTime();
    camera.position.x = Math.sin(curTime*camPanSpeed)*camPanStrength;
    camera.position.y = Math.cos(curTime*camPanSpeed)*camPanStrength;
    
    //controls.update();

    camTarget.copy(ship.position);
    camTarget.add(ship2.position);
    var dist = ship.position.distanceTo(ship2.position);
    camTarget.set(camTarget.x * 0.5, camTarget.y *0.5, camTarget.z * 0.5);

    var dx = curCamTarget.x - camTarget.x;
    var dy = curCamTarget.y - camTarget.y;
    var dz = curCamTarget.z - camTarget.z;

    var easeFactor = 0.06;
    
    curCamTarget.set(curCamTarget.x - (dx*easeFactor), curCamTarget.y - (dy*easeFactor), curCamTarget.z - (dz*easeFactor));

    var targetDist = -2.0 - dist*0.5;
    var distFrTarget = camera.position.z - targetDist;
    
    camera.position.z = camera.position.z - (distFrTarget*easeFactor);
    camera.fov = 25 + 10 * dist;
    camera.updateProjectionMatrix();

    camera.lookAt(curCamTarget);

    ship.update();
    ship2.update();

    ship.checkBulletsAgainst(ship2);
    ship2.checkBulletsAgainst(ship);
}

function render(){
    composer.render();
}
