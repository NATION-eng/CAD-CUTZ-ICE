/**
 * Zero-dependency luxury audio feedback engine using Web Audio API.
 * Guarantees 100% reliability even when offline or CDN links fail.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Luxury ascending chime for confirmed reservations & VIP ticket activation
   */
  playSuccessChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major arpeggio)

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.09);

        gain.gain.setValueAtTime(0.001, now + index * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.09);
        osc.stop(now + index * 0.09 + 0.55);
      });
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  /**
   * Smooth executive notification ping for session ready alert
   */
  playSessionReadyAlert() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [880, 1174.66]; // A5, D6

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.01, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.15 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.65);
      });

      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 150]);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Attention chime for admin when a new booking arrives
   */
  playAdminNewBooking() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.01, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle soft click sound for UI tabs and selections
   */
  playSoftClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }
}

export const soundEffects = new SoundEngine();
