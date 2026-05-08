import { useState, useRef, useEffect } from 'react';

function ChatBox({ messages, onSendMessage, disabled }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex-col" style={{ height: '500px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'var(--primary-color)' : '#f1f5f9',
            color: msg.role === 'user' ? '#fff' : '#000',
            padding: '0.75rem 1rem',
            borderRadius: '16px',
            maxWidth: '80%'
          }}>
            <strong style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '0.2rem' }}>
              {msg.role === 'user' ? 'User (Lead)' : 'AI Agent'}
            </strong>
            {msg.content || msg.message}
          </div>
        ))}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No messages yet. Start the call!</div>
        )}
        <div ref={endRef} />
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '1rem', background: '#f8fafc', borderTop: '1px solid var(--border-color)' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type user message here..."
          style={{ flex: 1, marginRight: '0.5rem' }}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || !input.trim()}>Send</button>
      </form>
    </div>
  );
}

export default ChatBox;
