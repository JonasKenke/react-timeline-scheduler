import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NavigationControls } from '../NavigationControls';

describe('NavigationControls', () => {
  it('renders two navigation buttons', () => {
    render(<NavigationControls onNavigate={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('calls onNavigate with "prev" when left button is clicked', () => {
    const onNavigate = vi.fn();
    render(<NavigationControls onNavigate={onNavigate} />);
    const [prevButton] = screen.getAllByRole('button');
    fireEvent.click(prevButton);
    expect(onNavigate).toHaveBeenCalledWith('prev');
  });

  it('calls onNavigate with "next" when right button is clicked', () => {
    const onNavigate = vi.fn();
    render(<NavigationControls onNavigate={onNavigate} />);
    const [, nextButton] = screen.getAllByRole('button');
    fireEvent.click(nextButton);
    expect(onNavigate).toHaveBeenCalledWith('next');
  });

  it('renders ChevronLeft and ChevronRight icons as SVGs', () => {
    const { container } = render(
      <NavigationControls onNavigate={vi.fn()} />
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('applies variant outline to buttons', () => {
    render(<NavigationControls onNavigate={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      // Button with variant="outline" gets 'border' class from cva
      expect(button.className).toContain('border');
    });
  });
});
