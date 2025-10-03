import React, { useState } from 'react';
import { authenticatedApiCall } from '@/lib/api';

const BookAppointment: React.FC = () => {
  const [form, setForm] = useState({ specialization: '', date: '', time: '', type: 'teleconsultation' });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const data = await authenticatedApiCall('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({ ...form })
      });
      
      if (data && data.doctor && data.doctor.name) {
        setMessage(`Appointment pending with Dr. ${data.doctor.name}`);
      } else {
        setMessage('Appointment request submitted (pending doctor confirmation).');
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Book Appointment</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-card border p-4 rounded-md">
        <div>
          <label className="block text-sm mb-1">Specialization (just a note)</label>
          <input name="specialization" value={form.specialization} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Time</label>
            <input type="time" name="time" value={form.time} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded p-2">
            <option value="teleconsultation">Teleconsultation</option>
            <option value="in-person">In Person</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
        {message && <div className="text-sm mt-2">{message}</div>}
      </form>
    </div>
  );
};

export default BookAppointment;
