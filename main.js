"use strict"

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    RATIO = WIDTH / HEIGHT,
    VIEW_ANGLE = 45,
    NEAR = 1,
    FAR = 10000;

var camera, scene, clock, controls, renderer, stats, container, keyboard;

var ship;

window.onload = function(){
    init();
    animate();
}



function createShipMesh(primaryColor, secondaryColor){
    var shipMaterial = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors });

    var faceIndices = ['a','b','c','d'];

    var shipGeometry = new THREE.Geometry();
    shipGeometry.vertices.push(new THREE.Vector3(-1, -1, 0));
    shipGeometry.vertices.push(new THREE.Vector3(0, 0, -1));
    shipGeometry.vertices.push(new THREE.Vector3(1, -1, 0));
    shipGeometry.vertices.push(new THREE.Vector3(0, 2, 0));

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

function PlayerShip(controls, primaryColor, secondaryColor){
    // A dictionary containing keys
    this.controls = controls;

    this.mesh = createShipMesh(primaryColor, secondaryColor);

    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.accel = 0.1;
    this.rotSpeed = 0.15;

    scene.add(this.mesh);
}

PlayerShip.prototype.update = function(){
    if (keyboard.pressed(this.controls["up"])){
        this.velocity.x += Math.cos(this.rotation+90*Math.PI/180)*this.accel;
        this.velocity.y += Math.sin(this.rotation+90*Math.PI/180)*this.accel;
    }
    if (keyboard.pressed(this.controls["down"])){
        this.velocity.x -= Math.cos(this.rotation+90*Math.PI/180)*this.accel;
        this.velocity.y -= Math.sin(this.rotation+90*Math.PI/180)*this.accel;

    }
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
}

function init(){
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x00);
    container.appendChild( renderer.domElement );

    clock = new THREE.Clock();
    clock.start();

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, RATIO, NEAR, FAR);
    camera.position.z = -30.0;

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

    scene.add(new THREE.AmbientLight(0xffffff));
    
    ship = new PlayerShip(
                {up:"up", down:"down", left:"left", right:"right"},
                [Math.random(), Math.random(), Math.random()],
                [Math.random(), Math.random(), Math.random()]
                );
    
    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.aspect = WIDTH/HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize(WIDTH,HEIGHT)
}

function animate(){
    requestAnimationFrame(animate);
    update();
    render();

    stats.update();
}

function update(){
    controls.update();

    ship.update();
}

function render(){
    renderer.render(scene, camera);
}
