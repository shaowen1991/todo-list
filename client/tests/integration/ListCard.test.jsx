import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ListCard from '../../src/components/ListCard';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ listId: '1' }),
  };
});

vi.mock('../../src/utils/dateUtils', () => ({
  formatDate: (_date) => '2023-03-26',
}));

describe('ListCard Component', () => {
  const mockList = {
    id: 1,
    title: 'Test Todo List',
    description: 'This is a test todo list',
    owner_username: 'testuser',
    created_at: '2023-03-26T10:00:00Z',
  };

  const setup = (list = mockList) => {
    return render(
      <BrowserRouter>
        <ListCard list={list} />
      </BrowserRouter>
    );
  };

  test('renders list card correctly', () => {
    setup();

    expect(screen.getByText('Test Todo List')).toBeInTheDocument();
    expect(screen.getByText('This is a test todo list')).toBeInTheDocument();
    expect(screen.getByText('Owner: testuser')).toBeInTheDocument();
    expect(screen.getByText('2023-03-26')).toBeInTheDocument();
  });

  test('applies active style when list is selected', () => {
    const { container } = setup();

    const listCard = container.firstChild;

    expect(listCard).toHaveClass('bg-blue-100');
  });

  test('applies inactive style when list is not selected', () => {
    const unselectedList = {
      ...mockList,
      id: 2,
    };
    const { container } = setup(unselectedList);

    const listCard = container.firstChild;

    expect(listCard).toHaveClass('bg-white');
    expect(listCard).not.toHaveClass('bg-blue-100');
  });

  test('truncates long titles', () => {
    const longTitleList = {
      ...mockList,
      title:
        'This is an extremely long title that should be truncated in the UI to ensure good display',
    };
    setup(longTitleList);

    const titleElement = screen.getByText(
      'This is an extremely long title that should be truncated in the UI to ensure good display'
    );
    expect(titleElement).toHaveClass('truncate');
  });
});
