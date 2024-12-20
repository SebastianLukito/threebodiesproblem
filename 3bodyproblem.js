// Konstanta Gravitasi (Universal)
const G = 150.0;

// Canvas setup
const canvas = document.getElementById("simulation");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Planet data structure
// Simpan juga posisi awal (initialX, initialY) agar bisa direset saat "Start" ditekan.
let planets = [
{
    initialX: width/2 - 100,
    initialY: height/2,
    x: width/2 - 100,
    y: height/2,
    vx: 0,
    vy: -2,
    mass: 20,
    color: "red",
    trace: [],
    direction: {x:0,y:-1}
},
{
    initialX: width/2 + 100,
    initialY: height/2,
    x: width/2 + 100,
    y: height/2,
    vx: 2,
    vy: 0,
    mass: 20,
    color: "green",
    trace: [],
    direction: {x:1,y:0}
},
{
    initialX: width/2,
    initialY: height/2 + 150,
    x: width/2,
    y: height/2 + 150,
    vx: 0,
    vy: 2,
    mass: 20,
    color: "yellow",
    trace: [],
    direction: {x:0,y:1}
}
];

// Background stars
const starCount = 200;
let stars = [];
for (let i = 0; i < starCount; i++) {
stars.push({
    x: Math.random()*width,
    y: Math.random()*height,
    radius: Math.random()*1.5,
    flicker: Math.random() < 0.2,
    phase: Math.random()*Math.PI*2,
    speed: Math.random()*0.05
});
}

// Simulation control
let running = false;
let lastTime = 0;

// DOM elements
const massMerah = document.getElementById('massMerah');
const speedMerah = document.getElementById('speedMerah');

const massHijau = document.getElementById('massHijau');
const speedHijau = document.getElementById('speedHijau');

const massKuning = document.getElementById('massKuning');
const speedKuning = document.getElementById('speedKuning');

document.getElementById('startSimulation').addEventListener('click', startSimulation);

function startSimulation() {
// Reset posisi planet ke posisi awal
planets.forEach((p, index) => {
    p.x = p.initialX;
    p.y = p.initialY;
    p.trace = [];
});

// Atur ulang parameter dari input toolbar
planets[0].mass = parseFloat(massMerah.value);
let sMerah = parseFloat(speedMerah.value);
planets[0].vx = planets[0].direction.x * sMerah;
planets[0].vy = planets[0].direction.y * sMerah;

planets[1].mass = parseFloat(massHijau.value);
let sHijau = parseFloat(speedHijau.value);
planets[1].vx = planets[1].direction.x * sHijau;
planets[1].vy = planets[1].direction.y * sHijau;

planets[2].mass = parseFloat(massKuning.value);
let sKuning = parseFloat(speedKuning.value);
planets[2].vx = planets[2].direction.x * sKuning;
planets[2].vy = planets[2].direction.y * sKuning;

running = true;
lastTime = performance.now();
requestAnimationFrame(update);
}

// Compute gravitational forces and update positions
function computeForces(dt) {
let ax = new Array(planets.length).fill(0);
let ay = new Array(planets.length).fill(0);

for (let i = 0; i < planets.length; i++) {
    for (let j = 0; j < planets.length; j++) {
    if (i === j) continue;
    let dx = planets[j].x - planets[i].x;
    let dy = planets[j].y - planets[i].y;
    let distSq = dx*dx + dy*dy;
    let dist = Math.sqrt(distSq);
    let force = (G * planets[i].mass * planets[j].mass) / distSq;
    ax[i] += force * (dx/dist) / planets[i].mass;
    ay[i] += force * (dy/dist) / planets[i].mass;
    }
}

for (let i = 0; i < planets.length; i++) {
    planets[i].vx += ax[i] * dt;
    planets[i].vy += ay[i] * dt;
    planets[i].x += planets[i].vx * dt;
    planets[i].y += planets[i].vy * dt;

    // Add to trace
    planets[i].trace.push({x: planets[i].x, y: planets[i].y});
}
}

function drawBackground() {
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, width, height);

// Draw stars
for (let s of stars) {
    let brightness = 1;
    if (s.flicker) {
    s.phase += s.speed;
    brightness = 0.5 + 0.5*Math.sin(s.phase);
    }
    ctx.fillStyle = `rgba(255,255,255,${brightness})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, 2*Math.PI);
    ctx.fill();
}
}

function drawPlanets() {
// Draw traces
for (let p of planets) {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (p.trace.length > 0) {
    ctx.moveTo(p.trace[0].x, p.trace[0].y);
    for (let i = 1; i < p.trace.length; i++) {
        ctx.lineTo(p.trace[i].x, p.trace[i].y);
    }
    }
    ctx.stroke();
}

// Draw planets
for (let p of planets) {
    ctx.fillStyle = p.color;
    let radius = Math.max(5, p.mass/4); 
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI*2);
    ctx.fill();
}
}

function update(time) {
if (!running) return;
let dt = (time - lastTime)*0.001; // convert ms to s
lastTime = time;

computeForces(dt);
drawBackground();
drawPlanets();

requestAnimationFrame(update);
}

// Mouse interaction
let draggedPlanet = null;
let offsetX = 0;
let offsetY = 0;

canvas.addEventListener("mousedown", (e) => {
const mx = e.clientX;
const my = e.clientY;
for (let p of planets) {
    let r = Math.max(5, p.mass/4);
    if ((mx - p.x)**2 + (my - p.y)**2 < r*r) {
    draggedPlanet = p;
    offsetX = p.x - mx;
    offsetY = p.y - my;
    break;
    }
}
});

canvas.addEventListener("mousemove", (e) => {
if (draggedPlanet) {
    draggedPlanet.x = e.clientX + offsetX;
    draggedPlanet.y = e.clientY + offsetY;
    draggedPlanet.trace = [];
}
});

canvas.addEventListener("mouseup", () => {
draggedPlanet = null;
});

window.addEventListener("resize", () => {
width = window.innerWidth;
height = window.innerHeight;
canvas.width = width;
canvas.height = height;
drawBackground();
drawPlanets();
});

// Initial draw before start
drawBackground();
drawPlanets();
