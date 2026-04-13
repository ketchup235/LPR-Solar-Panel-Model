// Solar panel dimensions (realistic proportions for 340Wp panel)
const PANEL_WIDTH = 1.7;
const PANEL_HEIGHT = 1.0;
const PANEL_DEPTH = 0.035;
const FRAME_THICKNESS = 0.025;
const CELL_GAP = 0.003;
const CELLS_X = 6;
const CELLS_Y = 10;

// Scene setup
let scene, camera, renderer, controls;
let solarPanelGroup;
let activeScreen = 'viewer';
let fourFingerGesture = null;
let lastScreenSwitchTimestamp = 0;
let currentImageIndex = -1;

const FOUR_FINGER_SWIPE_MIN_DISTANCE = 90;
const SCREEN_SWITCH_COOLDOWN_MS = 500;
const IMAGE_SLIDES = [
    'ChatGPT Image Apr 6, 2026, 05_42_39 PM.png',
    'Construction phase inspection report form.png'
];

// Initialize the 3D scene
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        50
    );
    camera.position.set(1.8, 0.8, 2.0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const viewerScreen = document.getElementById('viewerScreen');
    if (viewerScreen) {
        viewerScreen.prepend(renderer.domElement);
    } else {
        document.body.appendChild(renderer.domElement);
    }

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.6;
    controls.enablePan = false;
    controls.minDistance = 1.0;
    controls.maxDistance = 3.5;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.zoomSpeed = 0.8;
    controls.target.set(0, 0, 0);

    createStarfield();

    // Lighting setup
    setupLighting();

    // Create solar panel model
    createSolarPanelModel();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Setup UI controls
    setupUIControls();

    // Setup 4-finger swipe navigation between in-page screens
    setupScreenNavigation();

    // Auto-hide hints after 5 seconds
    setTimeout(() => {
        const hints = document.getElementById('hints');
        if (hints) hints.classList.add('hidden');
    }, 5000);

    // Start animation loop
    animate();
}

function setupScreenNavigation() {
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEndOrCancel, { passive: false });
    window.addEventListener('touchcancel', onTouchEndOrCancel, { passive: false });
}

function onTouchStart(event) {
    if (event.touches.length !== 4) {
        return;
    }

    const center = getTouchesCenter(event.touches);
    fourFingerGesture = {
        startX: center.x,
        startY: center.y,
        switched: false
    };

    event.preventDefault();
}

function onTouchMove(event) {
    if (!fourFingerGesture || event.touches.length < 4 || fourFingerGesture.switched) {
        return;
    }

    const center = getTouchesCenter(event.touches);
    const dx = center.x - fourFingerGesture.startX;
    const dy = center.y - fourFingerGesture.startY;
    const gestureDistance = Math.hypot(dx, dy);

    if (gestureDistance < FOUR_FINGER_SWIPE_MIN_DISTANCE) {
        event.preventDefault();
        return;
    }

    const now = Date.now();
    if (now - lastScreenSwitchTimestamp < SCREEN_SWITCH_COOLDOWN_MS) {
        event.preventDefault();
        return;
    }

    showNextImage();

    fourFingerGesture.switched = true;
    lastScreenSwitchTimestamp = now;
    event.preventDefault();
}

function onTouchEndOrCancel(event) {
    if (event.touches.length < 4) {
        fourFingerGesture = null;
    }
}

function getTouchesCenter(touches) {
    let x = 0;
    let y = 0;

    for (let i = 0; i < 4; i++) {
        x += touches[i].clientX;
        y += touches[i].clientY;
    }

    return {
        x: x / 4,
        y: y / 4
    };
}

function switchToScreen(screenName) {
    const viewerScreen = document.getElementById('viewerScreen');
    const imageScreen = document.getElementById('imageScreen');

    if (!viewerScreen || !imageScreen) {
        return;
    }

    if (screenName === 'image') {
        activeScreen = 'image';
        viewerScreen.classList.remove('active-screen');
        viewerScreen.classList.add('inactive-screen');
        viewerScreen.setAttribute('aria-hidden', 'true');

        imageScreen.classList.remove('inactive-screen');
        imageScreen.classList.add('active-screen');
        imageScreen.setAttribute('aria-hidden', 'false');
    }

    if (screenName === 'viewer') {
        activeScreen = 'viewer';
        imageScreen.classList.remove('active-screen');
        imageScreen.classList.add('inactive-screen');
        imageScreen.setAttribute('aria-hidden', 'true');

        viewerScreen.classList.remove('inactive-screen');
        viewerScreen.classList.add('active-screen');
        viewerScreen.setAttribute('aria-hidden', 'false');
    }
}

function showNextImage() {
    const imageElement = document.getElementById('fullScreenImage');
    if (!imageElement || IMAGE_SLIDES.length === 0) {
        return;
    }

    currentImageIndex++;
    
    // If we've cycled past the 2 images, return to viewer
    if (currentImageIndex >= IMAGE_SLIDES.length) {
        currentImageIndex = -1;
        switchToScreen('viewer');
        return;
    }
    
    imageElement.src = IMAGE_SLIDES[currentImageIndex];
    switchToScreen('image');
}

function createSlideDataUri(title, subtitle, colorA, colorB) {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <circle cx="1560" cy="240" r="360" fill="rgba(255,255,255,0.08)"/>
  <circle cx="300" cy="900" r="300" fill="rgba(255,255,255,0.06)"/>
  <text x="120" y="460" fill="#ffffff" font-size="96" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${escapeXml(title)}</text>
  <text x="120" y="560" fill="rgba(255,255,255,0.88)" font-size="44" font-family="Segoe UI, Arial, sans-serif">${escapeXml(subtitle)}</text>
</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function setupLighting() {
    // Key light - soft, from above-front-right
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill light - softer, from opposite side
    const fillLight = new THREE.DirectionalLight(0xf0f4ff, 0.7);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    // Strong rim light - defines edges from behind
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 1, -6);
    scene.add(rimLight);

    // Top accent light
    const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
    topLight.position.set(0, 8, 0);
    scene.add(topLight);

    // Side rim lights for edge definition
    const sideLight1 = new THREE.SpotLight(0xe8f0ff, 0.6);
    sideLight1.position.set(-5, 2, 0);
    sideLight1.angle = 0.5;
    sideLight1.penumbra = 1;
    scene.add(sideLight1);

    const sideLight2 = new THREE.SpotLight(0xfff8f0, 0.6);
    sideLight2.position.set(5, 2, 0);
    sideLight2.angle = 0.5;
    sideLight2.penumbra = 1;
    scene.add(sideLight2);

    // Low ambient to prevent crushed blacks
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
    scene.add(ambientLight);

    // Subtle bottom fill to show underside detail
    const bottomLight = new THREE.PointLight(0xe0e8ff, 0.15);
    bottomLight.position.set(0, -2, 2);
    scene.add(bottomLight);
}

function createSolarPanelModel() {
    // Main group that will be tilted
    solarPanelGroup = new THREE.Group();

    // Panel assembly group (will be rotated for tilt)
    const panelAssembly = new THREE.Group();
    const PANEL_TILT = -Math.PI * 0.30; // ~54 degrees - much steeper tilt
    panelAssembly.rotation.x = PANEL_TILT;
    panelAssembly.position.y = 0.2;

    // Create components
    createAluminumFrame(panelAssembly);
    createSolarCells(panelAssembly);
    createGlassLayer(panelAssembly);
    createBackSheet(panelAssembly);
    createJunctionBox(panelAssembly);
    createMountingHoles(panelAssembly);

    solarPanelGroup.add(panelAssembly);

    // Create mounting stand (properly attached)
    createMountingStand(solarPanelGroup, PANEL_TILT);

    scene.add(solarPanelGroup);
}

function createAluminumFrame(parent) {
    // Brushed anodized aluminum material
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x9a9a9a,
        roughness: 0.35,
        metalness: 0.92,
        envMapIntensity: 0.7
    });

    // Top frame
    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(PANEL_WIDTH, FRAME_THICKNESS, PANEL_DEPTH),
        frameMaterial
    );
    topFrame.position.set(0, PANEL_HEIGHT / 2 - FRAME_THICKNESS / 2, 0);
    parent.add(topFrame);

    // Bottom frame
    const bottomFrame = new THREE.Mesh(
        new THREE.BoxGeometry(PANEL_WIDTH, FRAME_THICKNESS, PANEL_DEPTH),
        frameMaterial
    );
    bottomFrame.position.set(0, -PANEL_HEIGHT / 2 + FRAME_THICKNESS / 2, 0);
    parent.add(bottomFrame);

    // Left frame
    const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(FRAME_THICKNESS, PANEL_HEIGHT - FRAME_THICKNESS * 2, PANEL_DEPTH),
        frameMaterial
    );
    leftFrame.position.set(-PANEL_WIDTH / 2 + FRAME_THICKNESS / 2, 0, 0);
    parent.add(leftFrame);

    // Right frame
    const rightFrame = new THREE.Mesh(
        new THREE.BoxGeometry(FRAME_THICKNESS, PANEL_HEIGHT - FRAME_THICKNESS * 2, PANEL_DEPTH),
        frameMaterial
    );
    rightFrame.position.set(PANEL_WIDTH / 2 - FRAME_THICKNESS / 2, 0, 0);
    parent.add(rightFrame);

    // Corner brackets
    const cornerPositions = [
        [PANEL_WIDTH / 2 - FRAME_THICKNESS * 0.6, PANEL_HEIGHT / 2 - FRAME_THICKNESS * 0.6],
        [-PANEL_WIDTH / 2 + FRAME_THICKNESS * 0.6, PANEL_HEIGHT / 2 - FRAME_THICKNESS * 0.6],
        [PANEL_WIDTH / 2 - FRAME_THICKNESS * 0.6, -PANEL_HEIGHT / 2 + FRAME_THICKNESS * 0.6],
        [-PANEL_WIDTH / 2 + FRAME_THICKNESS * 0.6, -PANEL_HEIGHT / 2 + FRAME_THICKNESS * 0.6]
    ];

    cornerPositions.forEach(([x, y]) => {
        const bracket = new THREE.Mesh(
            new THREE.BoxGeometry(FRAME_THICKNESS * 0.5, FRAME_THICKNESS * 0.5, 0.001),
            frameMaterial
        );
        bracket.position.set(x, y, PANEL_DEPTH / 2 + 0.0005);
        parent.add(bracket);
    });
}

function createSolarCells(parent) {
    //
    const cellWidth = (PANEL_WIDTH - FRAME_THICKNESS * 2 - CELL_GAP * (CELLS_X + 1)) / CELLS_X;
    const cellHeight = (PANEL_HEIGHT - FRAME_THICKNESS * 2 - CELL_GAP * (CELLS_Y + 1)) / CELLS_Y;

    // FIX: Darker "Deep Solar" color (0x0b1122)
    // Increased roughness slightly so it looks like matte silicon, not plastic
    const cellGeometry = new THREE.BoxGeometry(cellWidth - 0.002, cellHeight - 0.002, 0.0003);
    const cellMaterial = new THREE.MeshStandardMaterial({
        color: 0x0b1122, // Very deep navy (almost black)
        roughness: 0.25,
        metalness: 0.7,
        emissive: 0x000205, // Tiny amount of glow for visibility in dark
        emissiveIntensity: 0.3
    });

    for (let row = 0; row < CELLS_Y; row++) {
        for (let col = 0; col < CELLS_X; col++) {
            const x = -PANEL_WIDTH / 2 + FRAME_THICKNESS + CELL_GAP + (col + 0.5) * (cellWidth + CELL_GAP);
            const y = -PANEL_HEIGHT / 2 + FRAME_THICKNESS + CELL_GAP + (row + 0.5) * (cellHeight + CELL_GAP);

            const cell = new THREE.Mesh(cellGeometry, cellMaterial.clone());
            cell.position.set(x, y, PANEL_DEPTH / 2 + 0.0002);
            parent.add(cell);
        }
    }

    // High contrast busbars (Silver)
    const busbarMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const busbarWidth = 0.0015;
    const busbarCount = 3;

    for (let row = 0; row < CELLS_Y; row++) {
        for (let col = 0; col < CELLS_X; col++) {
            const cellX = -PANEL_WIDTH / 2 + FRAME_THICKNESS + CELL_GAP + (col + 0.5) * (cellWidth + CELL_GAP);
            const cellY = -PANEL_HEIGHT / 2 + FRAME_THICKNESS + CELL_GAP + (row + 0.5) * (cellHeight + CELL_GAP);

            for (let i = 0; i < busbarCount; i++) {
                const busbarX = cellX - cellWidth / 2 + (cellWidth / (busbarCount + 1)) * (i + 1);
                const busbar = new THREE.Mesh(
                    new THREE.BoxGeometry(busbarWidth, cellHeight - 0.002, 0.0001),
                    busbarMaterial
                );
                busbar.position.set(busbarX, cellY, PANEL_DEPTH / 2 + 0.0005);
                parent.add(busbar);
            }
        }
    }

    // Darker ribbons to blend better
    const ribbonMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    for (let row = 1; row < CELLS_Y; row++) {
        const y = -PANEL_HEIGHT / 2 + FRAME_THICKNESS + CELL_GAP + row * (cellHeight + CELL_GAP) - CELL_GAP / 2;
        const ribbon = new THREE.Mesh(
            new THREE.BoxGeometry(PANEL_WIDTH - FRAME_THICKNESS * 2.5, 0.002, 0.0001),
            ribbonMaterial
        );
        ribbon.position.set(0, y, PANEL_DEPTH / 2 + 0.0006);
        parent.add(ribbon);
    }
}

function createGlassLayer(parent) {
    // FIX: Use transmission instead of opacity to avoid "milky" white look
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.0,
        metalness: 0.1,
        transmission: 0.99, // 99% light passes through (Clear Glass)
        thickness: 0.003,
        transparent: true,
        opacity: 1.0        // Keep opacity 1 so transmission handles the see-through
    });

    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(PANEL_WIDTH - FRAME_THICKNESS * 2, PANEL_HEIGHT - FRAME_THICKNESS * 2, 0.003),
        glassMaterial
    );
    glass.position.set(0, 0, PANEL_DEPTH / 2 + 0.0015);
    parent.add(glass);
}

function createBackSheet(parent) {
    // Single solid backsheet
    const backSheetMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a4a4a,
        side: THREE.DoubleSide
    });

    const backSheet = new THREE.Mesh(
        new THREE.BoxGeometry(
            PANEL_WIDTH - FRAME_THICKNESS * 2.2,
            PANEL_HEIGHT - FRAME_THICKNESS * 2.2,
            0.0015
        ),
        backSheetMaterial
    );
    backSheet.position.set(0, 0, -PANEL_DEPTH / 2 - 0.0008);
    parent.add(backSheet);
}

function createJunctionBox(parent) {
    const boxGroup = new THREE.Group();
    boxGroup.position.set(0, -PANEL_HEIGHT / 2 + 0.12, -PANEL_DEPTH / 2 - 0.018);

    // Main junction box
    const mainBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.09, 0.025),
        new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
    );
    boxGroup.add(mainBox);

    // Box lid detail
    const lid = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.07, 0.002),
        new THREE.MeshBasicMaterial({ color: 0x252525 })
    );
    lid.position.set(0, 0, 0.013);
    boxGroup.add(lid);

    // Cable glands
    [-0.045, 0.045].forEach(x => {
        const gland = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.015, 16),
            new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
        );
        gland.position.set(x, -0.045, 0);
        boxGroup.add(gland);

        // Cable
        const cable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.004, 0.004, 0.025, 12),
            new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
        );
        cable.position.set(x, -0.045 - 0.02, 0);
        boxGroup.add(cable);
    });

    parent.add(boxGroup);
}

function createMountingHoles(parent) {
    const holeMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.6,
        metalness: 0.7
    });

    const holePositions = [
        [-PANEL_WIDTH / 4, -PANEL_HEIGHT / 2 + FRAME_THICKNESS / 2],
        [PANEL_WIDTH / 4, -PANEL_HEIGHT / 2 + FRAME_THICKNESS / 2],
        [-PANEL_WIDTH / 4, PANEL_HEIGHT / 2 - FRAME_THICKNESS / 2],
        [PANEL_WIDTH / 4, PANEL_HEIGHT / 2 - FRAME_THICKNESS / 2]
    ];

    holePositions.forEach(([x, y]) => {
        const hole = new THREE.Mesh(
            new THREE.TorusGeometry(0.006, 0.002, 8, 24),
            holeMaterial
        );
        hole.position.set(x, y, -PANEL_DEPTH / 2 - 0.001);
        hole.rotation.x = Math.PI / 2;
        parent.add(hole);
    });
}

function createMountingStand(parent, panelTilt) {
    const standGroup = new THREE.Group();

    // Materials
    const steelMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0.6,
        metalness: 0.4
    });

    // --- HELPER: Draw a bar exactly between two 3D points ---
    function createBarBetweenPoints(p1, p2, thickness, material) {
        const distance = p1.distanceTo(p2);
        const geometry = new THREE.CylinderGeometry(thickness, thickness, distance, 12);
        geometry.translate(0, distance / 2, 0); // Move pivot to bottom
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.copy(p1);
        mesh.lookAt(p2);
        mesh.rotateX(Math.PI / 2); // Cylinder looks along Y, we need it to look at target
        return mesh;
    }

    // --- 1. CALCULATE TOUCH POINTS ---
    // The panel rotates around (0, 0.2, 0). 
    const FLOOR_Y = -0.3;

    // Panel mounting locations
    const mountY_Top = 0.30;  // Rear attachment (High)
    const mountY_Bot = -0.30; // Front attachment (Low)

    // FIX: Removed the extra -0.01 gap. 
    // Added +0.005 to "embed" the leg 5mm INTO the frame so it's fully solid.
    const mountZ_Offset = -PANEL_DEPTH / 2 + 0.005;

    // Trig for rotation
    const cosT = Math.cos(panelTilt);
    const sinT = Math.sin(panelTilt);
    const pivotY = 0.2;

    // Calculate World Coordinates of the attachment points (Now inside the frame)
    // Rear (Top of tilted panel)
    const rearPoint = new THREE.Vector3(
        0,
        pivotY + (mountY_Top * cosT - mountZ_Offset * sinT),
        0 + (mountY_Top * sinT + mountZ_Offset * cosT)
    );

    // Front (Bottom of tilted panel)
    const frontPoint = new THREE.Vector3(
        0,
        pivotY + (mountY_Bot * cosT - mountZ_Offset * sinT),
        0 + (mountY_Bot * sinT + mountZ_Offset * cosT)
    );

    // --- 2. BUILD STRUCTURE ---
    [-0.5, 0.5].forEach(xOffset => {
        // Define key 3D points for this side's frame
        const pRearTop = new THREE.Vector3(xOffset, rearPoint.y, rearPoint.z);
        const pRearBot = new THREE.Vector3(xOffset, FLOOR_Y, rearPoint.z);

        const pFrontTop = new THREE.Vector3(xOffset, frontPoint.y, frontPoint.z);
        const pFrontBot = new THREE.Vector3(xOffset, FLOOR_Y, frontPoint.z);

        // A. REAR LEG (The "Longer" Bar)
        // Connects fully into the panel now
        standGroup.add(createBarBetweenPoints(pRearBot, pRearTop, 0.025, steelMaterial));

        // B. FRONT LEG
        standGroup.add(createBarBetweenPoints(pFrontBot, pFrontTop, 0.025, steelMaterial));

        // C. TOP RAIL (Under the panel)
        // Move it down slightly so it supports the panel rather than cutting through it
        const pRearRail = pRearTop.clone().add(new THREE.Vector3(0, -0.04, 0));
        const pFrontRail = pFrontTop.clone().add(new THREE.Vector3(0, -0.04, 0));
        standGroup.add(createBarBetweenPoints(pFrontRail, pRearRail, 0.02, steelMaterial));

        // D. DIAGONAL BRACE
        // Connect Front-Bottom to Rear-Top
        const braceStart = pFrontBot.clone().add(new THREE.Vector3(0, 0.05, 0));
        const braceEnd = pRearTop.clone().add(new THREE.Vector3(0, -0.15, 0));
        standGroup.add(createBarBetweenPoints(braceStart, braceEnd, 0.015, steelMaterial));

        // E. FEET
        const footGeo = new THREE.BoxGeometry(0.1, 0.02, 0.1);
        const rearFoot = new THREE.Mesh(footGeo, steelMaterial);
        rearFoot.position.set(xOffset, FLOOR_Y + 0.01, rearPoint.z);
        standGroup.add(rearFoot);

        const frontFoot = new THREE.Mesh(footGeo, steelMaterial);
        frontFoot.position.set(xOffset, FLOOR_Y + 0.01, frontPoint.z);
        standGroup.add(frontFoot);
    });

    // --- 3. HORIZONTAL STABILIZERS ---
    const pLeftRear = new THREE.Vector3(-0.5, FLOOR_Y + 0.1, rearPoint.z);
    const pRightRear = new THREE.Vector3(0.5, FLOOR_Y + 0.1, rearPoint.z);
    standGroup.add(createBarBetweenPoints(pLeftRear, pRightRear, 0.02, steelMaterial));

    parent.add(standGroup);
}

function setupUIControls() {
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetBtn = document.getElementById('resetBtn');
    const hints = document.getElementById('hints');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            const currentDistance = controls.getDistance();
            const newDistance = Math.max(1.0, currentDistance * 0.85);
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.sub(direction.multiplyScalar(currentDistance - newDistance));
            controls.update();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            const currentDistance = controls.getDistance();
            const newDistance = Math.min(3.5, currentDistance * 1.15);
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.add(direction.multiplyScalar(newDistance - currentDistance));
            controls.update();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            controls.reset();
        });
    }

    if (hints) {
        hints.addEventListener('click', () => {
            hints.classList.add('hidden');
        });
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function createStarfield() {
    // Create geometry for 5,000 stars
    const geometry = new THREE.BufferGeometry();
    const count = 5000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        // 1. Generate a random direction on a sphere
        // This ensures stars are all around us, not just in a box shape
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        // 2. Set a distance: Keep them FAR away (between 20m and 90m)
        // The "20" is the Safe Zone - no stars can exist closer than 20 meters.
        const distance = 20 + Math.random() * 70;

        // 3. Convert from Spherical to Cartesian (x, y, z) coordinates
        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2, // Your preferred size
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

// Start the application when the page loads
window.addEventListener('DOMContentLoaded', init);