import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ArrowRight, Compass, Eye, EyeOff, Layers, Sparkles, Sun } from 'lucide-react';

export type CameraPreset = 'observatory' | 'globe' | 'crest' | 'volumes';
export type LightingPreset = 'golden' | 'midnight' | 'studio';

interface CampusHeroSceneProps {
  schoolName: string;
  tagline: string;
  location: string;
  headline: string;
  subtext: string;
  studentsCount: number;
  teachersCount: number;
  yearsCount: number;
  awardsCount: number;
  enable3DByDefault?: boolean;
  onApplyClick: () => void;
  onExploreClick: () => void;
}

// Module-scope reusable math objects (Zero GC inside render loop)
const _camTargetPos = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.2, 0);
const _dummyMatrix = new THREE.Matrix4();
const _dummyPos = new THREE.Vector3();
const _dummyQuat = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3();
const _dummyEuler = new THREE.Euler();
const _tempColor = new THREE.Color();

function createGlobeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#0a1936');
  grad.addColorStop(0.5, '#0f2952');
  grad.addColorStop(1, '#08152c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Latitude & longitude graticule lines
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.28)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Stylized gold-tinted continents
  ctx.fillStyle = '#d97706';
  const continents = [
    [95, 70, 65, 48],
    [130, 135, 42, 75],
    [245, 55, 54, 42],
    [255, 108, 52, 72],
    [325, 62, 105, 65],
    [355, 112, 28, 34], // Indian subcontinent highlight
    [415, 165, 48, 35],
  ];
  continents.forEach(([x, y, w, h]) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
  });

  // Bright beacon on Sathyamangalam / South India
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(366, 132, 6, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createDialRingTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 512, 64);

  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 2;
  for (let i = 0; i < 64; i++) {
    const x = i * 8;
    const h = i % 4 === 0 ? 26 : 14;
    ctx.beginPath();
    ctx.moveTo(x, 32 - h / 2);
    ctx.lineTo(x, 32 + h / 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export const CampusHeroScene: React.FC<CampusHeroSceneProps> = ({
  schoolName,
  tagline,
  location,
  headline,
  subtext,
  studentsCount,
  teachersCount,
  yearsCount,
  awardsCount,
  enable3DByDefault = true,
  onApplyClick,
  onExploreClick,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('observatory');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('golden');
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [use2DFallback, setUse2DFallback] = useState<boolean>(!enable3DByDefault);

  // Store interactive state in refs so WebGL scene never tears down on UI updates
  const cameraPresetRef = useRef<CameraPreset>(cameraPreset);
  const lightingPresetRef = useRef<LightingPreset>(lightingPreset);
  const explodedRef = useRef<number>(explodedFactor);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    cameraPresetRef.current = cameraPreset;
  }, [cameraPreset]);

  useEffect(() => {
    lightingPresetRef.current = lightingPreset;
  }, [lightingPreset]);

  useEffect(() => {
    explodedRef.current = explodedFactor;
  }, [explodedFactor]);

  // Keyboard shortcut 'H' to toggle HUD dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (use2DFallback) return;
    const container = canvasMountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setUse2DFallback(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 760;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = 0x070e20;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.025);

    // Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0.2, 0.45, 6.4);

    // Balanced 3-Point Studio Lighting Rig + Hero Accent PointLight
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 1.35);
    hemiLight.position.set(0, 12, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3d6, 3.0);
    keyLight.position.set(5, 7, 6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      const d = 5.5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 22;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const heroGlowLight = new THREE.PointLight(0xf59e0b, 3.2, 12);
    heroGlowLight.position.set(2.0, 0.8, 3.2);
    scene.add(heroGlowLight);

    // Shared PBR Materials (varied roughness >= 0.25 across adjacent parts)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const globeTex = createGlobeTexture(maxAniso);
    const dialTex = createDialRingTexture(maxAniso);

    const brushedGoldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.18,
    });
    const deepNavyMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.3,
      roughness: 0.58,
    });
    const crimsonLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      metalness: 0.2,
      roughness: 0.65,
    });
    const emeraldLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      metalness: 0.2,
      roughness: 0.65,
    });
    const creamPaperMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      metalness: 0.05,
      roughness: 0.85,
    });
    const darkGraniteMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.45,
      roughness: 0.45,
    });
    const globeSurfaceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: globeTex,
      metalness: 0.22,
      roughness: 0.35,
    });
    const dialBandMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: dialTex,
      metalness: 0.78,
      roughness: 0.24,
    });

    // Root Scene Group framed cleanly on the right side on desktop so left editorial copy never overlaps
    const stageGroup = new THREE.Group();
    stageGroup.position.set(width > 960 ? 1.85 : 0, 0.05, 0);
    scene.add(stageGroup);

    // =========================================================================
    // 1. ARCHITECTURAL OBSERVATORY TERRACE & GROUNDED CONTACT SHADOW (6 parts)
    // =========================================================================
    const plinthGroup = new THREE.Group();
    plinthGroup.position.set(0, -1.65, 0);
    stageGroup.add(plinthGroup);

    const lowerStep = new THREE.Mesh(
      new THREE.CylinderGeometry(2.35, 2.55, 0.18, 48),
      darkGraniteMat
    );
    lowerStep.position.y = 0.09;
    lowerStep.receiveShadow = true;
    plinthGroup.add(lowerStep);

    const upperStep = new THREE.Mesh(
      new THREE.CylinderGeometry(1.85, 2.0, 0.16, 48),
      deepNavyMat
    );
    upperStep.position.y = 0.26;
    upperStep.receiveShadow = true;
    plinthGroup.add(upperStep);

    const brassTrimRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.86, 0.035, 16, 64),
      brushedGoldMat
    );
    brassTrimRing.rotation.x = Math.PI / 2;
    brassTrimRing.position.y = 0.34;
    plinthGroup.add(brassTrimRing);

    // Radial contact shadow plane (offset >= 0.02 to prevent Z-fighting)
    const shadowDiscMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 36), shadowDiscMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.36;
    plinthGroup.add(shadowDisc);

    // =========================================================================
    // 2. COMPOSITE ARMILLARY ACADEMIC GLOBE (8 distinct parts)
    // =========================================================================
    const globeGroup = new THREE.Group();
    globeGroup.position.set(0, -0.15, 0);
    stageGroup.add(globeGroup);

    // Part 1: Lathe-turned pedestal base
    const lathePoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.68, 0.0),
      new THREE.Vector2(0.58, 0.14),
      new THREE.Vector2(0.24, 0.32),
      new THREE.Vector2(0.18, 0.72),
      new THREE.Vector2(0.32, 0.82),
      new THREE.Vector2(0.0, 0.82),
    ];
    const pedestalGeo = new THREE.LatheGeometry(lathePoints, 32);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, brushedGoldMat);
    pedestalMesh.position.y = -1.15;
    pedestalMesh.castShadow = true;
    globeGroup.add(pedestalMesh);

    // Part 2: Inclined Cradle Tilted Assembly
    const tiltRig = new THREE.Group();
    tiltRig.position.y = 0.22;
    tiltRig.rotation.z = THREE.MathUtils.degToRad(23.5);
    globeGroup.add(tiltRig);

    // Part 3: Outer Meridian Brass Torus
    const meridianRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.16, 0.048, 20, 64),
      brushedGoldMat
    );
    meridianRing.castShadow = true;
    tiltRig.add(meridianRing);

    // Part 4: Equatorial Calendar Band with Procedural Tick Marks
    const horizonBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.11, 48, 1, true),
      dialBandMat
    );
    horizonBand.material.side = THREE.DoubleSide;
    tiltRig.add(horizonBand);

    // Part 5: Axial Spindle Rod
    const spindleRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 2.55, 16),
      brushedGoldMat
    );
    tiltRig.add(spindleRod);

    // Part 6: Top Finial Spire
    const finialCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.24, 20),
      brushedGoldMat
    );
    finialCone.position.y = 1.34;
    tiltRig.add(finialCone);

    // Part 7: Terrestrial Sphere with Procedural Continents
    const earthSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 40, 40),
      globeSurfaceMat
    );
    earthSphere.castShadow = true;
    tiltRig.add(earthSphere);

    // Part 8: Inner Celestial Orbit Ring
    const innerOrbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.02, 12, 64),
      brushedGoldMat
    );
    innerOrbitRing.rotation.x = Math.PI / 3;
    globeGroup.add(innerOrbitRing);

    // =========================================================================
    // 3. CEREMONIAL MORTARBOARD GRADUATION CAP (6 distinct parts)
    // =========================================================================
    const capGroup = new THREE.Group();
    capGroup.position.set(-0.1, 1.68, 0.2);
    capGroup.rotation.set(0.22, -0.35, -0.12);
    stageGroup.add(capGroup);

    // Part 1: Skullcap Crown
    const skullCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.48, 0.28, 32),
      deepNavyMat
    );
    skullCrown.position.y = -0.14;
    capGroup.add(skullCrown);

    // Part 2: Brass Crown Rim Band
    const crownBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.47, 0.024, 12, 36),
      brushedGoldMat
    );
    crownBand.rotation.x = Math.PI / 2;
    crownBand.position.y = -0.26;
    capGroup.add(crownBand);

    // Part 3: Beveled Square Trencher Board (ExtrudeGeometry)
    const boardShape = new THREE.Shape();
    const bs = 0.72;
    boardShape.moveTo(-bs, -bs);
    boardShape.lineTo(bs, -bs);
    boardShape.lineTo(bs, bs);
    boardShape.lineTo(-bs, bs);
    boardShape.closePath();
    const boardGeo = new THREE.ExtrudeGeometry(boardShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 3,
    });
    boardGeo.rotateX(Math.PI / 2);
    const boardMesh = new THREE.Mesh(boardGeo, darkGraniteMat);
    boardMesh.position.y = 0.03;
    boardMesh.castShadow = true;
    capGroup.add(boardMesh);

    // Part 4: Center Button Stud
    const centerButton = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.04, 20),
      brushedGoldMat
    );
    centerButton.position.y = 0.05;
    capGroup.add(centerButton);

    // Part 5: Curved Gold Tassel Cord (TubeGeometry)
    const tasselCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0.32, 0.05, 0.25),
      new THREE.Vector3(0.68, 0.02, 0.42),
      new THREE.Vector3(0.74, -0.32, 0.45),
    ]);
    const tasselCord = new THREE.Mesh(
      new THREE.TubeGeometry(tasselCurve, 24, 0.018, 8, false),
      brushedGoldMat
    );
    capGroup.add(tasselCord);

    // Part 6: Tassel Fringe Cone & Signet Ring
    const tasselFringe = new THREE.Mesh(
      new THREE.ConeGeometry(0.065, 0.22, 16),
      brushedGoldMat
    );
    tasselFringe.position.set(0.74, -0.42, 0.45);
    capGroup.add(tasselFringe);

    // =========================================================================
    // 4. FLOATING SCHOLARLY VOLUMES (3 Composite Books x 5 Parts each)
    // =========================================================================
    const booksGroup = new THREE.Group();
    stageGroup.add(booksGroup);

    function createCompositeBook(coverMat: THREE.Material): THREE.Group {
      const book = new THREE.Group();

      // 1. Beveled Outer Hardcover
      const coverShape = new THREE.Shape();
      coverShape.moveTo(-0.42, -0.56);
      coverShape.lineTo(0.42, -0.56);
      coverShape.lineTo(0.42, 0.56);
      coverShape.lineTo(-0.42, 0.56);
      coverShape.closePath();

      const coverGeo = new THREE.ExtrudeGeometry(coverShape, {
        depth: 0.14,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 2,
      });
      const coverMesh = new THREE.Mesh(coverGeo, coverMat);
      coverMesh.castShadow = true;
      book.add(coverMesh);

      // 2. Sculpted Cream Paper Block
      const pagesMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.79, 1.06, 0.11),
        creamPaperMat
      );
      pagesMesh.position.set(0.03, 0, 0.07);
      book.add(pagesMesh);

      // 3. Gold Foil Cover Emblem
      const foilEmblem = new THREE.Mesh(
        new THREE.RingGeometry(0.11, 0.16, 24),
        brushedGoldMat
      );
      foilEmblem.position.set(0.02, 0.08, 0.16);
      book.add(foilEmblem);

      // 4. Gilt Spine Ridges
      for (let r = -1; r <= 1; r++) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.03, 0.165),
          brushedGoldMat
        );
        rib.position.set(-0.42, r * 0.28, 0.07);
        book.add(rib);
      }

      // 5. Bookmark Ribbon Tail
      const ribbonCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.1, -0.54, 0.07),
        new THREE.Vector3(0.16, -0.72, 0.12),
        new THREE.Vector3(0.08, -0.86, 0.06),
      ]);
      const ribbonMesh = new THREE.Mesh(
        new THREE.TubeGeometry(ribbonCurve, 12, 0.014, 6, false),
        brushedGoldMat
      );
      book.add(ribbonMesh);

      return book;
    }

    const bookConfigs = [
      {
        mat: deepNavyMat,
        basePos: new THREE.Vector3(-1.75, 0.62, 0.55),
        baseRot: new THREE.Euler(0.35, 0.52, -0.22),
      },
      {
        mat: crimsonLeatherMat,
        basePos: new THREE.Vector3(1.75, 0.78, -0.25),
        baseRot: new THREE.Euler(-0.28, -0.48, 0.18),
      },
      {
        mat: emeraldLeatherMat,
        basePos: new THREE.Vector3(-1.55, -0.72, 0.45),
        baseRot: new THREE.Euler(0.42, 0.3, 0.25),
      },
    ];

    const bookMeshes = bookConfigs.map((cfg) => {
      const b = createCompositeBook(cfg.mat);
      b.position.copy(cfg.basePos);
      b.rotation.copy(cfg.baseRot);
      booksGroup.add(b);
      return { group: b, basePos: cfg.basePos, baseRot: cfg.baseRot };
    });

    // =========================================================================
    // 5. INSTANCED KNOWLEDGE CONSTELLATION PARTICLES (72 instances)
    // =========================================================================
    const particleCount = 72;
    const particleGeo = new THREE.OctahedronGeometry(0.052, 0);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.75,
      roughness: 0.2,
    });
    const instancedParticles = new THREE.InstancedMesh(
      particleGeo,
      particleMat,
      particleCount
    );
    instancedParticles.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(particleCount * 3),
      3
    );

    const particleOrbits: { radius: number; angle: number; y: number; speed: number; scale: number }[] = [];
    const palette = [0xf59e0b, 0x38bdf8, 0xfef3c7];

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.9 + (i % 9) * 0.25;
      const angle = (i / particleCount) * Math.PI * 2;
      const y = ((i % 11) - 5) * 0.38;
      const speed = 0.12 + (i % 5) * 0.04;
      const scale = 0.75 + (i % 4) * 0.15;
      particleOrbits.push({ radius, angle, y, speed, scale });

      _dummyPos.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      _dummyEuler.set(i * 0.3, i * 0.5, 0);
      _dummyQuat.setFromEuler(_dummyEuler);
      _dummyScale.setScalar(scale);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      instancedParticles.setMatrixAt(i, _dummyMatrix);

      _tempColor.setHex(palette[i % palette.length]);
      instancedParticles.setColorAt(i, _tempColor);
    }
    instancedParticles.instanceMatrix.needsUpdate = true;
    instancedParticles.instanceColor.needsUpdate = true;
    instancedParticles.computeBoundingSphere();
    instancedParticles.frustumCulled = false;
    stageGroup.add(instancedParticles);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer & Scroll Listeners
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      pointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY || 0;
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 760;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      stageGroup.position.x = w > 960 ? 1.85 : 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Paced Animation Loop using performance.now() (Zero deprecation warnings)
    let startTime = performance.now();
    let lastTime = startTime;
    let frameId = 0;
    let isDisposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      const elapsed = (now - startTime) * 0.001;
      const dampAlpha = 1 - Math.exp(-5.5 * dt);

      // Update Lighting Mood Presets smoothly
      const lPreset = lightingPresetRef.current;
      if (lPreset === 'golden') {
        keyLight.color.setHex(0xfff3d6);
        keyLight.intensity = 3.0;
        rimLight.color.setHex(0x38bdf8);
      } else if (lPreset === 'midnight') {
        keyLight.color.setHex(0x93c5fd);
        keyLight.intensity = 2.1;
        rimLight.color.setHex(0xf59e0b);
      } else {
        keyLight.color.setHex(0xffffff);
        keyLight.intensity = 3.4;
        rimLight.color.setHex(0xa855f7);
      }

      // Camera Preset Targets + Pointer & Scroll Parallax
      const cPreset = cameraPresetRef.current;
      const px = pointerRef.current.x * 0.45;
      const py = pointerRef.current.y * 0.3;
      const scrollOffset = Math.min(scrollRef.current * 0.0015, 1.2);

      if (cPreset === 'observatory') {
        _camTargetPos.set(0.2 + px, 0.42 + py - scrollOffset * 0.4, 6.35);
        _camLookTarget.set(0.35, 0.05, 0);
      } else if (cPreset === 'globe') {
        _camTargetPos.set(1.55 + px * 0.4, 0.2 + py * 0.3, 4.15);
        _camLookTarget.set(stageGroup.position.x, 0.0, 0);
      } else if (cPreset === 'crest') {
        _camTargetPos.set(1.4 + px * 0.4, 1.75 + py * 0.3, 3.65);
        _camLookTarget.set(stageGroup.position.x - 0.1, 1.55, 0.2);
      } else {
        _camTargetPos.set(-0.5 + px * 0.4, 0.55 + py * 0.3, 5.2);
        _camLookTarget.set(stageGroup.position.x - 0.6, 0.2, 0);
      }

      camera.position.lerp(_camTargetPos, dampAlpha);
      _currentLookAt.lerp(_camLookTarget, dampAlpha);
      camera.lookAt(_currentLookAt);

      // Rotate Globe & Orbital Rings
      earthSphere.rotation.y = 0.6 + elapsed * 0.35;
      innerOrbitRing.rotation.z = 0.3 + elapsed * 0.22;
      innerOrbitRing.rotation.y = 0.4 + elapsed * 0.18;

      // Exploded factor interpolation
      const exp = explodedRef.current;

      // Float Graduation Cap
      capGroup.position.y = THREE.MathUtils.lerp(
        capGroup.position.y,
        1.68 + exp * 0.65 + Math.sin(elapsed * 1.4) * 0.08,
        dampAlpha
      );
      capGroup.rotation.y = -0.35 + Math.sin(elapsed * 0.7) * 0.15;

      // Float Composite Books
      bookMeshes.forEach((b, idx) => {
        const spread = 1 + exp * 0.45;
        b.group.position.x = THREE.MathUtils.lerp(
          b.group.position.x,
          b.basePos.x * spread,
          dampAlpha
        );
        b.group.position.y =
          b.basePos.y * spread + Math.sin(elapsed * 1.2 + idx * 2.1) * 0.11;
        b.group.rotation.y = b.baseRot.y + Math.sin(elapsed * 0.6 + idx) * 0.14;
      });

      // Orbit Instanced Particles
      for (let i = 0; i < particleCount; i++) {
        const orb = particleOrbits[i];
        const a = orb.angle + elapsed * orb.speed;
        const r = orb.radius * (1 + exp * 0.25);
        _dummyPos.set(
          Math.cos(a) * r,
          orb.y + Math.sin(elapsed + i) * 0.08,
          Math.sin(a) * r
        );
        _dummyEuler.set(elapsed * 0.4 + i, elapsed * 0.6 + i, 0);
        _dummyQuat.setFromEuler(_dummyEuler);
        _dummyScale.setScalar(orb.scale);
        _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
        instancedParticles.setMatrixAt(i, _dummyMatrix);
      }
      instancedParticles.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      globeTex.dispose();
      dialTex.dispose();
      renderer.dispose();
    };
  }, [use2DFallback]);

  return (
    <section
      aria-label="Campus 3D Observatory Hero"
      className="relative h-[860px] lg:h-[820px] w-full overflow-hidden bg-slate-950 text-slate-100 flex items-center"
    >
      {/* Dedicated WebGL Mount Container (Outside sibling HUD overlays) */}
      {!use2DFallback ? (
        <div
          ref={canvasMountRef}
          data-testid="hero-3d-canvas"
          className="absolute inset-0 w-full h-full z-0"
        />
      ) : (
        <div
          data-testid="hero-2d-fallback"
          className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900"
        />
      )}

      {/* Measured contrast scrim restricted to left editorial column so right 3D subject shines */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full lg:w-[62%] z-[1] bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />

      {/* Semantic DOM Hero Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-20 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-none">
        <div className="lg:col-span-7 space-y-6 pointer-events-auto">
          {/* Unboxed Kicker Metadata (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-amber-400">
            <span>{location}</span>
            <span aria-hidden="true">·</span>
            <span>Day Scholar &amp; Residential Hostel</span>
            <span aria-hidden="true">·</span>
            <span>{tagline}</span>
          </div>

          <h1
            className="font-display font-bold text-white tracking-tight leading-[1.08]"
            style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)' }}
          >
            {headline}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {subtext}
          </p>

          {/* Single Primary CTA + Secondary Exploration Action */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="button"
              onClick={onApplyClick}
              className="px-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm inline-flex items-center gap-2 transition-transform duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <span>Pre-Admission Registration 2026–27</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExploreClick}
              className="px-5 py-3.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-medium text-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore Higher Secondary Streams
            </button>
          </div>

          {/* 4-Column Tabular KPI Strip */}
          <div className="pt-6 border-t border-slate-800/90 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-white">
                {studentsCount.toLocaleString()}+
              </div>
              <div className="text-xs text-slate-400 mt-1">Scholars Enrolled</div>
            </div>
            <div>
              <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-amber-400">
                {teachersCount}+
              </div>
              <div className="text-xs text-slate-400 mt-1">Postgraduate Faculty</div>
            </div>
            <div>
              <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-white">
                {yearsCount} Yrs
              </div>
              <div className="text-xs text-slate-400 mt-1">Academic Legacy</div>
            </div>
            <div>
              <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-amber-400">
                {awardsCount}+
              </div>
              <div className="text-xs text-slate-400 mt-1">District &amp; State Honours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Collapsible Bottom Control Dock (Centered via inset-x-0 flex wrapper, zero backdrop-filter) */}
      <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 pointer-events-none">
        <div
          className="w-full max-w-[920px] pointer-events-auto transition-transform duration-200"
          style={{
            transform: dockCollapsed ? 'translateY(calc(100% - 32px))' : 'translateY(0)',
          }}
        >
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setDockCollapsed((prev) => !prev)}
              aria-label={dockCollapsed ? 'Show 3D Scene Controls' : 'Hide 3D Scene Controls'}
              className="px-3.5 py-1 rounded-t-lg bg-slate-900 border border-b-0 border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              {dockCollapsed ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>▴ Show 3D Controls (H)</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>▾ Hide 3D Controls (H)</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 shadow-xl flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 overflow-x-auto">
            {/* Camera Presets */}
            <div className="flex items-center gap-1 shrink-0">
              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0 mr-0.5" />
              {(
                [
                  ['observatory', 'Observatory'],
                  ['globe', 'Globe Focus'],
                  ['crest', 'Scholars Cap'],
                  ['volumes', 'Volumes'],
                ] as [CameraPreset, string][]
              ).map(([presetKey, label]) => (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => setCameraPreset(presetKey)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraPreset === presetKey
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Lighting Presets */}
            <div className="flex items-center gap-1 shrink-0">
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0 mr-0.5" />
              {(
                [
                  ['golden', 'Golden'],
                  ['midnight', 'Midnight'],
                  ['studio', 'Studio'],
                ] as [LightingPreset, string][]
              ).map(([lKey, label]) => (
                <button
                  key={lKey}
                  type="button"
                  onClick={() => setLightingPreset(lKey)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    lightingPreset === lKey
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Exploded Assembly Slider & 2D Mode Toggle */}
            <div className="flex items-center gap-2.5 shrink-0">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap shrink-0">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Spread</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={explodedFactor}
                  onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                  aria-label="Orbit Spread Slider"
                  className="w-16 accent-amber-500 cursor-pointer"
                />
              </label>

              <button
                type="button"
                onClick={() => setUse2DFallback((prev) => !prev)}
                className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{use2DFallback ? 'Enable 3D' : '2D Lite'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
