'use client';
import { useState, useEffect, useRef } from 'react';

// Types TypeScript stricts
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

// 20 polices arabes de Google Fonts
const ARABIC_FONTS = [
  'Amiri', 'Cairo', 'Tajawal', 'Almarai', 'El Messiri',
  'Reem Kufi', 'Mada', 'Harmattan', 'Markazi Text', 'Scheherazade New',
  'Aref Ruqaa', 'Lemonada', 'Jomhuria', 'Lalezar', 'Mirza',
  'Rakkas', 'Katibeh', 'Kufam', 'Vibes', 'Noto Naskh Arabic'
];

// Tailles de police
const FONT_SIZES = [
  { name: 'Très petit', value: 24 },
  { name: 'Petit', value: 32 },
  { name: 'Moyen', value: 40 },
  { name: 'Grand', value: 48 },
  { name: 'Très grand', value: 56 },
  { name: 'Énorme', value: 64 }
];

// 10 couleurs vives
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

// 20 animations d'écran
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

function Preview({ image, sound, quotes, onClose, isRecording = false, selectedFont, selectedColor, selectedAnimation, fontSize }: PreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const createParticle = (type: string): Particle => {
    const id = Date.now() + Math.random();
    const baseParticle = {
      id,
      x: Math.random() * 450,
      y: -20,
      size: 0,
      opacity: 0,
      vx: 0,
      vy: 0,
      color: '#FFFFFF'
    };

    switch(type) {
      case 'snow':
        return { ...baseParticle, size: Math.random() * 8 + 4, vy: Math.random() * 2 + 1, vx: Math.sin(Date.now()) * 0.5, opacity: Math.random() * 0.6 + 0.4, color: '#FFFFFF' };
      case 'stars':
        return { ...baseParticle, x: Math.random() * 450, y: Math.random() * 800, size: Math.random() * 3 + 1, vy: 0, opacity: Math.random(), color: '#FFFF00' };
      case 'rain':
        return { ...baseParticle, size: Math.random() * 3 + 2, vy: Math.random() * 5 + 5, opacity: 0.7, color: '#87CEEB' };
      case 'bubbles':
        return { ...baseParticle, y: 820, size: Math.random() * 20 + 10, vy: -(Math.random() * 2 + 1), vx: Math.random() * 2 - 1, opacity: 0.5, color: '#00FFFF' };
      case 'confetti':
        return { ...baseParticle, size: Math.random() * 8 + 4, vy: Math.random() * 3 + 2, vx: Math.random() * 4 - 2, opacity: 1, color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'][Math.floor(Math.random() * 5)] };
      case 'leaves':
        return { ...baseParticle, size: Math.random() * 12 + 8, vy: Math.random() * 1.5 + 0.5, vx: Math.sin(Date.now()) * 2, opacity: 0.8, color: ['#228B22', '#FFD700', '#FF8C00'][Math.floor(Math.random() * 3)] };
      case 'butterflies':
        return { ...baseParticle, size: Math.random() * 15 + 10, vy: Math.random() * 1 + 0.5, vx: Math.sin(Date.now() * 0.1) * 3, opacity: 0.9, color: ['#FFB6C1', '#FF69B4', '#DDA0DD'][Math.floor(Math.random() * 3)] };
      case 'hearts':
        return { ...baseParticle, size: Math.random() * 15 + 10, vy: Math.random() * 2 + 1, vx: Math.random() * 2 - 1, opacity: 0.8, color: '#FF1493' };
      case 'particles':
        return { ...baseParticle, x: Math.random() * 450, y: Math.random() * 800, size: Math.random() * 4 + 2, vy: Math.random() * 0.5 - 0.25, vx: Math.random() * 0.5 - 0.25, opacity: Math.random() * 0.5 + 0.5, color: '#FFFFFF' };
      case 'light':
        return { ...baseParticle, x: Math.random() * 450, y: Math.random() * 800, size: Math.random() * 6 + 3, vy: 0, opacity: Math.random() * 0.3 + 0.2, color: '#FFFFE0' };
      case 'fire':
        return { ...baseParticle, y: 820, size: Math.random() * 20 + 10, vy: -(Math.random() * 3 + 2), vx: Math.random() * 2 - 1, opacity: Math.random() * 0.7 + 0.3, color: ['#FF4500', '#FF6347', '#FFD700'][Math.floor(Math.random() * 3)] };
      case 'smoke':
        return { ...baseParticle, y: 820, size: Math.random() * 30 + 20, vy: -(Math.random() * 1 + 0.5), vx: Math.random() * 1 - 0.5, opacity: Math.random() * 0.3 + 0.1, color: '#808080' };
      case 'clouds':
        return { ...baseParticle, x: -50, y: Math.random() * 400, size: Math.random() * 50 + 40, vy: 0, vx: Math.random() * 0.5 + 0.2, opacity: 0.4, color: '#F0F8FF' };
      case 'petals':
        return { ...baseParticle, size: Math.random() * 10 + 6, vy: Math.random() * 1.5 + 0.8, vx: Math.sin(Date.now() * 0.01) * 1.5, opacity: 0.7, color: ['#FFB6C1', '#FF69B4', '#FFC0CB'][Math.floor(Math.random() * 3)] };
      case 'sparkles':
        return { ...baseParticle, x: Math.random() * 450, y: Math.random() * 800, size: Math.random() * 5 + 2, vy: 0, opacity: Math.random(), color: ['#FFFFFF', '#FFD700', '#00FFFF'][Math.floor(Math.random() * 3)] };
      case 'aurora':
        return { ...baseParticle, x: Math.random() * 450, y: Math.random() * 800, size: Math.random() * 100 + 50, vy: Math.random() * 0.2, vx: Math.random() * 0.2 - 0.1, opacity: 0.1, color: ['#00FF00', '#00FFFF', '#FF00FF'][Math.floor(Math.random() * 3)] };
      case 'plasma':
        return { ...baseParticle, x: Math.random() * 450, y: Math.random() * 800, size: Math.random() * 80 + 40, vy: Math.random() * 0.5 - 0.25, vx: Math.random() * 0.5 - 0.25, opacity: 0.2, color: ['#FF00FF', '#00FFFF', '#FFFF00'][Math.floor(Math.random() * 3)] };
      case 'waves':
        return { ...baseParticle, x: Math.random() * 450, y: 700 + Math.random() * 100, size: Math.random() * 40 + 30, vy: Math.sin(Date.now() * 0.001) * 2, vx: 0, opacity: 0.3, color: '#4682B4' };
      case 'circles':
        return { ...baseParticle, x: 225, y: 400, size: Math.random() * 100 + 50, vy: 0, vx: 0, opacity: Math.random() * 0.1 + 0.05, color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][Math.floor(Math.random() * 4)] };
      default:
        return baseParticle;
    }
  };

  const updateParticle = (particle: Particle, type: string): Particle => {
    let newParticle = { ...particle };
    
    newParticle.x += newParticle.vx;
    newParticle.y += newParticle.vy;

    if (type === 'stars' || type === 'sparkles') {
      newParticle.opacity = Math.sin(Date.now() * 0.005 + particle.id) * 0.5 + 0.5;
    }

    if (type === 'circles') {
      newParticle.size += 0.5;
      newParticle.opacity -= 0.001;
    }

    return newParticle;
  };

  const isParticleOutOfBounds = (particle: Particle, type: string): boolean => {
    if (type === 'bubbles') return particle.y < -50;
    if (type === 'clouds') return particle.x > 500;
    if (type === 'circles') return particle.opacity <= 0 || particle.size > 200;
    if (['stars', 'light', 'sparkles', 'aurora', 'plasma', 'particles'].includes(type)) return false;
    return particle.y > 850 || particle.x < -50 || particle.x > 500;
  };

  const togglePause = () => {
    if (audio) {
      if (isPaused) {
        audio.play();
      } else {
        audio.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const startPreview = async () => {
    try {
      const newAudio = new Audio(sound.file);
      setAudio(newAudio);
      await newAudio.play();
      setIsStarted(true);

      if (isRecording) {
        startVideoGeneration(newAudio);
      }

      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= quotes.length - 1) {
            clearInterval(interval);
            newAudio.pause();
            return prev;
          }
          return prev + 1;
        });
      }, 5000);

      (newAudio as any).__intervalId = interval;
    } catch (error) {
      console.error('Erreur audio:', error);
      setIsStarted(true);
    }
  };

  const startVideoGeneration = async (audioElement: HTMLAudioElement) => {
    try {
      setRecordingStatus('🎬 Initialisation de la création vidéo...');
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      canvas.width = 720;
      canvas.height = 1280;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = image.url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setRecordingStatus('🎬 Configuration audio/vidéo...');

      const fps = 30;
      const duration = 60;
      const totalFrames = fps * duration;
      const quoteDuration = 5;
      const framesPerQuote = fps * quoteDuration;

      const videoStream = canvas.captureStream(fps);
      
      const audioContext = new AudioContext();
      const recordAudio = new Audio(sound.file);
      recordAudio.crossOrigin = 'anonymous';
      
      const source = audioContext.createMediaElementSource(recordAudio);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log('VP9 non supporté, utilisation VP8');
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }

      const mediaRecorder = new MediaRecorder(combinedStream, options);

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setRecordingStatus('💾 Création du fichier vidéo...');
        const blob = new Blob(chunks, { type: 'video/webm' });
        downloadVideo(blob);
        audioContext.close();
        recordAudio.pause();
        recordAudio.src = '';
      };

      mediaRecorder.start(1000);
      await recordAudio.play();
      setRecordingStatus('🔴 Création vidéo en cours...');

      // Fonction pour créer les particules selon le type d'animation
      const createVideoParticle = (index: number, animType: string): Particle => {
        const baseX = ((index * 37) % 720);
        const baseY = ((index * 53) % 1280);
        const baseSize = ((index * 7) % 10) + 5;
        const baseOpacity = ((index * 11) % 60 + 40) / 100;
        
        switch(animType) {
          case 'snow':
            return { id: index, x: baseX, y: baseY, size: baseSize, vx: Math.sin(index) * 0.5, vy: ((index * 5) % 3) + 1, opacity: baseOpacity, color: '#FFFFFF' };
          case 'stars':
            return { id: index, x: baseX, y: baseY, size: ((index * 3) % 3) + 1, vx: 0, vy: 0, opacity: ((index * 13) % 100) / 100, color: '#FFFF00' };
          case 'rain':
            return { id: index, x: baseX, y: -20 - (index * 50), size: ((index * 3) % 3) + 2, vx: 0, vy: ((index * 5) % 5) + 5, opacity: 0.7, color: '#87CEEB' };
          case 'bubbles':
            return { id: index, x: baseX, y: 1280 + (index * 30), size: ((index * 20) % 20) + 10, vx: ((index * 4) % 4 - 2) / 2, vy: -(((index * 2) % 2) + 1), opacity: 0.5, color: '#00FFFF' };
          case 'confetti':
            const confettiColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
            return { id: index, x: baseX, y: -20 - (index * 50), size: ((index * 8) % 8) + 4, vx: ((index * 8) % 8 - 4) / 2, vy: ((index * 3) % 3) + 2, opacity: 1, color: confettiColors[index % 5] };
          case 'leaves':
            const leafColors = ['#228B22', '#FFD700', '#FF8C00'];
            return { id: index, x: baseX, y: -20 - (index * 60), size: ((index * 12) % 12) + 8, vx: Math.sin(index * 2) * 2, vy: ((index * 3) % 3) + 0.5, opacity: 0.8, color: leafColors[index % 3] };
          case 'butterflies':
            const butterflyColors = ['#FFB6C1', '#FF69B4', '#DDA0DD'];
            return { id: index, x: baseX, y: baseY, size: ((index * 15) % 15) + 10, vx: Math.sin(index * 0.1) * 3, vy: ((index * 2) % 2) + 0.5, opacity: 0.9, color: butterflyColors[index % 3] };
          case 'hearts':
            return { id: index, x: baseX, y: -20 - (index * 50), size: ((index * 15) % 15) + 10, vx: ((index * 4) % 4 - 2) / 2, vy: ((index * 2) % 2) + 1, opacity: 0.8, color: '#FF1493' };
          case 'particles':
            return { id: index, x: baseX, y: baseY, size: ((index * 4) % 4) + 2, vx: ((index * 10) % 10 - 5) / 20, vy: ((index * 10) % 10 - 5) / 20, opacity: ((index * 5) % 50 + 50) / 100, color: '#FFFFFF' };
          case 'light':
            return { id: index, x: baseX, y: baseY, size: ((index * 6) % 6) + 3, vx: 0, vy: 0, opacity: ((index * 3) % 30 + 20) / 100, color: '#FFFFE0' };
          case 'fire':
            const fireColors = ['#FF4500', '#FF6347', '#FFD700'];
            return { id: index, x: baseX, y: 1280 + (index * 40), size: ((index * 20) % 20) + 10, vx: ((index * 4) % 4 - 2) / 2, vy: -(((index * 3) % 3) + 2), opacity: ((index * 7) % 70 + 30) / 100, color: fireColors[index % 3] };
          case 'smoke':
            return { id: index, x: baseX, y: 1280 + (index * 50), size: ((index * 30) % 30) + 20, vx: ((index * 2) % 2 - 1) / 2, vy: -(((index * 2) % 2) + 0.5), opacity: ((index * 3) % 30 + 10) / 100, color: '#808080' };
          case 'clouds':
            return { id: index, x: -50 - (index * 100), y: ((index * 400) % 400), size: ((index * 50) % 50) + 40, vx: ((index * 5) % 5 + 2) / 10, vy: 0, opacity: 0.4, color: '#F0F8FF' };
          case 'petals':
            const petalColors = ['#FFB6C1', '#FF69B4', '#FFC0CB'];
            return { id: index, x: baseX, y: -20 - (index * 50), size: ((index * 10) % 10) + 6, vx: Math.sin(index * 0.01) * 1.5, vy: ((index * 3) % 3) + 0.8, opacity: 0.7, color: petalColors[index % 3] };
          case 'sparkles':
            const sparkleColors = ['#FFFFFF', '#FFD700', '#00FFFF'];
            return { id: index, x: baseX, y: baseY, size: ((index * 5) % 5) + 2, vx: 0, vy: 0, opacity: ((index * 10) % 100) / 100, color: sparkleColors[index % 3] };
          case 'aurora':
            const auroraColors = ['#00FF00', '#00FFFF', '#FF00FF'];
            return { id: index, x: baseX, y: baseY, size: ((index * 100) % 100) + 50, vx: ((index * 4) % 4 - 2) / 20, vy: ((index * 2) % 2) / 10, opacity: 0.1, color: auroraColors[index % 3] };
          case 'plasma':
            const plasmaColors = ['#FF00FF', '#00FFFF', '#FFFF00'];
            return { id: index, x: baseX, y: baseY, size: ((index * 80) % 80) + 40, vx: ((index * 10) % 10 - 5) / 20, vy: ((index * 10) % 10 - 5) / 20, opacity: 0.2, color: plasmaColors[index % 3] };
          case 'waves':
            return { id: index, x: baseX, y: 700 + ((index * 100) % 100), size: ((index * 40) % 40) + 30, vx: 0, vy: Math.sin(index * 0.001) * 2, opacity: 0.3, color: '#4682B4' };
          case 'circles':
            const circleColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
            return { id: index, x: 360, y: 640, size: ((index * 100) % 100) + 50, vx: 0, vy: 0, opacity: ((index * 10) % 10 + 5) / 100, color: circleColors[index % 4] };
          default:
            return { id: index, x: baseX, y: baseY, size: baseSize, vx: 0, vy: 0, opacity: 0, color: '#FFFFFF' };
        }
      };

      let particlesArray: Particle[] = [];
      if (selectedAnimation !== 'none') {
        particlesArray = Array.from({ length: 30 }, (_, i) => createVideoParticle(i, selectedAnimation));
      }

      let frameCount = 0;

      // Utiliser une fonction qui dessine CHAQUE frame individuellement
      const renderFrame = () => {
        if (frameCount >= totalFrames) {
          mediaRecorder.stop();
          recordAudio.pause();
          return;
        }

        // Sauvegarder l'état du canvas
        ctx.save();
        
        // Dessiner l'image de fond
        ctx.drawImage(img, 0, 0, 720, 1280);
        
        // Overlay sombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, 720, 1280);

        // Dessiner les particules selon l'animation choisie
        if (selectedAnimation !== 'none') {
          particlesArray.forEach(particle => {
            ctx.save();
            
            if (selectedAnimation === 'hearts') {
              ctx.fillStyle = particle.color;
              ctx.globalAlpha = particle.opacity;
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.fill();
            } else if (selectedAnimation === 'stars' || selectedAnimation === 'sparkles') {
              ctx.fillStyle = particle.color;
              ctx.globalAlpha = particle.opacity;
              ctx.shadowBlur = 20;
              ctx.shadowColor = particle.color;
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              ctx.closePath();
              ctx.fill();
            } else {
              ctx.fillStyle = particle.color;
              ctx.globalAlpha = particle.opacity;
              if (['aurora', 'plasma', 'light'].includes(selectedAnimation)) {
                ctx.shadowBlur = particle.size;
                ctx.shadowColor = particle.color;
              } else {
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
              }
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              ctx.closePath();
              ctx.fill();
            }
            
            ctx.restore();

            // Mettre à jour la position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Effets spéciaux
            if (selectedAnimation === 'stars' || selectedAnimation === 'sparkles') {
              particle.opacity = Math.abs(Math.sin(frameCount * 0.05 + particle.id));
            }

            if (selectedAnimation === 'circles') {
              particle.size += 0.5;
              particle.opacity -= 0.001;
              if (particle.opacity <= 0 || particle.size > 200) {
                particle.size = 50;
                particle.opacity = 0.1;
                particle.x = 360;
                particle.y = 640;
              }
            }

            // Réinitialiser les particules hors écran
            if (selectedAnimation === 'bubbles' || selectedAnimation === 'fire' || selectedAnimation === 'smoke') {
              if (particle.y < -50) {
                particle.y = 1280;
                particle.x = (particle.id * 37) % 720;
              }
            } else if (selectedAnimation === 'clouds') {
              if (particle.x > 770) {
                particle.x = -50;
                particle.y = (particle.id * 400) % 400;
              }
            } else if (!['stars', 'light', 'sparkles', 'aurora', 'plasma', 'particles', 'circles'].includes(selectedAnimation)) {
              if (particle.y > 1280) {
                particle.y = -20;
                particle.x = (particle.id * 37) % 720;
              }
            }
          });
        }

        // Dessiner le texte
        const quoteIndex = Math.floor(frameCount / framesPerQuote) % quotes.length;
        const quote = quotes[quoteIndex];

        ctx.fillStyle = selectedColor;
        ctx.font = `bold ${Math.floor(fontSize * 720 / 450)}px ${selectedFont}, Arial`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'black';
        ctx.direction = 'rtl';
        ctx.globalAlpha = 1.0;

        const maxWidth = 600;
        const words = quote.split(' ');
        const lines: string[] = [];
        let currentLine = '';

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
        
        const progress = (frameCount / totalFrames) * 100;
        setRecordingProgress(Math.floor(progress));

        animationFrameRef.current = requestAnimationFrame(renderFrame);
      };

      renderFrame();

    } catch (error) {
      console.error('Erreur génération vidéo:', error);
      setRecordingStatus('❌ Erreur lors de la création');
      alert('Erreur: ' + (error as Error).message);
    }
  };

  const downloadVideo = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setRecordingStatus('✅ Vidéo téléchargée avec succès !');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (!isStarted || isRecording || !isMounted || selectedAnimation === 'none') return;

    const initialParticles = Array.from({ length: 20 }, () => createParticle(selectedAnimation));
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticle = createParticle(selectedAnimation);
        const updated = prev
          .map(p => updateParticle(p, selectedAnimation))
          .filter(p => !isParticleOutOfBounds(p, selectedAnimation));
        return [...updated, newParticle].slice(0, 50);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isStarted, isRecording, isMounted, selectedAnimation]);

  useEffect(() => {
    return () => {
      if (audio) {
        const intervalId = (audio as any).__intervalId;
        if (intervalId) clearInterval(intervalId);
        audio.pause();
        audio.src = '';
        audio.load();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audio]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex items-center justify-center">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=${ARABIC_FONTS.join('&family=')}:wght@400;700&display=swap');
      `}</style>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <button 
        onClick={onClose}
        className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg z-50 hover:bg-opacity-90 transition"
      >
        ← Retour
      </button>
      
      {isRecording && recordingStatus && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50">
          {recordingStatus} {recordingProgress > 0 && `${recordingProgress}%`}
        </div>
      )}
      
      {isStarted && !isRecording && (
        <button 
          onClick={togglePause}
          className="absolute top-20 left-4 bg-blue-600 bg-opacity-70 text-white px-4 py-2 rounded-lg z-50 hover:bg-opacity-90 transition"
        >
          {isPaused ? '▶ Reprendre' : '⏸ Pause'}
        </button>
      )}
      
      <div 
        ref={containerRef}
        className="relative bg-black rounded-3xl overflow-hidden shadow-2xl" 
        style={{ width: '450px', height: '800px' }}
      >
        <img 
          src={image.url} 
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black opacity-40" />
        
        {isStarted && !isRecording && particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
              transition: 'all 0.1s linear'
            }}
          />
        ))}
        
        {!isStarted ? (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <button
              onClick={startPreview}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg transition"
            >
              ▶ Démarrer {isRecording ? 'la création vidéo' : 'la prévisualisation'}
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <div className="text-white text-center px-8">
              <p 
                className="font-bold leading-relaxed"
                style={{ 
                  fontFamily: `${selectedFont}, Arial`,
                  fontSize: `${fontSize}px`,
                  color: selectedColor,
                  textShadow: '0 0 10px black, 0 0 20px black, 2px 2px 4px black',
                  direction: 'rtl'
                }}
              >
                {quotes[currentIndex]}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [sounds, setSounds] = useState<SoundData[]>([]);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAnimationPicker, setShowAnimationPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [selectedSound, setSelectedSound] = useState<SoundData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState('Cairo');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedAnimation, setSelectedAnimation] = useState('none');
  const [fontSize, setFontSize] = useState(40);
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://gamedrivne.github.io/wallpapers-api/data.json');
      const data = await response.json();
      setImages(data.wallpapers || []);
      setShowImagePicker(true);
    } catch (error) {
      console.error('Erreur chargement images:', error);
      alert('Erreur lors du chargement des images');
    }
    setLoading(false);
  };

  const loadSounds = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://gamedrivne.github.io/Sounds/sounds.json');
      const data = await response.json();
      setSounds(data.sounds || []);
      setShowSoundPicker(true);
    } catch (error) {
      console.error('Erreur chargement sons:', error);
      alert('Erreur lors du chargement des musiques');
    }
    setLoading(false);
  };

  const loadCategories = () => {
    setShowCategoryPicker(true);
  };

  const selectImage = (image: ImageData) => {
    setSelectedImage(image);
    setShowImagePicker(false);
  };

  const selectSound = (sound: SoundData) => {
    setSelectedSound(sound);
    setShowSoundPicker(false);
  };

  const selectCategory = async (category: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://gamedrivne.github.io/qts/api/${category}.json`);
      const data = await response.json();
      setQuotes(data.quotes || []);
      setSelectedCategory(category);
      setShowCategoryPicker(false);
    } catch (error) {
      console.error('Erreur chargement citations:', error);
      alert('Erreur lors du chargement des citations');
    }
    setLoading(false);
  };

  if (!isMounted) {
    return null;
  }

  if (showPreview && selectedImage && selectedSound) {
    return <Preview 
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
    />;
  }

  if (showImagePicker) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowImagePicker(false)} 
            className="mb-4 text-blue-400 text-lg hover:text-blue-300 transition"
          >
            ← Retour
          </button>
          <h2 className="text-2xl font-bold mb-4">Choisir une image</h2>
          <div className="grid grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div 
                key={index} 
                onClick={() => selectImage(image)} 
                className="cursor-pointer hover:opacity-80 transition transform hover:scale-105"
              >
                <img 
                  src={image.url} 
                  alt={`Image ${index + 1}`} 
                  className="w-full h-48 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showSoundPicker) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setShowSoundPicker(false)} 
            className="mb-4 text-blue-400 text-lg hover:text-blue-300 transition"
          >
            ← Retour
          </button>
          <h2 className="text-2xl font-bold mb-4">Choisir une musique</h2>
          <div className="space-y-3">
            {sounds.map((sound, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold mb-2">
                  {sound.title || sound.name || `Son ${index + 1}`}
                </p>
                <div className="flex gap-2">
                  <audio controls className="flex-1" src={sound.file}>
                    Votre navigateur ne supporte pas l'audio.
                  </audio>
                  <button 
                    onClick={() => selectSound(sound)} 
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
                  >
                    Choisir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showCategoryPicker) {
    const categories = [
      { id: 'hikam', name: 'Hikam', emoji: '📿' },
      { id: 'love', name: 'Love', emoji: '❤️' },
      { id: 'women', name: 'Women', emoji: '👩' },
      { id: 'dunya', name: 'Dunya', emoji: '🌍' }
    ];
    
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setShowCategoryPicker(false)} 
            className="mb-4 text-blue-400 text-lg hover:text-blue-300 transition"
          >
            ← Retour
          </button>
          <h2 className="text-2xl font-bold mb-4">Choisir une catégorie</h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                disabled={loading}
                className="bg-gray-800 p-8 rounded-lg hover:bg-gray-700 transition text-center disabled:opacity-50 transform hover:scale-105"
              >
                <div className="text-5xl mb-2">{cat.emoji}</div>
                <div className="font-semibold text-lg">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showFontPicker) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=${ARABIC_FONTS.join('&family=')}:wght@400;700&display=swap');
        `}</style>
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowFontPicker(false)} 
            className="mb-4 text-blue-400 text-lg hover:text-blue-300 transition"
          >
            ← Retour
          </button>
          <h2 className="text-2xl font-bold mb-4">Choisir une police arabe</h2>
          <div className="grid grid-cols-2 gap-3">
            {ARABIC_FONTS.map((font) => (
              <button
                key={font}
                onClick={() => {
                  setSelectedFont(font);
                  setShowFontPicker(false);
                }}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition text-center"
                style={{ fontFamily: `${font}, Arial` }}
              >
                <div className="text-2xl mb-2">{font}</div>
                <div className="text-lg" style={{ direction: 'rtl' }}>مثال نص عربي</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showFontSizePicker) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowFontSizePicker(false)} 
            className="mb-4 text-blue-400 text-lg hover:text-blue-300 transition"
          >
            ← Retour
          </button>
          <h2 className="text-2xl font-bold mb-4">Choisir la taille du texte</h2>
          <div className="grid grid-cols-3 gap-4">
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => {
                  setFontSize(size.value);
                  setShowFontSizePicker(false);
                }}
                className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition text-center transform hover:scale-105"
              >
                <div className="mb-2" style={{ fontSize: `${size.value / 2}px` }}>{size.name}</div>
                <div className="text-sm text-gray-400">{size.value}px</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showColorPicker) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowColorPicker(false)} 
            className="mb-4 text-blue-400 text-lg hover:text-blue-300 transition"
          >
            ← Retour
          </button>
          <h2 className="text-2xl font-bold mb-4">Choisir une couleur</h2>
          <div className="grid grid-cols-5 gap-4">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  setSelectedColor(color.value);
                  setShowColorPicker(false);
                }}
                className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition text-center transform hover:scale-105"
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white"
                  style={{ backgroundColor: color.value }}
                />
                <div className="text-sm">{color.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showAnimationPicker) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowAnimationPicker(false)} 
            className="mb-4 text-blue-400 text-lg hover:text-blue-300 transition"
          >
            ← Retour
          </button>
          <h2 className="text-2xl font-bold mb-4">Choisir une animation d'écran</h2>
          <div className="grid grid-cols-2 gap-3">
            {SCREEN_ANIMATIONS.map((anim) => (
              <button
                key={anim.value}
                onClick={() => {
                  setSelectedAnimation(anim.value);
                  setShowAnimationPicker(false);
                }}
                className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition text-center"
              >
                <div className="text-lg font-bold">{anim.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex gap-6 max-w-7xl mx-auto">
        <div className="w-1/3">
          <div className="sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-center">📱 Prévisualisation</h2>
            <div 
              className="relative bg-black rounded-3xl overflow-hidden shadow-2xl mx-auto border-8 border-gray-800" 
              style={{ width: '360px', height: '640px' }}
            >
              {selectedImage ? (
                <>
                  <img 
                    src={selectedImage.url} 
                    alt="Preview"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p 
                      className="font-bold text-center px-6 leading-relaxed"
                      style={{ 
                        fontFamily: `${selectedFont}, Arial`,
                        fontSize: `${fontSize * 0.8}px`,
                        color: selectedColor,
                        textShadow: '0 0 10px black, 0 0 20px black, 2px 2px 4px black',
                        direction: 'rtl'
                      }}
                      suppressHydrationWarning
                    >
                      {quotes[0] || 'النص سيظهر هنا'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Sélectionnez une image
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-2/3">
          <h1 className="text-4xl font-bold text-center mb-8">📱 Post Creator</h1>
          <div className="space-y-4">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Étape 1: Image de fond</h2>
              {selectedImage && (
                <p className="text-sm text-green-400 mb-2">✓ Image sélectionnée</p>
              )}
              <button 
                onClick={loadImages} 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg disabled:bg-gray-600 transition"
              >
                {loading ? 'Chargement...' : selectedImage ? 'Changer l\'image' : 'Choisir une image'}
              </button>
            </div>

            <div className={`bg-gray-800 p-6 rounded-lg ${!selectedImage ? 'opacity-50' : ''}`}>
              <h2 className="text-xl font-semibold mb-2">Étape 2: Musique</h2>
              {selectedSound && (
                <p className="text-sm text-green-400 mb-2">
                  ✓ {selectedSound.title || selectedSound.name || 'Musique sélectionnée'}
                </p>
              )}
              <button 
                onClick={loadSounds} 
                disabled={!selectedImage || loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg disabled:bg-gray-600 transition"
              >
                {loading ? 'Chargement...' : selectedSound ? 'Changer la musique' : 'Choisir une musique'}
              </button>
            </div>

            <div className={`bg-gray-800 p-6 rounded-lg ${!selectedSound ? 'opacity-50' : ''}`}>
              <h2 className="text-xl font-semibold mb-2">Étape 3: Catégorie</h2>
              {selectedCategory && (
                <p className="text-sm text-green-400 mb-2">
                  ✓ Catégorie: {selectedCategory} ({quotes.length} citations)
                </p>
              )}
              <button 
                onClick={loadCategories} 
                disabled={!selectedSound || loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg disabled:bg-gray-600 transition"
              >
                {loading ? 'Chargement...' : selectedCategory ? 'Changer la catégorie' : 'Choisir une catégorie'}
              </button>
            </div>

            <div className={`bg-gray-800 p-6 rounded-lg ${!selectedCategory ? 'opacity-50' : ''}`}>
              <h2 className="text-xl font-semibold mb-2">Étape 4: Personnalisation</h2>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowFontPicker(true)} 
                  disabled={!selectedCategory} 
                  className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg disabled:bg-gray-600 transition"
                >
                  🔤 Police
                  {selectedFont !== 'Cairo' && <div className="text-xs mt-1">✓ {selectedFont}</div>}
                </button>
                <button 
                  onClick={() => setShowFontSizePicker(true)} 
                  disabled={!selectedCategory} 
                  className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg disabled:bg-gray-600 transition"
                >
                  📏 Taille
                  <div className="text-xs mt-1">{fontSize}px</div>
                </button>
                <button 
                  onClick={() => setShowColorPicker(true)} 
                  disabled={!selectedCategory} 
                  className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg disabled:bg-gray-600 transition"
                >
                  🎨 Couleur
                  <div className="text-xs mt-1 flex items-center justify-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-white" style={{backgroundColor: selectedColor}}></div>
                  </div>
                </button>
                <button 
                  onClick={() => setShowAnimationPicker(true)} 
                  disabled={!selectedCategory} 
                  className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg disabled:bg-gray-600 transition"
                >
                  ✨ Animation
                  {selectedAnimation !== 'none' && <div className="text-xs mt-1">✓ {selectedAnimation}</div>}
                </button>
              </div>
            </div>

            {quotes.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">🎬 Créer le post</h2>
                <button 
                  onClick={() => {
                    setIsRecordingMode(false);
                    setShowPreview(true);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg mb-2 transition"
                >
                  👁️ Prévisualiser
                </button>
                <button 
                  onClick={() => {
                    setIsRecordingMode(true);
                    setShowPreview(true);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg transition"
                >
                  🎥 Création vidéo (720x1280, 60s)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
