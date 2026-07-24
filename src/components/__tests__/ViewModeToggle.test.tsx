import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ViewModeToggle } from '../ViewModeToggle';
import { translations } from '../../lib/translations';

const defaultProps = {
  viewMode: 'week' as const,
  displayMode: 'calendar' as const,
  onViewModeChange: vi.fn(),
  onDisplayModeChange: vi.fn(),
  onNavigate: vi.fn(),
  dateRangeLabel: 'Week 30, 2026',
  t: translations.en,
};

describe('ViewModeToggle', () => {
  it('renders the date range label', () => {
    render(<ViewModeToggle {...defaultProps} />);
    expect(screen.getByText('Week 30, 2026')).toBeTruthy();
  });

  it('renders navigation prev/next buttons', () => {
    const onNavigate = vi.fn();
    render(<ViewModeToggle {...defaultProps} onNavigate={onNavigate} />);
    // First two buttons are navigation prev/next
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onNavigate).toHaveBeenCalledWith('prev');
    fireEvent.click(buttons[1]);
    expect(onNavigate).toHaveBeenCalledWith('next');
  });

  it('renders display mode toggle buttons', () => {
    render(<ViewModeToggle {...defaultProps} />);
    expect(screen.getByText(translations.en.calendar)).toBeTruthy();
    expect(screen.getByText(translations.en.timeline)).toBeTruthy();
  });

  it('renders view period buttons for day, week, month, year', () => {
    render(<ViewModeToggle {...defaultProps} />);
    expect(screen.getByText(translations.en.day)).toBeTruthy();
    expect(screen.getByText(translations.en.week)).toBeTruthy();
    expect(screen.getByText(translations.en.month)).toBeTruthy();
    expect(screen.getByText(translations.en.year)).toBeTruthy();
  });

  it('calls onViewModeChange when a period button is clicked', () => {
    const onViewModeChange = vi.fn();
    render(
      <ViewModeToggle
        {...defaultProps}
        onViewModeChange={onViewModeChange}
      />
    );
    fireEvent.click(screen.getByText(translations.en.day));
    expect(onViewModeChange).toHaveBeenCalledWith('day');

    fireEvent.click(screen.getByText(translations.en.month));
    expect(onViewModeChange).toHaveBeenCalledWith('month');

    fireEvent.click(screen.getByText(translations.en.year));
    expect(onViewModeChange).toHaveBeenCalledWith('year');
  });

  it('calls onDisplayModeChange when display mode button is clicked', () => {
    const onDisplayModeChange = vi.fn();
    render(
      <ViewModeToggle
        {...defaultProps}
        onDisplayModeChange={onDisplayModeChange}
      />
    );
    fireEvent.click(screen.getByText(translations.en.timeline));
    expect(onDisplayModeChange).toHaveBeenCalledWith('timeline');

    fireEvent.click(screen.getByText(translations.en.calendar));
    expect(onDisplayModeChange).toHaveBeenCalledWith('calendar');
  });

  it('renders the Card wrapper', () => {
    const { container } = render(<ViewModeToggle {...defaultProps} />);
    const card = container.querySelector('.rounded-lg');
    expect(card).toBeTruthy();
  });

  it('renders CardTitle containing the date range label', () => {
    render(<ViewModeToggle {...defaultProps} />);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeTruthy();
    expect(title.textContent).toBe('Week 30, 2026');
  });
});
