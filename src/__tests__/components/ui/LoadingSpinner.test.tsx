import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('displays text when provided', () => {
    render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not display text when not provided', () => {
    render(<LoadingSpinner />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders full screen when fullScreen prop is true', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const fullScreenContainer = container.querySelector('.min-h-screen');
    expect(fullScreenContainer).toBeInTheDocument();
  });

  it('does not render full screen when fullScreen prop is false', () => {
    const { container } = render(<LoadingSpinner fullScreen={false} />);
    const fullScreenContainer = container.querySelector('.min-h-screen');
    expect(fullScreenContainer).not.toBeInTheDocument();
  });
});

