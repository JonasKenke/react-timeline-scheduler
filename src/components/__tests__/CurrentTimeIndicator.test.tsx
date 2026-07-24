import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CurrentTimeIndicator } from '../CurrentTimeIndicator';

describe('CurrentTimeIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when today is not in dateRange', () => {
    vi.setSystemTime(new Date('2026-01-15T12:00:00'));
    const dateRange = [new Date('2026-01-01'), new Date('2026-01-02')];
    const { container } = render(
      <CurrentTimeIndicator dateRange={dateRange} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders a red indicator line when today is in dateRange', () => {
    vi.setSystemTime(new Date('2026-01-15T12:00:00'));
    const dateRange = [
      new Date('2026-01-14'),
      new Date('2026-01-15'),
      new Date('2026-01-16'),
    ];
    const { container } = render(
      <CurrentTimeIndicator dateRange={dateRange} />
    );
    const indicator = container.querySelector('.bg-red-500');
    expect(indicator).not.toBeNull();
    expect((indicator as HTMLElement).className).toContain('bg-red-500');
  });

  it('positions the indicator correctly based on time and date range', () => {
    // Noon on the second day of a 3-day range = 50% position
    vi.setSystemTime(new Date('2026-01-15T12:00:00'));
    const dateRange = [
      new Date('2026-01-14'),
      new Date('2026-01-15'),
      new Date('2026-01-16'),
    ];
    const { container } = render(
      <CurrentTimeIndicator dateRange={dateRange} />
    );
    const indicator = container.querySelector('.bg-red-500') as HTMLElement;

    // Position = ((1*24*60 + 12*60) / (3*24*60)) * 100 = (2160/4320)*100 = 50%
    expect(indicator.style.left).toBe('50%');
  });

  it('shows correct time in title attribute', () => {
    vi.setSystemTime(new Date('2026-06-15T06:30:00'));
    const dateRange = [new Date('2026-06-15'), new Date('2026-06-16')];
    const { container } = render(
      <CurrentTimeIndicator dateRange={dateRange} />
    );
    const indicator = container.querySelector('.bg-red-500') as HTMLElement;
    expect(indicator.getAttribute('title')).toBe('Current time: 06:30');
  });

  it('positions correctly when today is the first day in range', () => {
    vi.setSystemTime(new Date('2026-06-15T06:30:00'));
    const dateRange = [new Date('2026-06-15'), new Date('2026-06-16')];
    const { container } = render(
      <CurrentTimeIndicator dateRange={dateRange} />
    );
    const indicator = container.querySelector('.bg-red-500') as HTMLElement;

    // Position = ((0*24*60 + 6*60 + 30) / (2*24*60)) * 100 = (390/2880)*100 ≈ 13.54%
    expect(indicator.style.left).toBe('13.541666666666666%');
  });

  it('returns null for empty dateRange', () => {
    vi.setSystemTime(new Date('2026-01-15T12:00:00'));
    const { container } = render(<CurrentTimeIndicator dateRange={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
