import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Background, Controls, Handle, MiniMap, Position, ReactFlow, ReactFlowProvider, useNodesState, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildNetwork, details, getDetail, getTopic, profile, relatedTopics, searchProfile, topics } from '../data/profile';
import './MainDashboard.css';

const OrbNode = memo(function OrbNode({ data, selected }) {
  return (
    <div className={`network-orb ${data.kind} ${selected ? 'is-selected' : ''}`} style={{ '--node-color': data.color }}>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <div className="network-orb-circle">{data.kind === 'profile' ? <img src={profile.portrait} alt="" draggable="false" /> : <span>{data.code}</span>}</div>
      <strong>{data.label}</strong><small>{data.subtitle}</small>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
});
const nodeTypes = { orb: OrbNode };
const fitOptions = { padding: .18, maxZoom: 1.05 };

function NetworkCanvas({ expandedId, selectedId, onSelect }) {
  const [graph] = useState(() => buildNetwork(expandedId));
  const [nodes, , onNodesChange] = useNodesState(graph.nodes);
  const { fitView } = useReactFlow();
  const canvasRef = useRef(null);
  useEffect(() => {
    let frame = 0;
    let lastSize = '';
    const observer = new ResizeObserver(([entry]) => {
      const size = `${Math.round(entry.contentRect.width)}:${Math.round(entry.contentRect.height)}`;
      if (size === lastSize) return;
      lastSize = size;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fitView(fitOptions));
    });
    observer.observe(canvasRef.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [fitView]);
  const edges = graph.edges.map(edge => {
    const active = selectedId === 'profile' || edge.source === selectedId || edge.target === selectedId;
    const color = graph.nodes.find(node => node.id === edge.target)?.data.color || '#79b8ff';
    return { ...edge, label: expandedId ? edge.label : undefined, type: 'straight', selectable: false, focusable: false,
      labelStyle: { fill: '#8da5c3', fontSize: 9 }, labelBgStyle: { fill: '#0b1320', fillOpacity: .95 }, labelBgPadding: [5, 3], labelBgBorderRadius: 3,
      style: { stroke: active ? color : '#36465a', strokeWidth: active ? 1.8 : 1, opacity: active ? .85 : .55, strokeDasharray: edge.crosslink ? '4 5' : undefined } };
  });
  return (
    <div className="network-canvas" ref={canvasRef} aria-label="Interactive portfolio network" onKeyDownCapture={event => {
      const node = event.target.closest?.('.react-flow__node');
      if (node && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault(); event.stopPropagation(); onSelect(node.getAttribute('data-id'));
      }
    }}>
      <ReactFlow nodes={nodes.map(node => ({ ...node, selected: node.id === selectedId }))} edges={edges} onNodesChange={onNodesChange}
        nodeTypes={nodeTypes} onNodeClick={(_, node) => onSelect(node.id)} onNodeDoubleClick={(_, node) => onSelect(node.id, true)}
        fitView fitViewOptions={fitOptions} minZoom={.25} maxZoom={2} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null}
        zoomOnScroll={false} zoomOnDoubleClick={false} colorMode="dark" preventScrolling={false} ariaLabelConfig={{ 'controls.fitView.ariaLabel': 'Fit network to view' }}>
        <Background color="#233345" gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap style={{ width: 110, height: 75 }} nodeColor={node => node.data.color} nodeStrokeWidth={0} maskColor="#080e1799" pannable zoomable ariaLabel="Network minimap" />
      </ReactFlow>
      <div className="network-canvas-meta" aria-hidden="true">{nodes.length} nodes <span>/</span> {edges.length} connections</div>
    </div>
  );
}

export default function MainDashboard() {
  const [selectedId, setSelectedId] = useState('profile');
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const inspectorRef = useRef(null);
  const detail = getDetail(selectedId);
  const topic = getTopic(detail?.topicId || selectedId);
  const matches = searchProfile(query);
  const select = useCallback((id, expand = false) => {
    setSelectedId(id);
    setQuery('');
    if (expand && getTopic(id)) setExpandedId(id);
    if (window.innerWidth < 980) inspectorRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }, []);
  const openDetail = item => { setExpandedId(item.topicId); select(item.id); };
  const reset = () => { setExpandedId(null); setSelectedId('profile'); setQuery(''); setRevision(value => value + 1); };
  return (
    <section className="profile-network" aria-labelledby="network-title">
      <header className="network-heading">
        <div><p className="network-eyebrow">THE CONNECTIONS BEHIND THE WORK</p><h1 id="network-title">My network, explored.</h1><p>Follow a connection. Get to know the details.</p></div>
        <button className="network-reset" type="button" onClick={reset}>↺ Reset view</button>
      </header>
      <div className="network-toolbar">
        <nav aria-label="Network views"><button type="button" aria-current={!expandedId ? 'page' : undefined} onClick={reset}>All connections</button>{expandedId && <><span aria-hidden="true">/</span><span>{getTopic(expandedId).title}</span></>}</nav>
        <label className="network-search"><span className="sr-only">Search portfolio connections</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a skill, company, project…" /></label>
      </div>
      {query.trim() && <section className="network-search-results" aria-label="Search results"><p role="status">{matches.length} matching connections</p>{matches.length ? <div>{matches.map(item => <button type="button" key={item.id} onClick={() => openDetail(item)}><span style={{ color: item.color }}>{getTopic(item.topicId).code}</span><strong>{item.name}</strong><small>{getTopic(item.topicId).title} ↗</small></button>)}</div> : <p>Try “Huawei”, “Rust” or “Cloud”.</p>}</section>}
      <div className="network-workspace">
        <div className="network-map-panel">
          <div className="network-map-topline"><span className="network-signal" />{expandedId ? `${getTopic(expandedId).title} / neighborhood` : 'Qi Le / connected profile'}<span className="network-map-tag">INTERACTIVE</span></div>
          <ReactFlowProvider key={`${expandedId || 'overview'}-${revision}`}><NetworkCanvas expandedId={expandedId} selectedId={selectedId} onSelect={select} /></ReactFlowProvider>
          <p className="network-map-hint">Drag to arrange / pan · Pinch or + / − to zoom<br />Solid links: profile areas · Dotted links: shared work or study</p>
        </div>
        <aside className="network-inspector" ref={inspectorRef} aria-labelledby="network-detail-title">
          <div className="network-inspector-bar"><span>CONNECTION DETAILS</span><span className="network-signal" /></div>
          {selectedId === 'profile' ? <>
            <p className="network-eyebrow">THE PERSON AT THE CENTER</p><h2 id="network-detail-title">Chang Qi Le<span>.</span></h2>
            <p className="network-role">{profile.role}</p><p>{profile.company} · {profile.department}</p>
            <div className="network-tags">{profile.focus.map(focus => <span key={focus}>{focus}</span>)}</div>
            <p className="network-bio">{profile.outlook}</p><a href={`mailto:${profile.email}`}>{profile.email} ↗</a>
            <div className="network-next"><h3>Where would you like to go?</h3><p>Select a node for a closer look. Expand a topic to reveal its individual connections.</p></div>
            <span className="network-total">{details.length} details across {topics.length} areas</span>
          </> : <>
            <p className="network-eyebrow" style={{ color: topic.color }}>{detail ? topic.title : 'EXPLORE A TOPIC'}</p><h2 id="network-detail-title">{detail?.name || topic.title}</h2>
            {detail ? <><p className="network-detail-body">{detail.desc}</p><h3 className="network-related-title">Connected to</h3><div className="network-related">{[topic.id, ...(relatedTopics[detail.id] || [])].map(id => <button type="button" key={id} onClick={() => { setExpandedId(id); select(id); }}>{getTopic(id).title} <span>↗</span></button>)}</div><button className="network-back" type="button" onClick={() => select(topic.id)}>← All {topic.title.toLowerCase()} details</button></> : <>
              <p>{topic.description}</p><button className="network-expand" type="button" onClick={() => setExpandedId(expandedId === topic.id ? null : topic.id)}>{expandedId === topic.id ? 'Return to full network' : `Expand ${topic.items.length} connections`} <span>↗</span></button>
              <div className="network-item-list">{topic.items.map(item => <button type="button" key={item.id} onClick={() => openDetail(getDetail(item.id))}><span>{getDetail(item.id).name}</span><small>{item.desc.split('\n')[0]}</small><b aria-hidden="true">↗</b></button>)}</div>
            </>}
          </>}
        </aside>
      </div>
      <nav className="network-topics" aria-label="Explore portfolio topics">{topics.map(item => <button type="button" key={item.id} aria-pressed={topic?.id === item.id} style={{ '--topic-color': item.color }} onClick={() => select(item.id)}><span />{item.title}<small>{item.items.length}</small></button>)}</nav>
    </section>
  );
}
