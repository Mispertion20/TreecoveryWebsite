import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordForm from '../../../components/auth/ResetPasswordForm';
import * as authService from '../../../services/auth';

// Mock the auth service
vi.mock('../../../services/auth');

describe('ResetPasswordForm', () => {
  const mockResetPassword = vi.fn();
  const mockOnSuccess = vi.fn();
  const testToken = 'test-reset-token';

  beforeEach(() => {
    vi.clearAllMocks();
    (authService.resetPassword as any) = mockResetPassword;
    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('renders reset password form', () => {
    render(<ResetPasswordForm token={testToken} />);
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token={testToken} />);

    const passwordInput = screen.getByLabelText('New Password');
    await user.type(passwordInput, 'weak');

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters long/)
      ).toBeInTheDocument();
    });
  });

  it('validates passwords match', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token={testToken} />);

    await user.type(screen.getByLabelText('New Password'), 'ValidPass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'DifferentPass123');

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue({ message: 'Password reset successful' });

    render(<ResetPasswordForm token={testToken} onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText('New Password'), 'ValidPass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'ValidPass123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: testToken,
        password: 'ValidPass123',
      });
    });
  });

  it('shows success message after successful reset', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue({ message: 'Password reset successful' });

    render(<ResetPasswordForm token={testToken} />);

    await user.type(screen.getByLabelText('New Password'), 'ValidPass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'ValidPass123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
      expect(screen.getByText(/Redirecting to login/)).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid or expired token';
    mockResetPassword.mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    render(<ResetPasswordForm token={testToken} />);

    await user.type(screen.getByLabelText('New Password'), 'ValidPass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'ValidPass123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables submit button when password is invalid', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token={testToken} />);

    await user.type(screen.getByLabelText('New Password'), 'weak');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ResetPasswordForm token={testToken} />);

    await user.type(screen.getByLabelText('New Password'), 'ValidPass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'ValidPass123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(screen.getByText('Resetting...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resetting/i })).toBeDisabled();
  });
});

