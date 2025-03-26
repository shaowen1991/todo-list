import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import UserCard from '../../src/components/UserCard';

import { ACCESS_PERMISSION } from '../../src/constants/enums';

describe('UserCard Component', () => {
  const mockUser = {
    user_id: 1,
    username: 'testuser',
    permission: ACCESS_PERMISSION.EDIT,
    requested_permission: ACCESS_PERMISSION.EDIT,
  };

  const mockOnAccept = vi.fn();
  const mockOnOptions = vi.fn();

  const setupRegular = () => {
    return render(<UserCard user={mockUser} onOptions={mockOnOptions} />);
  };

  const setupRequest = () => {
    return render(
      <UserCard user={mockUser} isRequest={true} onAccept={mockOnAccept} />
    );
  };

  test('renders regular user card correctly', () => {
    setupRegular();

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();

    const avatar = screen.getByText('T');
    expect(avatar).toBeInTheDocument();

    expect(screen.getByTitle('Options')).toBeInTheDocument();
    expect(screen.queryByTitle('Accept')).not.toBeInTheDocument();
  });

  test('renders request user card correctly', () => {
    setupRequest();

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();

    expect(screen.getByTitle('Accept')).toBeInTheDocument();
    expect(screen.queryByTitle('Options')).not.toBeInTheDocument();
  });

  test('calls onOptions when options button is clicked', () => {
    setupRegular();

    const optionsButton = screen.getByTitle('Options');
    fireEvent.click(optionsButton);

    expect(mockOnOptions).toHaveBeenCalledWith(1);
  });

  test('calls onAccept when accept button is clicked', () => {
    setupRequest();

    const acceptButton = screen.getByTitle('Accept');
    fireEvent.click(acceptButton);

    expect(mockOnAccept).toHaveBeenCalledWith(1);
  });

  test('handles missing optional props', () => {
    render(<UserCard user={mockUser} onOptions={() => {}} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();

    expect(screen.getByTitle('Options')).toBeInTheDocument();

    const optionsButton = screen.getByTitle('Options');
    expect(optionsButton).toBeInTheDocument();
  });
});
