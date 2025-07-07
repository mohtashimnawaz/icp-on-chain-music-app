import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

// 3D Audio Visualizer Bars
const AudioBars: React.FC<{ audioData?: number[] }> = ({ audioData = [] }) => {
  const barsRef = useRef<THREE.Group>(null);
  const barCount = 64;
  
  // Generate bars with random heights for demo
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => ({
      position: [
        (i - barCount / 2) * 0.3,
        0,
        0
      ],
      height: Math.random() * 2 + 0.5,
      color: new THREE.Color().setHSL(i / barCount, 0.8, 0.6)
    }));
  }, []);

  useFrame((state) => {
    if (barsRef.current) {
      // Animate bars based on audio data or time
      barsRef.current.children.forEach((bar, i) => {
        const mesh = bar as THREE.Mesh;
        const height = audioData[i] || Math.sin(state.clock.elapsedTime * 2 + i * 0.1) * 0.5 + 1;
        mesh.scale.y = height;
        mesh.position.y = height / 2;
        
        // Add color animation
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.color) {
          material.color.setHSL((i / barCount + state.clock.elapsedTime * 0.1) % 1, 0.8, 0.6);
        }
      });
    }
  });

  return (
    <group ref={barsRef}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position as [number, number, number]}>
          <boxGeometry args={[0.2, bar.height, 0.2]} />
          <meshStandardMaterial color={bar.color} />
        </mesh>
      ))}
    </group>
  );
};

// Floating Music Notes
const FloatingNotes: React.FC = () => {
  const notesRef = useRef<THREE.Group>(null);
  const noteCount = 20;

  const notes = useMemo(() => {
    return Array.from({ length: noteCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        Math.random() * 10,
        (Math.random() - 0.5) * 20
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      scale: Math.random() * 0.5 + 0.5
    }));
  }, []);

  useFrame((state) => {
    if (notesRef.current) {
      notesRef.current.children.forEach((note, i) => {
        note.rotation.y += 0.01;
        note.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01;
      });
    }
  });

  return (
    <group ref={notesRef}>
      {notes.map((note, i) => (
        <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={note.position as [number, number, number]} scale={note.scale}>
            <octahedronGeometry args={[0.5]} />
            <meshStandardMaterial 
              color={new THREE.Color().setHSL(i / noteCount, 0.7, 0.6)}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// 3D Platform/Stage
const MusicStage: React.FC = () => {
  return (
    <group>
      {/* Main stage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Stage lights */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 4) * 8,
          3,
          Math.sin(i * Math.PI / 4) * 8
        ]}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial 
            color={new THREE.Color().setHSL(i / 8, 0.8, 0.6)}
            emissive={new THREE.Color().setHSL(i / 8, 0.8, 0.3)}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D Text Component
const FloatingText: React.FC<{ text: string; position: [number, number, number] }> = ({ text, position }) => {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        position={position}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/helvetiker_regular.typeface.json"
      >
        {text}
      </Text>
    </Float>
  );
};

// Main 3D Scene
const Scene: React.FC = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 5, 10);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <MusicStage />
      <AudioBars />
      <FloatingNotes />
      
      <FloatingText text="ICP Music" position={[0, 8, 0]} />
      <FloatingText text="Platform" position={[0, 6, 0]} />
      
      <Environment preset="night" />
    </>
  );
};

// Main Component
const MusicVisualizer3D: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
        <Scene />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      
      {/* Overlay Controls */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        color: 'white',
        fontFamily: 'Poppins, Arial, sans-serif',
        background: 'rgba(34,34,54,0.85)',
        borderRadius: '18px',
        boxShadow: '0 4px 32px 0 rgba(123,31,162,0.18)',
        padding: '32px 40px',
        minWidth: '320px',
        maxWidth: '90vw',
        backdropFilter: 'blur(12px)',
        border: '2px solid #7b1fa2',
      }}>
        <h2 style={{
          fontWeight: 900,
          fontSize: '2.2rem',
          margin: 0,
          background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: 1,
          textShadow: '0 2px 8px #42a5f5',
        }}>3D Music Visualizer</h2>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            marginTop: '24px',
            padding: '12px 32px',
            background: isPlaying ? 'linear-gradient(90deg, #ff4444, #7b1fa2)' : 'linear-gradient(90deg, #44ff44, #00e5ff)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px #42a5f5',
            transition: 'all 0.2s',
          }}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default MusicVisualizer3D; 