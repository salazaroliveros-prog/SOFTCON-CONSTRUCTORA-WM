import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('App', () => {
  it('renderiza el título principal', () => {
    render(<App />);
    expect(screen.getByText(/SOFTCON-MYS/i)).toBeInTheDocument();
    expect(screen.getByText(/CONSTRUYENDO TU FUTURO/i)).toBeInTheDocument();
  });
});
