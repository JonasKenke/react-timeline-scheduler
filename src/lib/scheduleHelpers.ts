// Helper functions for schedule calculations

export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const calculateItemPosition = (item: any, totalHours: number = 24) => {
  // Handle all-day items
  if (item.allDay) {
    return {
      left: 0,
      width: 100,
      startMinutes: 0,
      endMinutes: 24 * 60,
      duration: 24 * 60,
    };
  }

  const startMinutes = timeToMinutes(item.startTime);
  const endMinutes = timeToMinutes(item.endTime);

  let duration = endMinutes - startMinutes;
  if (duration < 0) {
    duration = 24 * 60 - startMinutes + endMinutes;
  }

  const totalMinutes = totalHours * 60;
  const left = (startMinutes / totalMinutes) * 100;
  const width = (duration / totalMinutes) * 100;

  return { left, width, startMinutes, endMinutes, duration };
};

export const calculateVerticalPosition = (items: any[]) => {
  // Sort items by start time (all-day items come first)
  const sortedItems = [...items].sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return (
      timeToMinutes(a.startTime || "00:00") -
      timeToMinutes(b.startTime || "00:00")
    );
  });

  // Assign each item to a row level based on overlaps
  const levels: any[][] = [];

  sortedItems.forEach((item) => {
    const itemStart = item.allDay ? 0 : timeToMinutes(item.startTime);
    const itemEnd = item.allDay ? 24 * 60 : timeToMinutes(item.endTime);

    // Find the first level where this item doesn't overlap with existing items
    let assignedLevel = -1;
    for (let i = 0; i < levels.length; i++) {
      const levelItems = levels[i];
      const hasOverlap = levelItems.some((existingItem) => {
        const existingStart = existingItem.allDay
          ? 0
          : timeToMinutes(existingItem.startTime);
        const existingEnd = existingItem.allDay
          ? 24 * 60
          : timeToMinutes(existingItem.endTime);
        return !(itemEnd <= existingStart || itemStart >= existingEnd);
      });

      if (!hasOverlap) {
        assignedLevel = i;
        break;
      }
    }

    // If no level found, create a new one
    if (assignedLevel === -1) {
      assignedLevel = levels.length;
      levels.push([]);
    }

    levels[assignedLevel].push(item);
  });

  // Return the level for each item
  return items.map((item) => {
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].includes(item)) {
        return i;
      }
    }
    return 0;
  });
};
