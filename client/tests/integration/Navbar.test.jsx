import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../src/components/Navbar';

const mockLogout = vi.fn();

vi.mock('../../src/context/AuthContext', () => {
  return {
    useAuth: vi.fn(() => ({
      user: { username: 'testuser', id: 1 },
      logout: mockLogout,
    })),
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    mockLogout.mockReset();
  });

  const setup = () => {
    return render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  };

  test('renders navbar correctly', () => {
    setup();

    expect(screen.getByText('Todo Lists')).toBeInTheDocument();

    const avatarButton = screen.getByRole('button');
    expect(avatarButton).toBeInTheDocument();
    expect(avatarButton.textContent).toBe('T');
  });

  test('profile menu is hidden by default', () => {
    setup();

    const logoutButton = screen.queryByText('Logout');
    expect(logoutButton).not.toBeInTheDocument();
  });

  test('clicking avatar toggles profile menu', () => {
    setup();

    const avatarButton = screen.getByRole('button');
    fireEvent.click(avatarButton);

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(avatarButton);

    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('clicking logout calls the logout function', () => {
    setup();

    const avatarButton = screen.getByRole('button');
    fireEvent.click(avatarButton);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
