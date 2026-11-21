import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3DScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 24;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8)); // Capped DPR for 60fps
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported or context lost', e);
      return;
    }

    // 1. Ambient & Directional Lighting (Teal + Warm Saffron + Cyan)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const tealLight = new THREE.PointLight(0x087f8c, 3, 50);
    tealLight.position.set(-10, 10, 15);
    scene.add(tealLight);

    const saffronLight = new THREE.PointLight(0xff9933, 2.5, 40);
    saffronLight.position.set(12, -8, 12);
    scene.add(saffronLight);

    const cyanLight = new THREE.PointLight(0x19b8d5, 2, 40);
    cyanLight.position.set(0, 12, -5);
    scene.add(cyanLight);

    // 2. Floating Health Node Objects (Heart, Vaccine, Shield, Mother-Child Orb, Location Pin)
    const group = new THREE.Group();
    scene.add(group);

    // Node 1: Central Heart / Care Polyhedron
    const heartGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x087f8c,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const centerNode = new THREE.Mesh(heartGeo, heartMat);
    group.add(centerNode);

    // Wireframe Cage around Central Node
    const cageGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x19b8d5,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    group.add(cage);

    // Satellite 1: Warm Saffron Mother & Child Orb
    const orb1Geo = new THREE.SphereGeometry(1.4, 32, 32);
    const orb1Mat = new THREE.MeshStandardMaterial({
      color: 0xff9933,
      emissive: 0xff9933,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.6
    });
    const orb1 = new THREE.Mesh(orb1Geo, orb1Mat);
    orb1.position.set(9, 4, 3);
    group.add(orb1);

    // Satellite 2: Emerald Vaccine Cylinder / Vial
    const vialGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.8, 16);
    const vialMat = new THREE.MeshStandardMaterial({
      color: 0x20a675,
      roughness: 0.1,
      metalness: 0.9,
    });
    const vial = new THREE.Mesh(vialGeo, vialMat);
    vial.position.set(-8, -4, 2);
    vial.rotation.z = Math.PI / 4;
    group.add(vial);

    // Satellite 3: Cyan Location Pin Cone
    const coneGeo = new THREE.ConeGeometry(1.2, 2.6, 16);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x19b8d5,
      roughness: 0.3,
      metalness: 0.7
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(7, -6, -2);
    cone.rotation.x = Math.PI;
    group.add(cone);

    // Satellite 4: Deep Navy Shield Torus
    const torusGeo = new THREE.TorusGeometry(1.8, 0.35, 16, 32);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x142b45,
      emissive: 0x087f8c,
      emissiveIntensity: 0.2,
      roughness: 0.4
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(-7, 6, -1);
    group.add(torus);

    // 3. Floating Dust & Star Particles (Healthcare Constellation)
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cTeal = new THREE.Color(0x087f8c);
    const cSaffron = new THREE.Color(0xff9933);
    const cCyan = new THREE.Color(0x19b8d5);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const pick = Math.random();
      const col = pick < 0.4 ? cTeal : pick < 0.7 ? cCyan : cSaffron;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Mouse Parallax Handler
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 2;
      targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Responsive Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation Loop (60 FPS Capped)
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth mouse parallax lerping
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        group.rotation.y = currentX * 0.4 + elapsedTime * 0.12;
        group.rotation.x = -currentY * 0.3 + Math.sin(elapsedTime * 0.2) * 0.1;

        centerNode.rotation.y = elapsedTime * 0.3;
        centerNode.rotation.x = elapsedTime * 0.2;
        cage.rotation.y = -elapsedTime * 0.2;

        // Individual satellite orbits
        orb1.position.y = 4 + Math.sin(elapsedTime * 1.5) * 0.8;
        vial.position.y = -4 + Math.cos(elapsedTime * 1.2) * 0.7;
        vial.rotation.y = elapsedTime * 0.5;
        cone.position.y = -6 + Math.sin(elapsedTime * 1.8) * 0.6;
        torus.rotation.x = elapsedTime * 0.4;
        torus.rotation.y = elapsedTime * 0.3;

        particles.rotation.y = elapsedTime * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-90 dark:opacity-80"
      aria-hidden="true"
    />
  );
}
