import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * ThreeDProductViewer - Interactive 3D product bottle viewer using vanilla Three.js.
 * Renders the product image mapped onto a realistic 3D cylinder with physical materials.
 * 
 * @param {string} imageUrl The WebP product image path.
 * @param {string} name Product name.
 */
export default function ThreeDProductViewer({ imageUrl, name }) {
  const mountRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const width = currentMount.clientWidth || 360;
    const height = currentMount.clientHeight || 360;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // Transparent background to fit glass card
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    currentMount.appendChild(renderer.domElement);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Soft key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    // Rim highlight light for expensive glass outline
    const rimLight = new THREE.DirectionalLight(0xaeff85, 2.0);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    // Specular front light
    const frontLight = new THREE.PointLight(0xffffff, 1.2, 20);
    frontLight.position.set(0, 0, 6);
    scene.add(frontLight);

    // 4. Load Product Texture
    const textureLoader = new THREE.TextureLoader();
    let productTexture = null;

    // Group to hold all mesh parts
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    // Keep references to geometries and materials for proper GPU cleanup
    let bodyGeom = null;
    let neckGeom = null;
    let capGeom = null;
    let glassMaterial = null;
    let neckMaterial = null;
    let capMaterial = null;

    textureLoader.load(
      imageUrl,
      (texture) => {
        productTexture = texture;
        productTexture.colorSpace = THREE.SRGBColorSpace;
        
        // Wrap settings for standard product label
        productTexture.wrapS = THREE.ClampToEdgeWrapping;
        productTexture.wrapT = THREE.ClampToEdgeWrapping;
        productTexture.repeat.set(1, 1);
        productTexture.offset.set(0, 0);

        // 5. Materials
        // Realistic clearcoat physical glass cylinder
        glassMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.95,
          roughness: 0.05,
          metalness: 0.1,
          transmission: 0.5, // Clear glass transmission
          thickness: 1.0,    // Glass refraction depth
          ior: 1.5,          // Index of refraction for glass
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          map: productTexture, // Map label texture directly to body
          side: THREE.DoubleSide,
        });

        capMaterial = new THREE.MeshStandardMaterial({
          color: 0x072519, // Corporate Dark Green Cap
          roughness: 0.3,
          metalness: 0.8,
        });

        // 6. Bottle Geometry
        // Main bottle body (cylinder)
        bodyGeom = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 64, 1, false);
        const bodyMesh = new THREE.Mesh(bodyGeom, glassMaterial);
        bodyMesh.position.y = -0.3;
        bottleGroup.add(bodyMesh);

        // Bottle neck (tapered)
        neckGeom = new THREE.CylinderGeometry(0.8, 1.2, 0.6, 64);
        neckMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.1,
          transmission: 0.9,
          thickness: 0.5,
          ior: 1.5
        });
        const neckMesh = new THREE.Mesh(neckGeom, neckMaterial);
        neckMesh.position.y = 1.6;
        bottleGroup.add(neckMesh);

        // Bottle cap
        capGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.45, 32);
        const capMesh = new THREE.Mesh(capGeom, capMaterial);
        capMesh.position.y = 2.12;
        bottleGroup.add(capMesh);

        // Center group pivot
        bottleGroup.position.set(0, 0, 0);
        
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error("Failed to load product texture:", err);
        setLoading(false);
      }
    );

    // 7. Interaction States
    let pointerX = 0;
    let pointerY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerDown = (e) => {
      isDraggingRef.current = true;
      pointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      pointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      
      const deltaX = currentX - pointerX;
      const deltaY = currentY - pointerY;

      // Adjust rotation targets based on cursor drags
      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.007;

      pointerX = currentX;
      pointerY = currentY;
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    // Attach listeners
    const canvasEl = renderer.domElement;
    canvasEl.style.cursor = 'grab';
    canvasEl.addEventListener('mousedown', handlePointerDown);
    canvasEl.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvasEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    canvasEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let animationId = null;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for dragging rotation
      bottleGroup.rotation.y += (targetRotationY - bottleGroup.rotation.y) * 0.1;
      bottleGroup.rotation.x += (targetRotationX - bottleGroup.rotation.x) * 0.1;

      // Restrict rotation on X axis to avoid flipping upside down
      bottleGroup.rotation.x = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, bottleGroup.rotation.x));

      // Slow automatic floating and idle rotation when NOT dragging
      if (!isDraggingRef.current) {
        // Slow float
        bottleGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
        // Slow rotation
        bottleGroup.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('mousedown', handlePointerDown);
      canvasEl.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      
      canvasEl.removeEventListener('touchstart', handlePointerDown);
      canvasEl.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      cancelAnimationFrame(animationId);

      // Dispose Three.js geometries, materials, and textures to avoid GPU memory leaks
      if (bodyGeom) bodyGeom.dispose();
      if (neckGeom) neckGeom.dispose();
      if (capGeom) capGeom.dispose();
      if (glassMaterial) glassMaterial.dispose();
      if (neckMaterial) neckMaterial.dispose();
      if (capMaterial) capMaterial.dispose();
      if (productTexture) productTexture.dispose();

      renderer.dispose();
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A2E1F]/10 backdrop-blur-md rounded-2xl z-10">
          <div className="w-10 h-10 rounded-full border-4 border-[#76C945] border-t-transparent animate-spin" />
        </div>
      )}
      <div 
        ref={mountRef} 
        className="w-full h-full min-h-[350px] sm:min-h-[420px] active:cursor-grabbing" 
      />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[10px] text-white/80 font-bold uppercase tracking-widest pointer-events-none">
        Drag to Rotate / 3D Mode
      </div>
    </div>
  );
}
