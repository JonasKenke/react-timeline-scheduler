import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationControlsProps {
  onNavigate: (direction: 'prev' | 'next') => void;
}

/**
 * Prev/Next navigation buttons for moving through date ranges.
 */
export function NavigationControls({
  onNavigate,
}: NavigationControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onNavigate('prev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onNavigate('next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
