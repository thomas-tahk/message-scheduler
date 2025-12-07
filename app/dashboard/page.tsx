'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { schedulesAPI, schedulerAPI } from '@/lib/api-client';
import Link from 'next/link';

interface Schedule {
  id: string;
  type: 'EMAIL' | 'SMS';
  subject: string | null;
  body: string;
  recipientEmail: string | null;
  recipientPhone: string | null;
  recipientName: string | null;
  scheduledFor: string;
  enabled: boolean;
  status: string;
  recurrence: any;
  lastSentAt: string | null;
  nextRunAt: string | null;
  _count: {
    messages: number;
  };
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [triggeringScheduler, setTriggeringScheduler] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [user]);

  const loadSchedules = async () => {
    try {
      const data = await schedulesAPI.list();
      setSchedules(data.schedules);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleTriggerScheduler = async () => {
    setTriggeringScheduler(true);
    try {
      await schedulerAPI.trigger();
      alert('Scheduler triggered! Check your schedules for status updates.');
      loadSchedules();
    } catch (err: any) {
      alert('Failed to trigger scheduler: ' + err.message);
    } finally {
      setTriggeringScheduler(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await schedulesAPI.delete(id);
      loadSchedules();
    } catch (err: any) {
      alert('Failed to delete schedule: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Message Scheduler</h1>
            <p className="text-sm text-gray-600">Welcome, {user.name || user.email}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/contacts"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Contacts
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Link
            href="/schedules/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + New Schedule
          </Link>
          <button
            onClick={handleTriggerScheduler}
            disabled={triggeringScheduler}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400"
          >
            {triggeringScheduler ? 'Triggering...' : '▶ Run Scheduler Now'}
          </button>
        </div>

        {/* Schedules List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Schedules</h2>
          </div>

          {loadingSchedules ? (
            <div className="p-8 text-center text-gray-600">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No schedules yet.</p>
              <Link
                href="/schedules/new"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500"
              >
                Create your first schedule →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            schedule.type === 'EMAIL'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {schedule.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            schedule.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : schedule.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : schedule.status === 'COMPLETED'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {schedule.status}
                        </span>
                        {!schedule.enabled && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                            DISABLED
                          </span>
                        )}
                        {schedule.recurrence && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                            RECURRING
                          </span>
                        )}
                      </div>

                      {schedule.subject && (
                        <h3 className="font-semibold text-gray-900">{schedule.subject}</h3>
                      )}
                      <p className="text-gray-600 text-sm mt-1">
                        {schedule.body.length > 100
                          ? schedule.body.substring(0, 100) + '...'
                          : schedule.body}
                      </p>

                      <div className="mt-3 text-sm text-gray-500 space-y-1">
                        <div>
                          <strong>To:</strong>{' '}
                          {schedule.recipientName || schedule.recipientEmail || schedule.recipientPhone}
                        </div>
                        <div>
                          <strong>Scheduled:</strong> {formatDate(schedule.scheduledFor)}
                        </div>
                        {schedule.nextRunAt && (
                          <div>
                            <strong>Next Run:</strong> {formatDate(schedule.nextRunAt)}
                          </div>
                        )}
                        {schedule.lastSentAt && (
                          <div>
                            <strong>Last Sent:</strong> {formatDate(schedule.lastSentAt)}
                          </div>
                        )}
                        <div>
                          <strong>Messages Sent:</strong> {schedule._count.messages}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
