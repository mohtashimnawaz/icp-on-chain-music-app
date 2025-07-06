import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 3D Microphone
const Microphone: React.FC<{ position: [number, number, number]; isRecording: boolean }> = ({ position, isRecording }) => {
  const micRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (micRef.current && isRecording) {
      micRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={micRef} position={position}>
      {/* Microphone stand */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Microphone body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      {/* Microphone head */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color={isRecording ? "#ff4444" : "#888888"}
          emissive={isRecording ? "#ff0000" : "#000000"}
          emissiveIntensity={isRecording ? 0.3 : 0}
        />
      </mesh>
      
      {/* Recording indicator */}
      {isRecording && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
};

// 3D Mixing Console
const MixingConsole: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [selectedChannel, setSelectedChannel] = useState(0);
  const channelCount = 8;

  return (
    <group position={[0, -0.5, -2]}>
      {/* Console base */}
      <mesh>
        <boxGeometry args={[8, 0.3, 2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Channel strips */}
      {Array.from({ length: channelCount }, (_, i) => (
        <group key={i} position={[(i - channelCount / 2) * 0.8, 0.2, 0]}>
          {/* Channel fader */}
          <Html position={[0, 0, 0]} center>
            <div style={{
              width: '60px',
              height: '120px',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '5px',
              padding: '5px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '100%',
                height: '80px',
                background: selectedChannel === i ? '#444' : '#333',
                borderRadius: '3px',
                marginBottom: '5px',
                position: 'relative'
              }}>
                <div style={{
                  width: '100%',
                  height: `${Math.random() * 100}%`,
                  background: '#666',
                  position: 'absolute',
                  bottom: 0,
                  borderRadius: '3px'
                }} />
              </div>
              <div style={{ color: 'white', fontSize: '10px' }}>
                Ch {i + 1}
              </div>
            </div>
          </Html>
          
          {/* Channel button */}
          <Html position={[0, 0.8, 0]} center>
            <button
              onClick={() => setSelectedChannel(i)}
              style={{
                width: '40px',
                height: '20px',
                background: selectedChannel === i ? '#44ff44' : '#666',
                border: 'none',
                borderRadius: '3px',
                color: 'white',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              {i + 1}
            </button>
          </Html>
        </group>
      ))}
      
      {/* Master section */}
      <group position={[3.5, 0.2, 0]}>
        <Html position={[0, 0, 0]} center>
          <div style={{
            width: '100px',
            height: '120px',
            background: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '5px',
            padding: '5px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'white', fontSize: '12px', marginBottom: '10px' }}>
              MASTER
            </div>
            <div style={{
              width: '100%',
              height: '60px',
              background: '#333',
              borderRadius: '3px',
              marginBottom: '5px'
            }} />
            <div style={{
              width: '100%',
              height: '20px',
              background: isActive ? '#44ff44' : '#666',
              borderRadius: '3px',
              color: 'white',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isActive ? 'ON' : 'OFF'}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};

// 3D Monitor Speakers
const MonitorSpeakers: React.FC<{ position: [number, number, number]; side: 'left' | 'right' }> = ({ position, side }) => {
  const [isActive, setIsActive] = useState(false);
  
  useFrame((state) => {
    setIsActive(Math.sin(state.clock.elapsedTime * 5) > 0.5);
  });

  return (
    <group position={position}>
      {/* Speaker cabinet */}
      <mesh>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Woofer */}
      <mesh position={[0, -0.2, 0.35]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
        <meshStandardMaterial 
          color={isActive ? "#ff4444" : "#444444"}
          emissive={isActive ? "#ff0000" : "#000000"}
          emissiveIntensity={isActive ? 0.2 : 0}
        />
      </mesh>
      
      {/* Tweeter */}
      <mesh position={[0, 0.2, 0.35]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial 
          color={isActive ? "#4444ff" : "#444444"}
          emissive={isActive ? "#0000ff" : "#000000"}
          emissiveIntensity={isActive ? 0.2 : 0}
        />
      </mesh>
      
      {/* Speaker stand */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
};

// 3D Computer Screen
const ComputerScreen: React.FC<{ isOn: boolean }> = ({ isOn }) => {
  return (
    <group position={[0, 1.5, -1]}>
      {/* Screen stand */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Screen base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Screen display */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.8, 1, 0.02]} />
        <meshStandardMaterial 
          color={isOn ? "#000000" : "#333333"}
          emissive={isOn ? "#0000ff" : "#000000"}
          emissiveIntensity={isOn ? 0.3 : 0}
        />
      </mesh>
      
      {/* Screen content */}
      {isOn && (
        <Html position={[0, 0, 0.08]} center>
          <div style={{
            width: '300px',
            height: '200px',
            background: '#000',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '10px',
            border: '1px solid #0f0'
          }}>
            <div>ICP Music Studio</div>
            <div>Recording Session</div>
            <div>Track: 01</div>
            <div>Time: 00:03:45</div>
            <div>Level: ████████░░ 80%</div>
            <div>Status: Recording...</div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Guitar
const Guitar: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const guitarRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (guitarRef.current) {
      guitarRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={guitarRef} position={position}>
      {/* Guitar body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Guitar neck */}
      <mesh position={[0, 0, 0.6]}>
        <boxGeometry args={[0.1, 0.1, 1.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Guitar head */}
      <mesh position={[0, 0, 1.2]}>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Guitar strings */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, (i - 2.5) * 0.02, 0.6]}>
          <cylinderGeometry args={[0.005, 0.005, 1.2, 8]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      ))}
    </group>
  );
};

// 3D Piano/Keyboard
const Piano: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const [pressedKeys, setPressedKeys] = useState<number[]>([]);
  
  const whiteKeys = Array.from({ length: 14 }, (_, i) => i);
  const blackKeys = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map(i => i + 0.5);

  return (
    <group position={position}>
      {/* Piano base */}
      <mesh>
        <boxGeometry args={[6, 0.3, 1.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* White keys */}
      {whiteKeys.map((key) => (
        <mesh key={`white-${key}`} position={[(key - 7) * 0.4, 0.2, 0]}>
          <boxGeometry args={[0.35, 0.1, 1.2]} />
          <meshStandardMaterial 
            color={pressedKeys.includes(key) ? "#cccccc" : "#ffffff"}
            emissive={pressedKeys.includes(key) ? "#ffffff" : "#000000"}
            emissiveIntensity={pressedKeys.includes(key) ? 0.2 : 0}
          />
        </mesh>
      ))}
      
      {/* Black keys */}
      {blackKeys.map((key) => (
        <mesh key={`black-${key}`} position={[(key - 7) * 0.4, 0.25, 0.3]}>
          <boxGeometry args={[0.25, 0.15, 0.8]} />
          <meshStandardMaterial 
            color={pressedKeys.includes(key) ? "#333333" : "#000000"}
            emissive={pressedKeys.includes(key) ? "#666666" : "#000000"}
            emissiveIntensity={pressedKeys.includes(key) ? 0.3 : 0}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main 3D Scene
const Scene: React.FC<{
  isRecording: boolean;
  onToggleRecording: () => void;
  isComputerOn: boolean;
  onToggleComputer: () => void;
}> = ({ isRecording, onToggleRecording, isComputerOn, onToggleComputer }) => {
  const { camera } = useThree();

  React.useEffect(() => {
    camera.position.set(0, 2, 8);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Studio walls */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[20, 8, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[-10, 2, 0]}>
        <boxGeometry args={[0.2, 8, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[10, 2, 0]}>
        <boxGeometry args={[0.2, 8, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Studio equipment */}
      <Microphone position={[0, 0, 0]} isRecording={isRecording} />
      <MixingConsole isActive={isRecording} />
      <MonitorSpeakers position={[-2, 0, -1]} side="left" />
      <MonitorSpeakers position={[2, 0, -1]} side="right" />
      <ComputerScreen isOn={isComputerOn} />
      <Guitar position={[-3, 0, 1]} />
      <Piano position={[0, -1, 2]} />
      
      {/* Control buttons */}
      <Html position={[0, 3, 0]} center>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={onToggleRecording}
            style={{
              padding: '15px 30px',
              background: isRecording ? '#ff4444' : '#44ff44',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          
          <button
            onClick={onToggleComputer}
            style={{
              padding: '15px 30px',
              background: isComputerOn ? '#666666' : '#44ff44',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isComputerOn ? 'Turn Off PC' : 'Turn On PC'}
          </button>
        </div>
      </Html>
      
      {/* Studio title */}
      <Text
        position={[0, 4, -5]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        ICP Music Studio
      </Text>
      
      {/* Floating particles */}
      {Array.from({ length: 30 }, (_, i) => (
        <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 15,
            Math.random() * 8,
            (Math.random() - 0.5) * 15
          ]}>
            <sphereGeometry args={[0.03]} />
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
const MusicStudio3D: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isComputerOn, setIsComputerOn] = useState(true);

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleToggleComputer = () => {
    setIsComputerOn(!isComputerOn);
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 75 }}>
        <Scene
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
          isComputerOn={isComputerOn}
          onToggleComputer={handleToggleComputer}
        />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={20}
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
        <h2>3D Music Studio</h2>
        <p>Interactive recording environment</p>
        <p>Recording: {isRecording ? 'ON' : 'OFF'}</p>
        <p>Computer: {isComputerOn ? 'ON' : 'OFF'}</p>
      </div>
    </div>
  );
};

export default MusicStudio3D; 