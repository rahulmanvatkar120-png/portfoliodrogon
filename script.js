"use strict";

const screen = document.getElementById("screen");
const xmlns = "http://www.w3.org/2000/svg";
const xlinkns = "http://www.w3.org/1999/xlink";

let audioContext;
let isDragonSound = false;

const startDragonSound = () => {
	if (isDragonSound) return;
	audioContext = new (window.AudioContext || window.webkitAudioContext)();
	
	const createDragonGrowl = () => {
		const now = audioContext.currentTime;
		
		const osc1 = audioContext.createOscillator();
		const osc2 = audioContext.createOscillator();
		const osc3 = audioContext.createOscillator();
		const gainNode = audioContext.createGain();
		const filter = audioContext.createBiquadFilter();
		
		osc1.type = "sawtooth";
		osc1.frequency.setValueAtTime(60, now);
		osc1.frequency.linearRampToValueAtTime(40, now + 2);
		osc1.frequency.linearRampToValueAtTime(55, now + 4);
		
		osc2.type = "triangle";
		osc2.frequency.setValueAtTime(80, now);
		osc2.frequency.linearRampToValueAtTime(50, now + 2);
		osc2.frequency.linearRampToValueAtTime(70, now + 4);
		
		osc3.type = "sine";
		osc3.frequency.setValueAtTime(30, now);
		osc3.frequency.linearRampToValueAtTime(20, now + 3);
		
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(200, now);
		filter.Q.setValueAtTime(5, now);
		
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(0.3, now + 0.5);
		gainNode.gain.linearRampToValueAtTime(0.2, now + 2);
		gainNode.gain.linearRampToValueAtTime(0.25, now + 4);
		gainNode.gain.linearRampToValueAtTime(0, now + 5);
		
		osc1.connect(filter);
		osc2.connect(filter);
		osc3.connect(gainNode);
		filter.connect(gainNode);
		gainNode.connect(audioContext.destination);
		
		osc1.start(now);
		osc2.start(now);
		osc3.start(now);
		osc1.stop(now + 5);
		osc2.stop(now + 5);
		osc3.stop(now + 5);
		
		if (isDragonSound) {
			setTimeout(createDragonGrowl, 5500);
		}
	};
	
	const createFireSound = () => {
		const now = audioContext.currentTime;
		const bufferSize = audioContext.sampleRate * 3;
		const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
		const output = noiseBuffer.getChannelData(0);
		
		for (let i = 0; i < bufferSize; i++) {
			output[i] = Math.random() * 2 - 1;
		}
		
		const noise = audioContext.createBufferSource();
		noise.buffer = noiseBuffer;
		
		const filter1 = audioContext.createBiquadFilter();
		filter1.type = "bandpass";
		filter1.frequency.setValueAtTime(800, now);
		filter1.frequency.linearRampToValueAtTime(2000, now + 0.5);
		filter1.frequency.linearRampToValueAtTime(1200, now + 2);
		filter1.Q.setValueAtTime(1, now);
		
		const filter2 = audioContext.createBiquadFilter();
		filter2.type = "lowpass";
		filter2.frequency.setValueAtTime(3000, now);
		
		const gainNode = audioContext.createGain();
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(0.4, now + 0.3);
		gainNode.gain.linearRampToValueAtTime(0.5, now + 1);
		gainNode.gain.linearRampToValueAtTime(0.3, now + 2);
		gainNode.gain.linearRampToValueAtTime(0, now + 3);
		
		noise.connect(filter1);
		filter1.connect(filter2);
		filter2.connect(gainNode);
		gainNode.connect(audioContext.destination);
		
		noise.start(now);
		noise.stop(now + 3);
		
		if (isDragonSound) {
			setTimeout(createFireSound, 8000 + Math.random() * 4000);
		}
	};
	
	createDragonGrowl();
	setTimeout(createFireSound, 3000);
	isDragonSound = true;
};

window.addEventListener("click", startDragonSound, false);

window.addEventListener(
	"pointermove",
	(e) => {
		pointer.x = e.clientX;
		pointer.y = e.clientY;
		rad = 0;
	},
	false
);

const resize = () => {
	width = window.innerWidth;
	height = window.innerHeight;
};

let width, height;
window.addEventListener("resize", () => resize(), false);
resize();

const prepend = (use, i) => {
	const elem = document.createElementNS(xmlns, "use");
	elems[i].use = elem;
	elem.setAttributeNS(xlinkns, "xlink:href", "#" + use);
	screen.prepend(elem);
};

const N = 45;

const elems = [];
const leftWings = [];
const rightWings = [];

for (let i = 0; i < N; i++) elems[i] = { use: null, x: width / 2, y: 0 };
const pointer = { x: width / 2, y: height / 2 };
const radm = Math.min(pointer.x, pointer.y) - 20;
let frm = Math.random();
let rad = 0;

	for (let i = 1; i < N; i++) {
		if (i === 1) prepend("Cabeza", i);
		else if (i === 8 || i === 18) {
			prepend("Aletas", i);
			const leftWing = document.createElementNS(xmlns, "use");
			leftWing.setAttributeNS(xlinkns, "xlink:href", "#Aletas");
			screen.insertBefore(leftWing, screen.firstChild);
			leftWings.push({ use: leftWing, parentIndex: i });
			const rightWing = document.createElementNS(xmlns, "use");
			rightWing.setAttributeNS(xlinkns, "xlink:href", "#Aletas");
			screen.insertBefore(rightWing, screen.firstChild);
			rightWings.push({ use: rightWing, parentIndex: i });
		}
		else prepend("Espina", i);
	}

const fireCanvas = document.getElementById("fireCanvas");
const fireCtx = fireCanvas.getContext("2d");
fireCanvas.width = window.innerWidth;
fireCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
	fireCanvas.width = window.innerWidth;
	fireCanvas.height = window.innerHeight;
});

const particles = [];
let isBreathingFire = false;
let fireDirection = 0;

const createFireParticle = (x, y, angle) => {
	const speed = 3 + Math.random() * 4;
	return {
		x: x,
		y: y,
		vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
		vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
		life: 1,
		decay: 0.015 + Math.random() * 0.01,
		size: 15 + Math.random() * 25,
		type: Math.random() > 0.3 ? "fire" : "smoke"
	};
};

const updateParticles = () => {
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.x += p.vx;
		p.y += p.vy;
		p.vy -= 0.05;
		p.life -= p.decay;
		p.size *= 0.98;
		
		if (p.life <= 0) {
			particles.splice(i, 1);
		}
	}
};

	const drawParticles = () => {
	fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
	
	particles.forEach(p => {
		const gradient = fireCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
		
		if (p.type === "fire") {
			const r = Math.floor(255);
			const g = Math.floor(100 + p.life * 155);
			const b = Math.floor(p.life * 50);
			gradient.addColorStop(0, `rgba(255, ${g}, ${b}, ${p.life})`);
			gradient.addColorStop(0.4, `rgba(255, ${g - 50}, 0, ${p.life * 0.8})`);
			gradient.addColorStop(1, `rgba(100, 0, 0, 0)`);
		} else {
			gradient.addColorStop(0, `rgba(80, 80, 80, ${p.life * 0.5})`);
			gradient.addColorStop(1, `rgba(40, 40, 40, 0)`);
		}
		
		fireCtx.beginPath();
		fireCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		fireCtx.fillStyle = gradient;
		fireCtx.fill();
	});
};

const emitFire = () => {
	if (!isBreathingFire) return;
	
	const head = elems[0];
	const angle = fireDirection + Math.PI;
	const offsetX = Math.cos(angle) * 40;
	const offsetY = Math.sin(angle) * 40;
	
	for (let i = 0; i < 8; i++) {
		particles.push(createFireParticle(head.x + offsetX, head.y + offsetY, angle + (Math.random() - 0.5) * 0.5));
	}
};

setInterval(() => {
	isBreathingFire = true;
	setTimeout(() => { isBreathingFire = false; }, 2000);
}, 6000);

const run = () => {
	requestAnimationFrame(run);
	requestAnimationFrame(updateParticles);
	requestAnimationFrame(drawParticles);
	
	if (isBreathingFire) {
		emitFire();
	}
	
	let e = elems[0];
	const ax = (Math.cos(3 * frm) * rad * width) / height;
	const ay = (Math.sin(4 * frm) * rad * height) / width;
	e.x += (ax + pointer.x - e.x) / 10;
	e.y += (ay + pointer.y - e.y) / 10;
	
	fireDirection = Math.atan2(pointer.y - e.y, pointer.x - e.x);
	
	for (let i = 1; i < N; i++) {
		let e = elems[i];
		let ep = elems[i - 1];
		const a = Math.atan2(e.y - ep.y, e.x - ep.x);
		e.x += (ep.x - e.x + (Math.cos(a) * (100 - i)) / 5) / 4;
		e.y += (ep.y - e.y + (Math.sin(a) * (100 - i)) / 5) / 4;
		const s = (140 + 4 * (1 - i)) / 50;
		e.use.setAttributeNS(
			null,
			"transform",
			`translate(${(ep.x + e.x) / 2},${(ep.y + e.y) / 2}) rotate(${
				(180 / Math.PI) * a
			}) translate(${0},${0}) scale(${s},${s})`
		);
	}

	leftWings.forEach(w => {
		const parent = elems[w.parentIndex];
		const prev = elems[w.parentIndex - 1];
		const angle = Math.atan2(parent.y - prev.y, parent.x - prev.x);
		const wingFlap = Math.sin(frm * 5) * 35;
		const s = 2.5;
		w.use.setAttributeNS(null, "transform",
			`translate(${parent.x},${parent.y}) rotate(${(angle * 180 / Math.PI) - 120 + wingFlap}) scale(${-s},${s})`);
	});

	rightWings.forEach(w => {
		const parent = elems[w.parentIndex];
		const prev = elems[w.parentIndex - 1];
		const angle = Math.atan2(parent.y - prev.y, parent.x - prev.x);
		const wingFlap = Math.sin(frm * 5) * 35;
		const s = 2.5;
		w.use.setAttributeNS(null, "transform",
			`translate(${parent.x},${parent.y}) rotate(${(angle * 180 / Math.PI) + 120 - wingFlap}) scale(${s},${s})`);
	});

	if (rad < radm) rad++;
	frm += 0.003;
	if (rad > 60) {
		pointer.x += (width / 2 - pointer.x) * 0.05;
		pointer.y += (height / 2 - pointer.y) * 0.05;
	}
};

run();