import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalendarDay } from '../CalendarDay';

const mockItem = {
  id: '1',
  title: 'Test Event',
  startTime: '10:00',
  endTime: '11:00',
  type: 'event',
  color: '',
  group: { name: 'Team A' },
};

const defaultProps = {
  day: new Date('2026-07-24'),
  isCurrentMonth: true,
  isToday: false,
  isWeekend: false,
  items: [mockItem],
  maxVisibleItems: 3,
  showAddButton: false,
  canCreate: false,
  draggable: true,
  locale: 'en',
  t: { moreItems: 'more' },
  itemTypes: {
    event: { label: 'Event', color: 'bg-blue-500' },
  },
  onItemClick: vi.fn(),
  onAddClick: vi.fn(),
  onDoubleClick: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  isDropTarget: false,
  variant: 'month' as const,
};

describe('CalendarDay', () => {
  it('renders day number', () => {
    render(<CalendarDay {...defaultProps} />);
    expect(screen.getByText('24')).toBeTruthy();
  });

  it('shows item title', () => {
    render(<CalendarDay {...defaultProps} />);
    expect(screen.getByText('Test Event')).toBeTruthy();
  });

  it('shows group name on the item', () => {
    render(<CalendarDay {...defaultProps} />);
    expect(screen.getByText('Team A')).toBeTruthy();
  });

  it('applies muted styling for non-current month days', () => {
    const { container } = render(
      <CalendarDay {...defaultProps} isCurrentMonth={false} />
    );
    const cell = container.firstChild as HTMLElement;
    expect(cell.className).toContain('text-muted-foreground');
  });

  it('marks today with primary background', () => {
    const { container } = render(
      <CalendarDay {...defaultProps} isToday={true} />
    );
    const cell = container.firstChild as HTMLElement;
    expect(cell.className).toContain('bg-primary/10');
  });

  it('shows primary text color for today date number', () => {
    render(<CalendarDay {...defaultProps} isToday={true} />);
    const dayNumber = screen.getByText('24');
    expect(dayNumber.className).toContain('text-primary');
  });

  it('applies weekend styling', () => {
    const { container } = render(
      <CalendarDay {...defaultProps} isWeekend={true} />
    );
    const cell = container.firstChild as HTMLElement;
    expect(cell.className).toContain('bg-muted/10');
  });

  it('shows drop target highlight when isDropTarget is true', () => {
    const { container } = render(
      <CalendarDay {...defaultProps} isDropTarget={true} />
    );
    const cell = container.firstChild as HTMLElement;
    expect(cell.className).toContain('bg-primary/20');
  });

  it('renders "more" indicator when items exceed maxVisibleItems', () => {
    const manyItems = Array.from({ length: 5 }, (_, i) => ({
      ...mockItem,
      id: `item${i}`,
      title: `Item ${i}`,
    }));
    render(
      <CalendarDay
        {...defaultProps}
        items={manyItems}
        maxVisibleItems={3}
        t={{ moreItems: 'more' }}
      />
    );
    expect(screen.getByText('+2 more')).toBeTruthy();
  });

  it('does not render "more" indicator when items equal maxVisibleItems', () => {
    const items = Array.from({ length: 3 }, (_, i) => ({
      ...mockItem,
      id: `item${i}`,
      title: `Item ${i}`,
    }));
    render(
      <CalendarDay
        {...defaultProps}
        items={items}
        maxVisibleItems={3}
        t={{ moreItems: 'more' }}
      />
    );
    expect(screen.queryByText(/more/)).toBeNull();
  });

  it('calls onItemClick when item is clicked', () => {
    const onItemClick = vi.fn();
    render(
      <CalendarDay {...defaultProps} onItemClick={onItemClick} />
    );
    fireEvent.click(screen.getByText('Test Event'));
    expect(onItemClick).toHaveBeenCalledWith(mockItem);
  });

  it('calls onDoubleClick when cell is double-clicked', () => {
    const onDoubleClick = vi.fn();
    render(
      <CalendarDay
        {...defaultProps}
        onDoubleClick={onDoubleClick}
      />
    );
    const cell = screen.getByText('24').closest('[ondoubleclick]') || screen.getByText('24').closest('div')?.parentElement!;
    // Double-click on the container (the cell div)
    const cellDiv = screen.getByText('24').closest('.min-h-20')!;
    fireEvent.doubleClick(cellDiv);
    expect(onDoubleClick).toHaveBeenCalledWith(defaultProps.day);
  });

  it('shows add button when showAddButton and canCreate are true', () => {
    render(
      <CalendarDay
        {...defaultProps}
        showAddButton={true}
        canCreate={true}
        onAddClick={vi.fn()}
      />
    );
    expect(screen.getByText('+')).toBeTruthy();
  });

  it('calls onAddClick when add button is clicked', () => {
    const onAddClick = vi.fn();
    render(
      <CalendarDay
        {...defaultProps}
        showAddButton={true}
        canCreate={true}
        onAddClick={onAddClick}
      />
    );
    fireEvent.click(screen.getByText('+'));
    expect(onAddClick).toHaveBeenCalledWith(defaultProps.day);
  });

  it('does not show add button when showAddButton is false', () => {
    render(
      <CalendarDay
        {...defaultProps}
        showAddButton={false}
        canCreate={true}
      />
    );
    expect(screen.queryByText('+')).toBeNull();
  });

  it('does not show add button when canCreate is false', () => {
    render(
      <CalendarDay
        {...defaultProps}
        showAddButton={true}
        canCreate={false}
      />
    );
    expect(screen.queryByText('+')).toBeNull();
  });

  it('shows time range in week variant', () => {
    render(
      <CalendarDay
        {...defaultProps}
        variant="week"
      />
    );
    expect(screen.getByText('10:00-11:00')).toBeTruthy();
  });

  it('does not show time range in month variant', () => {
    render(
      <CalendarDay
        {...defaultProps}
        variant="month"
      />
    );
    expect(screen.queryByText('10:00-11:00')).toBeNull();
  });
});
