import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SummaryModal from '../components/SummaryModal';

function CallPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  
  const [lead, setLead] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  
  // Call States
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [currentAIMessage, setCurrentAIMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  // Timer States
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);

  // Speech Recognition Ref
  const recognitionRef = useRef(null);

  const fetchLeadDetails = async () => {
    try {
      const allLeads = await api.getLeads();
      const currentLead = allLeads.find(l => l.id === parseInt(leadId));
      if (currentLead) setLead(currentLead);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
    
    return () => {
      stopTimer();
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, [leadId]);

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const speakText = (text) => {
    if (!text) return;
    
    // Prevent overlap
    window.speechSynthesis.cancel();
    
    // Add short delay to prevent race conditions with cancel()
    setTimeout(() => {
      setIsAISpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsAISpeaking(false);
      };
      utterance.onerror = (e) => {
        console.error("Speech Synthesis Error:", e);
        setIsAISpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }, 100); 
  };

  const handleStartCall = async () => {
    try {
      const res = await api.startSingleCall(leadId);
      await fetchLeadDetails(); // Refresh lead status
      startTimer();
      
      if (res.greeting) {
        setCurrentAIMessage(res.greeting);
        speakText(res.greeting);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEndCall = async () => {
    try {
      stopTimer();
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setIsListening(false);
      setIsAISpeaking(false);
      
      const res = await api.endSingleCall(leadId);
      setSummary(res.summary);
      setShowSummary(true);
      await fetchLeadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendMessage = async (msg) => {
    try {
      console.log("Sending to backend...");
      setCurrentAIMessage("..."); 
      const res = await api.chat(leadId, msg);
      console.log("AI response received:", res.response);
      setCurrentAIMessage(res.response);
      speakText(res.response);
      await fetchLeadDetails(); // update score and status
    } catch (err) {
      console.error("API error:", err);
      alert(err.message);
    }
  };

  const toggleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setIsListening(false);
      return;
    }
    
    // Cancel AI speech to avoid capturing it
    window.speechSynthesis.cancel();
    setIsAISpeaking(false);
    
    // Create new instance every time to avoid getting stuck
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // single-turn
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      console.log("Mic started");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(`Speech detected: ${transcript}`);
      setCurrentUserMessage(transcript);
      handleSendMessage(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("Mic stopped listening");
      setIsListening(false);
      recognitionRef.current = null;
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  };

  if (!lead) return <div>Loading lead details...</div>;

  const isOngoing = lead.call_status === 'ongoing';

  return (
    <div className="flex-col">
      <div className="flex-row space-between">
        <button onClick={() => { stopTimer(); window.speechSynthesis.cancel(); navigate('/'); }} style={{ background: 'var(--text-muted)' }}>&larr; Back to Dashboard</button>
        <h2>Call Session: {lead.name}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '1rem' }}>
        {/* LEFT PANEL: LEAD DETAILS */}
        <div className="card flex-col">
          <h3>Lead Information</h3>
          <p><strong>Name:</strong> {lead.name}</p>
          <p><strong>Phone:</strong> {lead.phone}</p>
          <p><strong>Language:</strong> {lead.language}</p>
          
          <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
          
          <h3>Live Status</h3>
          <p><strong>Call Status:</strong> <span className={`call-${lead.call_status}`}>{lead.call_status.toUpperCase()}</span></p>
          <p><strong>Score:</strong> {lead.score}</p>
          <p><strong>Classification:</strong> <span className={`status-${lead.classification}`}>{lead.classification}</span></p>

          {lead.call_status === 'completed' && lead.needs_followup && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#dcf8c6', borderRadius: '8px', color: '#075e54', fontWeight: 'bold' }}>
              📱 WhatsApp Simulation: "Signup link sent via WhatsApp"
            </div>
          )}

          <div className="flex-col" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            {lead.call_status === 'pending' && (
              <button onClick={handleStartCall} style={{ background: 'var(--ongoing-color)', padding: '1rem' }}>Start AI Call</button>
            )}
            {isOngoing && (
              <button onClick={handleEndCall} style={{ background: 'var(--hot-color)', padding: '1rem' }}>End Call & Summarize</button>
            )}
            {lead.call_status === 'completed' && (
              <button onClick={() => {
                api.getSummary(leadId).then(data => { setSummary(data); setShowSummary(true); });
              }} style={{ padding: '1rem' }}>View Summary</button>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: VOICE SIMULATION UI */}
        <div className="card flex-col" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '400px' }}>
          {!isOngoing ? (
            <div style={{ color: 'var(--text-muted)' }}>
              {lead.call_status === 'completed' ? "Call completed." : "Click 'Start AI Call' to begin."}
            </div>
          ) : (
            <>
              <h2 style={{ color: 'var(--ongoing-color)', marginBottom: '0.5rem' }}>Call in Progress</h2>
              <div style={{ fontSize: '2rem', fontFamily: 'monospace', marginBottom: '2rem' }}>
                {formatTime(callDuration)}
              </div>

              <div style={{ width: '100%', maxWidth: '400px', background: '#f8f9fa', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>
                  {currentAIMessage ? `AI: "${currentAIMessage}"` : "Waiting for AI..."}
                </p>
              </div>
              
              {isAISpeaking && <div style={{ color: 'var(--ongoing-color)', marginBottom: '1rem', fontWeight: 'bold' }}>AI is speaking...</div>}

              <button 
                onClick={toggleListen}
                className={`mic-button ${isListening ? 'listening' : ''}`}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isListening ? 'var(--hot-color)' : 'var(--primary-color)',
                  color: 'white',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                🎤
              </button>

              {isListening && <div style={{ color: 'var(--hot-color)', fontWeight: 'bold' }}>Listening...</div>}
              
              <div style={{ marginTop: '1rem', minHeight: '40px', color: '#666' }}>
                {currentUserMessage && `You: "${currentUserMessage}"`}
              </div>
            </>
          )}
        </div>
      </div>

      {showSummary && (
        <SummaryModal summary={summary} onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
}

export default CallPage;
