import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Controller3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 400;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 12;

    // 3. Renderer Setup (Anti-alias enabled for smooth points, but alpha for matching card background)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 4. Create Holographic Particles (representing Game Deal Nodes)
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorBlue = new THREE.Color('#00f0ff');
    const colorPink = new THREE.Color('#ff007f');

    for (let i = 0; i < particleCount; i++) {
      // Create a nice controller/torus knot shape for the holographic mesh
      const t = (i / particleCount) * Math.PI * 2 * 6; // spiral loops
      const r = 2.5 + Math.sin(t * 3) * 0.6; // radius modulation
      
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      const z = Math.cos(t * 5) * 0.8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Blend colors between neon blue and electric pink
      const mixRatio = Math.sin(t) * 0.5 + 0.5;
      const mixedColor = colorBlue.clone().lerp(colorPink, mixRatio);
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material with round particles and vertex colors
    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    // Create point cloud mesh
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Add glowing lines connecting key nodes to look like a high-tech CAD drawing
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    
    // Choose subset of particles to connect
    for (let i = 0; i < particleCount; i += 8) {
      const nextIdx = (i + 8) % particleCount;
      linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      linePositions.push(positions[nextIdx * 3], positions[nextIdx * 3 + 1], positions[nextIdx * 3 + 2]);
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // 5. Mouse Parallax Movement
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-0.5 to 0.5)
      mouseX = (event.clientX / window.innerWidth) - 0.5;
      mouseY = (event.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse-following rotation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Constant background spin + mouse parallax rotation offset
      particleSystem.rotation.y += 0.005;
      particleSystem.rotation.x = targetY * 0.8;
      particleSystem.rotation.y += targetX * 0.8;

      lines.rotation.y += 0.005;
      lines.rotation.x = targetY * 0.8;
      lines.rotation.y += targetX * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 400;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[320px] md:h-[450px] flex items-center justify-center cursor-grab active:cursor-grabbing"
    >
      {/* Background neon ambient circle */}
      <div className="absolute w-56 h-56 rounded-full bg-cyber-blue opacity-10 filter blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute w-40 h-40 rounded-full bg-cyber-pink opacity-10 filter blur-3xl animate-pulse-glow pointer-events-none delay-1000" />
    </div>
  );
};
export default Controller3D;
