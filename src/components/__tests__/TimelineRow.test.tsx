import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimelineRow } from '../TimelineRow';
import { translations } from '../../lib/translations';
import type { BaseGroup, BaseScheduleItem } from '../../types';

const mockGroup: BaseGroup = {
  id: 'g1',
  name: 'Alice',
  role: 'Developer',
};

const mockItem: BaseScheduleItem = {
  id: 'item1',
  employeeId: 'g1',
  title: 'Morning Standup',
  date: '2026-07-24',
  startTime: '09:00',
  endTime: '09:30',
};

const createProps = (overrides: Partial<Parameters<typeof TimelineRow>[0]> = {}) => ({
  group: mockGroup,
  groups: [mockGroup],
  employeeItems: [mockItem],
  verticalLevels: [0],
  dateRange: [new Date('2026-07-24')],
  viewMode: 'day' as const,
  currentDate: new Date('2026-07-24'),
  draggedItem: null,
  dropTarget: null,
  itemTypes: {},
  t: translations.en,
  canEdit: true,
  canCreate: true,
  showGroupRole: true,
  showGroupAvatar: true,
  groupColors: ['bg-blue-500'],
  locale: 'en',
  onItemClick: vi.fn(),
  onCreateClick: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  computeDropPos: vi.fn(() => ({ left: 0, width: 100 })),
  snapToInterval: vi.fn((m: number) => m),
  timeToMinutes: vi.fn((s: string) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  }),
  ...overrides,
});

describe('TimelineRow', () => {
  it('renders group name', () => {
    render(<TimelineRow {...createProps()} />);
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('renders item title', () => {
    render(<TimelineRow {...createProps()} />);
    expect(screen.getByText('Morning Standup')).toBeTruthy();
  });

  it('shows group role when showGroupRole is true', () => {
    render(<TimelineRow {...createProps()} />);
    expect(screen.getByText('Developer')).toBeTruthy();
  });

  it('hides group role when showGroupRole is false', () => {
    render(<TimelineRow {...createProps({ showGroupRole: false })} />);
    expect(screen.queryByText('Developer')).toBeNull();
  });

  it('renders with empty items gracefully', () => {
    const { container } = render(
      <TimelineRow {...createProps({ employeeItems: [] })} />
    );
    expect(screen.getByText('Alice')).toBeTruthy();
    // Timeline area should still exist with minHeight
    const timelineAreas = container.querySelectorAll('.border-r');
    expect(timelineAreas.length).toBeGreaterThan(0);
  });

  it('calls onItemClick when item is clicked', () => {
    const onItemClick = vi.fn();
    render(<TimelineRow {...createProps({ onItemClick })} />);
    fireEvent.click(screen.getByText('Morning Standup'));
    expect(onItemClick).toHaveBeenCalledWith({
      ...mockItem,
    });
  });

  it('renders group avatar initials when no avatar URL provided', () => {
    render(<TimelineRow {...createProps()} />);
    // Alice's initials: 'A'
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('applies group color class', () => {
    render(<TimelineRow {...createProps({ groupColors: ['bg-green-500'] })} />);
    const initialsContainer = screen.getByText('A').closest('.rounded-full');
    expect(initialsContainer?.className).toContain('bg-green-500');
  });

  it('has row border top', () => {
    const { container } = render(
      <TimelineRow {...createProps()} />
    );
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain('border-t');
  });
});

describe('TimelineRow drag and drop', () => {
  it('renders items even when one is being dragged', () => {
    render(<TimelineRow {...createProps({ draggedItem: mockItem })} />);
    // Item card should still be rendered (not filtered out)
    expect(screen.getByText('Morning Standup')).toBeTruthy();
  });

  it('shows drop placeholder when draggedItem is set without dropTarget', () => {
    const { container } = render(
      <TimelineRow {...createProps({ draggedItem: mockItem })} />
    );
    // DropPlaceholder renders with dashed border
    const placeholder = container.querySelector('.border-dashed');
    expect(placeholder).toBeTruthy();
    // The placeholder shows the item title with a fallback default time
    expect(screen.getByText(/Morning Standup • 00:00-00:30/)).toBeTruthy();
  });

  it('shows time-snapped drop placeholder when dropTarget has time', () => {
    const dropTarget = { groupId: 'g1', date: new Date('2026-07-24'), time: '10:00' };
    render(<TimelineRow {...createProps({ draggedItem: mockItem, dropTarget })} />);
    // The placeholder shows the snapped time derived from dropTarget.time
    expect(screen.getByText(/Morning Standup • 10:00-10:30/)).toBeTruthy();
  });

  it('onDragStart callback fires with correct item', () => {
    const onDragStart = vi.fn();
    render(<TimelineRow {...createProps({ onDragStart })} />);
    const itemEl = screen.getByText('Morning Standup');
    fireEvent.dragStart(itemEl, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    expect(onDragStart).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 'item1', title: 'Morning Standup' })
    );
  });

  it('onDragOver callback fires with computed time', () => {
    const onDragOver = vi.fn();
    const { container } = render(<TimelineRow {...createProps({ onDragOver })} />);
    const timelineArea = container.querySelector('.col-span-full') as HTMLElement;
    fireEvent.dragOver(timelineArea, { clientX: 100, clientY: 50 });
    expect(onDragOver).toHaveBeenCalledWith(
      expect.any(Object),
      'g1',
      expect.any(Date),
      expect.any(String)
    );
  });

  it('onDrop callback fires with correct data', () => {
    const onDrop = vi.fn();
    const { container } = render(<TimelineRow {...createProps({ onDrop })} />);
    const timelineArea = container.querySelector('.col-span-full') as HTMLElement;
    fireEvent.drop(timelineArea, { clientX: 100, clientY: 50 });
    expect(onDrop).toHaveBeenCalledWith(
      expect.any(Object),
      'g1',
      expect.any(Date),
      expect.any(String)
    );
  });

  it('applies highlight class when dropTarget groupId matches', () => {
    const dropTarget = { groupId: 'g1', date: new Date('2026-07-24') };
    const { container } = render(<TimelineRow {...createProps({ dropTarget })} />);
    const timelineArea = container.querySelector('.col-span-full') as HTMLElement;
    expect(timelineArea.className).toContain('bg-primary/10');
  });

  it('does not apply highlight when dropTarget groupId is different', () => {
    const dropTarget = { groupId: 'g2', date: new Date('2026-07-24') };
    const { container } = render(<TimelineRow {...createProps({ dropTarget })} />);
    const timelineArea = container.querySelector('.col-span-full') as HTMLElement;
    expect(timelineArea.className).not.toContain('bg-primary/10');
  });
});
