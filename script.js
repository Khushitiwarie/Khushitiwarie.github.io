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


// Three.js Spider-Verse Web Network with Bloom
const canvasContainer = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05050a, 0.0015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.z = 400;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
canvasContainer.appendChild(renderer.domElement);



// Spider-Man Colors
const colorRed = new THREE.Color(0xff3b3b);
const colorBlue = new THREE.Color(0x00aaff);

const particleCount = 100;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
const particleVelocities = [];
const particleBasePositions = [];

for (let i = 0; i < particleCount; i++) {
    let x = (Math.random() - 0.5) * 1200;
    let y = (Math.random() - 0.5) * 1200;
    let z = (Math.random() - 0.5) * 1200;
    
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
    
    particleBasePositions.push({ x, y, z });
    
    let isRed = Math.random() > 0.5;
    particleColors[i * 3] = isRed ? colorRed.r : colorBlue.r;
    particleColors[i * 3 + 1] = isRed ? colorRed.g : colorBlue.g;
    particleColors[i * 3 + 2] = isRed ? colorRed.b : colorBlue.b;
    
    particleVelocities.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
    });
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Lines for the Web
const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending
});

const lineGeometry = new THREE.BufferGeometry();
const linePositions = new Float32Array(particleCount * particleCount * 3);
const lineColors = new Float32Array(particleCount * particleCount * 3);
lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lineMesh);

// Mouse Interaction Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouse3D = new THREE.Vector3();

document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const maxConnectionDistance = 180;
const mousePullRadius = 250;

function animate() {
    requestAnimationFrame(animate);

    // Camera sway
    camera.position.x += (mouse.x * 200 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 200 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    raycaster.setFromCamera(mouse, camera);
    mouse3D.copy(camera.position).add(raycaster.ray.direction.multiplyScalar(400));

    const positions = particleSystem.geometry.attributes.position.array;
    
    // Physics and Movement
    for (let i = 0; i < particleCount; i++) {
        let ix = i * 3;
        let iy = i * 3 + 1;
        let iz = i * 3 + 2;
        
        // Base floating movement
        positions[ix] += particleVelocities[i].x;
        positions[iy] += particleVelocities[i].y;
        positions[iz] += particleVelocities[i].z;

        // Bounce off invisible sphere
        if (Math.abs(positions[ix]) > 600) particleVelocities[i].x *= -1;
        if (Math.abs(positions[iy]) > 600) particleVelocities[i].y *= -1;
        if (Math.abs(positions[iz]) > 600) particleVelocities[i].z *= -1;
        
        // Mouse Pull Effect (Spider-Man web grip)
        let dx = mouse3D.x - positions[ix];
        let dy = mouse3D.y - positions[iy];
        let dz = mouse3D.z - positions[iz];
        let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < mousePullRadius) {
            let force = (mousePullRadius - dist) / mousePullRadius;
            positions[ix] += dx * force * 0.05;
            positions[iy] += dy * force * 0.05;
            positions[iz] += dz * force * 0.05;
        } else {
            // Return to base slightly to maintain structure
            positions[ix] += (particleBasePositions[i].x - positions[ix]) * 0.001;
            positions[iy] += (particleBasePositions[i].y - positions[iy]) * 0.001;
            positions[iz] += (particleBasePositions[i].z - positions[iz]) * 0.001;
        }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Draw Web Lines
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;
    
    for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
            let dx = positions[i * 3] - positions[j * 3];
            let dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            let dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (dist < maxConnectionDistance) {
                // Line positions
                linePositions[vertexpos++] = positions[i * 3];
                linePositions[vertexpos++] = positions[i * 3 + 1];
                linePositions[vertexpos++] = positions[i * 3 + 2];
                
                linePositions[vertexpos++] = positions[j * 3];
                linePositions[vertexpos++] = positions[j * 3 + 1];
                linePositions[vertexpos++] = positions[j * 3 + 2];
                
                // Line colors (interpolate between the two connected nodes)
                lineColors[colorpos++] = particleColors[i * 3];
                lineColors[colorpos++] = particleColors[i * 3 + 1];
                lineColors[colorpos++] = particleColors[i * 3 + 2];
                
                lineColors[colorpos++] = particleColors[j * 3];
                lineColors[colorpos++] = particleColors[j * 3 + 1];
                lineColors[colorpos++] = particleColors[j * 3 + 2];
                
                numConnected++;
            }
        }
    }
    
    lineMesh.geometry.setDrawRange(0, numConnected * 2);
    lineMesh.geometry.attributes.position.needsUpdate = true;
    lineMesh.geometry.attributes.color.needsUpdate = true;
    
    particleSystem.rotation.y += 0.001;
    particleSystem.rotation.z += 0.0005;
    lineMesh.rotation.y += 0.001;
    lineMesh.rotation.z += 0.0005;

    renderer.render(scene, camera);
}

animate();

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
if (spiderCursor) {
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
}
