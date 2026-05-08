function SummaryModal({ summary, onClose }) {
  if (!summary) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '500px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="space-between flex-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h2>Call Summary</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-main)', fontSize: '1.5rem', padding: 0 }}>&times;</button>
        </div>
        
        <div className="flex-col">
          <div>
            <h4 style={{ color: 'var(--primary-color)' }}>Key Points</h4>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              {summary.key_points?.map((point, idx) => <li key={idx}>{point}</li>)}
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--hot-color)' }}>Objections Raised</h4>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              {summary.objections?.length > 0 
                ? summary.objections.map((obj, idx) => <li key={idx}>{obj}</li>)
                : <li>No objections raised</li>}
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--ongoing-color)' }}>Next Action</h4>
            <p style={{ marginTop: '0.5rem' }}>{summary.next_action}</p>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button onClick={onClose}>Close Summary</button>
        </div>
      </div>
    </div>
  );
}

export default SummaryModal;
