import overview from '../data/overview.json';
import './OverviewView.css';

function OverviewView({ onNavigate }) {
  return (
    <section className="overview" aria-labelledby="overview-title">
      <header className="overview-bar">
        <span><span className="overview-slash">//</span> OVERVIEW</span>
        <span className="overview-bar-note">A little about me, at a glance.</span>
        <span className="overview-page-number">01 / PROFILE</span>
      </header>

      <div className="overview-board">
        <aside className="overview-profile" aria-label="Profile">
          <div className="overview-profile-label"><span className="overview-status-dot" /> A QUICK INTRO</div>
          <div className="overview-portrait-stage">
            <div className="overview-orbit" aria-hidden="true" />
            <span className="overview-portrait-name" aria-hidden="true">{overview.portraitBackdrop}</span>
            <img src={overview.portrait} alt={`${overview.name} in a black suit and tie`} className="overview-portrait" fetchPriority="high" />
          </div>
          <div className="overview-profile-caption">
            <p>{overview.name}</p>
            <span>{overview.tagline}</span>
          </div>
          <a className="overview-contact" href={`mailto:${overview.email}`}>Let's connect <span aria-hidden="true">↗</span></a>
        </aside>

        <div className="overview-details">
          <header className="overview-intro">
            <p className="overview-eyebrow">NETWORKING. CLOUD. AI.</p>
            <h1 id="overview-title">{overview.greeting}</h1>
            <p className="overview-role">{overview.role}</p>
            <p className="overview-description">{overview.introduction}</p>
            <ul className="overview-focus" aria-label="Areas of focus">
              {overview.focus.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </header>

          <div className="overview-facts">
            <section className="overview-fact-section overview-current" aria-labelledby="overview-current">
              <h2 id="overview-current"><span>01</span> Current chapter</h2>
              <h3>{overview.company}</h3>
              <p>{overview.department}</p>
              <span className="overview-current-label">{overview.role}</span>
            </section>

            <section className="overview-fact-section" aria-labelledby="overview-experience">
              <h2 id="overview-experience"><span>02</span> Previously</h2>
              <ol className="overview-timeline">
                {overview.experience.map((item) => (
                  <li key={item.name}>
                    <h3>{item.name}</h3>
                    <p>{item.role}</p>
                    <small>{item.period}</small>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="overview-outlook" aria-labelledby="overview-outlook">
            <h2 id="overview-outlook"><span>03</span> Looking ahead</h2>
            <p>{overview.outlook}</p>
          </section>
        </div>
      </div>

      <footer className="overview-footer">
        <span className="overview-footer-message"><span className="overview-ai-spark" aria-hidden="true">✦</span> {overview.footer} <span aria-hidden="true">→</span></span>
        <div>
          <button type="button" onClick={() => onNavigate('PROJECTS')}>View projects <span aria-hidden="true">↗</span></button>
          <button type="button" onClick={() => onNavigate('RESUME')}>Read resume <span aria-hidden="true">↗</span></button>
        </div>
      </footer>
    </section>
  );
}

export default OverviewView;
