import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../pages/RegisterPage';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('RegisterPage', () => {
  it('renderiza el formulario de registro', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Solicitar acceso/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear solicitud/i })).toBeInTheDocument();
  });
});
