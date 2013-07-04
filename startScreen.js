
window.onload = function(){
    initMenu();
};

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var startButton;
var gui, ship1GUI, ship2GUI;
var guiContainer;
var huemin = 0, huemax = 255, satmin = 0, satmax = 100, litmin = 25, litmax = 75;
var opts = function(){ this.name = "Player"; 
    this.hue1 = getRandomInt(huemin, huemax); this.sat1 = getRandomInt(satmin, satmax); this.lit1 = getRandomInt(litmin, litmax);
    this.hue2 = getRandomInt(huemin, huemax); this.sat2 = getRandomInt(satmin, satmax); this.lit2 = getRandomInt(litmin, litmax);};
var ship1Opts = new opts(),
    ship2Opts = new opts();

var ship1Name, ship2Name;

ship1Opts.name = "Player 1";
ship2Opts.name = "Player 2";

// implement name, color selection and start button
function initMenu(){
    createColPreviews();
    createStartButton();
    createShipGUIs();
}

function HSL2CSS(h,s,l){
    return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

function makeShadowCol(col){
    return "3px 3px 3px " + col + ", " +
        "-3px -3px 3px " + col + ", " +
        "-3px 3px 3px " + col + ", " +
        "3px -3px 3px " + col;

}

function createColPreviews(){
    ship1Name = document.createElement("h1");
    ship1Name.textContent = ship1Opts.name;
    
    var col = HSL2CSS(ship1Opts.hue2, ship1Opts.sat2, ship1Opts.lit2);
    ship1Name.style.textShadow = makeShadowCol(col);

    document.body.appendChild(ship1Name);

    ship2Name = document.createElement("h1");
    ship2Name.textContent = ship2Opts.name;
    
    col = HSL2CSS(ship2Opts.hue2, ship2Opts.sat2, ship2Opts.lit2);
    ship2Name.style.textShadow = makeShadowCol(col);
    
    document.body.appendChild(ship2Name);
    
    onGUIChange();
}

function onGUIChange(){
    ship1Name.textContent = ship1Opts.name;
    ship2Name.textContent = ship2Opts.name;

    ship1Name.style.color = HSL2CSS(ship1Opts.hue1, ship1Opts.sat1, ship1Opts.lit1);
    ship2Name.style.color = HSL2CSS(ship2Opts.hue1, ship2Opts.sat1, ship2Opts.lit1);

    var col = HSL2CSS(ship1Opts.hue2, ship1Opts.sat2, ship1Opts.lit2);
    ship1Name.style.textShadow = makeShadowCol(col);
    col = HSL2CSS(ship2Opts.hue2, ship2Opts.sat2, ship2Opts.lit2);
    ship2Name.style.textShadow = makeShadowCol(col);

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
    
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "150px";

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
}

function startGame(){
    exitMenu();
    init();
    animate();
}
