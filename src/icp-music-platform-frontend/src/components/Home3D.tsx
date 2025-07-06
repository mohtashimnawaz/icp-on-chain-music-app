import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Html, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

// 3D Music Notes
const MusicNotes: React.FC = () => {
  const notesRef = useRef<THREE.Group>(null);
  const noteCount = 15;

  const notes = useMemo(() => {
    return Array.from({ length: noteCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 30,
        Math.random() * 15,
        (Math.random() - 0.5) * 30
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      scale: Math.random() * 0.8 + 0.4,
      type: Math.floor(Math.random() * 3) // 0: quarter, 1: eighth, 2: whole
    }));
  }, []);

  useFrame((state) => {
    if (notesRef.current) {
      notesRef.current.children.forEach((note, i) => {
        note.rotation.y += 0.01;
        note.position.y += Math.sin(state.clock.elapsedTime + i) * 0.005;
      });
    }
  });

  const renderNote = (type: number, position: [number, number, number], scale: number) => {
    switch (type) {
      case 0: // Quarter note
        return (
          <group position={position} scale={scale}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      case 1: // Eighth note
        return (
          <group position={position} scale={scale}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.1, -0.1, 0]}>
              <torusGeometry args={[0.05, 0.02, 8, 16]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      case 2: // Whole note
        return (
          <group position={position} scale={scale}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
              <meshStandardMaterial color="#ffffff" />
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
        <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          {renderNote(note.type, note.position as [number, number, number], note.scale)}
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
      {platforms.map((platform, i) => (
        <group key={i} position={platform.position as [number, number, number]}>
          {/* Platform base */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[platform.size, platform.size, 0.2, 16]} />
            <meshStandardMaterial color={platform.color} />
          </mesh>
          
          {/* Platform glow */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[platform.size + 0.1, platform.size + 0.1, 0.05, 16]} />
            <meshStandardMaterial 
              color={platform.color}
              transparent
              opacity={0.3}
              emissive={platform.color}
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Platform label */}
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {platform.label}
          </Text>
        </group>
      ))}
    </group>
  );
};

// 3D Central Stage
const CentralStage: React.FC = () => {
  return (
    <group position={[0, -1, 0]}>
      {/* Main stage */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[6, 6, 0.3, 32]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Stage lights */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 6) * 5,
          2,
          Math.sin(i * Math.PI / 6) * 5
        ]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial 
            color={new THREE.Color().setHSL(i / 12, 0.8, 0.6)}
            emissive={new THREE.Color().setHSL(i / 12, 0.8, 0.3)}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Central logo */}
      <Text
        position={[0, 1, 0]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        ICP
      </Text>
      
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Music Platform
      </Text>
    </group>
  );
};

// 3D Floating Particles
const FloatingParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Group>(null);
  const particleCount = 100;

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 40,
        Math.random() * 20,
        (Math.random() - 0.5) * 40
      ],
      size: Math.random() * 0.1 + 0.02,
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
    }));
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        particle.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01;
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
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D Interactive Buttons
const InteractiveButtons: React.FC = () => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const buttons = [
    { id: 'upload', position: [-8, 0.5, -5], label: 'Upload Music', color: '#1976d2' },
    { id: 'listen', position: [8, 0.5, -5], label: 'Listen Now', color: '#42a5f5' },
    { id: 'collaborate', position: [0, 0.5, 8], label: 'Collaborate', color: '#7b1fa2' },
    { id: 'analytics', position: [-8, 0.5, 5], label: 'Analytics', color: '#388e3c' },
    { id: 'studio', position: [8, 0.5, 5], label: 'Studio', color: '#f57c00' }
  ];

  return (
    <group>
      {buttons.map((button) => (
        <group key={button.id} position={button.position as [number, number, number]}>
          <Html position={[0, 0, 0]} center>
            <button
              onMouseEnter={() => setHoveredButton(button.id)}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                padding: '15px 25px',
                background: hoveredButton === button.id ? button.color : 'rgba(0,0,0,0.7)',
                color: 'white',
                border: `2px solid ${button.color}`,
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                minWidth: '120px'
              }}
            >
              {button.label}
            </button>
          </Html>
        </group>
      ))}
    </group>
  );
};

// Main 3D Scene
const Scene: React.FC = () => {
  const { camera } = useThree();

  React.useEffect(() => {
    camera.position.set(0, 5, 15);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <CentralStage />
      <PlatformIslands />
      <MusicNotes />
      <FloatingParticles />
      <InteractiveButtons />
      
      <Environment preset="night" />
    </>
  );
};

// Main Component
const Home3D: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 5, 15], fov: 75 }}>
        <Scene />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={30}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Overlay Info */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Welcome to ICP Music Platform
        </h1>
        <p style={{ fontSize: '1.2rem', margin: '0 0 20px 0', opacity: 0.9 }}>
          The decentralized music platform built on Internet Computer
        </p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
            <strong>🎵 Upload & Share</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
            <strong>💰 Earn Royalties</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
            <strong>🤝 Collaborate</strong>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'right'
      }}>
        <p>Use mouse to explore the 3D environment</p>
        <p>Scroll to zoom in/out</p>
        <p>Click on platforms to navigate</p>
      </div>
    </div>
  );
};

export default Home3D; 