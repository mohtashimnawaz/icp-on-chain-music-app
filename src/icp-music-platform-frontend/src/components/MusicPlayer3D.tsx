import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 3D Vinyl Record
const VinylRecord: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isPlaying) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main vinyl disc */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Vinyl grooves */}
      <mesh position={[0, 0, 0.06]}>
        <cylinderGeometry args={[1.8, 1.8, 0.02, 32]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Center label */}
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Center hole */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};

// 3D Speaker
const Speaker: React.FC<{ position: [number, number, number]; side: 'left' | 'right' }> = ({ position, side }) => {
  const [isActive, setIsActive] = useState(false);
  
  useFrame((state) => {
    // Simulate speaker vibration
    setIsActive(Math.sin(state.clock.elapsedTime * 10) > 0.5);
  });

  return (
    <group position={position}>
      {/* Speaker cabinet */}
      <mesh>
        <boxGeometry args={[1.5, 2, 1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Speaker cone */}
      <mesh position={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial 
          color={isActive ? "#ff4444" : "#444444"}
          emissive={isActive ? "#ff0000" : "#000000"}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      
      {/* Speaker grill */}
      <mesh position={[0, 0, 0.65]}>
        <cylinderGeometry args={[0.45, 0.45, 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" wireframe />
      </mesh>
    </group>
  );
};

// 3D Control Panel
const ControlPanel: React.FC<{ 
  isPlaying: boolean; 
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}> = ({ isPlaying, onPlayPause, onNext, onPrevious, volume, onVolumeChange }) => {
  return (
    <group position={[0, -1, 2]}>
      {/* Control panel base */}
      <mesh>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Play/Pause button */}
      <Html position={[-1.5, 0.2, 0]} center>
        <button
          onClick={onPlayPause}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: isPlaying ? '#ff4444' : '#44ff44',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </Html>
      
      {/* Previous button */}
      <Html position={[-2.5, 0.2, 0]} center>
        <button
          onClick={onPrevious}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: '#666666',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ⏮️
        </button>
      </Html>
      
      {/* Next button */}
      <Html position={[-0.5, 0.2, 0]} center>
        <button
          onClick={onNext}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: '#666666',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ⏭️
        </button>
      </Html>
      
      {/* Volume slider */}
      <Html position={[1.5, 0.2, 0]} center>
        <div style={{ width: '100px', textAlign: 'center' }}>
          <div style={{ color: 'white', marginBottom: '5px' }}>Volume</div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </Html>
    </group>
  );
};

// 3D Audio Waveform
const AudioWaveform: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const waveformRef = useRef<THREE.Group>(null);
  const barCount = 32;

  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => ({
      position: [(i - barCount / 2) * 0.2, 0, 0],
      height: Math.random() * 0.5 + 0.1
    }));
  }, []);

  useFrame((state) => {
    if (waveformRef.current && isPlaying) {
      waveformRef.current.children.forEach((bar, i) => {
        const mesh = bar as THREE.Mesh;
        const height = Math.sin(state.clock.elapsedTime * 3 + i * 0.2) * 0.3 + 0.5;
        mesh.scale.y = height;
        mesh.position.y = height / 2;
      });
    }
  });

  return (
    <group ref={waveformRef} position={[0, 1, 2]}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position as [number, number, number]}>
          <boxGeometry args={[0.1, bar.height, 0.1]} />
          <meshStandardMaterial 
            color={new THREE.Color().setHSL(i / barCount, 0.8, 0.6)}
            emissive={new THREE.Color().setHSL(i / barCount, 0.8, 0.3)}
            emissiveIntensity={isPlaying ? 0.5 : 0}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D Track Info Display
const TrackInfo: React.FC<{ track: { title: string; artist: string; duration: string } }> = ({ track }) => {
  return (
    <group position={[0, 2, 2]}>
      <Html position={[0, 0, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{track.title}</h3>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', opacity: 0.8 }}>{track.artist}</p>
          <p style={{ margin: '0', fontSize: '12px', opacity: 0.6 }}>{track.duration}</p>
        </div>
      </Html>
    </group>
  );
};

// Main 3D Scene
const Scene: React.FC<{
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  track: { title: string; artist: string; duration: string };
}> = ({ isPlaying, onPlayPause, onNext, onPrevious, volume, onVolumeChange, track }) => {
  const { camera } = useThree();

  React.useEffect(() => {
    camera.position.set(0, 3, 8);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Background */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      {/* Vinyl Record */}
      <VinylRecord isPlaying={isPlaying} />
      
      {/* Speakers */}
      <Speaker position={[-3, 0, 0]} side="left" />
      <Speaker position={[3, 0, 0]} side="right" />
      
      {/* Control Panel */}
      <ControlPanel
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onNext={onNext}
        onPrevious={onPrevious}
        volume={volume}
        onVolumeChange={onVolumeChange}
      />
      
      {/* Audio Waveform */}
      <AudioWaveform isPlaying={isPlaying} />
      
      {/* Track Info */}
      <TrackInfo track={track} />
      
      {/* Floating particles */}
      {Array.from({ length: 50 }, (_, i) => (
        <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 10,
            (Math.random() - 0.5) * 20
          ]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial 
              color={new THREE.Color().setHSL(Math.random(), 0.8, 0.6)}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

// Main Component
const MusicPlayer3D: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Sample Track",
    artist: "Sample Artist",
    duration: "3:45"
  });

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    // Simulate next track
    setCurrentTrack({
      title: "Next Track",
      artist: "Next Artist",
      duration: "4:20"
    });
  };

  const handlePrevious = () => {
    // Simulate previous track
    setCurrentTrack({
      title: "Previous Track",
      artist: "Previous Artist",
      duration: "3:15"
    });
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 3, 8], fov: 75 }}>
        <Scene
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          volume={volume}
          onVolumeChange={setVolume}
          track={currentTrack}
        />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>
      
      {/* Overlay Info */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'right'
      }}>
        <h2>3D Music Player</h2>
        <p>Use mouse to rotate, scroll to zoom</p>
        <p>Volume: {volume}%</p>
      </div>
    </div>
  );
};

export default MusicPlayer3D; 