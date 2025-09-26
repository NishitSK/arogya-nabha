import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', specialization: '', experience: '', phone: '', clinic: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    fetch('/api/doctor/me', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.ok ? res.json() : {})
      .then((data: any) => {
        if (data && Object.keys(data).length) {
          setDoctor(data);
          setForm({
            name: data.name || '',
            specialization: data.specialization || '',
            experience: data.experience || '',
            phone: data.phone || '',
            clinic: data.clinic || '',
          });
          setEdit(!data.name);
        } else {
          setEdit(true);
        }
        setLoading(false);
      })
      .catch(() => { setEdit(true); setLoading(false); });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/doctor/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
  setDoctor(data);
  localStorage.setItem('doctorHasProfile', '1');
  setEdit(false);
  setSuccess('Profile updated!');
  navigate('/doctor');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading profile…</div>;

  if (!doctor && !edit) {
    setEdit(true);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <h2 className="text-2xl font-bold mb-4">Doctor Profile</h2>
      {edit ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
          <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 rounded" required />
          <input type="text" name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} className="border p-2 rounded" required />
          <input type="text" name="experience" placeholder="Experience (years)" value={form.experience} onChange={handleChange} className="border p-2 rounded" required />
          <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border p-2 rounded" required />
          <input type="text" name="clinic" placeholder="Clinic/Hospital" value={form.clinic} onChange={handleChange} className="border p-2 rounded" required />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save</button>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
        </form>
      ) : (
        <div className="bg-white p-6 rounded shadow w-80">
          <div className="mb-2"><b>Name:</b> {doctor?.name}</div>
          <div className="mb-2"><b>Specialization:</b> {doctor?.specialization}</div>
          <div className="mb-2"><b>Experience:</b> {doctor?.experience} years</div>
          <div className="mb-2"><b>Phone:</b> {doctor?.phone}</div>
          <div className="mb-2"><b>Clinic/Hospital:</b> {doctor?.clinic}</div>
          <button onClick={() => setEdit(true)} className="mt-4 bg-blue-500 text-white p-2 rounded">Edit</button>
        </div>
      )}
    </motion.div>
  );
}
