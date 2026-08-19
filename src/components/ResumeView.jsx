import { useState, useEffect } from 'react';
import resumeData from '../data/resume.json';
import './ResumeView.css';

const mask = [
  "                        ",
  "        xxxxxxxx        ",
  "       xxxxxxxxxx       ",
  "       xxxxxxxxxx       ",
  "       xxxxxxxxxx       ",
  "        xxxxxxxx        ",
  "         xxxxxx         ",
  "       xxxxxxxxxx       ",
  "     xxxxxxxxxxxxxx     ",
  "    xxxxxxxxxxxxxxxx    ",
  "   xxxxxxxxxxxxxxxxxx   ",
  "  xxxxxxxxxxxxxxxxxxxx  ",
  " xxxxxxxxxxxxxxxxxxxxxx ",
  "xxxxxxxxxxxxxxxxxxxxxxxx",
];

const ResumeView = () => {
  const PROFILE_IMAGE_URL = "https://media.licdn.com/dms/image/v2/D5603AQEPSK0J-MHYYA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1719029030375?e=1788393600&v=beta&t=5eTK1YguXuldlUFBVlEKeppKdumpej1JHa7uAL55Ao4"; // Use your actual URL
  
  const [matrixText, setMatrixText] = useState('');
  const [phase, setPhase] = useState('decoding');

  // The "Digits forming the picture" animation logic
  useEffect(() => {
    let interval;
    // Only run the shuffling math if we are in the decoding or fading phases
    if (phase === 'decoding' || phase === 'fading') {
      interval = setInterval(() => {
        const frame = mask.map(row => 
          row.split('').map(char => 
            // Replace 'x' with random 0/1, replace spaces with Non-Breaking Spaces
            char === 'x' ? (Math.random() > 0.5 ? '1' : '0') : '\u00A0'
          ).join('')
        ).join('\n');
        setMatrixText(frame);
      }, 50);
    }

    // Timeline control
    if (phase === 'decoding') {
      setTimeout(() => setPhase('fading'), 1500); // Shuffle for 1.5s, then start fade
    } else if (phase === 'fading') {
      setTimeout(() => setPhase('done'), 1500); // Allow 1.5s for the CSS crossfade, then kill interval
    }

    return () => clearInterval(interval);
  }, [phase]);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="resume-container">
      <div className="resume-actions no-print">
        <button className="btn-download" onClick={handleDownloadPDF}>
          [ DOWNLOAD_PDF ]
        </button>
      </div>

      <div className="resume-document">
        
        <header className="resume-header">
          {/* Updated Image Wrapper for Crossfade */}
          <div className="resume-image-wrapper">
            {/* The Matrix Silhouette */}
            {phase !== 'done' && (
              <div className={`matrix-overlay ${phase === 'fading' ? 'fading' : ''}`}>
                {matrixText}
              </div>
            )}
            
            {/* The Real Image */}
            <img 
              src={PROFILE_IMAGE_URL} 
              alt="Profile" 
              className={`resume-profile-img ${phase !== 'decoding' ? 'visible' : ''}`} 
            />
          </div>
          
          <div className="resume-brief">
            <h1 className="resume-name">CHANG QI LE</h1>
            <h2 className="resume-title">Computer Science & Network Engineer</h2>
            <div className="resume-contact">
              <span>{resumeData.core.children[2].desc.split('\n')[0]}</span>
              <span>{resumeData.core.children[2].desc.split('\n')[1]}</span>
              <span>Johor Bahru, Malaysia</span>
            </div>
            <p className="resume-summary">
              Fresh Graduate | Computer Science student at Universiti Malaya. Specializing in routing protocols, infrastructure as code, and building resilient network architectures.
            </p>
          </div>
        </header>

        <hr className="resume-divider" />

        {/* Body: Two Column Layout */}
        <div className="resume-body">
          {/* Main Column: Experience & Projects */}
          <div className="resume-main-col">
            <section className="resume-section">
              <h3>WORK EXPERIENCE</h3>
              {resumeData.experience.children.map(job => (
                <div key={job.id} className="resume-item">
                  <div className="item-header">
                    <h4>{job.desc.split('\n')[0]}</h4> {/* Title & Date */}
                    <span className="item-org">{job.label}</span>
                  </div>
                  <p className="item-desc">{job.desc.split('\n').slice(1).join('\n')}</p>
                </div>
              ))}
            </section>

            <section className="resume-section">
              <h3>KEY PROJECTS</h3>
              {resumeData.projects.children.map(proj => (
                <div key={proj.id} className="resume-item">
                  <div className="item-header">
                    <h4>{proj.label}</h4>
                  </div>
                  <p className="item-desc">{proj.desc}</p>
                </div>
              ))}
            </section>
          </div>

          {/* Side Column: Education, Awards, Certs */}
          <div className="resume-side-col">
            <section className="resume-section">
              <h3>EDUCATION</h3>
              <div className="resume-item">
                <h4>Universiti Malaya (UM)</h4>
                <p className="item-desc">Bachelor of CS: Computer System & Network (CGPA: 3.75)</p>
              </div>
              <div className="resume-item">
                <h4>National University of Singapore</h4>
                <p className="item-desc">Bachelor of Computing (Long-term Mobility)</p>
              </div>
            </section>

            <section className="resume-section">
              <h3>CERTIFICATIONS</h3>
              <ul className="resume-list">
                {resumeData.certifications.children.map(cert => (
                  <li key={cert.id}>{cert.desc}</li>
                ))}
              </ul>
            </section>

            <section className="resume-section">
              <h3>AWARDS</h3>
              <ul className="resume-list">
                {resumeData.awards.children.map(award => (
                  <li key={award.id}>{award.desc}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeView;