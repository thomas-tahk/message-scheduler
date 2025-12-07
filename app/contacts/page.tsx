'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { contactsAPI } from '@/lib/api-client';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export default function Contacts() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
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
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await contactsAPI.create({
        name,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      setShowForm(false);

      // Reload contacts
      loadContacts();
    } catch (err: any) {
      setError(err.message || 'Failed to create contact');
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
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Contacts</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Contact Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Contact'}
          </button>
        </div>

        {/* Add Contact Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 mb-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15551234567"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <p className="text-sm text-gray-500">* At least one of email or phone is required</p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {submitting ? 'Adding...' : 'Add Contact'}
            </button>
          </form>
        )}

        {/* Contacts List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Contacts</h2>
          </div>

          {loadingContacts ? (
            <div className="p-8 text-center text-gray-600">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No contacts yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-500"
              >
                Add your first contact →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-6 hover:bg-gray-50">
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    {contact.email && (
                      <div>
                        <strong>Email:</strong> {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div>
                        <strong>Phone:</strong> {contact.phone}
                      </div>
                    )}
                    {contact.notes && (
                      <div>
                        <strong>Notes:</strong> {contact.notes}
                      </div>
                    )}
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
