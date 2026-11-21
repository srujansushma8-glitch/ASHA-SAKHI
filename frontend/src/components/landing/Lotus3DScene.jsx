import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Lotus3DScene({ className = "w-full h-full min-h-[420px]" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 22);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('[Lotus3DScene] WebGL initialization failed', e);
      return;
    }

    // 2. Lighting: Rose-Deep, Soft Blush, and Golden Warmth
    const ambientLight = new THREE.AmbientLight(0xfff5f7, 1.2);
    scene.add(ambientLight);

    const roseKeyLight = new THREE.PointLight(0xa25b74, 3.5, 45);
    roseKeyLight.position.set(10, 14, 12);
    scene.add(roseKeyLight);

    const blushFillLight = new THREE.PointLight(0xc47a92, 2.5, 40);
    blushFillLight.position.set(-12, -6, 10);
    scene.add(blushFillLight);

    const goldCoreLight = new THREE.PointLight(0xffe6a3, 3, 25);
    goldCoreLight.position.set(0, 1.5, 2);
    scene.add(goldCoreLight);

    // 3. Central 3D Group
    const lotusGroup = new THREE.Group();
    scene.add(lotusGroup);

    // Materials
    const outerPetalMat = new THREE.MeshStandardMaterial({
      color: 0xa25b74,
      emissive: 0x5a2336,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.2,
      side: THREE.DoubleSide
    });

    const innerPetalMat = new THREE.MeshStandardMaterial({
      color: 0xc47a92,
      emissive: 0x823b53,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    const corePetalMat = new THREE.MeshStandardMaterial({
      color: 0xf9ecec,
      emissive: 0xe8a4b8,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.4,
      side: THREE.DoubleSide
    });

    // Helper: Create curved petal shape
    function createPetalMesh(width, length, curveHeight, material) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(width * 0.9, length * 0.45, 0, length);
      shape.quadraticCurveTo(-width * 0.9, length * 0.45, 0, 0);

      const geom = new THREE.ShapeGeometry(shape, 12);
      // Curve petal vertices outward in 3D
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const ratio = y / length;
        const z = Math.sin(ratio * Math.PI) * curveHeight;
        pos.setZ(i, z);
      }
      geom.computeVertexNormals();
      return new THREE.Mesh(geom, material);
    }

    // Layer 1: Outer Petals (8 large blooming petals)
    const outerPetalCount = 8;
    for (let i = 0; i < outerPetalCount; i++) {
      const angle = (i / outerPetalCount) * Math.PI * 2;
      const petal = createPetalMesh(2.2, 5.8, 1.4, outerPetalMat);
      petal.rotation.x = Math.PI / 2.7;
      petal.rotation.y = angle;
      petal.position.set(Math.cos(angle) * 0.6, -0.4, Math.sin(angle) * 0.6);
      lotusGroup.add(petal);
    }

    // Layer 2: Middle Petals (8 upright rose petals)
    const midPetalCount = 8;
    for (let i = 0; i < midPetalCount; i++) {
      const angle = ((i + 0.5) / midPetalCount) * Math.PI * 2;
      const petal = createPetalMesh(1.8, 4.8, 1.1, innerPetalMat);
      petal.rotation.x = Math.PI / 3.4;
      petal.rotation.y = angle;
      petal.position.set(Math.cos(angle) * 0.4, 0.2, Math.sin(angle) * 0.4);
      lotusGroup.add(petal);
    }

    // Layer 3: Inner Petals (6 gentle budding petals)
    const innerPetalCount = 6;
    for (let i = 0; i < innerPetalCount; i++) {
      const angle = (i / innerPetalCount) * Math.PI * 2;
      const petal = createPetalMesh(1.3, 3.6, 0.8, corePetalMat);
      petal.rotation.x = Math.PI / 4.4;
      petal.rotation.y = angle;
      petal.position.set(Math.cos(angle) * 0.25, 0.6, Math.sin(angle) * 0.25);
      lotusGroup.add(petal);
    }

    // Center Core: Glowing golden seed pod / heart
    const coreGeo = new THREE.CylinderGeometry(1.2, 0.8, 0.9, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf6df95,
      emissive: 0xd4a037,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.5
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.8;
    lotusGroup.add(core);

    // 4. Luminous Orbital Energy Rings (as in reference image)
    const ring1Geo = new THREE.TorusGeometry(7.2, 0.08, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xe8a4b8,
      transparent: true,
      opacity: 0.6
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(8.8, 0.06, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xffd1dc,
      transparent: true,
      opacity: 0.4
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 3.8;
    ring2.rotation.z = Math.PI / 5;
    scene.add(ring2);

    // 5. Floating Health Pearls (Care Nodes orbiting the Lotus)
    const pearlGroup = new THREE.Group();
    scene.add(pearlGroup);

    const pearlGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe8b4c4,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });

    const pearls = [];
    const pearlCount = 8;
    for (let i = 0; i < pearlCount; i++) {
      const p = new THREE.Mesh(pearlGeo, pearlMat);
      const radius = 6.2 + (i % 3) * 1.5;
      const pAngle = (i / pearlCount) * Math.PI * 2;
      p.position.set(
        Math.cos(pAngle) * radius,
        (Math.sin(pAngle * 2) * 2.2) + 0.5,
        Math.sin(pAngle) * radius * 0.7
      );
      pearlGroup.add(p);
      pearls.push({ mesh: p, angle: pAngle, radius, speed: 0.008 + (i * 0.002) });
    }

    // 6. Floating Blush Spore Dust Particles
    const particleCount = prefersReducedMotion ? 40 : 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 30;
      particlePos[i + 1] = (Math.random() - 0.5) * 22;
      particlePos[i + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xc47a92,
      size: 0.22,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse & Scroll Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0.25;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = y * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Handle Resize
    const onResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // 8. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Floating breathe on Lotus
        lotusGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.45;
        lotusGroup.rotation.y += 0.004;

        // Smooth Mouse Parallax
        targetRotY = mouseX * 0.45 + (elapsedTime * 0.05);
        targetRotX = 0.28 + (mouseY * 0.25);
        lotusGroup.rotation.y += (targetRotY - lotusGroup.rotation.y) * 0.05;
        lotusGroup.rotation.x += (targetRotX - lotusGroup.rotation.x) * 0.05;

        // Rings Rotation
        ring1.rotation.z += 0.003;
        ring2.rotation.z -= 0.0025;

        // Orbiting pearls
        pearls.forEach(p => {
          p.angle += p.speed;
          p.mesh.position.x = Math.cos(p.angle) * p.radius;
          p.mesh.position.z = Math.sin(p.angle) * (p.radius * 0.7);
          p.mesh.position.y = Math.sin(p.angle * 2 + elapsedTime) * 2;
        });

        // Dust particle drift
        particles.rotation.y = elapsedTime * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  return (
    <div className={`relative ${className} flex items-center justify-center select-none pointer-events-none`}>
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full pointer-events-auto" />

      {/* Decorative radial backlight */}
      <div className="absolute inset-0 bg-radial from-rose-200/30 via-transparent to-transparent pointer-events-none blur-3xl -z-10" />
    </div>
  );
}
