import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  IconButton, 
  Slider, 
  Card, 
  CardContent,
  LinearProgress,
  Chip,
  Tooltip,
  useTheme
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// Enhanced Audio Visualizer with 3D bars
const AudioVisualizer3D: React.FC<{ isPlaying: boolean; volume: number }> = ({ isPlaying, volume }) => {
  const barsRef = useRef<THREE.Group>(null);
  const barCount = 64;
  
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => ({
      position: [(i - barCount / 2) * 0.5, 0, 0],
      height: Math.random() * 3 + 0.5,
      color: `hsl(${(i / barCount) * 360}, 70%, 60%)`,
      phase: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame((state) => {
    if (barsRef.current && isPlaying) {
      barsRef.current.children.forEach((bar, i) => {
        const barData = bars[i];
        const intensity = Math.sin(state.clock.elapsedTime * 8 + barData.phase) * 0.5 + 0.5;
        const height = barData.height * intensity * volume;
        bar.scale.y = height;
        bar.position.y = height / 2;
        
        // Color shifting effect
        const material = (bar as THREE.Mesh).material as THREE.MeshStandardMaterial;
        material.color.setHSL((i / barCount + state.clock.elapsedTime * 0.1) % 1, 0.8, 0.6);
        material.emissive.setHSL((i / barCount + state.clock.elapsedTime * 0.1) % 1, 0.8, 0.3);
      });
    }
  });

  return (
    <group ref={barsRef}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position as [number, number, number]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial 
            color={bar.color}
            emissive={bar.color}
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

// Floating Music Particles
const MusicParticles: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const particlesRef = useRef<THREE.Group>(null);
  const particleCount = 200;

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      ],
      velocity: [
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05
      ],
      color: `hsl(${Math.random() * 360}, 80%, 70%)`,
      size: Math.random() * 0.2 + 0.1
    }));
  }, []);

  useFrame((state) => {
    if (particlesRef.current && isPlaying) {
      particlesRef.current.children.forEach((particle, i) => {
        const particleData = particles[i];
        particle.position.x += particleData.velocity[0];
        particle.position.y += particleData.velocity[1];
        particle.position.z += particleData.velocity[2];
        
        // Add wave motion
        particle.position.y += Math.sin(state.clock.elapsedTime * 2 + i * 0.1) * 0.02;
        
        // Reset particle position if it goes too far
        if (Math.abs(particle.position.x) > 25) {
          particle.position.x = (Math.random() - 0.5) * 50;
          particle.position.y = (Math.random() - 0.5) * 50;
          particle.position.z = (Math.random() - 0.5) * 50;
        }
        
        // Pulsing effect
        const pulse = Math.sin(state.clock.elapsedTime * 4 + i * 0.2) * 0.3 + 0.7;
        particle.scale.setScalar(particleData.size * pulse);
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
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Central Music Sphere
const MusicSphere: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += isPlaying ? 0.01 : 0.002;
      sphereRef.current.rotation.x += isPlaying ? 0.005 : 0.001;
      
      // Pulsing effect when playing
      if (isPlaying) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.3 + 1;
        sphereRef.current.scale.setScalar(pulse);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={isPlaying ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

// Main 3D Music Player Component
const MusicPlayer3D: React.FC = () => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  
  const currentTrack = {
    title: "Ethereal Beats",
    artist: "Digital Composer",
    album: "Cyber Symphony",
    cover: "/api/placeholder/200/200"
  };

  // Simulate progress when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    setCurrentTime(newValue as number);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 70 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <fog attach="fog" args={['#0a0a0a', 10, 100]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7b1fa2" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#42a5f5" />
        
        {/* Environment */}
        <Environment preset="night" />
        
        {/* 3D Components */}
        <MusicSphere isPlaying={isPlaying} />
        <AudioVisualizer3D isPlaying={isPlaying} volume={volume} />
        <MusicParticles isPlaying={isPlaying} />
        
        {/* Controls */}
        <OrbitControls 
          enablePan={false} 
          minDistance={8} 
          maxDistance={25}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Player Controls UI */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          width: '90%',
          maxWidth: '600px'
        }}
      >
        <Card sx={{ 
          background: 'rgba(0, 0, 0, 0.8)', 
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Track Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '10px',
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h6">♪</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  {currentTrack.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  {currentTrack.artist}
                </Typography>
              </Box>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  onClick={() => setIsLiked(!isLiked)}
                  sx={{ color: isLiked ? '#ff6b6b' : '#fff' }}
                >
                  {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </motion.div>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Slider
                value={currentTime}
                max={duration}
                onChange={handleProgressChange}
                sx={{
                  color: theme.palette.primary.main,
                  '& .MuiSlider-thumb': {
                    backgroundColor: theme.palette.primary.main,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: theme.palette.primary.main,
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Box>

            {/* Control Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  onClick={() => setIsShuffled(!isShuffled)}
                  sx={{ color: isShuffled ? '#4ecdc4' : '#fff' }}
                >
                  <ShuffleIcon />
                </IconButton>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton sx={{ color: theme.palette.text.primary }}>
                  <SkipPreviousIcon />
                </IconButton>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  onClick={handlePlayPause}
                  sx={{ 
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                    width: 56,
                    height: 56
                  }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton sx={{ color: theme.palette.text.primary }}>
                  <SkipNextIcon />
                </IconButton>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  onClick={() => setIsRepeated(!isRepeated)}
                  sx={{ color: isRepeated ? '#4ecdc4' : '#fff' }}
                >
                  <RepeatIcon />
                </IconButton>
              </motion.div>
            </Box>

            {/* Volume Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
              <IconButton
                onClick={() => setIsMuted(!isMuted)}
                sx={{ color: '#fff' }}
              >
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Slider
                value={isMuted ? 0 : volume}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                sx={{
                  color: theme.palette.primary.main,
                  flex: 1,
                  '& .MuiSlider-thumb': {
                    backgroundColor: theme.palette.primary.main,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: theme.palette.primary.main,
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Indicators */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Chip
                  label="Playing"
                  color="primary"
                  sx={{ background: '#4ecdc4' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {isShuffled && (
            <Chip
              label="Shuffle"
              variant="outlined"
              sx={{ color: '#4ecdc4', borderColor: '#4ecdc4' }}
            />
          )}
          
          {isRepeated && (
            <Chip
              label="Repeat"
              variant="outlined"
              sx={{ color: '#4ecdc4', borderColor: '#4ecdc4' }}
            />
          )}
        </Box>
      </motion.div>
    </motion.div>
  );
};

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

export default MusicPlayer3D; 