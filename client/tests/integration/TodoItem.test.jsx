import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import TodoItem from '../../src/components/TodoItem';

import { TODO_STATUS, PRIORITY } from '../../src/constants/enums';

vi.mock('../../src/utils/dateUtils', () => ({
  formatDate: () => '2023-03-26',
}));

describe('TodoItem Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    description: 'This is a test todo item',
    due_date: '2023-03-30',
    status: TODO_STATUS.IN_PROGRESS,
    priority: PRIORITY.P1,
    created_at: '2023-03-26',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockGridTemplateColumns = '15% 35% 10% 10% 10% 10% 10%';

  const setup = () => {
    return render(
      <TodoItem
        todo={mockTodo}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        gridTemplateColumns={mockGridTemplateColumns}
        showActions={true}
      />
    );
  };

  test('renders todo item correctly', () => {
    setup();

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('This is a test todo item')).toBeInTheDocument();
    const dateElements = screen.getAllByText('2023-03-26');
    expect(dateElements.length).toBeGreaterThan(0);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('P1')).toBeInTheDocument();
  });

  test('applies correct classes for status and priority', () => {
    setup();

    const statusElement = screen.getByText('In Progress');
    expect(statusElement).toHaveClass('bg-yellow-100');
    expect(statusElement).toHaveClass('text-yellow-800');

    const priorityElement = screen.getByText('P1');
    expect(priorityElement).toHaveClass('bg-yellow-100');
    expect(priorityElement).toHaveClass('text-yellow-800');
  });

  test('calls onEdit when edit button is clicked', () => {
    setup();

    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });

  test('calls onDelete when delete button is clicked', () => {
    setup();

    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  test('uses the provided gridTemplateColumns style', () => {
    const { container } = setup();

    const todoItem = container.firstChild;
    expect(todoItem).toHaveStyle(
      `grid-template-columns: ${mockGridTemplateColumns}`
    );
  });
});
