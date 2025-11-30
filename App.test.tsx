import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Check for something that should be on the initial screen
        // Based on outline, maybe "Player Selection" or similar text?
        // Or just check that it doesn't throw.
        expect(document.body).toBeInTheDocument();
    });
});
