/* =========================================
   1. CUSTOM CURSOR & HOVER EFFECTS
   ========================================= */
const cursorOutline = document.querySelector('[data-cursor-outline]');
const hoverTriggers = document.querySelectorAll('.hover-trigger');

// Move Cursor
window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    cursorOutline.style.left = `${posX}px`;
    cursorOutline.style.top = `${posY}px`;
});

// General Hover Scale Effect (Rotate into X)
hoverTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => { document.body.classList.add('hovered'); });
    trigger.addEventListener('mouseleave', () => { document.body.classList.remove('hovered'); });
});

/* =========================================
   2. THREE.JS BACKGROUND
   ========================================= */
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.002);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
for(let i = 0; i < particlesCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 60; }
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({ size: 0.15, color: 0x00f3ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

const geometry = new THREE.IcosahedronGeometry(1, 0);
const material = new THREE.MeshBasicMaterial({ color: 0x00bcd4, wireframe: true, transparent: true, opacity: 0.15 });
const shapes = [];
for (let i = 0; i < 15; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 40;
    mesh.position.z = (Math.random() - 0.5) * 40;
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    const scale = Math.random();
    mesh.scale.set(scale, scale, scale);
    scene.add(mesh);
    shapes.push({ mesh: mesh, speedX: (Math.random() - 0.5) * 0.005, speedY: (Math.random() - 0.5) * 0.005, rotateSpeed: (Math.random() - 0.5) * 0.01 });
}

let mouseX = 0; let mouseY = 0;
window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});
const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = mouseY * 0.1; particlesMesh.rotation.y += mouseX * 0.1;
    shapes.forEach(item => {
        item.mesh.rotation.x += item.rotateSpeed; item.mesh.rotation.y += item.rotateSpeed;
        item.mesh.position.x += item.speedX; item.mesh.position.y += item.speedY;
        if(item.mesh.position.x > 25) item.mesh.position.x = -25;
        if(item.mesh.position.x < -25) item.mesh.position.x = 25;
    });
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =========================================
   3. ANIMATIONS
   ========================================= */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.15 });
document.querySelectorAll('.slide-up').forEach(el => observer.observe(el));

// 3D Tilt Effect (Only on Desktop)
if (window.matchMedia("(min-width: 768px)").matches) {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const rotateX = ((y - rect.height/2) / (rect.height/2)) * -5;
            const rotateY = ((x - rect.width/2) / (rect.width/2)) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'; });
    });
}

/* =========================================
   4. SECURITY: "STEALING DETECTED" POPUP
   ========================================= */
const warningModal = document.getElementById('warning-modal');

function showWarning() {
    warningModal.classList.add('active');
    setTimeout(() => {
        warningModal.classList.remove('active');
    }, 3000); 
}

// 1. Block Right Click (Desktop & Mobile Long Press usually triggers this)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showWarning();
});

// 2. Block Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') || 
        (e.ctrlKey && e.key === 'u')
    ) {
        e.preventDefault();
        showWarning();
    }
});

// 3. Mobile Specific: Block Touch-and-Hold
let touchTimer;
document.addEventListener('touchstart', (e) => {
    touchTimer = setTimeout(() => {
        // e.preventDefault(); 
    }, 800);
}, { passive: false });

document.addEventListener('touchend', () => {
    clearTimeout(touchTimer);
});
