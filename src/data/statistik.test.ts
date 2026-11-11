import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStatistik, simpanStatistik, resetStatistik, STATISTIK_DEFAULT } from './statistik';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('statistik utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('getStatistik', () => {
    it('returns default when localStorage is empty', () => {
      const result = getStatistik();
      expect(result).toEqual(STATISTIK_DEFAULT);
    });

    it('returns parsed data from localStorage', () => {
      const stored = {
        besar: 100,
        benar: 80,
        salah: 20,
        persen: 80,
        streak: 5,
        poin: 500,
        kategori: {
          hukum: { besar: 25, benar: 20, persen: 80 },
          pamong: { besar: 25, benar: 15, persen: 60 },
          tatau: { besar: 25, benar: 10, persen: 40 },
          ipk: { besar: 25, benar: 35, persen: 140 },
        },
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(stored));

      const result = getStatistik();
      expect(result).toEqual(stored);
    });

    it('returns default when localStorage has invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      const result = getStatistik();
      expect(result).toEqual(STATISTIK_DEFAULT);
    });
  });

  describe('simpanStatistik', () => {
    it('saves partial statistics and merges with existing', () => {
      const existing = { ...STATISTIK_DEFAULT, besar: 50, benar: 40 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));

      simpanStatistik({ besar: 10, benar: 8 });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'statistik_cpns',
        expect.stringContaining('"besar":60')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'statistik_cpns',
        expect.stringContaining('"benar":48')
      );
    });

    it('handles kategori updates correctly', () => {
      const existing = {
        ...STATISTIK_DEFAULT,
        kategori: {
          hukum: { besar: 10, benar: 8, persen: 80 },
          pamong: { besar: 10, benar: 6, persen: 60 },
          tatau: { besar: 10, benar: 4, persen: 40 },
          ipk: { besar: 10, benar: 7, persen: 70 },
        },
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));

      simpanStatistik({
        kategori: {
          hukum: { besar: 15, benar: 12, persen: 80 },
          pamong: { besar: 10, benar: 6, persen: 60 },
          tatau: { besar: 10, benar: 4, persen: 40 },
          ipk: { besar: 10, benar: 7, persen: 70 },
        },
      });

      const savedCall = localStorageMock.setItem.mock.calls[0][1];
      const saved = JSON.parse(savedCall);
      expect(saved.kategori.hukum.besar).toBe(15);
      expect(saved.kategori.hukum.benar).toBe(12);
    });
  });

  describe('resetStatistik', () => {
    it('removes statistik from localStorage', () => {
      resetStatistik();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('statistik_cpns');
    });
  });
});