/**
 * High-performance, non-blocking luxury audio feedback engine using Web Audio API.
 * Optimized for zero main-thread blocking (INP < 16ms) by offloading audio synthesis
 * to asynchronous macrotask queues so UI repaints and React state updates occur instantly.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isResuming: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          return null;
        }
      }
    }

    if (this.ctx && this.ctx.state === "suspended" && !this.isResuming) {
      this.isResuming = true;
      this.ctx.resume()
        .catch(() => {})
        .finally(() => {
          this.isResuming = false;
        });
    }

    return this.ctx;
  }

  /**
   * Schedules sound execution asynchronously so the calling event handler
   * returns in 0ms, preventing INP (Interaction to Next Paint) latency penalties.
   */
  private defer(fn: () => void) {
    if (typeof window === "undefined") return;
    // Use setTimeout 0 to allow the browser to paint the UI update immediately
    setTimeout(fn, 0);
  }

  /**
   * Luxury ascending chime for confirmed reservations & VIP ticket activation
   */
  playSuccessChime() {
    this.defer(() => {
      try {
        const ctx = this.getContext();
        if (!ctx || ctx.state === "suspended") return;

        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major arpeggio)

        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + index * 0.08);

          gain.gain.setValueAtTime(0.001, now + index * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + index * 0.08);
          osc.stop(now + index * 0.08 + 0.5);
        });
      } catch {
        // AudioContext might be unavailable
      }
    });
  }

  /**
   * Smooth executive notification ping for session ready alert
   */
  playSessionReadyAlert() {
    this.defer(() => {
      try {
        const ctx = this.getContext();
        if (!ctx || ctx.state === "suspended") return;

        const now = ctx.currentTime;
        const freqs = [880, 1174.66]; // A5, D6

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.01, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.12 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.55);
        });

        if ("vibrate" in navigator) {
          try {
            navigator.vibrate([100, 50, 150]);
          } catch {}
        }
      } catch {
        // Ignore
      }
    });
  }

  /**
   * Attention chime for admin when a new booking arrives
   */
  playAdminNewBooking() {
    this.defer(() => {
      try {
        const ctx = this.getContext();
        if (!ctx || ctx.state === "suspended") return;

        const now = ctx.currentTime;
        const notes = [587.33, 880, 1174.66]; // D5, A5, D6

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.01, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.45);
        });
      } catch {
        // Ignore
      }
    });
  }

  /**
   * Subtle soft click sound for UI tabs and selections (completely non-blocking)
   */
  playSoftClick() {
    this.defer(() => {
      try {
        const ctx = this.getContext();
        if (!ctx || ctx.state === "suspended") return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } catch {
        // Ignore
      }
    });
  }
}

export const soundEffects = new SoundEngine();
