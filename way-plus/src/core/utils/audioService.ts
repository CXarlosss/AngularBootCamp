/**
 * WAY+ Audio Engine v2 (Pure Web Audio API)
 * All sounds are mathematically synthesized. No external assets.
 * PWA-friendly & Offline-ready.
 */

export type SoundType = 'click' | 'hover' | 'success' | 'error' | 'chest' | 'milestone' | 'secret' | 'coins';
export type AmbientZone = 'home' | 'relax' | 'bravery' | 'shop' | 'album' | 'zen' | 'zen-forest' | 'zen-waves' | 'zen-wind' | 'none';

class AudioService {
  private static instance: AudioService;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentAmbient: { zone: AmbientZone; stop: () => void } | null = null;
  private enabled = true;

  private constructor() {}

  static getInstance() {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return { ctx: this.ctx, master: this.masterGain! };
  }

  toggle(enabled?: boolean) {
    this.enabled = enabled ?? !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.enabled ? 0.5 : 0, this.ctx?.currentTime || 0, 0.1);
    }
    return this.enabled;
  }

  // --- UI SFX SYNTHESIS ---

  playSFX(type: SoundType) {
    if (!this.enabled) return;
    const { ctx, master } = this.initContext();

    switch (type) {
      case 'click':
        this.synthPop(ctx, master);
        break;
      case 'hover':
        this.synthSparkle(ctx, master);
        break;
      case 'success':
        this.synthFanfare(ctx, master);
        break;
      case 'error':
        this.synthBloop(ctx, master);
        break;
      case 'coins':
        this.synthCoin(ctx, master);
        break;
      case 'chest':
        this.synthMagic(ctx, master);
        break;
      case 'milestone':
        this.synthEpic(ctx, master);
        break;
    }
  }

  private synthPop(ctx: AudioContext, dest: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  private synthSparkle(ctx: AudioContext, dest: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  private synthCoin(ctx: AudioContext, dest: AudioNode) {
    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.frequency.setValueAtTime(950, t);
    osc2.frequency.setValueAtTime(1200, t);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);
    
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.2);
    osc2.stop(t + 0.2);
  }

  private synthFanfare(ctx: AudioContext, dest: AudioNode) {
    const t = ctx.currentTime;
    [440, 554, 659, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, t + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.4);
    });
  }

  private synthBloop(ctx: AudioContext, dest: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  private synthMagic(ctx: AudioContext, dest: AudioNode) {
    const t = ctx.currentTime;
    for(let i=0; i<10; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(800 + Math.random() * 2000, t + i * 0.05);
      gain.gain.setValueAtTime(0.05, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.2);
    }
  }

  private synthEpic(ctx: AudioContext, dest: AudioNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.5);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 2.0);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 2.0);
  }

  // --- AMBIENT SYNTHESIS ---

  playAmbient(zone: AmbientZone) {
    if (!this.enabled) return;
    if (this.currentAmbient?.zone === zone) return;
    
    this.stopAmbient();
    const { ctx, master } = this.initContext();

    let stopFn = () => {};

    switch (zone) {
      case 'home':
        stopFn = this.startHomeAmbient(ctx, master);
        break;
      case 'relax':
        stopFn = this.startRelaxAmbient(ctx, master);
        break;
      case 'shop':
        stopFn = this.startShopAmbient(ctx, master);
        break;
      case 'zen':
        stopFn = this.startZenRain(ctx, master);
        break;
      case 'zen-forest':
        stopFn = this.startZenForest(ctx, master);
        break;
      case 'zen-waves':
        stopFn = this.startZenWaves(ctx, master);
        break;
      case 'zen-wind':
        stopFn = this.startZenWind(ctx, master);
        break;
    }

    this.currentAmbient = { zone, stop: stopFn };
  }

  stopAmbient() {
    if (this.currentAmbient) {
      this.currentAmbient.stop();
      this.currentAmbient = null;
    }
  }

  private startHomeAmbient(ctx: AudioContext, dest: AudioNode) {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1);
    gain.connect(dest);

    const playNote = (freq: number, delay: number) => {
      const osc = ctx.createOscillator();
      const nGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      nGain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
      nGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 1.5);
      osc.connect(nGain);
      nGain.connect(gain);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 2);
    };

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    let count = 0;
    const interval = setInterval(() => {
      playNote(notes[count % notes.length], 0);
      count++;
    }, 2000);

    return () => {
      clearInterval(interval);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => gain.disconnect(), 1100);
    };
  }

  private startRelaxAmbient(ctx: AudioContext, dest: AudioNode) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.frequency.value = 100;
    osc2.frequency.value = 104; // 4Hz binaural beat
    
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);
    
    osc1.start();
    osc2.start();
    
    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        gain.disconnect();
      }, 1100);
    };
  }

  private startShopAmbient(ctx: AudioContext, dest: AudioNode) {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1);
    gain.connect(dest);

    const interval = setInterval(() => {
      const osc = ctx.createOscillator();
      const nGain = ctx.createGain();
      osc.frequency.value = 800 + Math.random() * 1000;
      nGain.gain.setValueAtTime(0.05, ctx.currentTime);
      nGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(nGain);
      nGain.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }, 400);

    return () => {
      clearInterval(interval);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => gain.disconnect(), 1100);
    };
  }

  private startZenRain(ctx: AudioContext, dest: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    whiteNoise.start();

    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        whiteNoise.stop();
        gain.disconnect();
      }, 1100);
    };
  }

  private startZenForest(ctx: AudioContext, dest: AudioNode) {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
    gain.connect(dest);

    const interval = setInterval(() => {
      const osc = ctx.createOscillator();
      const nGain = ctx.createGain();
      osc.frequency.setValueAtTime(1500 + Math.random() * 1000, ctx.currentTime);
      nGain.gain.setValueAtTime(0.02, ctx.currentTime);
      nGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(nGain);
      nGain.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }, 3000);

    return () => {
      clearInterval(interval);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => gain.disconnect(), 1100);
    };
  }

  private startZenWaves(ctx: AudioContext, dest: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(dest);

    noise.connect(filter);
    filter.connect(gain);
    noise.start();

    const interval = setInterval(() => {
      const t = ctx.currentTime;
      gain.gain.linearRampToValueAtTime(0.15, t + 4);
      gain.gain.linearRampToValueAtTime(0.02, t + 8);
    }, 8000);

    return () => {
      clearInterval(interval);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => { noise.stop(); gain.disconnect(); }, 1100);
    };
  }

  private startZenWind(ctx: AudioContext, dest: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 10;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
    gain.connect(dest);

    noise.connect(filter);
    filter.connect(gain);
    noise.start();

    const interval = setInterval(() => {
      filter.frequency.exponentialRampToValueAtTime(400 + Math.random() * 600, ctx.currentTime + 2);
    }, 3000);

    return () => {
      clearInterval(interval);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => { noise.stop(); gain.disconnect(); }, 1100);
    };
  }

  // --- TTS remains but simplified ---
  speak(text: string) {
    if (!this.enabled) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 1.1;
    synth.speak(utterance);
  }
}

export const audioService = AudioService.getInstance();
