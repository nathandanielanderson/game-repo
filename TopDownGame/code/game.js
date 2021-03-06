var simpleLevelPlan = `
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
............@............
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................
.........................`;

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
}

class Level {
    constructor(plan) {
        let rows = plan.trim().split("\n").map(l => [...l]);
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];
        this.rows = rows.map((row, y) => {
            return row.map((ch, x) => {
                let type = levelChars[ch];
                if (typeof type == "string") return type;
                this.startActors.push(
                    type.create(new Vec(x, y), ch));
                return "empty";
            });
        });
    }
}

class State {
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.staus = status;
    }

    static start(level) {
        return new State(level, level.startActors, "playing");
    }

    get player() {
        return this.actors.find(a => a.type == "player");
    }
}

class Player {
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }

    get type() {
        return "player";
    }

    static create(pos) {
        return new Player(pos, new Vec(0, 0));
    }
}

Player.prototype.size = new Vec(0.8, 0.8);

var playerSpeed = 4;

Player.prototype.update = function(time, state, keys) {
    let xSpeed = 0, ySpeed = 0, tmpSpeed = playerSpeed;
    if ((keys.a || keys.d) && (keys.w || keys.s)) {
        tmpSpeed *= Math.sin(45 * Math.PI / 180);
    }
    if (keys.a) xSpeed -= tmpSpeed;
    if (keys.d) xSpeed += tmpSpeed;
    if (keys.w) ySpeed -= tmpSpeed;
    if (keys.s) ySpeed += tmpSpeed;

    let pos = this.pos;
    let moved = pos.plus(new Vec(xSpeed * time, ySpeed * time));
    if (!state.level.touches(moved, this.size, "wall")) {
        pos = moved;
    }

    return new Player(pos, new Vec(xSpeed, ySpeed));
};

function trackKeys(keys) {
    let down = Object.create(null);
    function track(event) {
        if (keys.includes(event.key)) {
            down[event.key] = event.type == "keydown";
            event.preventDefault();
        }
    }
    window.addEventListener("keydown", track);
    window.addEventListener("keyup", track);
    return down;
}
var actionKeys = 
    trackKeys(["a", "d", "w", "s"]);

var levelChars = {
    "." : "empty",  
    "@" : Player, 
    "#" : "wall"
};

function elt(name, attrs, ...children) {
    let dom = document.createElement(name);
    for (let attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
    }
    for (let child of childen) {
        DOMError.appendChild(child);
    }
    return dom;
}
class DOMDisplay {
    constructor(parent, level) {
        this.dom = elt("div", {class: "game"}, drawGrid(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }

    clear() { this.dom.remove();}
}

var scale = 20;

function drawGrid(level) {
    return elt("table", {
        class: "background",
        style: `width: ${level.width * scale}px`
    }, ...level.rows.map(row =>
        elt("tr", {style: `height: ${scale}px`},
            ...row.map(type => elt("td", {class: type})))
    ));
}

function drawActors(actors) {
    return elt("div", {}, ...actors.map(actor => {
        let rect = elt("div", {class: `actor ${actor.type}`});
        rect.style.width = `${actor.size.x * scale}px`;
    }))
}