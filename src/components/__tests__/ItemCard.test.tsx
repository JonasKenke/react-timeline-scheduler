import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ItemCard } from '../ItemCard';
import { translations } from '../../lib/translations';
import type { BaseScheduleItem } from '../../types';

const mockItem: BaseScheduleItem = {
  id: '1',
  employeeId: 'emp1',
  title: 'Test Meeting',
  date: '2026-07-24',
  startTime: '10:00',
  endTime: '11:30',
  type: 'meeting',
};

const defaultProps = {
  item: mockItem,
  leftPercent: '10%',
  widthPercent: '30%',
  top: '8px',
  showTimeLabel: true,
  isAllDayItem: false,
  colorClass: 'bg-blue-500',
  compact: false,
  t: translations.en,
  canEdit: true,
  onItemClick: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
};

describe('ItemCard', () => {
  it('renders item title', () => {
    render(<ItemCard {...defaultProps} />);
    expect(screen.getByText('Test Meeting')).toBeTruthy();
  });

  it('shows time range', () => {
    render(<ItemCard {...defaultProps} />);
    expect(screen.getByText('10:00-11:30')).toBeTruthy();
  });

  it('does not show time label when showTimeLabel is false', () => {
    render(<ItemCard {...defaultProps} showTimeLabel={false} />);
    expect(screen.queryByText('10:00-11:30')).toBeNull();
  });

  it('renders with correct positioning styles', () => {
    const { container } = render(<ItemCard {...defaultProps} />);
    const card = container.firstChild as HTMLElement;
    expect(card.style.left).toBe('10%');
    expect(card.style.width).toBe('30%');
    expect(card.style.top).toBe('8px');
  });

  it('calls onItemClick when clicked', () => {
    const onItemClick = vi.fn();
    render(<ItemCard {...defaultProps} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText('Test Meeting'));
    expect(onItemClick).toHaveBeenCalledWith(mockItem);
  });

  it('shows All Day label for all-day items', () => {
    render(
      <ItemCard
        {...defaultProps}
        isAllDayItem={true}
        showTimeLabel={false}
      />
    );
    expect(screen.getByText(translations.en.allDay)).toBeTruthy();
  });

  it('does not show time label for all-day items', () => {
    render(<ItemCard {...defaultProps} isAllDayItem={true} />);
    expect(screen.queryByText('10:00-11:30')).toBeNull();
    expect(screen.getByText(translations.en.allDay)).toBeTruthy();
  });

  it('applies compact classes when compact is true', () => {
    const { container } = render(
      <ItemCard {...defaultProps} compact={true} />
    );
    expect((container.firstChild as HTMLElement).className).toContain('text-[10px]');
  });

  it('does not apply compact classes when compact is false', () => {
    const { container } = render(
      <ItemCard {...defaultProps} compact={false} />
    );
    expect((container.firstChild as HTMLElement).className).not.toContain('text-[10px]');
  });

  it('is draggable when canEdit is true', () => {
    render(<ItemCard {...defaultProps} canEdit={true} />);
    const el = screen.getByText('Test Meeting').closest('[draggable]');
    expect(el?.getAttribute('draggable')).toBe('true');
  });

  it('is not draggable when canEdit is false', () => {
    render(<ItemCard {...defaultProps} canEdit={false} />);
    const el = screen.getByText('Test Meeting').closest('[draggable]');
    expect(el?.getAttribute('draggable')).toBe('false');
  });

  it('calls onDragStart on drag start', () => {
    const onDragStart = vi.fn();
    render(<ItemCard {...defaultProps} onDragStart={onDragStart} />);
    const el = screen.getByText('Test Meeting').closest('div')!;
    fireEvent.dragStart(el);
    expect(onDragStart).toHaveBeenCalled();
  });

  it('calls onDragEnd on drag end', () => {
    const onDragEnd = vi.fn();
    render(<ItemCard {...defaultProps} onDragEnd={onDragEnd} />);
    const el = screen.getByText('Test Meeting').closest('div')!;
    fireEvent.dragEnd(el);
    expect(onDragEnd).toHaveBeenCalled();
  });

  it('sets correct title attribute for overnight items with cross-midnight duration', () => {
    const overnightItem: BaseScheduleItem = {
      ...mockItem,
      startTime: '22:00',
      endTime: '02:00',
    };
    render(
      <ItemCard
        {...defaultProps}
        item={overnightItem}
        isAllDayItem={false}
      />
    );
    const card = screen.getByText(overnightItem.title).closest('[title]');
    expect(card?.getAttribute('title')).toBe(
      'Test Meeting (22:00-02:00)'
    );
  });

  it('sets correct title for all-day items', () => {
    const allDayItem: BaseScheduleItem = {
      ...mockItem,
      allDay: true,
    };
    render(
      <ItemCard
        {...defaultProps}
        item={allDayItem}
        isAllDayItem={true}
        showTimeLabel={false}
      />
    );
    const card = screen
      .getByText(allDayItem.title)
      .closest('[title]');
    expect(card?.getAttribute('title')).toBe(
      'Test Meeting (All Day)'
    );
  });

  it('applies color class', () => {
    const { container } = render(
      <ItemCard {...defaultProps} colorClass="bg-red-500" />
    );
    expect((container.firstChild as HTMLElement).className).toContain('bg-red-500');
  });

  it('has cursor-move class when draggable', () => {
    const { container } = render(<ItemCard {...defaultProps} />);
    expect((container.firstChild as HTMLElement).className).toContain('cursor-move');
  });
});
