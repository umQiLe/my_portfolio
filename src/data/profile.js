import resume from './resume.json' with { type: 'json' };
import overview from './overview.json' with { type: 'json' };

export const profile = overview;
export const topics = [
  { id: 'experience', title: 'Experience', code: 'EX', color: '#71b7ff', description: 'My current chapter and previous roles.', items: [{ id: 'antlabs', label: 'ANTlabs', desc: `${overview.role}\n${overview.department}\n${overview.outlook}` }, ...resume.experience.children] },
  { id: 'skills', title: 'Expertise', code: 'SK', color: '#66e0cc', description: 'Networking, cloud, security and AI.', items: resume.skills.children },
  { id: 'projects', title: 'Projects', code: 'PR', color: '#bd9cff', description: 'Systems I have built and explored.', items: resume.projects.children },
  { id: 'education', title: 'Education', code: 'ED', color: '#f4ce76', description: 'My foundations in computer science.', items: resume.core.children.filter(item => item.id !== 'c3') },
  { id: 'certifications', title: 'Credentials', code: 'CR', color: '#f49fbb', description: 'Technical qualifications and first-aid training.', items: resume.certifications.children },
  { id: 'activities', title: 'Community', code: 'CO', color: '#91cffa', description: 'Leadership, volunteering and communities.', items: resume.activities.children },
  { id: 'awards', title: 'Recognition', code: 'AW', color: '#ffa779', description: 'Hackathons, cybersecurity challenges and innovation.', items: resume.awards.children },
];

const names = {
  e1: 'iFAST Global Hub AI', e2: 'Huawei MY', e3: 'UM Lab Teaching',
  sk1: 'Networking', sk2: 'Cloud & Databases', sk3: 'Security & Systems', sk4: 'Development & AI', sk5: 'Languages & Leadership',
  p1: 'Uptime Bot', p2: 'Software Audit', p3: 'UMPTT Audio', p4: 'NetMaster', p5: 'BSD in Rust', p6: 'Network Technology', p7: 'VC Data Analysis',
  c1: 'Universiti Malaya', c2: 'NUS', cert1: 'Huawei', cert2: 'Cisco', cert3: 'Cloud & AI', cert4: 'First Aid',
  a1: 'TARUMT Hackathon', a2: 'IIUM Hackathon', a3: 'CyberHunt CTF', a4: 'Innovation Competition',
  act1: 'PEKOM', act2: 'UMCS 2025', act3: 'AIESEC', act4: 'Tech Communities', act5: 'Volunteering',
};

// Explicit relationships from the descriptions, rather than inferred career claims.
export const relatedTopics = {
  e1: ['skills', 'projects'], e2: ['skills', 'projects'], e3: ['education', 'skills'],
  p1: ['experience', 'skills'], p2: ['experience', 'skills'], p3: ['education', 'skills'],
  p4: ['experience', 'skills'], p5: ['education', 'skills'], p6: ['education', 'skills'], p7: ['education', 'skills'],
  cert1: ['skills'], cert2: ['skills'], cert3: ['skills'], cert4: ['activities'],
  a1: ['skills'], a2: ['skills'], a3: ['skills'], a4: ['skills'],
  act1: ['skills', 'education'], act2: ['education'], act4: ['education'], act5: ['certifications'],
};

export const details = topics.flatMap(topic => topic.items.map(item => ({ ...item, name: names[item.id] || item.label, topicId: topic.id, color: topic.color })));
export const getDetail = id => details.find(item => item.id === id);
export const getTopic = id => topics.find(topic => topic.id === id);
export const searchProfile = query => {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return words.length ? details.filter(item => words.every(word => `${getTopic(item.topicId).title} ${item.name} ${item.label} ${item.desc}`.toLowerCase().includes(word))) : [];
};

export function buildNetwork(expandedId = null) {
  const expanded = getTopic(expandedId);
  const nodes = [{ id: 'profile', position: { x: expanded ? -310 : 0, y: 0 }, type: 'orb', data: { label: 'Chang Qi Le', subtitle: 'IT & Solutions Delivery', code: 'QL', kind: 'profile', color: '#86efac' } }];
  const edges = [];
  if (!expanded) {
    topics.forEach((topic, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / topics.length;
      nodes.push({ id: topic.id, type: 'orb', position: { x: Math.cos(angle) * 220, y: Math.sin(angle) * 205 }, data: { label: topic.title, subtitle: `${topic.items.length} connections`, code: topic.code, color: topic.color, kind: 'topic' } });
      edges.push({ id: `profile-${topic.id}`, source: 'profile', target: topic.id });
    });
    edges.push(
      { id: 'work-projects', source: 'experience', target: 'projects', label: 'built at work', crosslink: true },
      { id: 'skills-projects', source: 'skills', target: 'projects', label: 'applied in', crosslink: true },
      { id: 'education-community', source: 'education', target: 'activities', label: 'UM / NUS', crosslink: true },
    );
  } else {
    nodes.push({ id: expanded.id, type: 'orb', position: { x: 0, y: 0 }, data: { label: expanded.title, subtitle: `${expanded.items.length} connections`, code: expanded.code, color: expanded.color, kind: 'topic' } });
    edges.push({ id: `profile-${expanded.id}`, source: 'profile', target: expanded.id });
    expanded.items.forEach((item, index) => {
      const angle = -Math.PI * .78 + index * Math.PI * 1.56 / Math.max(1, expanded.items.length - 1);
      const detail = getDetail(item.id);
      nodes.push({ id: item.id, type: 'orb', position: { x: Math.cos(angle) * 220 + 70, y: Math.sin(angle) * 220 }, data: { label: detail.name, subtitle: 'View details', code: String(index + 1).padStart(2, '0'), color: expanded.color, kind: 'detail' } });
      edges.push({ id: `${expanded.id}-${item.id}`, source: expanded.id, target: item.id });
    });
    if (expanded.id === 'projects') edges.push(
      { id: 'ifast-projects', source: 'p1', target: 'p2', label: 'iFAST', crosslink: true },
      { id: 'um-projects-a', source: 'p3', target: 'p6', label: 'UM', crosslink: true },
      { id: 'um-projects-b', source: 'p6', target: 'p7', label: 'UM', crosslink: true },
    );
  }
  return { nodes: nodes.map(node => ({ ...node, origin: [.5, .5], ariaRole: 'button', ariaLabel: `Explore ${node.data.label}`, deletable: false })), edges };
}
