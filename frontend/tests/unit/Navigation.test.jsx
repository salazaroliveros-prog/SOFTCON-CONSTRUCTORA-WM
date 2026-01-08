import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
describe('Navigation', () => {
  it('navega entre login y registro', () => {
    render(<App />);
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('go-register-btn'));
    expect(screen.getByText(/Registro/i)).toBeInTheDocument();
  });
});
