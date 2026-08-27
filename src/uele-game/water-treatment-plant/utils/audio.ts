/**
 * Procedural Web Audio API sound synthesizer for industrial plant effects.
 * Safe, zero external dependencies, works offline in any browser.
 */

class PlantSoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private waterGain: GainNode | null = null;
  private motorGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private motorOsc: OscillatorNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupContinuousLoops();
    } catch {
      console.warn('Web Audio API not supported or blocked');
    }
  }

  private setupContinuousLoops() {
    if (!this.ctx) return;

    // 1. Water Rushing (Pink Noise Buffer)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04;
      b6 = white * 0.115926;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Filter to make it sound like rushing flowing water in channels
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 650;

    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.value = 0;

    noise.connect(filter);
    filter.connect(this.waterGain);
    this.waterGain.connect(this.ctx.destination);
    noise.start(0);
    this.noiseNode = noise;

    // 2. Motor/Pump humming (Multi-harmonic low rumble)
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 58; // 58Hz electrical/pump hum

    const oscSub = this.ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.value = 116; // Harmonic

    this.motorGain = this.ctx.createGain();
    this.motorGain.gain.value = 0;

    osc.connect(this.motorGain);
    oscSub.connect(this.motorGain);
    this.motorGain.connect(this.ctx.destination);

    osc.start(0);
    oscSub.start(0);
    this.motorOsc = osc;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!this.ctx && enabled) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended' && enabled) {
      this.ctx.resume();
    }

    if (this.waterGain && this.motorGain && this.ctx) {
      const now = this.ctx.currentTime;
      if (enabled) {
        this.waterGain.gain.setTargetAtTime(0.04, now, 0.5);
        this.motorGain.gain.setTargetAtTime(0.02, now, 0.5);
      } else {
        this.waterGain.gain.setTargetAtTime(0, now, 0.2);
        this.motorGain.gain.setTargetAtTime(0, now, 0.2);
      }
    }
  }

  public playClickSound() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  public playInspectChime() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.04, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    } catch {
      // ignore
    }
  }

  public playToggleSound(active: boolean) {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const startFreq = active ? 350 : 550;
      const endFreq = active ? 650 : 280;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.1);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  }
}

export const plantAudio = new PlantSoundEngine();
