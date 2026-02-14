import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../../../components/auth/RegisterForm';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
vi.mock('../../../contexts/AuthContext');

describe('RegisterForm', () => {
  const mockRegister = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      register: mockRegister,
    });
  });

  it('renders registration form', () => {
    render(<RegisterForm />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'weak');

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters long/)
      ).toBeInTheDocument();
    });
  });

  it('validates password contains uppercase letter', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'lowercase123');

    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one uppercase letter/)
      ).toBeInTheDocument();
    });
  });

  it('validates password contains lowercase letter', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'UPPERCASE123');

    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one lowercase letter/)
      ).toBeInTheDocument();
    });
  });

  it('validates password contains number', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'NoNumbers');

    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one number/)
      ).toBeInTheDocument();
    });
  });

  it('shows password strength good when password is valid', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'ValidPass123');

    await waitFor(() => {
      expect(screen.getByText(/Password strength: Good/)).toBeInTheDocument();
    });
  });

  it('validates passwords match', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(passwordInput, 'ValidPass123');
    await user.type(confirmPasswordInput, 'DifferentPass123');

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({});

    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'ValidPass123');
    await user.type(screen.getByLabelText('Confirm Password'), 'ValidPass123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPass123',
      });
    });
  });

  it('disables submit button when password is invalid', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Password'), 'weak');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    expect(submitButton).toBeDisabled();
  });

  it('displays error message on registration failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email already exists';
    mockRegister.mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Email'), 'existing@example.com');
    await user.type(screen.getByLabelText('Password'), 'ValidPass123');
    await user.type(screen.getByLabelText('Confirm Password'), 'ValidPass123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('calls onSwitchToLogin when sign in link is clicked', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />);

    const signInLink = screen.getByText('Sign in');
    await user.click(signInLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });
});

