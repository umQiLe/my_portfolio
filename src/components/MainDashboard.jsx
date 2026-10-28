import { useCallback, useEffect, useRef, useState } from 'react';
import resume from '../data/resume.json';
import overview from '../data/overview.json';
import './MainDashboard.css';

const categories = [
  {
    id: 'qile-profile', title: 'Profile', description: 'The person behind the connections.',
    items: [
      { id: 'current-role', label: overview.company, desc: `${overview.role}\n${overview.department}\n${overview.outlook}` },
      { id: 'contact', label: 'Contact', desc: `Email: ${overview.email}` },
    ],
  },
  { id: 'qile-expertise', title: 'Expertise', description: 'Networking, cloud, AI and the tools I work with.', items: resume.skills.children },
  {
    id: 'qile-experience', title: 'Experience', description: 'My current chapter and previous roles.',
    items: [{ id: 'antlabs', label: overview.company, desc: `${overview.role}\n${overview.department}` }, ...resume.experience.children],
  },
  { id: 'qile-projects', title: 'Projects', description: 'Automation, network systems and real-time communication.', items: resume.projects.children },
  { id: 'qile-education', title: 'Education', description: 'Where I developed my foundations in computer science.', items: resume.core.children.filter((item) => item.id !== 'c3') },
  { id: 'qile-credentials', title: 'Credentials', description: 'Technical certifications and first-aid training.', items: resume.certifications.children },
  { id: 'qile-awards', title: 'Recognition', description: 'Hackathons, cybersecurity challenges and innovation.', items: resume.awards.children },
  { id: 'qile-community', title: 'Community', description: 'Leadership, volunteering and communities I contribute to.', items: resume.activities.children },
];

function markSelected(document, id) {
  document.querySelectorAll('svg [data-node-id]').forEach((node) => {
    node.setAttribute('aria-pressed', String(node.getAttribute('data-node-id') === id));
    const rect = node.querySelector('rect');
    if (!rect) return;
    if (node.getAttribute('data-node-id') === id) {
      rect.style.stroke = '#7ee787';
      rect.style.strokeWidth = '2.5';
    } else {
      rect.style.removeProperty('stroke');
      rect.style.removeProperty('stroke-width');
    }
  });
}

function MainDashboard() {
  const [activeId, setActiveId] = useState('qile-profile');
  const [query, setQuery] = useState('');
  const [mapOpen, setMapOpen] = useState(() => window.innerWidth > 768);
  const frameRef = useRef(null);
  const mapRef = useRef(null);
  const explorerRef = useRef(null);
  const cleanupFrame = useRef(null);
  const selectedRef = useRef(activeId);

  const selectCategory = useCallback((id, fromDiagram = false) => {
    if (!categories.some((category) => category.id === id)) return;
    setActiveId(id);
    setQuery('');
    if (fromDiagram) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      explorerRef.current?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
    }
  }, []);

  const connectDiagram = useCallback(() => {
    cleanupFrame.current?.();
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    const svg = document.querySelector('svg');
    svg?.setAttribute('role', 'group');
    svg?.removeAttribute('aria-labelledby');
    svg?.removeAttribute('aria-describedby');
    svg?.setAttribute('aria-label', 'Qi Le portfolio connections');

    document.querySelectorAll('svg [data-node-id]').forEach((node) => {
      const category = categories.find((item) => item.id === node.getAttribute('data-node-id'));
      if (!category) return;
      node.setAttribute('role', 'button');
      node.setAttribute('tabindex', '0');
      node.setAttribute('aria-label', `Explore ${category.title}`);
      node.removeAttribute('aria-describedby');
      node.style.cursor = 'pointer';
    });

    const handleSelect = (event) => {
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      const node = event.target.closest?.('svg [data-node-id]');
      if (!node) return;
      const id = node.getAttribute('data-node-id');
      if (!categories.some((category) => category.id === id)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      markSelected(document, id);
      selectCategory(id, true);
    };

    document.addEventListener('click', handleSelect, true);
    document.addEventListener('keydown', handleSelect, true);
    markSelected(document, selectedRef.current);
    cleanupFrame.current = () => {
      document.removeEventListener('click', handleSelect, true);
      document.removeEventListener('keydown', handleSelect, true);
    };
  }, [selectCategory]);

  useEffect(() => {
    selectedRef.current = activeId;
    const document = frameRef.current?.contentDocument;
    if (document) markSelected(document, activeId);
  }, [activeId]);

  useEffect(() => {
    const frame = frameRef.current;
    const map = mapRef.current;
    if (!frame || !map) return;
    const resize = () => {
      // Match the authored SVG ratio and the viewer's 8px embed padding.
      frame.style.height = `${Math.ceil(Math.max(0, frame.clientWidth - 16) * 890 / 1390 + 16)}px`;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(map);
    resize();
    return () => observer.disconnect();
  }, [mapOpen]);

  useEffect(() => {
    if (frameRef.current?.contentDocument?.querySelector('svg')) connectDiagram();
    return () => cleanupFrame.current?.();
  }, [connectDiagram]);

  const active = categories.find((category) => category.id === activeId);
  const search = query.trim().toLowerCase();
  const matches = search
    ? categories.map((category) => ({ ...category, items: category.items.filter((item) => `${category.title} ${item.label} ${item.desc}`.toLowerCase().includes(search)) })).filter((category) => category.items.length)
    : [active];
  const resultCount = matches.reduce((total, category) => total + category.items.length, 0);

  return (
    <section className="profile-topology" aria-labelledby="topology-title">
      <header className="topology-heading">
        <div>
          <p className="topology-eyebrow">CONNECTED PROFILE / 08 AREAS</p>
          <h1 id="topology-title">Everything connects.</h1>
          <p className="topology-description">Explore the work, skills and experiences behind Qi Le.</p>
        </div>
        <a className="topology-viewer-link" href="/diagrams/portfolio-topology.html?theme=dark" target="_blank" rel="noopener noreferrer">Open full map <span aria-hidden="true">↗</span></a>
      </header>

      <div className="topology-map-panel">
        <div className="topology-map-bar">
          <span><span className="topology-status-dot" aria-hidden="true" /> Portfolio connections</span>
          <button type="button" aria-expanded={mapOpen} aria-controls="portfolio-map" onClick={() => setMapOpen((open) => !open)}>{mapOpen ? 'Hide map −' : 'Show map +'}</button>
        </div>
        <div id="portfolio-map" ref={mapRef} hidden={!mapOpen}>
          <iframe ref={frameRef} onLoad={connectDiagram} title="Qi Le portfolio connections — select an area to explore its details" src="/diagrams/portfolio-topology.html?embed=1&theme=dark" className="topology-map-frame" />
          <p className="topology-map-caption">Select a topic to read its details below. Connections describe areas of my profile.</p>
        </div>
      </div>

      <section className="topology-explorer" ref={explorerRef} aria-labelledby="explorer-title">
        <div className="topology-explorer-heading">
          <div><p className="topology-eyebrow">FOLLOW YOUR CURIOSITY</p><h2 id="explorer-title">Explore the details</h2></div>
          <label className="topology-search" htmlFor="topology-search">
            <span className="topology-search-label">Search this profile</span>
            <input id="topology-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, skills, experience…" aria-controls="topology-results" />
          </label>
        </div>
        <nav className="topology-categories" aria-label="Portfolio topics">
          {categories.map((category) => (
            <button type="button" key={category.id} aria-pressed={!search && activeId === category.id} onClick={() => selectCategory(category.id)}>
              {category.title}<span>{category.items.length}</span>
            </button>
          ))}
        </nav>
        <p className="topology-result-summary" role="status">{search ? `${resultCount} matching ${resultCount === 1 ? 'detail' : 'details'} across ${matches.length} ${matches.length === 1 ? 'topic' : 'topics'}.` : active.description}</p>
        <div id="topology-results">
          {matches.map((category) => (
            <section className="topology-result-group" key={category.id} aria-label={category.title}>
              {search && <h3>{category.title}</h3>}
              <div className="topology-detail-grid">
                {category.items.map((item) => (
                  <article className="topology-detail-card" key={item.id}>
                    <span className="topology-detail-code">{item.label.replaceAll('_', ' ')}</span>
                    <h3>{item.desc.split('\n')[0]}</h3>
                    {item.desc.includes('\n') && <p>{item.desc.split('\n').slice(1).join('\n')}</p>}
                  </article>
                ))}
              </div>
            </section>
          ))}
          {!matches.length && <div className="topology-empty"><h3>No connections found.</h3><p>Try a technology, company or project name.</p><button type="button" onClick={() => setQuery('')}>Clear search</button></div>}
        </div>
      </section>
    </section>
  );
}

export default MainDashboard;
