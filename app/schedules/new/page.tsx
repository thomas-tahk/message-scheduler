'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { schedulesAPI, contactsAPI } from '@/lib/api-client';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function NewSchedule() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [type, setType] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [contactId, setContactId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [interval, setInterval] = useState(1);
  const [endDate, setEndDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      const data = await contactsAPI.list();
      setContacts(data.contacts);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  const handleContactChange = (contactId: string) => {
    setContactId(contactId);
    if (contactId) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        setRecipientEmail(contact.email || '');
        setRecipientPhone(contact.phone || '');
        setRecipientName(contact.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const recurrence = isRecurring ? {
        type: recurrenceType,
        interval,
        ...(endDate && { endDate }),
      } : null;

      await schedulesAPI.create({
        type,
        subject: type === 'EMAIL' ? subject : null,
        body,
        contactId: contactId || null,
        recipientEmail: type === 'EMAIL' ? recipientEmail : null,
        recipientPhone: type === 'SMS' ? recipientPhone : null,
        recipientName: recipientName || null,
        scheduledFor,
        recurrence,
        enabled: true,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create New Schedule</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Message Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="EMAIL"
                  checked={type === 'EMAIL'}
                  onChange={(e) => setType(e.target.value as 'EMAIL' | 'SMS')}
                  className="mr-2"
                />
                Email
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="SMS"
                  checked={type === 'SMS'}
                  onChange={(e) => setType(e.target.value as 'EMAIL' | 'SMS')}
                  className="mr-2"
                />
                SMS
              </label>
            </div>
          </div>

          {/* Contact Selection */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
              Select Contact (optional)
            </label>
            <select
              id="contact"
              value={contactId}
              onChange={(e) => handleContactChange(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Or enter manually below --</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} ({contact.email || contact.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Recipient Info */}
          <div>
            <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
              Recipient Name (optional)
            </label>
            <input
              id="recipientName"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {type === 'EMAIL' ? (
            <div>
              <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700">
                Recipient Email *
              </label>
              <input
                id="recipientEmail"
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700">
                Recipient Phone *
              </label>
              <input
                id="recipientPhone"
                type="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+15551234567"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {/* Subject (Email Only) */}
          {type === 'EMAIL' && (
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject *
              </label>
              <input
                id="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              Message *
            </label>
            <textarea
              id="body"
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {type === 'SMS' && (
              <p className="mt-1 text-sm text-gray-500">
                Character count: {body.length} (keep under 160 for best results)
              </p>
            )}
          </div>

          {/* Schedule Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                id="scheduledDate"
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                id="scheduledTime"
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Recurring Options */}
          <div className="border-t pt-6">
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Make this recurring</span>
            </label>

            {isRecurring && (
              <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                <div>
                  <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700">
                    Repeat
                  </label>
                  <select
                    id="recurrenceType"
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                    Every (interval)
                  </label>
                  <input
                    id="interval"
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Example: Every {interval} {recurrenceType === 'daily' ? 'day(s)' : recurrenceType === 'weekly' ? 'week(s)' : recurrenceType === 'monthly' ? 'month(s)' : 'year(s)'}
                  </p>
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date (optional)
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty for no end date
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {submitting ? 'Creating...' : 'Create Schedule'}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
