import { render, screen } from '@testing-library/react';
import App from '../App';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('App', () => {
  it('renderiza el título principal', () => {
    // Mock manual de localStorage
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true
    });
    render(<App />);
    // Verifica que el título de login esté presente
    expect(screen.getByText(/INGRESA/i)).toBeInTheDocument();
    expect(screen.getByText(/SOFTCON-WM/i)).toBeInTheDocument();
  });
});


