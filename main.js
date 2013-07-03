"use strict"

// 1 for 1:1 rendering, 2 for resolution/2 rendering, 0.5 for 2*resolution rendering (supersampling)...
var sFactor = 1;

var WIDTH = window.innerWidth/sFactor;
var HEIGHT = window.innerHeight/sFactor;

var updatesPerSecond = 1.0 / 60.0;

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

var scoreText;

window.onload = function(){
    init();
    animate();
}

var gridMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
function MakeGrid(planeW, planeH, numW, numH){
    var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeW*numW, planeH*numH, planeW, planeH),
            gridMaterial );

    scene.add(plane);
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

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );
    
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
                [Math.random(), 1,.5],
                [Math.random(), 1,.5]);

    ship.position.x = 0.75;
    ship.position.y = 0.75;
    
    ship2 = new PlayerShip(
                0.03,
                {up:"up", left:"left", right:"right", fire:"down"},
                [Math.random(), 1,.5],
                [Math.random(), 1,.5]);

    ship2.position.x = -0.75;
    ship2.position.y = -0.75;

    ship2.spawnPoint.set(-0.75, -0.75);


    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );
    composer.setSize(WIDTH, HEIGHT);
    
    // comment when enabling shaders
    if (!shaderEnabled){
        var e = new THREE.ShaderPass( THREE.CopyShader );
        e.renderToScreen = true;
        composer.addPass(e);
    } else {
        effect = new THREE.ShaderPass( THREE.TheScreenShader );
        effect.uniforms["resolution"].value.x = WIDTH;
        effect.uniforms["resolution"].value.y = HEIGHT;
        effect.renderToScreen = true;
        composer.addPass( effect );
    }
    window.addEventListener("resize", onWindowResize, false);

    scoreText = document.getElementById("scoretext");
    updateScore();
}

function updateScore(){
    scoreText.textContent = "Score: " + ship.score + " - " + ship2.score;
}

function onWindowResize() {
    WIDTH = window.innerWidth/sFactor;
    HEIGHT = window.innerHeight/sFactor;

    camera.aspect = WIDTH/HEIGHT;
    camera.updateProjectionMatrix();

    if (shaderEnabled){
        effect.uniforms["resolution"].value.x = WIDTH;
        effect.uniforms["resolution"].value.y = HEIGHT;
    }

    composer.setSize(WIDTH,HEIGHT)
    renderer.setSize(WIDTH,HEIGHT)
}

var timeCounter = 0;

var delta;
function animate(){
    requestAnimationFrame(animate);
    
    var oDelta = clock.getDelta();
    delta = oDelta / (timeCounter / updatesPerSecond);
    while (timeCounter > updatesPerSecond){
        update();
        timeCounter -= updatesPerSecond;
    }
    
    timeCounter += oDelta;
    
    render();

    stats.update();
}

var camPanSpeed = 0.5;
var camPanStrength = 1.0;

var camTarget = new THREE.Vector3(0,0,0);
var curCamTarget = new THREE.Vector3(0,0,0);
function update(){
    var curTime = clock.getElapsedTime();

    camera.position.x = Math.sin(clock.getElapsedTime()*camPanSpeed)*camPanStrength;
    camera.position.y = Math.cos(clock.getElapsedTime()*camPanSpeed)*camPanStrength;
    
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

    camera.lookAt(curCamTarget);
    
    if (shaderEnabled){
        effect.uniforms["time"].value = curTime;
    }
    
    sunShader.uniforms["time"].value = curTime;

    sunShader.uniforms.amplitude.value = Math.sin(curTime*3);

    ship.update(delta);
    ship2.update(delta);

    ship.checkBulletsAgainst(ship2);
    ship2.checkBulletsAgainst(ship);
}

function render(){
    composer.render();
}
