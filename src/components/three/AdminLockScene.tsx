import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface AdminLockSceneProps {
  status: 'locked' | 'error' | 'unlocked';
}

export const AdminLockScene: React.FC<AdminLockSceneProps> = ({ status }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<'locked' | 'error' | 'unlocked'>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const container = mountRef.current;
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
        alpha: true,
      });
    } catch {
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 0.3, 4.4);
    camera.lookAt(0, 0.1, 0);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const statusLight = new THREE.PointLight(0xf59e0b, 2.5, 8);
    statusLight.position.set(0, 0.2, 2.2);
    scene.add(statusLight);

    // Materials
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.28,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.92,
      roughness: 0.18,
    });
    const dialFaceMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.5,
      roughness: 0.55,
    });
    const statusRingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45,
      metalness: 0.5,
      roughness: 0.3,
    });

    // Composite 7-Part Vault Padlock Assembly
    const lockGroup = new THREE.Group();
    scene.add(lockGroup);

    // 1. Beveled Padlock Chassis (ExtrudeGeometry)
    const bodyShape = new THREE.Shape();
    bodyShape.absarc(0, 0, 0.95, 0, Math.PI * 2, false);
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.44,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 4,
    });
    bodyGeo.center();
    const bodyMesh = new THREE.Mesh(bodyGeo, titaniumMat);
    bodyMesh.position.y = -0.35;
    lockGroup.add(bodyMesh);

    // 2. Front Gold Bezel Ring
    const bezelRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.76, 0.045, 16, 48),
      goldMat
    );
    bezelRing.position.set(0, -0.35, 0.25);
    lockGroup.add(bezelRing);

    // 3. Status Indicator Ring
    const statusRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.54, 0.025, 12, 48),
      statusRingMat
    );
    statusRing.position.set(0, -0.35, 0.26);
    lockGroup.add(statusRing);

    // 4. Combination Dial Cylinder
    const dialGroup = new THREE.Group();
    dialGroup.position.set(0, -0.35, 0.26);
    lockGroup.add(dialGroup);

    const dialCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.46, 0.12, 32),
      dialFaceMat
    );
    dialCylinder.rotation.x = Math.PI / 2;
    dialGroup.add(dialCylinder);

    // 5. Keyhole Slot Core
    const keyholeSlot = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.26, 0.15),
      goldMat
    );
    keyholeSlot.position.z = 0.02;
    dialGroup.add(keyholeSlot);

    // 6. Hardened Shackle Assembly (Lifts & pivots on unlock)
    const shackleGroup = new THREE.Group();
    shackleGroup.position.set(0, 0.42, 0);
    lockGroup.add(shackleGroup);

    const shackleArch = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.11, 20, 40, Math.PI),
      goldMat
    );
    shackleArch.position.y = 0.35;
    shackleGroup.add(shackleArch);

    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.55, 20),
      goldMat
    );
    leftLeg.position.set(-0.52, 0.08, 0);
    shackleGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.42, 20),
      goldMat
    );
    rightLeg.position.set(0.52, 0.14, 0);
    shackleGroup.add(rightLeg);

    // 7. Ground Contact Shadow Disc
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.2, 32),
      new THREE.MeshBasicMaterial({
        color: 0x020617,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -1.52;
    scene.add(shadowDisc);

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
      const damp = 1 - Math.exp(-7 * dt);
      const st = statusRef.current;

      if (st === 'error') {
        statusRingMat.color.setHex(0xef4444);
        statusRingMat.emissive.setHex(0xef4444);
        statusLight.color.setHex(0xef4444);
        lockGroup.position.x = Math.sin(elapsed * 42) * 0.18;
        shackleGroup.position.y = THREE.MathUtils.lerp(shackleGroup.position.y, 0.42, damp);
        shackleGroup.rotation.y = THREE.MathUtils.lerp(shackleGroup.rotation.y, 0, damp);
      } else if (st === 'unlocked') {
        statusRingMat.color.setHex(0x10b981);
        statusRingMat.emissive.setHex(0x10b981);
        statusLight.color.setHex(0x10b981);
        lockGroup.position.x = THREE.MathUtils.lerp(lockGroup.position.x, 0, damp);
        shackleGroup.position.y = THREE.MathUtils.lerp(shackleGroup.position.y, 0.78, damp);
        shackleGroup.rotation.y = THREE.MathUtils.lerp(shackleGroup.rotation.y, 0.55, damp);
        dialGroup.rotation.z = THREE.MathUtils.lerp(dialGroup.rotation.z, Math.PI * 1.5, damp);
      } else {
        statusRingMat.color.setHex(0xf59e0b);
        statusRingMat.emissive.setHex(0xf59e0b);
        statusLight.color.setHex(0xf59e0b);
        lockGroup.position.x = THREE.MathUtils.lerp(lockGroup.position.x, 0, damp);
        shackleGroup.position.y = THREE.MathUtils.lerp(shackleGroup.position.y, 0.42, damp);
        shackleGroup.rotation.y = THREE.MathUtils.lerp(shackleGroup.rotation.y, 0, damp);
        dialGroup.rotation.z = Math.sin(elapsed * 0.9) * 0.35;
      }

      lockGroup.rotation.y = Math.sin(elapsed * 0.65) * 0.24;
      lockGroup.position.y = Math.sin(elapsed * 1.4) * 0.05;

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
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="admin-3d-lock"
      className="w-full h-56 sm:h-64 relative overflow-hidden"
    />
  );
};
