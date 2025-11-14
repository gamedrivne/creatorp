'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Types et interfaces améliorées
interface ImageData {
  url: string;
  photographer?: string;
  category?: string;
}

interface SoundData {
  file: string;
  title?: string;
  name?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface PreviewProps {
  image: ImageData;
  sound: SoundData;
  quotes: string[];
  onClose: () => void;
  isRecording?: boolean;
  selectedFont: string;
  selectedColor: string;
  selectedAnimation: string;
  fontSize: number;
  duration: number;
}

// Constantes extraites et optimisées
const ARABIC_FONTS = [
  'Amiri', 'Cairo', 'Tajawal', 'Almarai', 'El Messiri', 'Reem Kufi', 
  'Mada', 'Harmattan', 'Markazi Text', 'Scheherazade New', 'Aref Ruqaa', 
  'Lemonada', 'Jomhuria', 'Lalezar', 'Mirza', 'Rakkas', 'Katibeh', 
  'Kufam', 'Vibes', 'Noto Naskh Arabic'
];

const FONT_SIZES = [
  { name: 'Très petit', value: 24 },
  { name: 'Petit', value: 32 },
  { name: 'Moyen', value: 40 },
  { name: 'Grand', value: 48 },
  { name: 'Très grand', value: 56 },
  { name: 'Énorme', value: 64 }
];

const COLORS = [
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Jaune', value: '#FFD700' },
  { name: 'Rose', value: '#FF1493' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Orange', value: '#FF6347' },
  { name: 'Vert Lime', value: '#00FF00' },
  { name: 'Violet', value: '#DA70D6' },
  { name: 'Rouge', value: '#FF0000' },
  { name: 'Bleu', value: '#1E90FF' },
  { name: 'Or', value: '#FFA500' }
];

const SCREEN_ANIMATIONS = [
  { name: 'Aucune', value: 'none' },
  { name: 'Neige', value: 'snow' },
  { name: 'Étoiles', value: 'stars' },
  { name: 'Pluie', value: 'rain' },
  { name: 'Bulles', value: 'bubbles' },
  { name: 'Confettis', value: 'confetti' },
  { name: 'Feuilles', value: 'leaves' },
  { name: 'Papillons', value: 'butterflies' },
  { name: 'Cœurs', value: 'hearts' },
  { name: 'Particules', value: 'particles' },
  { name: 'Lumière', value: 'light' },
  { name: 'Feu', value: 'fire' },
  { name: 'Fumée', value: 'smoke' },
  { name: 'Nuages', value: 'clouds' },
  { name: 'Pétales', value: 'petals' },
  { name: 'Sparkles', value: 'sparkles' },
  { name: 'Aurore', value: 'aurora' },
  { name: 'Plasma', value: 'plasma' },
  { name: 'Vagues', value: 'waves' },
  { name: 'Cercles', value: 'circles' }
];

const DURATION_OPTIONS = [
  { name: '20 secondes', value: 20 },
  { name: '30 secondes', value: 30 },
  { name: '1 minute', value: 60 }
];

const CATEGORIES = [
  { id: 'hikam', name: 'Hikam', emoji: '📿', gradient: 'from-emerald-400 to-cyan-400' },
  { id: 'love', name: 'Love', emoji: '❤️', gradient: 'from-pink-400 to-rose-400' },
  { id: 'women', name: 'Women', emoji: '👩', gradient: 'from-purple-400 to-pink-400' },
  { id: 'dunya', name: 'Dunya', emoji: '🌍', gradient: 'from-blue-400 to-indigo-400' }
];

// API Endpoints
const API_ENDPOINTS = {
  IMAGES: 'https://gamedrivne.github.io/wallpapers-api/data.json',
  SOUNDS: 'https://gamedrivne.github.io/Sounds/sounds.json',
  QUOTES: (category: string) => `https://gamedrivne.github.io/qts/api/${category}.json`
};

// Utilitaires optimisés
class ParticleManager {
  private static colors: Record<string, string | string[]> = {
    snow: '#FFFFFF', stars: '#FFFF00', rain: '#87CEEB', bubbles: '#00FFFF',
    confetti: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
    leaves: ['#228B22', '#FFD700', '#FF8C00'], butterflies: ['#FFB6C1', '#FF69B4', '#DDA0DD'],
    hearts: '#FF1493', particles: '#FFFFFF', light: '#FFFFE0', 
    fire: ['#FF4500', '#FF6347', '#FFD700'],
    smoke: '#808080', clouds: '#F0F8FF', petals: ['#FFB6C1', '#FF69B4', '#FFC0CB'],
    sparkles: ['#FFFFFF', '#FFD700', '#00FFFF'], aurora: ['#00FF00', '#00FFFF', '#FF00FF'],
    plasma: ['#FF00FF', '#00FFFF', '#FFFF00'], waves: '#4682B4', 
    circles: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']
  };

  static createParticle(index: number, animType: string, frame: number, containerWidth: number, containerHeight: number): Particle {
    const colors = this.colors[animType] || '#FFFFFF';
    const color = Array.isArray(colors) ? colors[index % colors.length] : colors;

    switch(animType) {
      case 'snow':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: -20, 
          size: Math.random() * 8 + 4, 
          vx: Math.sin(frame * 0.01) * 0.5, 
          vy: Math.random() * 2 + 1, 
          opacity: Math.random() * 0.6 + 0.4, 
          color 
        };
      case 'stars':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: Math.random() * containerHeight, 
          size: Math.random() * 3 + 1, 
          vx: 0, 
          vy: 0, 
          opacity: Math.random() * 0.5 + 0.5, 
          color 
        };
      case 'rain':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: -20, 
          size: Math.random() * 3 + 2, 
          vx: 0, 
          vy: Math.random() * 5 + 5, 
          opacity: 0.7, 
          color 
        };
      case 'bubbles':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: containerHeight + 20, 
          size: Math.random() * 20 + 10, 
          vx: Math.random() * 2 - 1, 
          vy: -(Math.random() * 2 + 1), 
          opacity: 0.5, 
          color 
        };
      case 'confetti':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: -20, 
          size: Math.random() * 8 + 4, 
          vx: Math.random() * 4 - 2, 
          vy: Math.random() * 3 + 2, 
          opacity: 1, 
          color 
        };
      case 'leaves':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: -20, 
          size: Math.random() * 12 + 8, 
          vx: Math.sin(frame * 0.01) * 2, 
          vy: Math.random() * 1.5 + 0.5, 
          opacity: 0.8, 
          color 
        };
      case 'butterflies':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: Math.random() * containerHeight, 
          size: Math.random() * 15 + 10, 
          vx: Math.sin(frame * 0.1) * 3, 
          vy: Math.random() * 1 + 0.5, 
          opacity: 0.9, 
          color 
        };
      case 'hearts':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: -20, 
          size: Math.random() * 15 + 10, 
          vx: Math.random() * 2 - 1, 
          vy: Math.random() * 2 + 1, 
          opacity: 0.8, 
          color 
        };
      case 'particles':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: Math.random() * containerHeight, 
          size: Math.random() * 4 + 2, 
          vx: Math.random() * 0.5 - 0.25, 
          vy: Math.random() * 0.5 - 0.25, 
          opacity: Math.random() * 0.5 + 0.5, 
          color 
        };
      case 'light':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: Math.random() * containerHeight, 
          size: Math.random() * 6 + 3, 
          vx: 0, 
          vy: 0, 
          opacity: Math.random() * 0.3 + 0.2, 
          color 
        };
      case 'fire':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: containerHeight + 20, 
          size: Math.random() * 20 + 10, 
          vx: Math.random() * 2 - 1, 
          vy: -(Math.random() * 3 + 2), 
          opacity: Math.random() * 0.7 + 0.3, 
          color 
        };
      case 'smoke':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: containerHeight + 20, 
          size: Math.random() * 30 + 20, 
          vx: Math.random() * 1 - 0.5, 
          vy: -(Math.random() * 1 + 0.5), 
          opacity: Math.random() * 0.3 + 0.1, 
          color 
        };
      case 'clouds':
        return { 
          id: index, 
          x: -100, 
          y: Math.random() * 400, 
          size: Math.random() * 50 + 40, 
          vx: Math.random() * 0.5 + 0.2, 
          vy: 0, 
          opacity: 0.4, 
          color 
        };
      case 'petals':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: -20, 
          size: Math.random() * 10 + 6, 
          vx: Math.sin(frame * 0.01) * 1.5, 
          vy: Math.random() * 1.5 + 0.8, 
          opacity: 0.7, 
          color 
        };
      case 'sparkles':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: Math.random() * containerHeight, 
          size: Math.random() * 5 + 2, 
          vx: 0, 
          vy: 0, 
          opacity: Math.random() * 0.5 + 0.5, 
          color 
        };
      case 'aurora':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: Math.random() * containerHeight, 
          size: Math.random() * 100 + 50, 
          vx: Math.random() * 0.2 - 0.1, 
          vy: Math.random() * 0.2, 
          opacity: 0.1, 
          color 
        };
      case 'plasma':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: Math.random() * containerHeight, 
          size: Math.random() * 80 + 40, 
          vx: Math.random() * 0.5 - 0.25, 
          vy: Math.random() * 0.5 - 0.25, 
          opacity: 0.2, 
          color 
        };
      case 'waves':
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: containerHeight - Math.abs(Math.sin(frame * 0.1) * 200), 
          size: Math.random() * 40 + 30, 
          vx: 0, 
          vy: Math.sin(frame * 0.001) * 2, 
          opacity: 0.3, 
          color 
        };
      case 'circles':
        return { 
          id: index, 
          x: containerWidth / 2, 
          y: containerHeight / 2, 
          size: Math.random() * 100 + 50, 
          vx: 0, 
          vy: 0, 
          opacity: Math.random() * 0.1 + 0.05, 
          color 
        };
      default:
        return { 
          id: index, 
          x: Math.random() * containerWidth, 
          y: Math.random() * containerHeight, 
          size: 0, 
          vx: 0, 
          vy: 0, 
          opacity: 0, 
          color: '#FFFFFF' 
        };
    }
  }

  static updateParticle(particle: Particle, frame: number, animType: string, containerWidth: number, containerHeight: number): Particle {
    let updatedParticle = { ...particle };
    updatedParticle.x += updatedParticle.vx;
    updatedParticle.y += updatedParticle.vy;

    if (animType === 'stars' || animType === 'sparkles') {
      updatedParticle.opacity = Math.abs(Math.sin(frame * 0.05 + particle.id)) * 0.8 + 0.2;
    }

    if (animType === 'circles') {
      updatedParticle.size += 0.5;
      updatedParticle.opacity -= 0.001;
      if (updatedParticle.opacity <= 0 || updatedParticle.size > 200) {
        return this.createParticle(particle.id, animType, frame, containerWidth, containerHeight);
      }
    }

    // Reset particle if out of bounds
    if (this.isOutOfBounds(updatedParticle, animType, containerWidth, containerHeight)) {
      return this.createParticle(particle.id, animType, frame, containerWidth, containerHeight);
    }

    return updatedParticle;
  }

  private static isOutOfBounds(particle: Particle, type: string, containerWidth: number, containerHeight: number): boolean {
    if (type === 'bubbles') return particle.y < -50;
    if (type === 'clouds') return particle.x > containerWidth + 100;
    if (type === 'circles') return false;
    if (['stars', 'light', 'sparkles', 'aurora', 'plasma', 'particles'].includes(type)) return false;
    return particle.y > containerHeight + 50 || particle.x < -50 || particle.x > containerWidth + 50;
  }
}

// Composant de gestion des particules
const ParticlesRenderer: React.FC<{
  particles: Particle[];
  containerRef: React.RefObject<HTMLDivElement>;
  animation: string;
}> = ({ particles, containerRef, animation }) => {
  const containerWidth = containerRef.current?.offsetWidth || 450;
  const containerHeight = containerRef.current?.offsetHeight || 800;

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none transition-all duration-100"
          style={{
            left: `${(particle.x / containerWidth) * 100}%`,
            top: `${(particle.y / containerHeight) * 100}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            transform: animation === 'butterflies' ? 'rotate(45deg)' : 'none'
          }}
        />
      ))}
    </>
  );
};

// Composant optimisé pour la prévisualisation
const Preview: React.FC<PreviewProps> = ({ 
  image, 
  sound, 
  quotes, 
  onClose, 
  isRecording = false, 
  selectedFont, 
  selectedColor, 
  selectedAnimation, 
  fontSize, 
  duration 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Memoized calculations
  const quoteChangeInterval = useMemo(() => 5000, []);
  const containerDimensions = useMemo(() => ({
    width: containerRef.current?.offsetWidth || 450,
    height: containerRef.current?.offsetHeight || 800
  }), []);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current.clear();
    
    if (audio) {
      audio.pause();
      audio.src = '';
      setAudio(null);
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [audio]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Animation management
  useEffect(() => {
    if (!isStarted || isRecording || !isMounted || selectedAnimation === 'none') {
      setParticles([]);
      return;
    }

    let frame = 0;
    const { width, height } = containerDimensions;
    
    // Initialize particles
    const initialParticles = Array.from({ length: 30 }, (_, i) => 
      ParticleManager.createParticle(i, selectedAnimation, 0, width, height)
    );
    setParticles(initialParticles);

    const animate = () => {
      setParticles(prev => 
        prev.map(particle => 
          ParticleManager.updateParticle(particle, frame++, selectedAnimation, width, height)
        )
      );

      // Add new particle occasionally
      if (Math.random() < 0.3) {
        const newParticle = ParticleManager.createParticle(
          Date.now() + Math.random(), 
          selectedAnimation, 
          frame, 
          width, 
          height
        );
        setParticles(prev => [...prev.slice(-29), newParticle]); // Keep max 30 particles
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStarted, isRecording, isMounted, selectedAnimation, containerDimensions]);

  const togglePause = useCallback(() => {
    if (audio) {
      if (isPaused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
      setIsPaused(!isPaused);
    }
  }, [audio, isPaused]);

  const startPreview = useCallback(async () => {
    try {
      setError(null);
      const newAudio = new Audio(sound.file);
      setAudio(newAudio);
      
      await newAudio.play();
      setIsStarted(true);

      if (isRecording) {
        startVideoGeneration(newAudio);
      }

      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= quotes.length - 1) {
            clearInterval(interval);
            intervalsRef.current.delete(interval);
            if (newAudio) newAudio.pause();
            return prev;
          }
          return prev + 1;
        });
      }, quoteChangeInterval);

      intervalsRef.current.add(interval);
      (newAudio as any).__intervalId = interval;
    } catch (error) {
      console.error('Erreur audio:', error);
      setError('Erreur lors de la lecture audio');
      setIsStarted(true);
    }
  }, [sound.file, isRecording, quotes.length, quoteChangeInterval]);

  const startVideoGeneration = useCallback(async (audioElement: HTMLAudioElement) => {
    try {
      setRecordingStatus(`🎬 Initialisation ${duration}s...`);
      setError(null);
      startTimeRef.current = Date.now();
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Setup canvas
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      canvas.style.left = '-9999px';
      canvas.style.top = '0';

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      canvas.width = 720;
      canvas.height = 1280;

      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = image.url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
      });

      // Setup video recording
      const fps = 30;
      const totalFrames = fps * duration;
      const framesPerQuote = fps * 5;

      const videoStream = canvas.captureStream(fps);
      
      // Setup audio recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const recordAudio = new Audio(sound.file);
      recordAudio.crossOrigin = 'anonymous';
      
      const source = audioContext.createMediaElementSource(recordAudio);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);
      
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      // MediaRecorder setup with fallback
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 5000000,
        audioBitsPerSecond: 192000
      };

      if (options.mimeType && !MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
        options.videoBitsPerSecond = 3000000; // Lower for compatibility
      }

      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm';
        options.videoBitsPerSecond = 2000000;
      }

      const mediaRecorder = new MediaRecorder(combinedStream, options);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualDurationSec = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
        console.log(`Vidéo terminée: durée réelle ${actualDurationSec}s, durée attendue ${duration}s`);
        setRecordingStatus(`💾 Vidéo créée (${actualDurationSec}s / ${duration}s attendues)`);
        
        const blob = new Blob(chunks, { type: options.mimeType || 'video/webm' });
        console.log(`Taille du fichier: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `post-${Date.now()}-${duration}s-HD.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        try {
          await audioContext.close();
        } catch (e) {
          console.warn('Erreur fermeture audioContext:', e);
        }
        
        recordAudio.pause();
        recordAudio.src = '';
        
        setRecordingStatus(`✅ Vidéo ${actualDurationSec}s téléchargée !`);
        setTimeout(() => onClose(), 2000);
      };

      mediaRecorder.onerror = (e) => {
        console.error('Erreur MediaRecorder:', e);
        setError('Erreur lors de l\'enregistrement');
        setRecordingStatus('❌ Erreur d\'enregistrement');
      };

      mediaRecorder.start(100);
      
      const audioStartTime = Date.now();
      await recordAudio.play();
      
      // Duration monitoring
      const audioDurationCheck = setInterval(() => {
        const elapsed = (Date.now() - audioStartTime) / 1000;
        if (elapsed >= duration && mediaRecorder.state === 'recording') {
          clearInterval(audioDurationCheck);
          intervalsRef.current.delete(audioDurationCheck);
          console.log(`Arrêt forcé après ${elapsed.toFixed(1)}s`);
          mediaRecorder.stop();
          recordAudio.pause();
        }
      }, 500);

      intervalsRef.current.add(audioDurationCheck);
      setRecordingStatus(`🔴 Enregistrement... 0s/${duration}s`);

      // Video rendering
      let frameCount = 0;
      let videoParticles: Particle[] = [];
      
      if (selectedAnimation !== 'none') {
        videoParticles = Array.from({ length: 50 }, (_, i) => 
          ParticleManager.createParticle(i, selectedAnimation, 0, 720, 1280)
        );
      }

      const renderFrame = () => {
        if (frameCount >= totalFrames) {
          console.log(`Fin de l'enregistrement: ${frameCount} frames sur ${totalFrames} attendues`);
          mediaRecorder.stop();
          recordAudio.pause();
          return;
        }

        // Draw background
        ctx.drawImage(img, 0, 0, 720, 1280);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, 720, 1280);

        // Draw particles
        if (selectedAnimation !== 'none' && videoParticles.length > 0) {
          videoParticles.forEach((particle, index) => {
            particle = ParticleManager.updateParticle(particle, frameCount, selectedAnimation, 720, 1280);
            videoParticles[index] = particle;

            ctx.save();
            ctx.globalAlpha = particle.opacity;
            
            if (['aurora', 'plasma', 'light', 'stars', 'sparkles'].includes(selectedAnimation)) {
              ctx.shadowBlur = particle.size * 2;
              ctx.shadowColor = particle.color;
            }
            
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }

        // Draw text
        const quoteIndex = Math.floor(frameCount / framesPerQuote) % quotes.length;
        const quote = quotes[quoteIndex];

        ctx.save();
        ctx.fillStyle = selectedColor;
        ctx.font = `bold ${Math.floor(fontSize * 720 / 450)}px "${selectedFont}", Arial`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'black';
        ctx.direction = 'rtl';

        const maxWidth = 600;
        const words = quote.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        // Text wrapping
        words.forEach(word => {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        });
        lines.push(currentLine);

        const lineHeight = Math.floor(fontSize * 720 / 450) * 1.4;
        const startY = 640 - (lines.length * lineHeight) / 2;
        
        lines.forEach((line, i) => {
          ctx.fillText(line, 360, startY + i * lineHeight);
        });
        ctx.restore();

        frameCount++;
        
        const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const progress = (frameCount / totalFrames) * 100;
        setRecordingProgress(Math.floor(progress));
        setRecordingStatus(`🔴 Enregistrement... ${elapsedSec}s/${duration}s`);

        animationFrameRef.current = requestAnimationFrame(renderFrame);
      };

      renderFrame();
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la génération vidéo');
      setRecordingStatus('❌ Erreur');
    }
  }, [image.url, sound.file, duration, selectedAnimation, quotes, fontSize, selectedColor, selectedFont, onClose]);

  // Font loading effect
  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${ARABIC_FONTS.join('&family=')}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 flex items-center justify-center p-3">
      <canvas ref={canvasRef} style={{ position: 'absolute', left: '-9999px', top: '0', display: 'block' }} />
      
      <button 
        onClick={onClose} 
        className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl z-50 hover:scale-105 transition-transform shadow-lg font-bold text-sm sm:text-base"
      >
        ← Retour
      </button>
      
      {isRecording && recordingStatus && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-xl z-50 shadow-lg font-bold text-xs sm:text-base">
          {recordingStatus} {recordingProgress > 0 && `${recordingProgress}%`}
        </div>
      )}
      
      {isStarted && !isRecording && (
        <button 
          onClick={togglePause} 
          className="absolute top-14 left-2 sm:top-20 sm:left-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl z-50 hover:scale-105 transition-transform shadow-lg font-bold text-sm sm:text-base"
        >
          {isPaused ? '▶ Reprendre' : '⏸ Pause'}
        </button>
      )}
      
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg z-50">
          {error}
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="relative bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-purple-500" 
        style={{ width: '100%', maxWidth: '450px', aspectRatio: '9/16' }}
      >
        <img src={image.url} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black opacity-40" />
        
        {isStarted && !isRecording && selectedAnimation !== 'none' && (
          <ParticlesRenderer 
            particles={particles} 
            containerRef={containerRef} 
            animation={selectedAnimation} 
          />
        )}
        
        {!isStarted ? (
          <div className="absolute inset-0 flex items-center justify-center z-40 p-4">
            <button 
              onClick={startPreview} 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold shadow-lg transition-all transform hover:scale-110"
            >
              ▶ Démarrer {isRecording ? 'création' : 'prévisualisation'}
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-40 p-4 sm:p-8">
            <p 
              className="font-bold leading-relaxed text-white text-center" 
              style={{ 
                fontFamily: `${selectedFont}, Arial`, 
                fontSize: `${fontSize * 0.9}px`, 
                color: selectedColor, 
                textShadow: '0 0 10px black, 0 0 20px black', 
                direction: 'rtl' 
              }}
            >
              {quotes[currentIndex]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant principal optimisé
const Home: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [sounds, setSounds] = useState<SoundData[]>([]);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // State pour les sélecteurs
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAnimationPicker, setShowAnimationPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // State pour les sélections
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [selectedSound, setSelectedSound] = useState<SoundData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState('Cairo');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedAnimation, setSelectedAnimation] = useState('none');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [fontSize, setFontSize] = useState(40);
  const [isRecordingMode, setIsRecordingMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // API functions with better error handling
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.IMAGES);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!data.wallpapers || !Array.isArray(data.wallpapers)) {
        throw new Error('Format de données invalide');
      }
      
      setImages(data.wallpapers);
      setShowImagePicker(true);
    } catch (error) {
      console.error('Erreur chargement images:', error);
      setError('Erreur lors du chargement des images. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSounds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.SOUNDS);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!data.sounds || !Array.isArray(data.sounds)) {
        throw new Error('Format de données invalide');
      }
      
      setSounds(data.sounds);
      setShowSoundPicker(true);
    } catch (error) {
      console.error('Erreur chargement sons:', error);
      setError('Erreur lors du chargement des sons. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.QUOTES(category));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!data.quotes || !Array.isArray(data.quotes)) {
        throw new Error('Format de données invalide');
      }
      
      setQuotes(data.quotes);
      setSelectedCategory(category);
      setShowCategoryPicker(false);
    } catch (error) {
      console.error('Erreur chargement citations:', error);
      setError('Erreur lors du chargement des citations. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Font loading
  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${ARABIC_FONTS.join('&family=')}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Memoized values
  const canProceedToSound = selectedImage !== null;
  const canProceedToCategory = selectedSound !== null;
  const canProceedToPreview = selectedCategory !== null && quotes.length > 0;

  // Composants de sélecteurs optimisés
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="bg-red-600 text-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">❌ Erreur</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (showPreview && selectedImage && selectedSound) {
    return (
      <Preview 
        image={selectedImage} 
        sound={selectedSound} 
        quotes={quotes} 
        onClose={() => { 
          setShowPreview(false); 
          setIsRecordingMode(false); 
        }} 
        isRecording={isRecordingMode} 
        selectedFont={selectedFont} 
        selectedColor={selectedColor} 
        selectedAnimation={selectedAnimation} 
        fontSize={fontSize} 
        duration={selectedDuration} 
      />
    );
  }

  if (showDurationPicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowDurationPicker(false)} 
            className="mb-4 sm:mb-6 text-white text-base sm:text-lg hover:scale-105 transition-transform bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold shadow-lg"
          >
            ← Retour
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">⏱️ Durée de la vidéo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {DURATION_OPTIONS.map((opt) => (
              <button 
                key={opt.value} 
                onClick={() => { 
                  setSelectedDuration(opt.value); 
                  setShowDurationPicker(false); 
                }} 
                className="bg-white bg-opacity-10 backdrop-blur-md p-6 sm:p-8 rounded-xl sm:rounded-2xl hover:bg-opacity-20 transition-all text-center transform hover:scale-105 border-2 border-white border-opacity-20"
              >
                <div className="text-xl sm:text-2xl font-bold">{opt.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showImagePicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => setShowImagePicker(false)} 
            className="mb-4 sm:mb-6 text-white text-base sm:text-lg hover:scale-105 transition-transform bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold shadow-lg"
          >
            ← Retour
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">🖼️ Choisir une image</h2>
          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl">Chargement des images...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  onClick={() => { 
                    setSelectedImage(image); 
                    setShowImagePicker(false); 
                  }} 
                  className="cursor-pointer hover:opacity-90 transition-all transform hover:scale-105 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white border-opacity-30"
                >
                  <img 
                    src={image.url} 
                    alt={`Image ${index + 1}`} 
                    className="w-full h-32 sm:h-56 object-cover" 
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showSoundPicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => setShowSoundPicker(false)} 
            className="mb-4 sm:mb-6 text-white text-base sm:text-lg hover:scale-105 transition-transform bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold shadow-lg"
          >
            ← Retour
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">🎵 Choisir une musique</h2>
          {sounds.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl">Chargement des sons...</div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {sounds.map((sound, index) => (
                <div 
                  key={index} 
                  className="bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-white border-opacity-20"
                >
                  <p className="font-bold mb-2 sm:mb-3 text-base sm:text-xl truncate">
                    {sound.title || sound.name || `Son ${index + 1}`}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <audio 
                      controls 
                      className="flex-1 rounded-lg w-full" 
                      src={sound.file}
                    >
                      Votre navigateur ne supporte pas l'audio.
                    </audio>
                    <button 
                      onClick={() => { 
                        setSelectedSound(sound); 
                        setShowSoundPicker(false); 
                      }} 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:scale-105 transition-transform whitespace-nowrap text-sm sm:text-base"
                    >
                      Choisir ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showCategoryPicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowCategoryPicker(false)} 
            className="mb-4 sm:mb-6 text-white text-base sm:text-lg hover:scale-105 transition-transform bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold shadow-lg"
          >
            ← Retour
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">📚 Choisir une catégorie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => selectCategory(cat.id)} 
                disabled={loading} 
                className={`bg-gradient-to-br ${cat.gradient} p-6 sm:p-10 rounded-xl sm:rounded-2xl hover:scale-105 transition-all text-center disabled:opacity-50 border-2 sm:border-4 border-white border-opacity-30 shadow-2xl`}
              >
                <div className="text-5xl sm:text-7xl mb-3 sm:mb-4">{cat.emoji}</div>
                <div className="font-bold text-xl sm:text-2xl text-white">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showFontPicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => setShowFontPicker(false)} 
            className="mb-4 sm:mb-6 text-white text-base sm:text-lg hover:scale-105 transition-transform bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold shadow-lg"
          >
            ← Retour
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">🔤 Police arabe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {ARABIC_FONTS.map((font) => (
              <button 
                key={font} 
                onClick={() => { 
                  setSelectedFont(font); 
                  setShowFontPicker(false); 
                }} 
                className="bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl hover:bg-opacity-20 transition-all text-center border-2 border-white border-opacity-20 hover:scale-105"
                style={{ fontFamily: `${font}, Arial` }}
              >
                <div className="text-base sm:text-xl mb-1 sm:mb-2 font-bold truncate">{font}</div>
                <div className="text-lg sm:text-2xl" style={{ direction: 'rtl' }}>مثال نص عربي</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showFontSizePicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => setShowFontSizePicker(false)} 
            className="mb-4 sm:mb-6 text-white text-base sm:text-lg hover:scale-105 transition-transform bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold shadow-lg"
          >
            ← Retour
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">📏 Taille du texte</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
            {FONT_SIZES.map((size) => (
              <button 
                key={size.value} 
                onClick={() => { 
                  setFontSize(size.value); 
                  setShowFontSizePicker(false); 
                }} 
                className="bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-8 rounded-xl sm:rounded-2xl hover:bg-opacity-20 transition-all text-center transform hover:scale-105 border-2 border-white border-opacity-20"
              >
                <div 
                  className="mb-2 sm:mb-3 font-bold" 
                  style={{ fontSize: `${Math.min(size.value / 2, 28)}px` }}
                >
                  {size.name}
                </div>
                <div className="text-xs sm:text-sm bg-yellow-500 text-black px-2 py-1 rounded inline-block">
                  {size.value}px
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showColorPicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => setShowColorPicker(false)} 
            className="mb-4 sm:mb-6 text-white text-base sm:text-lg hover:scale-105 transition-transform bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold shadow-lg"
          >
            ← Retour
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">🎨 Couleur du texte</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-5">
            {COLORS.map((color) => (
              <button 
                key={color.value} 
                onClick={() => { 
                  setSelectedColor(color.value); 
                  setShowColorPicker(false); 
                }} 
                className="bg-white bg-opacity-10 backdrop-blur-md p-3 sm:p-6 rounded-xl sm:rounded-2xl hover:bg-opacity-20 transition-all text-center transform hover:scale-110 border-2 border-white border-opacity-20"
              >
                <div 
                  className="w-12 h-12 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 sm:mb-3 border-2 sm:border-4 border-white shadow-lg" 
                  style={{ 
                    backgroundColor: color.value, 
                    boxShadow: `0 0 20px ${color.value}` 
                  }} 
                />
                <div className="text-xs sm:text-sm font-bold">{color.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showAnimationPicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => setShowAnimationPicker(false)} 
            className="mb-4 sm:mb-6 text-white text-base sm:text-lg hover:scale-105 transition-transform bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold shadow-lg"
          >
            ← Retour
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">✨ Animation d'écran</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
            {SCREEN_ANIMATIONS.map((anim) => (
              <button 
                key={anim.value} 
                onClick={() => { 
                  setSelectedAnimation(anim.value); 
                  setShowAnimationPicker(false); 
                }} 
                className="bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl hover:bg-opacity-20 transition-all text-center border-2 border-white border-opacity-20 hover:scale-105"
              >
                <div className="text-sm sm:text-lg font-bold">{anim.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 max-w-7xl mx-auto">
        <div className="lg:w-1/3">
          <div className="lg:sticky lg:top-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-white">📱 Prévisualisation</h2>
            <div 
              className="relative bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mx-auto border-2 sm:border-4 border-white border-opacity-30" 
              style={{ width: '100%', maxWidth: '360px', aspectRatio: '9/16' }}
            >
              {selectedImage ? (
                <>
                  <img src={selectedImage.url} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p 
                      className="font-bold text-center leading-relaxed" 
                      style={{ 
                        fontFamily: `${selectedFont}, Arial`, 
                        fontSize: `${fontSize * 0.6}px`, 
                        color: selectedColor, 
                        textShadow: '0 0 10px black, 0 0 20px black', 
                        direction: 'rtl' 
                      }} 
                      suppressHydrationWarning
                    >
                      {quotes[0] || 'النص سيظهر هنا'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm sm:text-base">
                  Sélectionnez une image
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-2/3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-10 text-white">📱 Post Creator ✨</h1>
          <div className="space-y-4 sm:space-y-5">
            {/* Étape 1: Image */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-white border-opacity-20">
              <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white">Étape 1: Image 🖼️</h2>
              {selectedImage && <p className="text-xs sm:text-sm mb-2 bg-green-500 text-white px-2 py-1 rounded inline-block font-bold">✓ Image sélectionnée</p>}
              <button 
                onClick={loadImages} 
                disabled={loading} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 w-full py-3 sm:py-4 rounded-xl disabled:opacity-50 transition-all font-bold text-base sm:text-lg text-white hover:scale-105 shadow-lg"
              >
                {loading ? 'Chargement...' : selectedImage ? 'Changer l\'image' : 'Choisir une image'}
              </button>
            </div>

            {/* Étape 2: Musique */}
            <div className={`bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-white border-opacity-20 ${!canProceedToSound ? 'opacity-50' : ''}`}>
              <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white">Étape 2: Musique 🎵</h2>
              {selectedSound && <p className="text-xs sm:text-sm mb-2 bg-green-500 text-white px-2 py-1 rounded inline-block font-bold">✓ {selectedSound.title || 'Musique sélectionnée'}</p>}
              <button 
                onClick={loadSounds} 
                disabled={!canProceedToSound || loading} 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 w-full py-3 sm:py-4 rounded-xl disabled:opacity-50 transition-all font-bold text-base sm:text-lg text-white hover:scale-105 shadow-lg"
              >
                {loading ? 'Chargement...' : selectedSound ? 'Changer la musique' : 'Choisir une musique'}
              </button>
            </div>

            {/* Étape 3: Catégorie */}
            <div className={`bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-white border-opacity-20 ${!canProceedToCategory ? 'opacity-50' : ''}`}>
              <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white">Étape 3: Catégorie 📚</h2>
              {selectedCategory && <p className="text-xs sm:text-sm mb-2 bg-green-500 text-white px-2 py-1 rounded inline-block font-bold">✓ {selectedCategory} ({quotes.length} citations)</p>}
              <button 
                onClick={() => setShowCategoryPicker(true)} 
                disabled={!canProceedToCategory || loading} 
                className="bg-gradient-to-r from-orange-500 to-red-500 w-full py-3 sm:py-4 rounded-xl disabled:opacity-50 transition-all font-bold text-base sm:text-lg text-white hover:scale-105 shadow-lg"
              >
                {loading ? 'Chargement...' : selectedCategory ? 'Changer la catégorie' : 'Choisir une catégorie'}
              </button>
            </div>

            {/* Étape 4: Personnalisation */}
            <div className={`bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-white border-opacity-20 ${!canProceedToPreview ? 'opacity-50' : ''}`}>
              <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white">Étape 4: Personnalisation ✨</h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowFontPicker(true)} 
                  disabled={!canProceedToPreview} 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 py-3 sm:py-4 rounded-xl disabled:opacity-50 transition-all font-bold hover:scale-105 border-2 border-white border-opacity-30 text-sm sm:text-base text-white"
                >
                  🔤 Police
                  {selectedFont !== 'Cairo' && <div className="text-xs mt-1 truncate">✓ {selectedFont}</div>}
                </button>
                <button 
                  onClick={() => setShowFontSizePicker(true)} 
                  disabled={!canProceedToPreview} 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 py-3 sm:py-4 rounded-xl disabled:opacity-50 transition-all font-bold hover:scale-105 border-2 border-white border-opacity-30 text-sm sm:text-base text-white"
                >
                  📏 Taille
                  <div className="text-xs mt-1">{fontSize}px</div>
                </button>
                <button 
                  onClick={() => setShowColorPicker(true)} 
                  disabled={!canProceedToPreview} 
                  className="bg-gradient-to-r from-orange-500 to-red-500 py-3 sm:py-4 rounded-xl disabled:opacity-50 transition-all font-bold hover:scale-105 border-2 border-white border-opacity-30 text-sm sm:text-base text-white"
                >
                  🎨 Couleur
                  <div className="text-xs mt-1 flex items-center justify-center gap-1">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white" 
                      style={{backgroundColor: selectedColor}}
                    />
                  </div>
                </button>
                <button 
                  onClick={() => setShowAnimationPicker(true)} 
                  disabled={!canProceedToPreview} 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 py-3 sm:py-4 rounded-xl disabled:opacity-50 transition-all font-bold hover:scale-105 border-2 border-white border-opacity-30 text-sm sm:text-base text-white"
                >
                  ✨ Animation
                  {selectedAnimation !== 'none' && <div className="text-xs mt-1 truncate">✓ {selectedAnimation}</div>}
                </button>
              </div>
            </div>

            {/* Étape 5: Durée */}
            <div className={`bg-white bg-opacity-10 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-white border-opacity-20 ${!canProceedToPreview ? 'opacity-50' : ''}`}>
              <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white">Étape 5: Durée ⏱️</h2>
              <button 
                onClick={() => setShowDurationPicker(true)} 
                disabled={!canProceedToPreview} 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 w-full py-3 sm:py-4 rounded-xl disabled:opacity-50 transition-all font-bold text-base sm:text-lg hover:scale-105 border-2 border-white border-opacity-30 text-white"
              >
                ⏱️ Durée: {DURATION_OPTIONS.find(d => d.value === selectedDuration)?.name || '1 minute'}
              </button>
            </div>

            {/* Création du post */}
            {canProceedToPreview && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white border-opacity-40">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">🎬 Créer le post</h2>
                <button 
                  onClick={() => { 
                    setIsRecordingMode(false); 
                    setShowPreview(true); 
                  }} 
                  className="w-full bg-white text-green-700 py-3 sm:py-4 rounded-xl mb-2 sm:mb-3 transition-all font-bold text-base sm:text-lg hover:scale-105 shadow-lg hover:bg-gray-50"
                >
                  👁️ Prévisualiser
                </button>
                <button 
                  onClick={() => { 
                    setIsRecordingMode(true); 
                    setShowPreview(true); 
                  }} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 sm:py-4 rounded-xl transition-all font-bold text-base sm:text-lg hover:scale-105 shadow-lg"
                >
                  🎥 Création vidéo ({selectedDuration}s - HD)
                </button>
                <p className="text-xs text-white text-center mt-2 opacity-80">Format: 720x1280 • Qualité: Haute</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;