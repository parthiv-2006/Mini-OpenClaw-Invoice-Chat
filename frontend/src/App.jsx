import React from 'react';
import DragAndDrop from './components/DragAndDrop';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="app-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Mini-Moltbot</h1>
        <p className="subtitle">Upload your financial documents and chat with them instantly.</p>
      </div>

      <div className="content-grid active">
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>1. Upload Document</h2>
          <DragAndDrop />
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>2. Document Chat</h2>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem' }}>
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
