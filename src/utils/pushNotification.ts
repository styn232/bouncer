// Push Notification and Romantic Audio Chime Utility for Dating With Bouncer

export interface NewSinglePayload {
  name?: string;
  age: number;
  city?: string;
  location: string;
  photo?: string;
  profileId?: string;
  gender?: 'male' | 'female' | string;
}

/**
 * Check if the browser supports standard Web Push / Notification API
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getPushPermission(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request permission from the user to send browser push notifications
 */
export async function requestPushPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isPushNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('bouncer_push_alerts_enabled', 'true');
    } else {
      localStorage.setItem('bouncer_push_alerts_enabled', 'false');
    }
    return permission;
  } catch (err) {
    console.warn('Notification permission request failed:', err);
    return 'denied';
  }
}

/**
 * Check if user has opted in to push notifications in local storage
 */
export function isPushAlertsEnabled(): boolean {
  if (!isPushNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  return localStorage.getItem('bouncer_push_alerts_enabled') !== 'false';
}

export function setPushAlertsEnabled(enabled: boolean) {
  localStorage.setItem('bouncer_push_alerts_enabled', enabled ? 'true' : 'false');
}

/**
 * Synthesize a lovely, gentle romantic chime using Web Audio API
 * No external mp3 file required - 100% reliable across browsers
 */
export function playRomanticChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Harmonic love chime frequencies: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    const notes = [523.25, 659.25, 783.99];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.85);
    });
  } catch (e) {
    // AudioContext autoplay might be gated by user gesture; silently ignore
  }
}

/**
 * Gender targeted notification format:
 * - If male registered -> send to females: "❤️ New Gentleman Alert! A new gentleman (Age, City) just registered!"
 * - If female registered -> send to males: "❤️ New Lady Alert! A new lady (Age, City) just registered!"
 */
export function formatGenderTargetedNotification(profile: NewSinglePayload): {
  title: string;
  message: string;
  targetGender: 'male' | 'female' | 'all';
} {
  const age = profile.age || 25;
  const location = profile.city || profile.location || 'Harare';
  const isMale = profile.gender === 'male';
  const isFemale = profile.gender === 'female';

  if (isMale) {
    return {
      title: '❤️ New Gentleman Alert!',
      message: `A new gentleman (${age}, ${location}) just registered! Check out his profile.`,
      targetGender: 'female' // Send to females
    };
  }

  if (isFemale) {
    return {
      title: '❤️ New Lady Alert!',
      message: `A new lady (${age}, ${location}) just registered! Check out her profile.`,
      targetGender: 'male' // Send to males
    };
  }

  return {
    title: '❤️ New Single Alert!',
    message: `New Single, ${age} and ${location} has signed up`,
    targetGender: 'all'
  };
}

/**
 * Legacy formatter for backward compatibility
 */
export function formatNewSingleNotification(profile: NewSinglePayload): { title: string; message: string } {
  return formatGenderTargetedNotification(profile);
}

let originalDocTitle: string | null = null;
let titleFlashTimer: any = null;

/**
 * Flash browser tab title to alert user even if tab is in the background
 */
export function flashBrowserTabTitle(alertText: string, durationMs = 8000) {
  if (typeof document === 'undefined') return;
  if (!originalDocTitle) {
    originalDocTitle = document.title || 'Dating With Bouncer';
  }

  if (titleFlashTimer) {
    clearInterval(titleFlashTimer);
  }

  let toggle = false;
  titleFlashTimer = setInterval(() => {
    document.title = toggle ? alertText : originalDocTitle!;
    toggle = !toggle;
  }, 1000);

  setTimeout(() => {
    if (titleFlashTimer) {
      clearInterval(titleFlashTimer);
      titleFlashTimer = null;
    }
    if (originalDocTitle) {
      document.title = originalDocTitle;
    }
  }, durationMs);
}

const RECEIVED_NOTIFS_STORAGE_KEY = 'bouncer_received_notifs_v1';
const receivedNotifSet = new Set<string>();

function loadReceivedNotifsFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECEIVED_NOTIFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((k) => {
          if (typeof k === 'string') receivedNotifSet.add(k);
        });
      }
    }
  } catch {
    // Ignore storage read errors
  }
}

loadReceivedNotifsFromStorage();

function persistReceivedNotifsToStorage() {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(receivedNotifSet).slice(-500);
    localStorage.setItem(RECEIVED_NOTIFS_STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Check if a notification (by ID, profileId, or title+message signature) has already been received
 */
export function hasReceivedNotification(keys: string | string[]): boolean {
  loadReceivedNotifsFromStorage();
  const list = Array.isArray(keys) ? keys : [keys];
  return list.some((k) => Boolean(k && receivedNotifSet.has(k)));
}

/**
 * Mark a notification (by ID, profileId, and/or title+message signature) as received so it never repeats
 */
export function markNotificationReceived(keys: string | string[]): void {
  const list = Array.isArray(keys) ? keys : [keys];
  let changed = false;
  list.forEach((k) => {
    if (k && !receivedNotifSet.has(k)) {
      receivedNotifSet.add(k);
      changed = true;
    }
  });
  if (changed) {
    persistReceivedNotifsToStorage();
  }
}

/**
 * Build deduplication keys for a notification item
 */
export function getNotificationDedupeKeys(notif: {
  id?: string;
  profileId?: string;
  title?: string;
  message?: string;
}): string[] {
  const keys: string[] = [];
  if (notif.id) keys.push(`id:${notif.id}`);
  if (notif.profileId) keys.push(`profile:${notif.profileId}`);
  if (notif.title || notif.message) {
    keys.push(`msg:${(notif.title || '').trim()}::${(notif.message || '').trim()}`);
  }
  return keys;
}

/**
 * Send a native browser push notification directly to the operating system / browser
 * Deduplicates by tag / content so a user never receives the same notification twice.
 */
export async function triggerBrowserPushNotification(
  title: string,
  body: string,
  options?: {
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }
): Promise<boolean> {
  const dedupeTag = options?.tag || `msg:${title.trim()}::${body.trim()}`;
  if (hasReceivedNotification(dedupeTag)) {
    return false;
  }
  markNotificationReceived(dedupeTag);

  // Flash browser tab title for guaranteed visibility
  flashBrowserTabTitle(`(1) ${title}`);

  if (!isPushNotificationSupported()) return false;

  // If permission has not been requested yet, request it now
  if (Notification.permission === 'default') {
    const res = await requestPushPermission();
    if (res !== 'granted') return false;
  }

  if (Notification.permission !== 'granted') return false;

  try {
    const iconUrl = options?.icon || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    const notif = new Notification(title, {
      body,
      icon: iconUrl,
      badge: iconUrl,
      tag: dedupeTag
    });

    if (options?.onClick) {
      notif.onclick = () => {
        window.focus();
        options.onClick?.();
        notif.close();
      };
    }

    return true;
  } catch (err) {
    // Some mobile browsers require ServiceWorker showNotification
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.ready) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          body,
          icon: options?.icon,
          tag: dedupeTag
        });
        return true;
      } catch (swErr) {
        console.warn('Service worker push fallback note:', swErr);
      }
    }
    console.warn('Native notification trigger warning:', err);
    return false;
  }
}
