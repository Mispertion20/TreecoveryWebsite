import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '../../../components/auth/ForgotPasswordForm';
import * as authService from '../../../services/auth';

// Mock the auth service
vi.mock('../../../services/auth');

describe('ForgotPasswordForm', () => {
  const mockForgotPassword = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (authService.forgotPassword as any) = mockForgotPassword;
  });

  it('renders forgot password form', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('submits form with email', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue({ message: 'Email sent' });

    render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue({ message: 'Email sent' });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
      expect(
        screen.getByText(/If an account exists with test@example.com/)
      ).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email not found';
    mockForgotPassword.mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('Email'), 'nonexistent@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockImplementation(
      () => new Promise(() => {})
    ); // Never resolves

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('calls onSwitchToLogin when back to sign in is clicked', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue({ message: 'Email sent' });

    render(<ForgotPasswordForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      const backButton = screen.getByText('Back to Sign In');
      expect(backButton).toBeInTheDocument();
    });

    await user.click(screen.getByText('Back to Sign In'));
    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  it('requires email field', () => {
    render(<ForgotPasswordForm />);
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toBeRequired();
  });
});

