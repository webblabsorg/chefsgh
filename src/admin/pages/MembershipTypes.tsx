import { useEffect, useState } from 'react';
import {
  fetchMembershipTypesAdmin,
  createMembershipType,
  updateMembershipType,
  deleteMembershipType,
  MembershipType,
} from '../../lib/adminMembershipTypesApi';

export default function MembershipTypes() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MembershipType[]>([]);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [cName, setCName] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cPrice, setCPrice] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cBenefits, setCBenefits] = useState('');

  // Inline edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [eName, setEName] = useState('');
  const [eSlug, setESlug] = useState('');
  const [ePrice, setEPrice] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eBenefits, setEBenefits] = useState('');
  const [eActive, setEActive] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMembershipTypesAdmin({ includeInactive });
      setData(res.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [includeInactive]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createMembershipType({
        name: cName.trim(),
        slug: cSlug.trim(),
        price: Number(cPrice || 0),
        description: cDesc.trim() || undefined,
        benefits: cBenefits,
        is_active: true,
      } as any);
      setCName(''); setCSlug(''); setCPrice(''); setCDesc(''); setCBenefits('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Create failed');
    }
  };

  const startEdit = (mt: MembershipType) => {
    setEditId(mt.id);
    setEName(mt.name);
    setESlug(mt.slug);
    setEPrice(String(mt.price));
    setEDesc(mt.description || '');
    setEBenefits((mt.benefits || []).join(', '));
    setEActive(mt.is_active);
  };

  const onSave = async (id: string) => {
    setError(null);
    try {
      await updateMembershipType(id, {
        name: eName.trim(),
        slug: eSlug.trim(),
        price: Number(ePrice || 0),
        description: eDesc.trim() || undefined,
        benefits: eBenefits,
        is_active: eActive,
      } as any);
      setEditId(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Save failed');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this membership type? This will fail if it is in use.')) return;
    setError(null);
    try {
      await deleteMembershipType(id);
      await load();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Membership Types</h1>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={includeInactive} onChange={(e)=>setIncludeInactive(e.target.checked)} /> Include inactive
        </label>
      </div>

      <form onSubmit={onCreate} className="bg-white border border-slate-200 rounded p-4 space-y-3">
        <div className="font-semibold">Add New</div>
        <div className="grid md:grid-cols-5 gap-3">
          <Input label="Name" value={cName} onChange={setCName} required />
          <Input label="Slug" value={cSlug} onChange={setCSlug} required />
          <Input label="Price" value={cPrice} onChange={setCPrice} type="number" required />
          <Input label="Description" value={cDesc} onChange={setCDesc} />
          <Input label="Benefits (comma-separated)" value={cBenefits} onChange={setCBenefits} />
        </div>
        <div className="flex justify-end">
          <button className="bg-teal-600 hover:bg-teal-700 text-white rounded px-4 py-2 text-sm">Create</button>
        </div>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Slug</th>
              <th className="text-left px-3 py-2">Price</th>
              <th className="text-left px-3 py-2">Active</th>
              <th className="text-left px-3 py-2">Benefits</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={6}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={6}>No membership types</td></tr>
            ) : data.map((mt) => (
              <tr key={mt.id} className="border-t">
                <td className="px-3 py-2">
                  {editId === mt.id ? (
                    <input className="border rounded px-2 py-1 w-full" value={eName} onChange={(e)=>setEName(e.target.value)} />
                  ) : (
                    <div className="font-medium">{mt.name}</div>
                  )}
                  <div className="text-xs text-slate-500">{mt.description}</div>
                </td>
                <td className="px-3 py-2">
                  {editId === mt.id ? (
                    <input className="border rounded px-2 py-1 w-full" value={eSlug} onChange={(e)=>setESlug(e.target.value)} />
                  ) : (
                    mt.slug
                  )}
                </td>
                <td className="px-3 py-2">
                  {editId === mt.id ? (
                    <input type="number" className="border rounded px-2 py-1 w-full" value={ePrice} onChange={(e)=>setEPrice(e.target.value)} />
                  ) : (
                    `GH₵${Number(mt.price).toFixed(2)}`
                  )}
                </td>
                <td className="px-3 py-2">
                  {editId === mt.id ? (
                    <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={eActive} onChange={(e)=>setEActive(e.target.checked)} /> Active</label>
                  ) : (
                    <span className="rounded px-2 py-0.5 text-xs border">{mt.is_active ? 'Yes' : 'No'}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editId === mt.id ? (
                    <input className="border rounded px-2 py-1 w-full" value={eBenefits} onChange={(e)=>setEBenefits(e.target.value)} />
                  ) : (
                    <div className="text-xs text-slate-700 truncate max-w-[360px]">{(mt.benefits || []).join(', ')}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {editId === mt.id ? (
                    <div className="flex gap-2 justify-end">
                      <button className="border rounded px-2 py-1 text-sm" onClick={()=>setEditId(null)}>Cancel</button>
                      <button className="bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-1 text-sm" onClick={()=>onSave(mt.id)}>Save</button>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-end text-sm">
                      <button className="text-teal-700 hover:underline" onClick={()=>startEdit(mt)}>Edit</button>
                      <button className="text-red-600 hover:underline" onClick={()=>onDelete(mt.id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

