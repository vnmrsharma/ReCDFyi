import '@testing-library/jest-dom';

// Mock import.meta for Vite environment variables
(global as any).import = {
  meta: {
    env: {
      VITE_APP_VERSION: '1.0.0',
      VITE_BUILD_DATE: new Date().toISOString(),
    },
  },
};

// Mock window.matchMedia for responsive design tests (only if window exists)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
