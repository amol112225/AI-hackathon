import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CallPage from './pages/CallPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <h1>AP Hunter Voice Agent</h1>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/call/:leadId" element={<CallPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
