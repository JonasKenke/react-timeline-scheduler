import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TimelineHeader } from '../TimelineHeader';

describe('TimelineHeader', () => {
  it('renders group label', () => {
    const dateRange = [new Date('2026-07-24')];
    render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="day"
        groupLabel="Team A"
        locale="en"
      />
    );
    expect(screen.getByText('Team A')).toBeTruthy();
  });

  it('renders date column header formatted as EEE, dd.MM', () => {
    const dateRange = [new Date('2026-07-24')];
    render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="day"
        groupLabel="Team"
        locale="en"
      />
    );
    // format(date, 'EEE, dd.MM') -> 'Fri, 24.07'
    expect(screen.getByText(/Fri, 24\.07/)).toBeTruthy();
  });

  it('renders all 24 hour labels in day view', () => {
    const dateRange = [new Date('2026-07-24')];
    render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="day"
        groupLabel="Team"
        locale="en"
      />
    );
    // Day view shows every hour (0-23)
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('23')).toBeTruthy();
  });

  it('renders hour labels every 6 hours in week view', () => {
    const dateRange = [new Date('2026-07-24')];
    render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="week"
        groupLabel="Team"
        locale="en"
      />
    );
    // Week view shows hours 0, 6, 12, 18
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
  });

  it('renders multiple date column headers when multiple days in range', () => {
    const dateRange = [
      new Date('2026-07-24'),
      new Date('2026-07-25'),
      new Date('2026-07-26'),
    ];
    render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="week"
        groupLabel="Team"
        locale="en"
      />
    );
    // Three date headers expected
    expect(screen.getByText(/Sat, 25\.07/)).toBeTruthy();
    expect(screen.getByText(/Sun, 26\.07/)).toBeTruthy();
    expect(screen.getByText(/Fri, 24\.07/)).toBeTruthy();
  });

  it('applies today highlighting for the current date', () => {
    // Today is 2026-07-24 in the test environment
    const dateRange = [new Date('2026-07-24')];
    const { container } = render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="day"
        groupLabel="Team"
        locale="en"
      />
    );
    // Today's column header should have the primary text color class
    const dateHeader = screen.getByText(/Fri, 24\.07/).closest('div');
    expect(dateHeader?.className).toContain('text-primary');
  });

  it('uses proper grid template columns for single day', () => {
    const dateRange = [new Date('2026-07-24')];
    const { container } = render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="day"
        groupLabel="Team"
        locale="en"
      />
    );
    const grids = container.querySelectorAll('.grid');
    expect(grids.length).toBe(2); // date header row + hour header row
    grids.forEach((grid) => {
      expect((grid as HTMLElement).style.gridTemplateColumns).toBe(
        '200px repeat(24, 1fr)'
      );
    });
  });

  it('adjusts grid columns for multiple days', () => {
    const dateRange = [
      new Date('2026-07-24'),
      new Date('2026-07-25'),
    ];
    const { container } = render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="week"
        groupLabel="Team"
        locale="en"
      />
    );
    const grids = container.querySelectorAll('.grid');
    grids.forEach((grid) => {
      expect((grid as HTMLElement).style.gridTemplateColumns).toBe(
        '200px repeat(48, 1fr)'
      );
    });
  });

  it('uses German locale when locale is "de"', () => {
    const dateRange = [new Date('2026-07-24')];
    render(
      <TimelineHeader
        dateRange={dateRange}
        viewMode="day"
        groupLabel="Team"
        locale="de"
      />
    );
    // German locale: 'Fr., 24.07'
    expect(screen.getByText(/Fr\.,? 24\.07/)).toBeTruthy();
  });
});
