import React, { useState } from 'react';

interface VitalEntry { id: string; type: string; value: string; date: string; }

const VitalsTracker: React.FC = () => {
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [form, setForm] = useState({ type: 'Blood Pressure', value: '', date: new Date().toISOString().slice(0,10) });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value) return;
    setEntries(prev => ([...prev, { id: Date.now().toString(), ...form }]));
    setForm(f => ({ ...f, value: '' }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Vitals Tracker</h1>
      <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-4 bg-card border p-4 rounded-md items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Vital Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="border rounded p-2 text-sm">
              <option>Blood Pressure</option>
              <option>Heart Rate</option>
              <option>Blood Sugar</option>
              <option>Temperature</option>
              <option>Oxygen Saturation</option>
            </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Value</label>
          <input name="value" value={form.value} onChange={handleChange} placeholder="e.g. 120/80 or 98" className="border rounded p-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="border rounded p-2 text-sm" />
        </div>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded text-sm">Add</button>
      </form>
      <div className="space-y-2">
        {entries.length === 0 && <div className="text-sm text-muted-foreground">No entries yet.</div>}
        {entries.map(e => (
          <div key={e.id} className="p-3 border rounded bg-card flex justify-between items-center text-sm">
            <div>
              <div className="font-medium">{e.type}</div>
              <div className="text-muted-foreground text-xs">{e.value} on {e.date}</div>
            </div>
            <button onClick={() => setEntries(prev => prev.filter(x => x.id !== e.id))} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VitalsTracker;
