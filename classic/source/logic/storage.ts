import type { SavedSession } from '../types';

const KEY = '13clues:session:v1';

export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedSession;
    if (typeof data.roomId !== 'string' || typeof data.seat !== 'number') return null;
    return { ...data, marks: data.marks ?? {} };
  } catch {
    return null;
  }
}

export function saveSession(session: SavedSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* 저장 공간 부족·사생활 보호 모드 등은 무시 */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
