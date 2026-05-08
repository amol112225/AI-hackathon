import { useState, useEffect } from 'react';
import { api } from '../services/api';
import LeadList from '../components/LeadList';

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', language: 'English' });
  const [file, setFile] = useState(null);

  const fetchLeads = async () => {
    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await api.addLead(newLead);
      setNewLead({ name: '', phone: '', language: 'English' });
      fetchLeads();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadCSV = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      setLoading(true);
      await api.uploadCSV(file);
      setFile(null);
      fetchLeads();
      alert('CSV Uploaded Successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAll = async () => {
    await api.startCalls();
    fetchLeads();
  };

  const handleStopAll = async () => {
    await api.stopCalls();
    fetchLeads();
  };

  return (
    <div className="flex-col">
      <div className="flex-row space-between">
        <h2>Dashboard</h2>
        <div className="flex-row">
          <button onClick={handleStartAll} style={{ backgroundColor: 'var(--ongoing-color)' }}>Start All Calls</button>
          <button onClick={handleStopAll} style={{ backgroundColor: 'var(--hot-color)' }}>Stop All Calls</button>
        </div>
      </div>

      <div className="flex-row" style={{ alignItems: 'stretch' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3>Add Lead Manually</h3>
          <form onSubmit={handleAddLead} className="flex-col" style={{ marginTop: '1rem' }}>
            <input type="text" placeholder="Name" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} required />
            <input type="text" placeholder="Phone" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} required />
            <button type="submit">Add Lead</button>
          </form>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h3>Upload CSV</h3>
          <form onSubmit={handleUploadCSV} className="flex-col" style={{ marginTop: '1rem' }}>
            <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} required />
            <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload CSV'}</button>
          </form>
        </div>
      </div>

      <LeadList leads={leads} />
    </div>
  );
}

export default Dashboard;
