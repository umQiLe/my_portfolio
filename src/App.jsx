import { useState } from 'react';
import './App.css';
import MainDashboard from './components/MainDashboard';
import ResumeView from './components/ResumeView';
import ProjectsView from './components/ProjectsView';
import GatewayView from './components/GatewayView';
import CLIWidget from './components/CLIWidget';
import MascotWidget from './components/MascotWidget';
import OverviewView from './components/OverviewView';

const navigation = [
  { id: 'OVERVIEW', label: '[O] Overview' },
  { id: 'DASHBOARD', label: '[T] Topology' },
  { id: 'PROJECTS', label: '[P] Projects' },
  { id: 'RESUME', label: '[R] Resume / CV' },
  { id: 'GATEWAY', label: '[G] Gateway Hub' },
];

function App() {
  const [activePane, setActivePane] = useState('OVERVIEW');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  const [isMascotActive, setIsMascotActive] = useState(false);

  const navigate = (pane) => {
    setActivePane(pane);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

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
            aria-label={isSidebarOpen ? 'Hide navigation' : 'Show navigation'}
            aria-expanded={isSidebarOpen}
            aria-controls="portfolio-navigation"
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
        <aside id="portfolio-navigation" aria-label="Portfolio navigation" inert={!isSidebarOpen} className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-section">
            <h3 className="section-title">NAVIGATION</h3>
            <ul>
              {navigation.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => navigate(item.id)} aria-current={activePane === item.id ? 'page' : undefined} className={`nav-button ${activePane === item.id ? 'active' : ''}`}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-section footer">
            <p className="sub-text">Build v1.1 // React</p>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className={`content-pane ${activePane === 'OVERVIEW' ? 'overview-pane' : ''}`}>
          {activePane === 'OVERVIEW' && <OverviewView onNavigate={navigate} />}
          {activePane === 'DASHBOARD' && <MainDashboard view={activePane} />}
          {activePane === 'RESUME' && <ResumeView />}
          {activePane === 'PROJECTS' && <ProjectsView />}
          {activePane === 'GATEWAY' && <GatewayView />}
        </main>
      </div>

      <CLIWidget onTriggerMascot={(action) => setIsMascotActive(action === 'open')} />

      <MascotWidget 
        isVisible={isMascotActive} 
        onClose={() => setIsMascotActive(false)} 
      />
      
    </div>
  );
}

export default App;
