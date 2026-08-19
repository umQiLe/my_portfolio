import './ExtraViews.css';

const ProjectsView = () => {
  // Rich media project data
  const projectGallery = [
    {
      id: 'umptt',
      title: 'UMPTT (Real-time Voice Comm)',
      tech: ['WebSocket', 'WebRTC', 'Concurrency'],
      description: 'Push-to-talk system achieving <120ms latency. Implemented mutex locks and request serialization within the signaling logic to completely prevent race conditions during simultaneous user transmissions.',
      mediaType: 'image',
      mediaSrc: 'https://lh3.googleusercontent.com/d/1D_Nk1l7fLx4wvip_HTh7dGxoE55hAeXL',
      links: { slide: 'https://drive.google.com/file/d/1NethxzjbUAO1GAPGaV7VwYwWQN3Sx7eD/view?usp=drive_link' }
    },
    {
      id: 'TBC',
      title: 'To Be Updated ...',
      tech: ['null'],
      description: 'N/A',
      mediaType: 'image',
      mediaSrc: 'https://ehelperteam.com/wp-content/uploads/2019/09/Broken-images.png', 
      links: { github: 'https://github.com/umQiLe/' }
    },
  ];

  return (
    <div className="module-container fade-in">
      <div className="module-header">
        <h2>[ PROJECT_ARCHIVE ]</h2>
        <p className="sub-text">EXECUTE: View rich media logs of completed builds.</p>
      </div>

      <div className="project-grid">
        {projectGallery.map(proj => (
          <div key={proj.id} className="media-card">
            <div className="media-display">
              {proj.mediaType === 'video' ? (
                <video src={proj.mediaSrc} controls muted className="media-content" />
              ) : (
                <img src={proj.mediaSrc} alt={proj.title} className="media-content" />
              )}
            </div>
            
            <div className="media-info">
              <h3 className="media-title">{proj.title}</h3>
              <div className="tech-badges">
                {proj.tech.map((t, i) => (
                  <span key={i} className="tech-badge">{t}</span>
                ))}
              </div>
              <p className="media-desc">{proj.description}</p>
              
              <div className="media-actions">
                {proj.links.github && <a href={proj.links.github} className="action-link" target="_blank" rel="noopener noreferrer">[ GITHUB ]</a>}
                {proj.links.slide && <a href={proj.links.slide} className="action-link" target="_blank" rel="noopener noreferrer">[ SLIDES ]</a>}
                {proj.links.video && <a href={proj.links.video} className="action-link" target="_blank" rel="noopener noreferrer">[ VIDEO ]</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsView;