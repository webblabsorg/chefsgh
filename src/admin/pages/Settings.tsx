import { useState } from 'react';
import { exportUsersCsv, exportPaymentsCsv, importUsersCsv, importPaymentsCsv } from '../../lib/adminCsvApi';

export default function Settings() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [importUsersFile, setImportUsersFile] = useState<File | null>(null);
  const [importPaymentsFile, setImportPaymentsFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onExportUsers = async () => {
    setMsg(null);
    const blob = await exportUsersCsv({ start, end });
    downloadBlob(blob, `users-${new Date().toISOString().slice(0,10)}.csv`);
  };
  const onExportPayments = async () => {
    setMsg(null);
    const blob = await exportPaymentsCsv({ start, end });
    downloadBlob(blob, `payments-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const onImportUsers = async () => {
    if (!importUsersFile) { setMsg('Choose a users CSV file'); return; }
    setMsg(null);
    const res = await importUsersCsv(importUsersFile, dryRun);
    setMsg(`Users import ${dryRun ? 'dry-run' : 'applied'}: processed ${res.processed}, created ${res.created}, updated ${res.updated}, errors ${res.errors.length}`);
  };
  const onImportPayments = async () => {
    if (!importPaymentsFile) { setMsg('Choose a payments CSV file'); return; }
    setMsg(null);
    const res = await importPaymentsCsv(importPaymentsFile, dryRun);
    setMsg(`Payments import ${dryRun ? 'dry-run' : 'applied'}: processed ${res.processed}, created ${res.created}, updated ${res.updated}, errors ${res.errors.length}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="bg-white border border-slate-200 rounded p-4 space-y-3">
        <div className="font-semibold">CSV Export</div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm text-slate-700">Start Date</label>
            <input type="date" className="mt-1 border rounded px-3 py-2 text-sm" value={start} onChange={(e)=>setStart(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-700">End Date</label>
            <input type="date" className="mt-1 border rounded px-3 py-2 text-sm" value={end} onChange={(e)=>setEnd(e.target.value)} />
          </div>
          <button onClick={onExportUsers} className="bg-teal-600 hover:bg-teal-700 text-white rounded px-4 py-2 text-sm">Export Users CSV</button>
          <button onClick={onExportPayments} className="border rounded px-4 py-2 text-sm">Export Payments CSV</button>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded p-4 space-y-3">
        <div className="font-semibold">CSV Import</div>
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={dryRun} onChange={(e)=>setDryRun(e.target.checked)} /> Dry run (validate only)</label>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Import Users</div>
            <input type="file" accept=".csv" onChange={(e)=>setImportUsersFile(e.target.files?.[0] || null)} />
            <button onClick={onImportUsers} className="bg-teal-600 hover:bg-teal-700 text-white rounded px-4 py-2 text-sm">Upload</button>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Import Payments</div>
            <input type="file" accept=".csv" onChange={(e)=>setImportPaymentsFile(e.target.files?.[0] || null)} />
            <button onClick={onImportPayments} className="border rounded px-4 py-2 text-sm">Upload</button>
          </div>
        </div>
        {msg && <div className="text-sm text-slate-700">{msg}</div>}
      </section>
    </div>
  );
}

