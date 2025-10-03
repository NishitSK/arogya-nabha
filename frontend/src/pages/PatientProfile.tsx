import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

export default function PatientProfile() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    fetch('/api/patient/me', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      })
      .then(text => {
        let data: any = {};
        if (text.trim()) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON Parse Error in PatientProfile:', parseError);
            console.error('Response text:', text);
            data = {};
          }
        }
        if (data && Object.keys(data).length) {
          setPatient(data);
          setForm({
            name: data.name || '',
            age: data.age || '',
            gender: data.gender || '',
            address: data.address || '',
            phone: data.phone || '',
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
      const res = await fetch('/api/patient/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      
      const text = await res.text();
      let data: any = {};
      
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON Parse Error in PatientProfile submit:', parseError);
          throw new Error('Invalid response from server');
        }
      }
      
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setPatient(data);
      localStorage.setItem('patientHasProfile', '1');
      setEdit(false);
      setSuccess('Profile updated! Redirecting to dashboard...');
      
      // Wait a moment to show success message, then navigate
      setTimeout(() => {
        navigate('/patient');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading profile…</div>;

  if (!patient && !edit) {
    // No existing profile but not in edit state (edge) -> force edit
    setEdit(true);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Patient Profile</h2>
      {edit ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
          <input name="age" value={form.age} onChange={handleChange} placeholder="Age" className="border p-2 rounded" type="number" required />
          <select name="gender" value={form.gender} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save Profile</button>
          {error && <div className="text-red-500 p-3 bg-red-50 rounded border border-red-200">{error}</div>}
          {success && <div className="text-green-700 p-3 bg-green-50 rounded border border-green-200 font-medium">{success}</div>}
        </form>
      ) : (
        <div>
          <div><b>Name:</b> {patient.name}</div>
          <div><b>Age:</b> {patient.age}</div>
          <div><b>Gender:</b> {patient.gender}</div>
          <div><b>Address:</b> {patient.address}</div>
          <div><b>Phone:</b> {patient.phone}</div>
          <button onClick={() => setEdit(true)} className="mt-4 bg-yellow-500 text-white p-2 rounded">Edit</button>
        </div>
      )}
    </motion.div>
  );
}
