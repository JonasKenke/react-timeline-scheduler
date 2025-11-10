import React, { useState } from 'react';
import { ScheduleComponent, type BaseScheduleItem, type BaseEmployee } from '@jonaskenke/react-timeline-scheduler';


// Sample data
const sampleGroups: BaseEmployee[] = [
  { id: '1', name: 'John Doe', role: 'Developer', color: 'bg-blue-500' },
  { id: '2', name: 'Jane Smith', role: 'Designer', color: 'bg-green-500' },
  { id: '3', name: 'Bob Johnson', role: 'Manager', color: 'bg-orange-500' },
];

const sampleItems: BaseScheduleItem[] = [
  {
    id: '1',
    employeeId: '1',
    title: 'Morning Standup',
    date: '2025-11-09',
    startTime: '09:00',
    endTime: '10:00',
    type: 'meeting',
  },
  {
    id: '2',
    employeeId: '2',
    title: 'Design Review',
    date: '2025-11-09',
    startTime: '14:00',
    endTime: '15:30',
    type: 'meeting',
  },
  {
    id: '3',
    employeeId: '1',
    title: 'Code Review',
    date: '2025-11-10',
    startTime: '10:00',
    endTime: '11:00',
    type: 'task',
  },
  {
    id: '5',
    employeeId: '1',
    title: 'Vacation Day',
    date: '2025-11-12',
    allDay: true,
    type: 'vacation',
  },
  {
    id: '6',
    employeeId: '2',
    title: 'Sick Leave',
    date: '2025-11-13',
    allDay: true,
    type: 'sick',
  },
];

function App() {
  const [items, setItems] = useState<BaseScheduleItem[]>(sampleItems);
  const [employees] = useState<BaseEmployee[]>(sampleGroups);

  const handleItemClick = (item: BaseScheduleItem) => {
    console.log('Item clicked:', item);
    alert(`Clicked: ${item.title}`);
  };

  const handleItemCreate = (data: Partial<BaseScheduleItem>) => {
    console.log('Create item:', data);
    // In a real app, you would open a modal or form here
    alert('Create functionality would open a form here');
  };

  const handleItemUpdate = (id: string, data: Partial<BaseScheduleItem>) => {
    console.log('Update item:', id, data);
    setItems(items.map(item => 
      item.id === id ? { ...item, ...data } : item
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Schedule Component Demo</h1>

        <ScheduleComponent
          items={items}
          groups={employees}
          onItemClick={handleItemClick}
          onItemCreate={handleItemCreate}
          onItemUpdate={handleItemUpdate}
          canCreate={true}
          canEdit={true}
          showControls={true}
          showLegend={true}
          legendItems={[
            { label: 'Meetings', color: 'bg-green-500' },
            { label: 'Tasks', color: 'bg-orange-500' },
            { label: 'Breaks', color: 'bg-gray-500' },
            { label: 'Vacation', color: 'bg-purple-500' },
            { label: 'Sick Leave', color: 'bg-yellow-500' },
          ]}
          locale="en"
        />

        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">JSON Data Format</h2>
          <p className="text-sm text-gray-600 mb-4">
            The component accepts data in the following JSON format:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Groups:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{JSON.stringify(sampleGroups, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-medium">Schedule Items:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{JSON.stringify(sampleItems, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;