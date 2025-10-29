import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createUser, updateUser, fetchUser, EmergencyContact } from '../../lib/usersApi';

type Mode = 'create' | 'edit';

export default function UserForm() {
  const { id } = useParams();
  const location = useLocation();
  const mode: Mode = location.pathname.endsWith('/new') ? 'create' : 'edit';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);

  const [first_name, setFirst] = useState('');
  const [middle_name, setMiddle] = useState('');
  const [last_name, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhone] = useState('');
  const [alternative_phone, setAltPhone] = useState('');
  const [street_address, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [digital_address, setDigital] = useState('');
  const [emergency, setEmergency] = useState<EmergencyContact>({ name: '', relationship: '', phone: '' });

  // Create-only fields
  const [date_of_birth, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say'>('male');
  const [id_type, setIdType] = useState<'ghana_card' | 'passport' | 'voter_id' | 'driver_license'>('ghana_card');
  const [id_number, setIdNumber] = useState('');

  useEffect(() => {
    let mounted = true;
    if (mode === 'edit' && id) {
      (async () => {
        try {
          const res = await fetchUser(id);
          if (!mounted) return;
          const u = res.user;
          setFirst(u.first_name || '');
          setMiddle(u.middle_name || '');
          setLast(u.last_name || '');
          setEmail(u.email || '');
          setPhone(u.phone_number || '');
          setAltPhone(u.alternative_phone || '');
          setStreet(u.street_address || '');
          setCity(u.city || '');
          setRegion(u.region || '');
          setDigital(u.digital_address || '');
          try {
            const ec = typeof u.emergency_contact === 'string' ? JSON.parse(u.emergency_contact) : u.emergency_contact;
            setEmergency({ name: ec?.name || '', relationship: ec?.relationship || '', phone: ec?.phone || '' });
          } catch {
            setEmergency({ name: '', relationship: '', phone: '' });
          }
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    }
    return () => { mounted = false; };
  }, [mode, id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'create') {
        if (!first_name || !last_name || !email || !phone_number || !date_of_birth || !id_number || !street_address || !city || !region || !emergency.name || !emergency.phone) {
          setError('Please fill all required fields');
          return;
        }
        await createUser({
          first_name, middle_name, last_name, email, phone_number, alternative_phone,
          date_of_birth, gender, nationality: 'Ghanaian', id_type, id_number,
          street_address, city, region, digital_address,
          professional_info: {}, emergency_contact: emergency,
        } as any);
        navigate('/admin/users');
      } else if (id) {
        await updateUser(id, {
          first_name, middle_name, last_name, email, phone_number, alternative_phone,
          street_address, city, region, digital_address,
          emergency_contact: emergency,
        });
        navigate(`/admin/users/${id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{mode === 'create' ? 'Add User' : 'Edit User'}</h1>
      </div>
      {loading ? (
        <div className="text-slate-600">Loading...</div>
      ) : (
        <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded p-4 space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Input label="First name" value={first_name} onChange={setFirst} required />
            <Input label="Middle name" value={middle_name} onChange={setMiddle} />
            <Input label="Last name" value={last_name} onChange={setLast} required />
            <Input label="Email" type="email" value={email} onChange={setEmail} required />
            <Input label="Phone" value={phone_number} onChange={setPhone} required />
            <Input label="Alt. Phone" value={alternative_phone} onChange={setAltPhone} />
            <Input label="Street address" value={street_address} onChange={setStreet} required />
            <Input label="City" value={city} onChange={setCity} required />
            <Input label="Region" value={region} onChange={setRegion} required />
            <Input label="Digital address" value={digital_address} onChange={setDigital} />
          </div>

          {mode === 'create' && (
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-slate-700">Date of Birth</label>
                <input type="date" className="mt-1 w-full border rounded px-3 py-2 text-sm" value={date_of_birth} onChange={(e)=>setDob(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm text-slate-700">Gender</label>
                <select className="mt-1 w-full border rounded px-3 py-2 text-sm" value={gender} onChange={(e)=>setGender(e.target.value as any)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700">ID Type</label>
                <select className="mt-1 w-full border rounded px-3 py-2 text-sm" value={id_type} onChange={(e)=>setIdType(e.target.value as any)}>
                  <option value="ghana_card">Ghana Card</option>
                  <option value="passport">Passport</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="driver_license">Driver License</option>
                </select>
              </div>
              <Input label="ID Number" value={id_number} onChange={setIdNumber} required />
            </div>
          )}

          <fieldset className="border rounded p-3">
            <legend className="text-sm font-semibold">Emergency Contact</legend>
            <div className="grid md:grid-cols-3 gap-3 mt-2">
              <Input label="Name" value={emergency.name} onChange={(v)=>setEmergency({...emergency, name: v})} required />
              <Input label="Relationship" value={emergency.relationship} onChange={(v)=>setEmergency({...emergency, relationship: v})} />
              <Input label="Phone" value={emergency.phone} onChange={(v)=>setEmergency({...emergency, phone: v})} required />
            </div>
          </fieldset>

          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button type="button" className="border rounded px-4 py-2 text-sm" onClick={()=>navigate(-1)}>Cancel</button>
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded px-4 py-2 text-sm">
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (v: string)=>void; type?: string; required?: boolean; }) {
  return (
    <div>
      <label className="text-sm text-slate-700">{label}</label>
      <input
        type={type}
        className="mt-1 w-full border rounded px-3 py-2 text-sm"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
