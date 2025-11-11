import React, { useState } from 'react';
import { ScheduleComponent, type BaseScheduleItem, type BaseGroup, type Translations } from '@jonaskenke/react-timeline-scheduler';


// Sample data - Base items (resources) grouped by department
const sampleGroups: BaseGroup[] = [
  { id: '1', name: 'John Doe', role: 'Developer', color: 'bg-blue-500', groupId: 'engineering' },
  { id: '2', name: 'Jane Smith', role: 'Designer', color: 'bg-green-500', groupId: 'design' },
  { id: '3', name: 'Bob Johnson', role: 'Manager', color: 'bg-orange-500', groupId: 'engineering' },
  { id: '4', name: 'Alice Brown', role: 'Senior Developer', color: 'bg-purple-500', groupId: 'engineering' },
  { id: '5', name: 'Charlie Wilson', role: 'UX Designer', color: 'bg-pink-500', groupId: 'design' },
  { id: '6', name: 'Diana Prince', role: 'Project Manager', color: 'bg-indigo-500' }, // No groupId - standalone
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
    id: '4',
    employeeId: '3',
    title: 'Sprint Planning',
    date: '2025-11-10',
    startTime: '13:00',
    endTime: '15:00',
    type: 'meeting',
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
  {
    id: '7',
    employeeId: '4',
    title: 'Architecture Review',
    date: '2025-11-11',
    startTime: '11:00',
    endTime: '12:30',
    type: 'meeting',
  },
  {
    id: '8',
    employeeId: '5',
    title: 'User Research',
    date: '2025-11-11',
    startTime: '09:00',
    endTime: '12:00',
    type: 'task',
  },
  {
    id: '9',
    employeeId: '6',
    title: 'Client Meeting',
    date: '2025-11-12',
    startTime: '15:00',
    endTime: '16:00',
    type: 'meeting',
  },
];

function App() {
  const [items, setItems] = useState<BaseScheduleItem[]>(sampleItems);
  const [groups, setGroups] = useState<BaseGroup[]>(sampleGroups);
  const [locale, setLocale] = useState<'en' | 'de' | 'es' | 'fr'>('en');
  const [useCustomTranslations, setUseCustomTranslations] = useState(false);

  // Custom translations example - override some strings
  const customTranslations: Partial<Translations> = {
    today: '📅 Today',
    newItem: '✨ New Event',
    allDay: '🌅 All Day',
    calendar: '📆 Calendar',
    timeline: '⏰ Timeline',
    meeting: '👥 Meeting',
    task: '📋 Task',
  };

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

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Locale:</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'en' | 'de' | 'es' | 'fr')}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Custom Translations:</label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={useCustomTranslations}
              onChange={(e) => setUseCustomTranslations(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm">Enable custom translations (with emojis)</span>
          </label>
        </div>

        <ScheduleComponent
          items={items}
          groups={groups}
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
          locale={locale}
          customTranslations={useCustomTranslations ? customTranslations : undefined}
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