'use client';

import { useState, useEffect } from 'react';

interface Schedule {
  id: string;
  name: string;
  subject: string;
  body: string;
  recipients: string[];
  enabled: boolean;
  recurrence: {
    type: 'once' | 'daily' | 'weekly' | 'monthly';
    time: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    startDate?: string;
  };
  lastSent?: string;
  createdAt: string;
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [time, setTime] = useState('09:00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    const res = await fetch('/api/schedules');
    const data = await res.json();
    setSchedules(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const scheduleData = {
      name,
      subject,
      body,
      recipients: recipients.split(',').map((r) => r.trim()),
      enabled: true,
      recurrence: {
        type: recurrenceType,
        time,
        ...(recurrenceType === 'weekly' && { daysOfWeek }),
        ...(recurrenceType === 'monthly' && { dayOfMonth }),
        ...(recurrenceType === 'once' && { startDate }),
      },
    };

    if (editingId) {
      await fetch(`/api/schedules/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });
    } else {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });
    }

    resetForm();
    loadSchedules();
  }

  function resetForm() {
    setName('');
    setSubject('');
    setBody('');
    setRecipients('');
    setRecurrenceType('daily');
    setTime('09:00');
    setDaysOfWeek([1]);
    setDayOfMonth(1);
    setStartDate('');
    setShowForm(false);
    setEditingId(null);
  }

  function editSchedule(schedule: Schedule) {
    setEditingId(schedule.id);
    setName(schedule.name);
    setSubject(schedule.subject);
    setBody(schedule.body);
    setRecipients(schedule.recipients.join(', '));
    setRecurrenceType(schedule.recurrence.type);
    setTime(schedule.recurrence.time);
    setDaysOfWeek(schedule.recurrence.daysOfWeek || [1]);
    setDayOfMonth(schedule.recurrence.dayOfMonth || 1);
    setStartDate(schedule.recurrence.startDate || '');
    setShowForm(true);
  }

  async function deleteSchedule(id: string) {
    if (!confirm('Delete this schedule?')) return;
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    loadSchedules();
  }

  async function toggleSchedule(id: string, enabled: boolean) {
    await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    });
    loadSchedules();
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Scheduler</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Schedule'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Schedule' : 'Create Schedule'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Weekly team update"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Weekly Team Update - [Date]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                  placeholder="Hello team,&#10;&#10;Here's what's happening this week..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients (comma-separated)
                </label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="email1@example.com, email2@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurrence
                  </label>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="once">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              {recurrenceType === 'once' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              )}

              {recurrenceType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days of Week
                  </label>
                  <div className="flex gap-2">
                    {dayNames.map((day, idx) => (
                      <label key={idx} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={daysOfWeek.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDaysOfWeek([...daysOfWeek, idx]);
                            } else {
                              setDaysOfWeek(daysOfWeek.filter((d) => d !== idx));
                            }
                          }}
                          className="mr-1"
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {recurrenceType === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Create'} Schedule
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Schedules</h2>
          {schedules.length === 0 ? (
            <p className="text-gray-500">No schedules yet. Create one to get started!</p>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {schedule.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Subject:</span> {schedule.subject}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">To:</span> {schedule.recipients.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Schedule:</span> {schedule.recurrence.type} at {schedule.recurrence.time}
                      {schedule.recurrence.type === 'weekly' &&
                        ` (${schedule.recurrence.daysOfWeek?.map((d) => dayNames[d]).join(', ')})`}
                      {schedule.recurrence.type === 'monthly' &&
                        ` (day ${schedule.recurrence.dayOfMonth})`}
                    </p>
                    {schedule.lastSent && (
                      <p className="text-sm text-gray-500 mt-1">
                        Last sent: {new Date(schedule.lastSent).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleSchedule(schedule.id, schedule.enabled)}
                      className={`px-3 py-1 rounded ${
                        schedule.enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {schedule.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => editSchedule(schedule)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
