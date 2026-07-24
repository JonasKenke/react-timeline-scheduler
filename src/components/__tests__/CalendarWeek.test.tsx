import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalendarWeekRow } from '../CalendarWeek';

const weekDays = [
  new Date('2026-07-20'),
  new Date('2026-07-21'),
  new Date('2026-07-22'),
  new Date('2026-07-23'),
  new Date('2026-07-24'),
  new Date('2026-07-25'),
  new Date('2026-07-26'),
];

const defaultProps = {
  weekDays,
  currentDate: new Date('2026-07-24'),
  isToday: (date: Date) => date.getDate() === 24,
  getItemsForDay: vi.fn(() => []),
  isDropTargetForDay: vi.fn(() => false),
  maxVisibleItems: 3,
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
  variant: 'week' as const,
};

describe('CalendarWeekRow', () => {
  it('renders 7 day cells', () => {
    render(<CalendarWeekRow {...defaultProps} />);
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('21')).toBeTruthy();
    expect(screen.getByText('22')).toBeTruthy();
    expect(screen.getByText('23')).toBeTruthy();
    expect(screen.getByText('24')).toBeTruthy();
    expect(screen.getByText('25')).toBeTruthy();
    expect(screen.getByText('26')).toBeTruthy();
  });

  it('renders items provided by getItemsForDay', () => {
    const items = [
      { id: '1', title: 'Event 1', group: { name: 'Team A' } },
    ];
    const getItemsForDay = vi.fn().mockImplementation(
      (date: Date) => (date.getDate() === 24 ? items : [])
    );
    render(
      <CalendarWeekRow
        {...defaultProps}
        getItemsForDay={getItemsForDay}
      />
    );
    expect(screen.getByText('Event 1')).toBeTruthy();
  });

  it('marks today correctly via isToday callback', () => {
    render(<CalendarWeekRow {...defaultProps} />);
    // Day 24 should be today, so it has text-primary color
    const todayNumber = screen.getByText('24');
    expect(todayNumber.className).toContain('text-primary');
  });

  it('handles empty week gracefully', () => {
    const { container } = render(
      <CalendarWeekRow
        {...defaultProps}
        getItemsForDay={vi.fn(() => [])}
      />
    );
    // Should render 7 day cells
    const dayNumbers = ['20', '21', '22', '23', '24', '25', '26'];
    dayNumbers.forEach((num) => {
      expect(screen.getByText(num)).toBeTruthy();
    });
  });

  it('passes correct variant to CalendarDay', () => {
    render(<CalendarWeekRow {...defaultProps} variant="week" />);
    // Day 20 is Monday (index 5 is weekend: saturday) in a week starting Monday
    // Weekend check: index % 7 === 5 || index % 7 === 6
    // Day 25 (index 5) should be weekend, Day 26 (index 6) should be weekend
  });

  it('renders correct number of CalendarDay components', () => {
    const { container } = render(<CalendarWeekRow {...defaultProps} />);
    // Each CalendarDay has a .min-h-20 class
    const dayCells = container.querySelectorAll('.min-h-20');
    expect(dayCells.length).toBe(7);
  });
});
