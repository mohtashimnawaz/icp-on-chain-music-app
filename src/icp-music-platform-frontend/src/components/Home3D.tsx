import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Html, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

// Enhanced 3D Music Notes with better animations
const MusicNotes: React.FC = () => {
  const notesRef = useRef<THREE.Group>(null);
  const noteCount = 20;

  const notes = useMemo(() => {
    return Array.from({ length: noteCount }, (_, index) => ({
      position: [
        (Math.random() - 0.5) * 40,
        Math.random() * 20,
        (Math.random() - 0.5) * 40
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      scale: Math.random() * 1.2 + 0.6,
      type: Math.floor(Math.random() * 4), // 0: quarter, 1: eighth, 2: whole, 3: treble clef
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      speed: Math.random() * 0.02 + 0.01
    }));
  }, []);

  useFrame((state) => {
    if (notesRef.current) {
      notesRef.current.children.forEach((note, i) => {
        const noteData = notes[i];
        note.rotation.y += noteData.speed;
        note.rotation.x += noteData.speed * 0.5;
        note.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01;
        note.position.x += Math.cos(state.clock.elapsedTime + i * 0.5) * 0.005;
        
        // Add pulsing effect
        const pulse = Math.sin(state.clock.elapsedTime * 2 + i) * 0.1 + 1;
        note.scale.setScalar(noteData.scale * pulse);
      });
    }
  });

  const renderNote = (type: number, position: [number, number, number], scale: number, color: string) => {
    const noteColor = new THREE.Color(color);
    
    switch (type) {
      case 0: // Quarter note with glow
        return (
          <group position={position} scale={scale}>
            <mesh>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial 
                color={noteColor} 
                emissive={noteColor}
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8, 16]} />
              <meshStandardMaterial 
                color={noteColor}
                emissive={noteColor}
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        );
      case 1: // Eighth note
        return (
          <group position={position} scale={scale}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial 
                color={noteColor}
                emissive={noteColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 16]} />
              <meshStandardMaterial color={noteColor} />
            </mesh>
            <mesh position={[0.1, -0.1, 0]} rotation={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.01, 0.01, 0.3, 16]} />
              <meshStandardMaterial color={noteColor} />
            </mesh>
          </group>
        );
      case 2: // Whole note
        return (
          <group position={position} scale={scale}>
            <mesh>
              <torusGeometry args={[0.12, 0.05, 8, 16]} />
              <meshStandardMaterial 
                color={noteColor}
                emissive={noteColor}
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        );
      case 3: // Treble clef
        return (
          <group position={position} scale={scale}>
            <mesh>
              <torusGeometry args={[0.08, 0.02, 8, 16]} />
              <meshStandardMaterial 
                color={noteColor}
                emissive={noteColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
              <meshStandardMaterial color={noteColor} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color={noteColor} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <group ref={notesRef}>
      {notes.map((note, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={0.5}>
          {renderNote(note.type, note.position as [number, number, number], note.scale, note.color)}
        </Float>
      ))}
    </group>
  );
};

// 3D Platform Islands
const PlatformIslands: React.FC = () => {
  const platforms = [
    { position: [-8, -1, -5], size: 3, color: '#1976d2', label: 'Upload' },
    { position: [8, -1, -5], size: 3, color: '#42a5f5', label: 'Listen' },
    { position: [0, -1, 8], size: 4, color: '#7b1fa2', label: 'Collaborate' },
    { position: [-8, -1, 5], size: 2.5, color: '#388e3c', label: 'Analytics' },
    { position: [8, -1, 5], size: 2.5, color: '#f57c00', label: 'Studio' }
  ];

  return (
    <group>
      {platforms.map((platform, index) => (
        <Float key={index} speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <group position={platform.position as [number, number, number]}>
            <mesh>
              <cylinderGeometry args={[platform.size, platform.size, 0.5, 32]} />
              <meshStandardMaterial 
                color={platform.color} 
                emissive={platform.color}
                emissiveIntensity={0.1}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
            <Html position={[0, 1, 0]} center>
              <div style={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                {platform.label}
              </div>
            </Html>
          </group>
        </Float>
      ))}
    </group>
  );
};

// Animated Particles
const AnimatedParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Group>(null);
  const particleCount = 50;

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, index) => ({
      position: [
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      ],
      velocity: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ],
      color: `hsl(${Math.random() * 360}, 80%, 70%)`,
      size: Math.random() * 0.1 + 0.05
    }));
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const particleData = particles[i];
        particle.position.x += particleData.velocity[0];
        particle.position.y += particleData.velocity[1];
        particle.position.z += particleData.velocity[2];
        
        // Reset particle position if it goes too far
        if (Math.abs(particle.position.x) > 50) {
          particle.position.x = (Math.random() - 0.5) * 100;
          particle.position.y = (Math.random() - 0.5) * 100;
          particle.position.z = (Math.random() - 0.5) * 100;
        }
        
        // Add subtle rotation
        particle.rotation.x += 0.01;
        particle.rotation.y += 0.01;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position as [number, number, number]}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial 
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Central Logo/Title
const CentralLogo: React.FC = () => {
  const logoRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.y += 0.005;
      logoRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={logoRef} position={[0, 3, 0]}>
        <torusGeometry args={[2, 0.5, 16, 32]} />
        <meshStandardMaterial 
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text
        position={[0, 0, 0]}
        fontSize={2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        TuneSphere
      </Text>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.8}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
      >
        Decentralized Music Platform
      </Text>
    </group>
  );
};

// Main Home3D Component
const Home3D: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ 
        height: '100vh', 
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 5, 20], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0a0a0a, #1a1a2e)' }}
      >
        <fog attach="fog" args={['#0a0a0a', 20, 100]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7b1fa2" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#42a5f5" />
        
        {/* Environment */}
        <Environment preset="night" />
        <Stars count={2000} />
        
        {/* 3D Components */}
        <CentralLogo />
        <MusicNotes />
        <PlatformIslands />
        <AnimatedParticles />
        
        {/* Controls */}
        <OrbitControls 
          enablePan={false} 
          minDistance={10} 
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 10
        }}
      >
        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
          Experience Music in 3D
        </Typography>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              borderRadius: '50px',
              px: 4,
              py: 2,
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff5252, #26a69a)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
              }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Enter the Experience
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Home3D;
