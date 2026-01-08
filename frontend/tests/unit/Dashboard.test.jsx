import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';
describe('Dashboard', () => {
  it('renderiza el dashboard', () => {
    render(<App />);
    expect(screen.getByText(/SOFTCON-MYS/i)).toBeInTheDocument();
  });
});
