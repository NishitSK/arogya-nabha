import React, { useState } from 'react';

interface Reminder { id: string; name: string; dosage: string; time: string; }

const MedicationReminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [form, setForm] = useState({ name: '', dosage: '', time: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.time) return;
    setReminders(prev => ([...prev, { id: Date.now().toString(), ...form }]));
    setForm({ name: '', dosage: '', time: '' });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Medication Reminders</h1>
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 bg-card border p-4 rounded-md">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Medicine" className="border rounded p-2 flex-1" />
        <input name="dosage" value={form.dosage} onChange={handleChange} placeholder="Dosage" className="border rounded p-2 w-32" />
        <input type="time" name="time" value={form.time} onChange={handleChange} className="border rounded p-2 w-36" />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Add</button>
      </form>
      <div className="space-y-2">
        {reminders.length === 0 && <div className="text-sm text-muted-foreground">No reminders yet.</div>}
        {reminders.map(r => (
          <div key={r.id} className="p-3 border rounded bg-card flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name} {r.dosage && <span className="text-xs text-muted-foreground">({r.dosage})</span>}</div>
              <div className="text-xs text-muted-foreground">At {r.time}</div>
            </div>
            <button onClick={() => setReminders(prev => prev.filter(x => x.id !== r.id))} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationReminders;
