"use strict"

//var WIDTH = window.innerWidth;
//var HEIGHT = window.innerHeight;

var WIDTH = 640;
var HEIGHT = 480;

var RATIO = WIDTH / HEIGHT,
    VIEW_ANGLE = 45,
    NEAR = 1,
    FAR = 10000;

var camera, scene, clock, controls, renderer, stats, container, keyboard;

var bulletList = Array();

var ship;

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
    
    ship = new PlayerShip(
                0.03,
                {up:"up", down:"down", left:"left", right:"right"},
                [Math.random(), Math.random(), Math.random()],
                [Math.random(), Math.random(), Math.random()]
                );

    ship.position.x = 0.75;
    ship.position.y = 0.75;

    
    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.aspect = WIDTH/HEIGHT;
    camera.updateProjectionMatrix();

    //renderer.setSize(WIDTH,HEIGHT)
}

function animate(){
    requestAnimationFrame(animate);
    update();
    render();

    stats.update();
}

var camPanSpeed = 0.5;
var camPanStrength = 0.5;

function update(){

    camera.position.x = Math.sin(clock.getElapsedTime()*camPanSpeed)*camPanStrength;
    camera.position.y = Math.cos(clock.getElapsedTime()*camPanSpeed)*camPanStrength;

    controls.update();
    
    ship.update();
}

function render(){
    renderer.render(scene, camera);
}
