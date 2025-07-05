import '@testing-library/jest-dom';

// Mock Tauri API
const mockInvoke = vi.fn();
const mockTauriApi = {
  invoke: mockInvoke,
  core: {
    invoke: mockInvoke,
  },
};

vi.mock('@tauri-apps/api/core', () => mockTauriApi);
vi.mock('@tauri-apps/plugin-opener', () => ({
  open: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Global test utilities
global.mockTauriInvoke = mockInvoke;
