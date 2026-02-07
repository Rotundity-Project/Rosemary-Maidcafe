'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '@/components/game/GameProvider';

type SfxType = 'click' | 'success' | 'warning' | 'achievement';

interface AudioSettings {
  muted: boolean;
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  bgmVolume: number;
  sfxVolume: number;
}

interface AudioContextValue {
  settings: AudioSettings;
  setMuted: (muted: boolean) => void;
  setBgmEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  playSfx: (type: SfxType) => void;
}

const STORAGE_KEY = 'rosemary-maid-cafe-audio-settings';

const defaultSettings: AudioSettings = {
  muted: false,
  bgmEnabled: true,
  sfxEnabled: true,
  bgmVolume: 0.15,
  sfxVolume: 0.25,
};

const GameAudioContext = createContext<AudioContextValue | null>(null);

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function safeParseSettings(raw: string | null): AudioSettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    if (typeof parsed !== 'object' || !parsed) return null;
    return {
      muted: Boolean(parsed.muted),
      bgmEnabled: parsed.bgmEnabled !== false,
      sfxEnabled: parsed.sfxEnabled !== false,
      bgmVolume: typeof parsed.bgmVolume === 'number' ? clamp01(parsed.bgmVolume) : defaultSettings.bgmVolume,
      sfxVolume: typeof parsed.sfxVolume === 'number' ? clamp01(parsed.sfxVolume) : defaultSettings.sfxVolume,
    };
  } catch {
    return null;
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    return safeParseSettings(window.localStorage.getItem(STORAGE_KEY)) ?? defaultSettings;
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const lastNotificationIdRef = useRef<string | null>(null);

  const { state } = useGame();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const ensureAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    const existing = audioContextRef.current;
    if (existing) return existing;

    const webkitAudioContext = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const Ctor = window.AudioContext || webkitAudioContext;
    if (!Ctor) return null;

    const created = new Ctor();
    audioContextRef.current = created;
    return created;
  }, []);

  const resumeIfNeeded = useCallback(async () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }
  }, [ensureAudioContext]);

  useEffect(() => {
    const onUserGesture = () => {
      void resumeIfNeeded();
    };
    window.addEventListener('pointerdown', onUserGesture);
    window.addEventListener('keydown', onUserGesture);
    return () => {
      window.removeEventListener('pointerdown', onUserGesture);
      window.removeEventListener('keydown', onUserGesture);
    };
  }, [resumeIfNeeded]);

  const stopBgm = useCallback(() => {
    const nodes = bgmNodesRef.current;
    if (!nodes) return;
    try {
      nodes.osc.stop();
    } catch {}
    bgmNodesRef.current = null;
  }, []);

  const startBgm = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (bgmNodesRef.current) return;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 220;
    osc.connect(gain);
    osc.start();

    bgmNodesRef.current = { osc, gain };
  }, [ensureAudioContext]);

  useEffect(() => {
    if (settings.muted || !settings.bgmEnabled) {
      stopBgm();
      return;
    }
    startBgm();
  }, [settings.muted, settings.bgmEnabled, startBgm, stopBgm]);

  useEffect(() => {
    const nodes = bgmNodesRef.current;
    if (!nodes) return;
    const target = settings.muted || !settings.bgmEnabled ? 0 : settings.bgmVolume;
    nodes.gain.gain.setTargetAtTime(target, nodes.gain.context.currentTime, 0.05);
  }, [settings.muted, settings.bgmEnabled, settings.bgmVolume]);

  const playTone = useCallback((frequency: number, durationMs: number, volume: number, type: OscillatorType = 'sine') => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') return;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.connect(gain);

    const now = ctx.currentTime;
    const duration = durationMs / 1000;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }, [ensureAudioContext]);

  const playSfx = useCallback((type: SfxType) => {
    if (settings.muted || !settings.sfxEnabled) return;
    void resumeIfNeeded();

    const v = settings.sfxVolume;
    switch (type) {
      case 'click':
        playTone(660, 45, v * 0.5, 'square');
        break;
      case 'success':
        playTone(523.25, 80, v * 0.7, 'sine');
        playTone(659.25, 120, v * 0.7, 'sine');
        break;
      case 'warning':
        playTone(196, 140, v * 0.9, 'sawtooth');
        break;
      case 'achievement':
        playTone(784, 110, v * 0.8, 'triangle');
        playTone(988, 140, v * 0.8, 'triangle');
        break;
      default:
        break;
    }
  }, [playTone, resumeIfNeeded, settings.muted, settings.sfxEnabled, settings.sfxVolume]);

  useEffect(() => {
    const last = state.notifications[state.notifications.length - 1];
    if (!last || last.id === lastNotificationIdRef.current) {
      return;
    }
    lastNotificationIdRef.current = last.id;

    if (last.type === 'achievement') {
      playSfx('achievement');
    } else if (last.type === 'warning' || last.type === 'error') {
      playSfx('warning');
    } else if (last.type === 'success') {
      playSfx('success');
    }
  }, [playSfx, state.notifications]);

  const value = useMemo<AudioContextValue>(() => {
    return {
      settings,
      setMuted: (muted) => setSettings(s => ({ ...s, muted })),
      setBgmEnabled: (bgmEnabled) => setSettings(s => ({ ...s, bgmEnabled })),
      setSfxEnabled: (sfxEnabled) => setSettings(s => ({ ...s, sfxEnabled })),
      setBgmVolume: (bgmVolume) => setSettings(s => ({ ...s, bgmVolume: clamp01(bgmVolume) })),
      setSfxVolume: (sfxVolume) => setSettings(s => ({ ...s, sfxVolume: clamp01(sfxVolume) })),
      playSfx,
    };
  }, [playSfx, settings]);

  return <GameAudioContext.Provider value={value}>{children}</GameAudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(GameAudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
}

export default AudioProvider;

