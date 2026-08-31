"use client";

// Web Audio API Procedural Sound Synthesizer (Zero asset dependencies, instant low-latency audio)

class SoundFXEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Tactile button click (Emil Kowalski style crisp click)
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {
      // Audio not permitted or inactive
    }
  }

  // Heavy bowling ball rolling on wooden lane (filtered rumble)
  public playBallRoll() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 1.0;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(260, this.ctx.currentTime + 0.9);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {}
  }

  // 10 Bowling Pins Impact & Explosion
  public playPinStrike() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      const ctx = this.ctx;
      if (!ctx) return;

      const now = ctx.currentTime;

      // Heavy wood impact thud
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = "triangle";
      thudOsc.frequency.setValueAtTime(110, now);
      thudOsc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
      thudGain.gain.setValueAtTime(0.4, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.3);

      // Metallic wood pin clatter harmonics
      const frequencies = [1200, 1650, 2100, 2800, 3400];
      frequencies.forEach((freq, i) => {
        const pinOsc = ctx.createOscillator();
        const pinGain = ctx.createGain();
        const delay = i * 0.015;

        pinOsc.type = "sine";
        pinOsc.frequency.setValueAtTime(freq + Math.random() * 200, now + delay);
        pinOsc.frequency.exponentialRampToValueAtTime(300, now + delay + 0.15);

        pinGain.gain.setValueAtTime(0.12, now + delay);
        pinGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);

        pinOsc.connect(pinGain);
        pinGain.connect(ctx.destination);

        pinOsc.start(now + delay);
        pinOsc.stop(now + delay + 0.16);
      });
    } catch {}
  }

  // Strike Celebration Fanfare Chime
  public playStrikeFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      const ctx = this.ctx;
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major Fanfare)
      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + index * 0.08;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {}
  }
}


  // Warning / Error Buzzer (e.g. already used ticket)
  public playBuzzer() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      const ctx = this.ctx;
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

export const soundFX = new SoundFXEngine();