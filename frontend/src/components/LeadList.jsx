import { useNavigate } from 'react-router-dom';

function LeadList({ leads }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h3>All Leads</h3>
      <table style={{ width: '100%', marginTop: '1rem', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            <th>Name</th>
            <th>Phone</th>
            <th>Call Status</th>
            <th>Classification</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.5rem 0' }}>{lead.name}</td>
              <td>{lead.phone}</td>
              <td className={`call-${lead.call_status}`}>{lead.call_status.toUpperCase()}</td>
              <td className={`status-${lead.classification}`}>{lead.classification}</td>
              <td>{lead.score}</td>
              <td>
                <button onClick={() => navigate(`/call/${lead.id}`)}>
                  View Call
                </button>
              </td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>No leads found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeadList;
