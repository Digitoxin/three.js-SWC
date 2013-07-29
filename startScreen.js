"use strict";

window.onload = function(){
    initMenu();
};

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var startButton;
var gui, ship1GUI, ship2GUI;
var guiContainer;
var huemin = 0, huemax = 360, satmin = 0, satmax = 100, litmin = 25, litmax = 100;
var opts = function(){ this.name = "Player"; 
    this.hue1 = getRandomInt(huemin, huemax); this.sat1 = getRandomInt(satmin, satmax); this.lit1 = getRandomInt(litmin, litmax);
    this.hue2 = getRandomInt(huemin, huemax); this.sat2 = getRandomInt(satmin, satmax); this.lit2 = getRandomInt(litmin, litmax);};
var ship1Opts, ship2Opts;



var genOpts = {winScore: 3};

var ship1Name, ship2Name;


var player1keys = "WASD";
var player2keys = "↑ ← ↓ →";
var player1GamepadActive = false;
var player2GamepadActive = false;

function initMenu(){
    if (localStorage.getItem("ship1opts")){
    ship1Opts = JSON.parse(localStorage.getItem("ship1opts"));
    } else {
        ship1Opts = new opts();
        ship1Opts.name = "Player 1";
    }

    if (localStorage.getItem("ship2opts")){
        ship2Opts = JSON.parse(localStorage.getItem("ship2opts"));
    } else {
        ship2Opts = new opts()
        ship2Opts.name = "Player 2";
    }

    initGamepads();
    createLogoText();
    createColPreviews();
    createStartButton();
    createInfoImage();
    createShipGUIs();

    
}

function HSL2CSS(h,s,l){
    return "hsl(" + h + ", " + s + "%, " + l + "%)";
}
var infoImage;
function createInfoImage(){
    infoImage = document.createElement("img");
    infoImage.style.position = "fixed";
    infoImage.style.right = "0%";
    infoImage.style.top = "0%";
    infoImage.style.zIndex = "-1";
    infoImage.style.height = "100%";
    infoImage.onload = function(e){
        document.body.appendChild(infoImage);
    };
    infoImage.setAttribute("src", "images/buttons.png");
}

var logotext;
function createLogoText(){
    logotext = document.createElement("h2");
    logotext.textContent = "CosmoWar!";

    logotext.style.fontFamily = "press_start_2pregular";
    logotext.style.color = "white";

    document.body.appendChild(logotext);
}

function createColPreviews(){
    ship1Name = document.createElement("p");
    ship1Name.textContent = ship1Opts.name;
    ship1Name.style.fontFamily = "press_start_2pregular";
    ship1Name.style.width = "400px";
    ship1Name.style.borderStyle = "solid";
    ship1Name.style.borderWidth = "4px";

    document.body.appendChild(ship1Name);

    ship2Name = document.createElement("p");
    ship2Name.textContent = ship2Opts.name;
    ship2Name.style.fontFamily = "press_start_2pregular";
    ship2Name.style.width = "400px";
    ship2Name.style.borderStyle = "solid";
    ship2Name.style.borderWidth = "4px";

    document.body.appendChild(ship2Name);
    
    onGUIChange();
}

function onGUIChange(){
    ship1Name.textContent = ship1Opts.name + " ( " + player1keys + " )";
    ship2Name.textContent = ship2Opts.name + " ( " + player2keys + " )";
    
    var col = HSL2CSS(ship1Opts.hue2, ship1Opts.sat2, ship1Opts.lit2);
    ship1Name.style.color = col;
    col = HSL2CSS(ship2Opts.hue2, ship2Opts.sat2, ship2Opts.lit2);
    ship2Name.style.color = col;

    col = HSL2CSS(ship1Opts.hue1, ship1Opts.sat1, ship1Opts.lit1);
    ship1Name.style.backgroundColor = col;
    ship1Name.style.borderColor = col;
    col = HSL2CSS(ship2Opts.hue1, ship2Opts.sat1, ship2Opts.lit1);
    ship2Name.style.backgroundColor = col;
    ship2Name.style.borderColor = col;

}

function createStartButton(){
    startButton = document.createElement("button");
    startButton.setAttribute("type", "button");
    startButton.setAttribute("name", "startGame");
    startButton.setAttribute("onclick", "startGame()");
    startButton.textContent = "Start Game";
    startButton.style.position = "relative";
    document.body.appendChild(startButton);
}

function createShipGUIs(){
    gui = new dat.GUI({ autoPlace: false });
    gui.add(genOpts, "winScore", 1, 10).step(1);
    
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "200px";

    guiContainer = document.getElementById("GUIContainer");
    guiContainer.appendChild(gui.domElement);
    
    guiContainer.style.position = "fixed";

    ship1GUI = gui.addFolder("Player 1");
    var c = ship1GUI.add(ship1Opts, "name");
    c.onChange(onGUIChange);
    c = ship1GUI.add(ship1Opts, "hue1", huemin, huemax);
    c.onChange(onGUIChange);
    c = ship1GUI.add(ship1Opts, "sat1", satmin, satmax);
    c.onChange(onGUIChange);
    c = ship1GUI.add(ship1Opts, "lit1", litmin, litmax);
    c.onChange(onGUIChange);
    c = ship1GUI.add(ship1Opts, "hue2", huemin, huemax);
    c.onChange(onGUIChange);
    c = ship1GUI.add(ship1Opts, "sat2", satmin, satmax);
    c.onChange(onGUIChange);
    c = ship1GUI.add(ship1Opts, "lit2", litmin, litmax);
    c.onChange(onGUIChange);
    
    ship2GUI = gui.addFolder("Player 2");
    c = ship2GUI.add(ship2Opts, "name");
    c.onChange(onGUIChange);
    c = ship2GUI.add(ship2Opts, "hue1", huemin, huemax);
    c.onChange(onGUIChange);
    c = ship2GUI.add(ship2Opts, "sat1", satmin, satmax);
    c.onChange(onGUIChange);
    c = ship2GUI.add(ship2Opts, "lit1", litmin, litmax);
    c.onChange(onGUIChange);
    c = ship2GUI.add(ship2Opts, "hue2", huemin, huemax);
    c.onChange(onGUIChange);
    c = ship2GUI.add(ship2Opts, "sat2", satmin, satmax);
    c.onChange(onGUIChange);
    c = ship2GUI.add(ship2Opts, "lit2", litmin, litmax);
    c.onChange(onGUIChange);

}

// delete all menu dom elements
function exitMenu(){
    document.body.removeChild(startButton);
    document.body.removeChild(guiContainer);
    document.body.removeChild(ship1Name);
    document.body.removeChild(ship2Name);
    document.body.removeChild(logotext);
    document.body.removeChild(infoImage);

    localStorage.setItem("ship1opts", JSON.stringify(ship1Opts));
    localStorage.setItem("ship2opts", JSON.stringify(ship2Opts));
}

function startGame(){
    exitMenu();
    init();
    animate();
}

var gamepad1, gamepad2;
function initGamepads(){
    var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

    if (!gamepadSupportAvailable){
        return;
    }

    var gamepads = navigator.webkitGetGamepads();

    gamepad1 = gamepads[0];
    gamepad2 = gamepads[1];

    if (gamepad1){
        console.log("Controller detected! Player 1 controller active!");

        player1keys = "CONTROLLER";
        player1GamepadActive = true;
    }

    if (gamepad2){
        console.log("Controller detected! Player 2 controller active!");

        player2keys = "CONTROLLER";
        player2GamepadActive = true;
    }


}

