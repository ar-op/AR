/* =========================================
   1. CUSTOM CURSOR (INSTANT MOVEMENT)
   ========================================= */
const cursorOutline = document.querySelector('[data-cursor-outline]');
const hoverTriggers = document.querySelectorAll('.hover-trigger');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // FOR CROSSHAIR: DIRECT MOVEMENT (NO LAG)
    // We use .style.left/top instead of animate() for instant response
    cursorOutline.style.left = `${posX}px`;
    cursorOutline.style.top = `${posY}px`;
});

// Hover Effect
hoverTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
        document.body.classList.add('hovered');
    });
    trigger.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovered');
    });
});

/* =========================================
   2. THREE.JS BACKGROUND
   ========================================= */
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Fog for depth (Dark Purple to Black)
scene.fog = new THREE.FogExp2(0x050505, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // Transparent bg
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- PARTICLES GEOMETRY ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;

const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Random positions spread out
    posArray[i] = (Math.random() - 0.5) * 60;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xa855f7, // Purple
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- GEOMETRIC SHAPES (Abstract Debris) ---
const geometry = new THREE.IcosahedronGeometry(1, 0);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x7e22ce, 
    wireframe: true,
    transparent: true,
    opacity: 0.15 
});

const shapes = [];
for (let i = 0; i < 15; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 40;
    mesh.position.z = (Math.random() - 0.5) * 40;
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    // Random scale
    const scale = Math.random();
    mesh.scale.set(scale, scale, scale);
    
    scene.add(mesh);
    shapes.push({
        mesh: mesh,
        speedX: (Math.random() - 0.5) * 0.005,
        speedY: (Math.random() - 0.5) * 0.005,
        rotateSpeed: (Math.random() - 0.5) * 0.01
    });
}

// --- ANIMATION LOOP ---
let mouseX = 0;
let mouseY = 0;

// Slight parallax based on mouse
window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate entire particle system slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = mouseY * 0.1;
    particlesMesh.rotation.y += mouseX * 0.1;

    // Animate abstract shapes
    shapes.forEach(item => {
        item.mesh.rotation.x += item.rotateSpeed;
        item.mesh.rotation.y += item.rotateSpeed;
        item.mesh.position.x += item.speedX;
        item.mesh.position.y += item.speedY;

        // Bounds check to keep them close (simple wrap)
        if(item.mesh.position.x > 25) item.mesh.position.x = -25;
        if(item.mesh.position.x < -25) item.mesh.position.x = 25;
    });

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =========================================
   3. SCROLL ANIMATIONS (Intersection Observer)
   ========================================= */
const observerOptions = {
    threshold: 0.15 // Trigger when 15% of item is visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

const elementsToAnimate = document.querySelectorAll('.slide-up');
elementsToAnimate.forEach(el => observer.observe(el));


/* =========================================
   4. 3D TILT EFFECT FOR CARDS
   ========================================= */
const cards = document.querySelectorAll('.glass-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

/* =========================================
   5. DISABLE INSPECT & VIEW SOURCE
   ========================================= */

// Disable Right Click Context Menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Disable Keyboard Shortcuts for DevTools
document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
        e.preventDefault();
    }
    // Ctrl + Shift + I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
    }
    // Ctrl + Shift + J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
    }
    // Ctrl + U (View Source)
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
    }
});