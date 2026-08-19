import './ExtraViews.css';

const GatewayView = () => {
  const links = [
    { name: 'LINKEDIN', url: 'https://www.linkedin.com/in/chang-qi-le-550334257/', icon: 'LNK', desc: 'Professional network and experience logs.' },
    { name: 'GITHUB', url: 'https://github.com/umQiLe/', icon: 'GIT', desc: 'Source code repositories and open-source contributions.' },
    { name: 'EMAIL', url: 'mailto:umqile@gmail.com', icon: 'EML', desc: 'Direct encrypted communication channel.' }
  ];

  return (
    <div className="module-container fade-in">
      <div className="gateway-wrapper">
        <div className="gateway-terminal">
          <div className="gateway-header">
            <span className="blink-text">EXTERNAL_GATEWAY_ROUTING_ACTIVE</span>
          </div>
          
          <div className="gateway-links">
            {links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noreferrer" className="gateway-btn">
                <div className="btn-icon">[{link.icon}]</div>
                <div className="btn-text">
                  <h4>{link.name}</h4>
                  <p>{link.desc}</p>
                </div>
                <div className="btn-arrow">→</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewayView;