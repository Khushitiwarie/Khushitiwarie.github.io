// Loader Animation
window.addEventListener('load', () => {
    const progress = document.querySelector('.progress');
    const loader = document.getElementById('loader');
    
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 15;
        if(width >= 100) {
            width = 100;
            progress.style.width = width + '%';
            clearInterval(interval);
            setTimeout(() => {
                document.querySelector('.loader-text').classList.add('hide');
                document.querySelector('.progress-bar').classList.add('hide');
                document.querySelector('.spiderman-logo').classList.add('logo-zoom');
                loader.classList.add('fade-out');
                setTimeout(() => loader.style.display = 'none', 1000);
            }, 500);
        } else {
            progress.style.width = width + '%';
        }
    }, 100);
});

// Navigation Scroll Effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Three.js Spider Web / Node Network
const canvasContainer = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05050a, 0.001);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.z = 400;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
canvasContainer.appendChild(renderer.domElement);

// Particles and Lines
const particleCount = 200;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleVelocities = [];

for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 1000;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    
    particleVelocities.push({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
        z: (Math.random() - 0.5) * 1.5
    });
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: 0x00ffcc,
    size: 2,
    transparent: true,
    opacity: 0.8
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Lines connecting particles
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.15
});

// We will update lines dynamically in the render loop
const lineGeometry = new THREE.BufferGeometry();
const linePositions = new Float32Array(particleCount * particleCount * 3);
lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lineMesh);

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2);
});

// Animation Loop
const maxConnectionDistance = 150;

function animate() {
    requestAnimationFrame(animate);

    targetX = mouseX * 0.2;
    targetY = mouseY * 0.2;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    const positions = particleSystem.geometry.attributes.position.array;
    
    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i].x;
        positions[i * 3 + 1] += particleVelocities[i].y;
        positions[i * 3 + 2] += particleVelocities[i].z;

        // Bounce off bounds
        if (Math.abs(positions[i * 3]) > 500) particleVelocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 500) particleVelocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 500) particleVelocities[i].z *= -1;
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Update lines (spider web effect)
    let vertexpos = 0;
    let numConnected = 0;
    
    for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (dist < maxConnectionDistance) {
                linePositions[vertexpos++] = positions[i * 3];
                linePositions[vertexpos++] = positions[i * 3 + 1];
                linePositions[vertexpos++] = positions[i * 3 + 2];
                
                linePositions[vertexpos++] = positions[j * 3];
                linePositions[vertexpos++] = positions[j * 3 + 1];
                linePositions[vertexpos++] = positions[j * 3 + 2];
                numConnected++;
            }
        }
    }
    
    lineMesh.geometry.setDrawRange(0, numConnected * 2);
    lineMesh.geometry.attributes.position.needsUpdate = true;
    
    particleSystem.rotation.y += 0.001;
    lineMesh.rotation.y += 0.001;

    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Custom Spider Cursor Logic
const spiderCursor = document.getElementById('spider-cursor');
const spiderSvg = spiderCursor.querySelector('svg');
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let lastCursorX = cursorX;
let lastCursorY = cursorY;
let isMoving = false;
let moveTimeout;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    
    spiderCursor.style.left = cursorX + 'px';
    spiderCursor.style.top = cursorY + 'px';
    
    // Calculate angle
    const dx = cursorX - lastCursorX;
    const dy = cursorY - lastCursorY;
    
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        // SVG spider is facing up by default (0 degrees means right in atan2)
        // so we add 90 degrees to make it face the movement direction
        spiderSvg.style.transform = otate( + (angle + 90) + deg);
        
        spiderCursor.classList.add('moving');
        isMoving = true;
        
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
            spiderCursor.classList.remove('moving');
            isMoving = false;
        }, 100);
        
        lastCursorX = cursorX;
        lastCursorY = cursorY;
    }
});
