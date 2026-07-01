import React, { useEffect, useRef } from 'react';
import useMousePosition from '@/hooks/useMousePosition';

export default function BioCanvas({ isHovered = false, isSuccess = false }) {
  const canvasRef = useRef(null);
  const mouse = useMousePosition();

  // Keep references to animate speed multiplier and camera offsets smoothly
  const stateRef = useRef({
    speedMultiplier: 1.0,
    cameraX: 0,
    cameraY: 0,
    particles: [],
    molecules: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const focalLength = 350;
    const maxDepth = 250;
    const minDepth = -250;

    // Helper to generate a plant cell
    const createCell = (initialZ = null) => {
      const radius = 18 + Math.random() * 25;
      const chloroplasts = [];
      const numChl = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numChl; i++) {
        chloroplasts.push({
          angle: Math.random() * Math.PI * 2,
          distance: 6 + Math.random() * (radius - 12),
          radius: 3 + Math.random() * 4,
          speed: (Math.random() - 0.5) * 0.03,
        });
      }

      return {
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: initialZ !== null ? initialZ : (Math.random() - 0.5) * 500,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        vz: (Math.random() - 0.5) * 0.1,
        radius,
        chloroplasts,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.015,
        history: [], // For streak rendering during success warp
      };
    };

    // Helper to generate a molecule (carbon ring / chemistry structure)
    const createMolecule = (initialZ = null) => {
      const nodes = [];
      const numNodes = 5 + Math.floor(Math.random() * 4);
      
      // Generate a ring-like layout in 3D local space
      for (let i = 0; i < numNodes; i++) {
        const angle = (i / numNodes) * Math.PI * 2;
        const radius = 30 + Math.random() * 15;
        nodes.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: (Math.random() - 0.5) * 20,
        });
      }

      // Create bonds between adjacent nodes and some cross bonds
      const bonds = [];
      for (let i = 0; i < numNodes; i++) {
        bonds.push([i, (i + 1) % numNodes]);
        if (Math.random() > 0.6) {
          bonds.push([i, (i + 3) % numNodes]);
        }
      }

      return {
        x: (Math.random() - 0.5) * width * 1.6,
        y: (Math.random() - 0.5) * height * 1.6,
        z: initialZ !== null ? initialZ : (Math.random() - 0.5) * 500,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.08,
        nodes,
        bonds,
        rotX: Math.random() * 0.005,
        rotY: Math.random() * 0.005,
        rotZ: Math.random() * 0.005,
        angleX: Math.random() * Math.PI * 2,
        angleY: Math.random() * Math.PI * 2,
        angleZ: Math.random() * Math.PI * 2,
        history: [],
      };
    };

    // Initialize pools
    const cellCount = 20;
    const moleculeCount = 12;
    const state = stateRef.current;
    
    state.particles = Array.from({ length: cellCount }, () => createCell());
    state.molecules = Array.from({ length: moleculeCount }, () => createMolecule());

    const render = () => {
      // Clear canvas with a very soft trail for smooth movement, 
      // when success is active, let's draw darker, shorter trails
      ctx.fillStyle = isSuccess ? 'rgba(8, 15, 8, 0.25)' : '#080c08';
      ctx.fillRect(0, 0, width, height);

      // Smoothly interpolate speed multiplier based on hover and success states
      let targetSpeed = 1.0;
      if (isSuccess) {
        targetSpeed = 48.0;
      } else if (isHovered) {
        targetSpeed = 4.2;
      }
      state.speedMultiplier += (targetSpeed - state.speedMultiplier) * 0.08;

      // Smoothly interpolate camera pan targets from mouse coordinates
      const targetCamX = mouse.normalizedX * 45;
      const targetCamY = mouse.normalizedY * 45;
      state.cameraX += (targetCamX - state.cameraX) * 0.08;
      state.cameraY += (targetCamY - state.cameraY) * 0.08;

      const cx = width / 2 - state.cameraX;
      const cy = height / 2 - state.cameraY;

      // Draw grid backdrop in 3D
      ctx.strokeStyle = 'rgba(15, 123, 59, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = -gridSize * 3; x < width + gridSize * 3; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x - state.cameraX * 0.4, 0);
        ctx.lineTo(x - state.cameraX * 0.4, height);
        ctx.stroke();
      }
      for (let y = -gridSize * 3; y < height + gridSize * 3; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y - state.cameraY * 0.4);
        ctx.lineTo(width, y - state.cameraY * 0.4);
        ctx.stroke();
      }

      // Render molecules
      state.molecules.forEach((mol) => {
        // Drift position
        mol.x += mol.vx * state.speedMultiplier;
        mol.y += mol.vy * state.speedMultiplier;
        mol.z += (mol.vz - (isSuccess ? 0.8 : 0)) * state.speedMultiplier;

        // Rotate molecule in local space
        mol.angleX += mol.rotX * (isSuccess ? 5 : 1);
        mol.angleY += mol.rotY * (isSuccess ? 5 : 1);
        mol.angleZ += mol.rotZ * (isSuccess ? 5 : 1);

        // Recycle when out of bounds or behind camera
        if (mol.z < minDepth) {
          Object.assign(mol, createMolecule(maxDepth));
        } else if (mol.z > maxDepth && !isSuccess) {
          Object.assign(mol, createMolecule(minDepth));
        }

        // Project local nodes to screen coordinates
        const projectedNodes = mol.nodes.map((node) => {
          // 3D rotation matrix around local center
          // Rotate X
          let y1 = node.y * Math.cos(mol.angleX) - node.z * Math.sin(mol.angleX);
          let z1 = node.y * Math.sin(mol.angleX) + node.z * Math.cos(mol.angleX);
          // Rotate Y
          let x2 = node.x * Math.cos(mol.angleY) + z1 * Math.sin(mol.angleY);
          let z2 = -node.x * Math.sin(mol.angleY) + z1 * Math.cos(mol.angleY);
          // Rotate Z
          let x3 = x2 * Math.cos(mol.angleZ) - y1 * Math.sin(mol.angleZ);
          let y3 = x2 * Math.sin(mol.angleZ) + y1 * Math.cos(mol.angleZ);

          // Add local center coordinates
          const worldX = mol.x + x3;
          const worldY = mol.y + y3;
          const worldZ = mol.z + z2;

          const scale = focalLength / (focalLength + worldZ);
          return {
            x: cx + worldX * scale,
            y: cy + worldY * scale,
            z: worldZ,
            scale,
          };
        });

        // Skip rendering if molecule is completely behind camera
        const visible = projectedNodes.some((n) => n.z > -focalLength);
        if (!visible) return;

        // Draw bonds
        mol.bonds.forEach(([idxA, idxB]) => {
          const nA = projectedNodes[idxA];
          const nB = projectedNodes[idxB];
          if (!nA || !nB) return;

          const alpha = Math.max(0, Math.min(0.25, (maxDepth - (nA.z + nB.z) / 2) / 400));
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.lineWidth = Math.max(0.5, 1.5 * ((nA.scale + nB.scale) / 2));
          ctx.beginPath();
          ctx.moveTo(nA.x, nA.y);
          ctx.lineTo(nB.x, nB.y);
          ctx.stroke();
        });

        // Draw nodes (chemical atoms)
        projectedNodes.forEach((node) => {
          const depthAlpha = Math.max(0, Math.min(0.4, (maxDepth - node.z) / 400));
          const nodeRad = Math.max(1, 4 * node.scale);
          ctx.fillStyle = `rgba(110, 231, 183, ${depthAlpha})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRad, 0, Math.PI * 2);
          ctx.fill();

          // Node core glow
          if (node.scale > 0.8) {
            ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRad * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // Render plant cells
      state.particles.forEach((cell) => {
        // Apply velocity with speed multiplier
        cell.x += cell.vx * state.speedMultiplier;
        cell.y += cell.vy * state.speedMultiplier;
        cell.z += (cell.vz - (isSuccess ? 1.0 : 0)) * state.speedMultiplier;

        // Handle recycle on Z bounds
        if (cell.z < minDepth) {
          Object.assign(cell, createCell(maxDepth));
        } else if (cell.z > maxDepth && !isSuccess) {
          Object.assign(cell, createCell(minDepth));
        }

        const scale = focalLength / (focalLength + cell.z);
        const screenX = cx + cell.x * scale;
        const screenY = cy + cell.y * scale;

        // Skip if behind camera
        if (cell.z <= -focalLength) return;

        // Bioluminescent pulsing effect
        cell.pulseOffset += cell.pulseSpeed * (isSuccess ? 3 : 1);
        const pulse = 1.0 + Math.sin(cell.pulseOffset) * 0.08;
        const finalRadius = Math.max(2, cell.radius * scale * pulse);

        // Alpha based on depth transparency mapping
        const alpha = Math.max(0, Math.min(0.28, (maxDepth - cell.z) / 500));

        // Save history for streak mapping when moving fast
        if (state.speedMultiplier > 6.0) {
          cell.history.push({ x: screenX, y: screenY });
          if (cell.history.length > 5) cell.history.shift();

          // Render high-speed camera push-forward streak line
          ctx.beginPath();
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.45})`;
          ctx.lineWidth = finalRadius * 0.6;
          ctx.lineCap = 'round';
          ctx.moveTo(cell.history[0].x, cell.history[0].y);
          for (let i = 1; i < cell.history.length; i++) {
            ctx.lineTo(cell.history[i].x, cell.history[i].y);
          }
          ctx.stroke();
        } else {
          cell.history = [];
        }

        // Draw chloroplasts rotating inside the cells
        cell.chloroplasts.forEach((chl) => {
          chl.angle += chl.speed * (isSuccess ? 4 : 1);
          const chX = screenX + Math.cos(chl.angle) * chl.distance * scale;
          const chY = screenY + Math.sin(chl.angle) * chl.distance * scale;
          const chRad = Math.max(0.5, chl.radius * scale);

          ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(chX, chY, chRad, 0, Math.PI * 2);
          ctx.fill();
        });

        // Membrane outer glowing border
        const gradient = ctx.createRadialGradient(
          screenX,
          screenY,
          finalRadius * 0.1,
          screenX,
          screenY,
          finalRadius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.7})`);
        gradient.addColorStop(0.3, `rgba(16, 185, 129, ${alpha * 0.4})`);
        gradient.addColorStop(0.85, `rgba(16, 185, 129, ${alpha * 0.15})`);
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, finalRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw soft outer rim structure
        ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.35})`;
        ctx.lineWidth = Math.max(0.5, 1.2 * scale);
        ctx.beginPath();
        ctx.arc(screenX, screenY, finalRadius * 0.88, 0, Math.PI * 2);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isHovered, isSuccess, mouse.normalizedX, mouse.normalizedY]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
    />
  );
}
