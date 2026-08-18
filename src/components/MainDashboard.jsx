import React, { useState, useRef } from 'react';
import resumeData from '../data/resume.json';

const MainDashboard = ({ view }) => {
  const [nodes, setNodes] = useState([
    { ...resumeData.core, x: 50, y: 50, isCore: true },   // Center
    { ...resumeData.experience, x: 25, y: 30 }, // Top-Left
    { ...resumeData.projects, x: 75, y: 30 },   // Top-Right
    { ...resumeData.awards, x: 25, y: 70 },     // Bottom-Left
    { ...resumeData.certifications, x: 75, y: 70 }, // Bottom-Right
    { ...resumeData.skills, x: 50, y: 15 },     // Top-Center
    { ...resumeData.activities, x: 50, y: 85 }  // Bottom-Center
  ]);

  const [hoveredData, setHoveredData] = useState(null); 
  const [activeNode, setActiveNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);

  const containerRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragThreshold = 5; 

  const handleMouseDown = (e, nodeId) => {
    if (activeNode) return; 
    e.stopPropagation();
    setDraggingNode(nodeId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!draggingNode || activeNode || !containerRef.current) return;
    
    if (Math.abs(e.clientX - dragStart.current.x) > dragThreshold || 
        Math.abs(e.clientY - dragStart.current.y) > dragThreshold) {
      isDragging.current = true;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    
    setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x, y } : n));
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    setActiveNode(activeNode === nodeId ? null : nodeId);
  };

  const handleBgClick = () => {
    setActiveNode(null); 
  };

  if (view !== 'DASHBOARD') return <div className="placeholder-pane">ACCESSING_MODULE: {view}...</div>;

  const coreNode = nodes.find(n => n.id === 'core');
  const activeNodeData = nodes.find(n => n.id === activeNode);

  const canvasStyle = activeNodeData 
    ? { transform: `translate(calc(50% - ${activeNodeData.x}%), calc(50% - ${activeNodeData.y}%))` }
    : { transform: `translate(0%, 0%)` };

  return (
    <div 
      ref={containerRef}
      className="topology-container" 
      onMouseMove={handleMouseMove} 
      onMouseUp={() => setDraggingNode(null)} 
      onMouseLeave={() => setDraggingNode(null)} 
      onClick={handleBgClick}
    >
      <div className="topology-instruction">DRAG TO MOVE | CLICK TO FOCUS & EXPAND</div>

      <div className="topology-canvas" style={canvasStyle}>
        
        <svg className="topology-edges">
          {nodes.filter(n => !n.isCore).map(node => {
            const isDimmed = activeNode && activeNode !== node.id && activeNode !== 'core';
            return (
              <line 
                key={`edge-${node.id}`} 
                x1={`${coreNode.x}%`} 
                y1={`${coreNode.y}%`} 
                x2={`${node.x}%`} 
                y2={`${node.y}%`} 
                className={`edge-line ${activeNode === node.id ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`} 
              />
            );
          })}
        </svg>

        {nodes.map(node => (
          <div 
            key={node.id} 
            className={`node ${node.isCore ? 'node-core' : 'node-satellite'} ${activeNode === node.id ? 'focused' : ''} ${activeNode && activeNode !== node.id ? 'dimmed' : ''}`} 
            style={{ left: `${node.x}%`, top: `${node.y}%` }} 
            onMouseEnter={() => !activeNode && setHoveredData(node)} 
            onMouseLeave={() => setHoveredData(null)} 
            onMouseDown={(e) => handleMouseDown(e, node.id)} 
            onClick={(e) => handleNodeClick(e, node.id)}
          >
            <div className="node-dot"></div>
            <div className="node-label">{node.label}</div>

            {hoveredData?.id === node.id && !draggingNode && !activeNode && (
              <div className="mini-node-popup">
                <div className="mini-header">{node.label}_DATA</div>
                <div className="mini-body">{node.summary}</div>
              </div>
            )}

            {activeNode === node.id && (
              <div className="sub-nodes-container">
                {/* PRE-CALCULATE SUB-NODE POSITIONS */}
                {(() => {
                  const total = node.children.length;
                  const radius = 145; // slightly wider radius for denser nodes

                  // Step A: Render ALL sub-edges FIRST so they sit strictly in the background
                  const edgesMarkup = node.children.map((child, i) => {
                    const slice = (2 * Math.PI) / total;
                    // Organic jitter calculated safely to prevent overlap
                    const jitter = Math.sin(i * 99) * (slice * 0.25);
                    const angle = (i * slice) + jitter;

                    return (
                      <div 
                        key={`sub-edge-${child.id}`} 
                        className="sub-edge" 
                        style={{ transform: `rotate(${angle}rad)`, '--line-length': `${radius}px` }} 
                      />
                    );
                  });

                  // Step B: Render ALL sub-nodes SECOND so they sit on top of the edges
                  const nodesMarkup = node.children.map((child, i) => {
                    const slice = (2 * Math.PI) / total;
                    const jitter = Math.sin(i * 99) * (slice * 0.25);
                    const angle = (i * slice) + jitter;

                    const cx = Math.cos(angle) * radius;
                    const cy = Math.sin(angle) * radius;

                    return (
                      <div 
                        key={`sub-node-${child.id}`} 
                        className="sub-node-wrapper" 
                        style={{ left: `${cx}px`, top: `${cy}px` }}
                      >
                        <div 
                          className="sub-node" 
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredData(child); }} 
                          onMouseLeave={(e) => { e.stopPropagation(); setHoveredData(null); }}
                        >
                          {child.label}
                        </div>
                        {hoveredData?.id === child.id && (
                          <div className="mini-node-popup sub-popup">
                            <div className="mini-header">{child.label}_DETAILS</div>
                            <div className="mini-body">{child.desc}</div>
                          </div>
                        )}
                      </div>
                    );
                  });

                  return [...edgesMarkup, ...nodesMarkup];
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

MainDashboard.defaultProps = {
  view: 'DASHBOARD'
};

export default MainDashboard;