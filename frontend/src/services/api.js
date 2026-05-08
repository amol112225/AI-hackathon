const API_BASE = 'http://localhost:8000';

export const api = {
  // Leads
  getLeads: async () => {
    const res = await fetch(`${API_BASE}/leads/`);
    return res.json();
  },
  
  addLead: async (data) => {
    const res = await fetch(`${API_BASE}/leads/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/leads/upload-csv`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Calls
  startCalls: async () => {
    const res = await fetch(`${API_BASE}/calls/start`, { method: 'POST' });
    return res.json();
  },
  
  stopCalls: async () => {
    const res = await fetch(`${API_BASE}/calls/stop`, { method: 'POST' });
    return res.json();
  },
  
  startSingleCall: async (leadId) => {
    const res = await fetch(`${API_BASE}/calls/start/${leadId}`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  endSingleCall: async (leadId) => {
    const res = await fetch(`${API_BASE}/calls/${leadId}/end`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  chat: async (leadId, message) => {
    const res = await fetch(`${API_BASE}/calls/${leadId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Transcripts & Summary
  getTranscript: async (leadId) => {
    const res = await fetch(`${API_BASE}/transcript/${leadId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  getSummary: async (leadId) => {
    const res = await fetch(`${API_BASE}/summary/${leadId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
