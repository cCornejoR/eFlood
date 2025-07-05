import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders homepage by default', () => {
    render(<App />);

    // Check if the homepage content is rendered
    expect(screen.getByText(/eFlow/i)).toBeInTheDocument();
    expect(screen.getByText(/Hydraulic Analysis Tool/i)).toBeInTheDocument();
  });

  it('has proper document structure', () => {
    render(<App />);

    // Check for main structural elements
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});
