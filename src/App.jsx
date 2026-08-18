import React, { useState } from 'react';
import './App.css';
import MainDashboard from './components/MainDashboard';
import ResumeView from './components/ResumeView';
import ProjectsView from './components/ProjectsView';
import GatewayView from './components/GatewayView';
import CLIWidget from './components/CLIWidget';
import MascotWidget from './components/MascotWidget';

function App() {
  const [activePane, setActivePane] = useState('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMascotActive, setIsMascotActive] = useState(false);

  return (
    <div className="coder-ui-container">
      {/* Video Background */}
      <video autoPlay loop muted playsInline className="video-background">
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Header / Top Nav */}
      <header className="main-header">
        <div className="branding">
          <button 
            className="sidebar-toggle" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            [ {isSidebarOpen ? 'HIDE' : 'MENU'} ]
          </button>
          <span className="user-prompt">guest@qilechang:~</span>
          <span className="dot active"></span>
          <span className="title">Portfolio Dashboard</span>
        </div>
        <div className="status-bar">
          <span className="stat">STATUS: <span className="highlight green">ONLINE</span></span>
          <span className="stat">LOC: JOHOR, MY</span>
        </div>
      </header>

      <div className="main-layout">
        {/* Collapsible Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-section">
            <h3 className="section-title">NAVIGATION</h3>
            <ul>
              <li onClick={() => setActivePane('DASHBOARD')} className={activePane === 'DASHBOARD' ? 'active' : ''}>[H] Topology</li>
              <li onClick={() => setActivePane('PROJECTS')} className={activePane === 'PROJECTS' ? 'active' : ''}>[P] Projects</li>
              <li onClick={() => setActivePane('RESUME')} className={activePane === 'RESUME' ? 'active' : ''}>[R] Resume / CV</li>
              <li onClick={() => setActivePane('GATEWAY')} className={activePane === 'GATEWAY' ? 'active' : ''}>[G] Gateway Hub</li>
            </ul>
          </div>
          <div className="sidebar-section footer">
            <p className="sub-text">Build v1.1 // React</p>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="content-pane">
          {activePane === 'DASHBOARD' && <MainDashboard view={activePane} />}
          {activePane === 'RESUME' && <ResumeView />}
          {activePane === 'PROJECTS' && <ProjectsView />}
          {activePane === 'GATEWAY' && <GatewayView />}
          {activePane !== 'DASHBOARD' && activePane !== 'PROJECTS' && activePane !== 'RESUME' && activePane !== 'GATEWAY' && (
            <div className="placeholder-pane">ACCESSING_MODULE: {activePane}...</div>
          )}
        </main>
      </div>

      {/* 3. Pass the trigger function into the CLI Widget */}
      <CLIWidget onTriggerMascot={(action) => setIsMascotActive(action === 'open')} />

      {/* 4. Render the Floating Mascot */}
      <MascotWidget 
        isVisible={isMascotActive} 
        onClose={() => setIsMascotActive(false)} 
      />
      
    </div>
  );
}

export default App;