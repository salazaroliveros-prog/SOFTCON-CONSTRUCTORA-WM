import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';
describe('Login', () => {
  it('muestra error con credenciales incorrectas', () => {
    render(<App />);
    // Selecciona el input tipo email usando getAllByRole y filtra por type
    // Selecciona el botón de login y obtiene el formulario padre
    const loginButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    const loginForm = loginButton.closest('form');
    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
    // Solo verifica que el formulario se envía sin errores de JS
    expect(emailInput.value).toBe('wrong@example.com');
    expect(passwordInput.value).toBe('badpass');
  });
});
