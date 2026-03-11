import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import './App.css'

const NODES = [
  { id: 'human', label: 'Human Intent', x: 80, y: 250, color: '#4a9eff', icon: '\u{1F9E0}' },
  { id: 'agent', label: 'AI Agent', x: 320, y: 150, color: '#a855f7', icon: '\u{1F916}' },
  { id: 'content', label: 'Generated Content', x: 560, y: 70, color: '#f59e0b', icon: '\u{1F4C4}' },
  { id: 'actions', label: 'Automated Actions', x: 560, y: 270, color: '#ef4444', icon: '\u26A1' },
  { id: 'web', label: 'The Internet', x: 800, y: 150, color: '#10b981', icon: '\u{1F310}' },
  { id: 'feeds', label: 'Other Agents / Feeds', x: 800, y: 370, color: '#6366f1', icon: '\u{1F4E1}' },
  { id: 'noise', label: 'Cumulative Noise', x: 1060, y: 250, color: '#ef4444', icon: '\u{1F4E2}' },
]

const EDGES = [
  { from: 'human', to: 'agent', label: 'prompts' },
  { from: 'agent', to: 'content', label: 'generates' },
  { from: 'agent', to: 'actions', label: 'executes' },
  { from: 'content', to: 'web', label: 'publishes' },
  { from: 'actions', to: 'web', label: 'modifies' },
  { from: 'actions', to: 'feeds', label: 'triggers' },
  { from: 'web', to: 'noise', label: 'amplifies' },
  { from: 'feeds', to: 'noise', label: 'compounds' },
  { from: 'feeds', to: 'agent', label: 'feeds back' },
]

const INSIGHTS = {
  human: {
    title: 'Human Intent',
    icon: '\u{1F9E0}',
    color: '#4a9eff',
    text: 'A single human desire \u2014 "grow my brand", "find leads", "stay informed" \u2014 gets translated into instructions for an AI agent. The intent is simple, but the agent interprets it as a mandate for continuous action.',
  },
  agent: {
    title: 'AI Agent',
    icon: '\u{1F916}',
    color: '#a855f7',
    text: 'The agent operates autonomously: drafting emails, posting content, signing up for services, engaging on social media. Each agent acts rationally in isolation \u2014 but millions of them act simultaneously.',
  },
  content: {
    title: 'Generated Content',
    icon: '\u{1F4C4}',
    color: '#f59e0b',
    text: 'Blog posts, social media updates, comments, emails, code commits \u2014 all generated at machine speed. Much of it is plausible but adds little genuine signal. The volume overwhelms human-created content.',
  },
  actions: {
    title: 'Automated Actions',
    icon: '\u26A1',
    color: '#ef4444',
    text: "Agents don't just write \u2014 they act. They send emails, create accounts, fill out forms, book meetings, submit applications. Every action creates ripple effects in systems designed for human-speed interaction.",
  },
  web: {
    title: 'The Internet',
    icon: '\u{1F310}',
    color: '#10b981',
    text: 'The shared information space absorbs all this output. Search results fill with AI-generated pages. Inboxes fill with AI-drafted outreach. Social feeds fill with AI-optimized engagement. Signal-to-noise ratio drops.',
  },
  feeds: {
    title: 'Other Agents & Feeds',
    icon: '\u{1F4E1}',
    color: '#6366f1',
    text: "Your agent's output becomes another agent's input. Agent A sends an email, Agent B reads and responds, Agent A processes the response. Automated feedback loops emerge \u2014 machines talking to machines, creating activity that looks meaningful but isn't.",
  },
  noise: {
    title: 'Cumulative Noise',
    icon: '\u{1F4E2}',
    color: '#ef4444',
    text: "Each agent adds a thin layer of noise. Multiply by millions of agents, running 24/7, and the cumulative effect is transformative. Attention becomes the scarcest resource. Trust in digital communication erodes. The cost of verifying what's real exceeds the cost of creating what's fake.",
  },
}

const NW = 140
const NH = 70

function App() {
  const [selected, setSelected] = useState(null)
  const [agentCount, setAgentCount] = useState(1)
  const [particles, setParticles] = useState([])
  const [noiseLevel, setNoiseLevel] = useState(0)
  const particleId = useRef(0)

  const nodeMap = useMemo(() => {
    const m = {}
    NODES.forEach(n => { m[n.id] = n })
    return m
  }, [])

  const spawnParticles = useCallback(() => {
    const count = Math.ceil(agentCount / 2)
    const newParticles = []
    for (let i = 0; i < count; i++) {
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)]
      const from = nodeMap[edge.from]
      const to = nodeMap[edge.to]
      const hue = Math.random() > 0.5 ? from.color : to.color
      newParticles.push({
        id: particleId.current++,
        from: { x: from.x + NW / 2, y: from.y + NH / 2 },
        to: { x: to.x + NW / 2, y: to.y + NH / 2 },
        progress: 0,
        speed: 0.006 + Math.random() * 0.014,
        color: hue,
        size: 2 + Math.random() * 2.5,
      })
    }
    return newParticles
  }, [agentCount, nodeMap])

  useEffect(() => {
    let animFrame
    let lastSpawn = 0
    const animate = (time) => {
      if (time - lastSpawn > 150) {
        setParticles(prev => [...prev, ...spawnParticles()])
        lastSpawn = time
      }
      setParticles(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + p.speed }))
          .filter(p => p.progress < 1)
      )
      animFrame = requestAnimationFrame(animate)
    }
    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [spawnParticles])

  useEffect(() => {
    const target = Math.min(100, agentCount * 3 + Math.log2(agentCount + 1) * 15)
    const interval = setInterval(() => {
      setNoiseLevel(prev => {
        const diff = target - prev
        return Math.abs(diff) < 0.5 ? target : prev + diff * 0.05
      })
    }, 30)
    return () => clearInterval(interval)
  }, [agentCount])

  const noiseLabel = noiseLevel < 30 ? 'Manageable' : noiseLevel < 60 ? 'Degraded' : noiseLevel < 85 ? 'Overwhelmed' : 'Collapsed'
  const noiseTier = noiseLevel < 30 ? 'low' : noiseLevel < 60 ? 'mid' : noiseLevel < 85 ? 'high' : 'critical'
  const agentTier = agentCount < 20 ? 'low' : agentCount < 50 ? 'mid' : 'high'

  return (
    <div className="app">
      <header>
        <h1>The Inevitable Noise Machine</h1>
        <p className="subtitle">How AI agents collectively degrade the information environment</p>
      </header>

      <div className="controls">
        <label>
          <span className="control-label">Active Agents:</span>
          <input
            type="range"
            min={1}
            max={100}
            value={agentCount}
            onChange={e => setAgentCount(Number(e.target.value))}
          />
          <span className={`agent-count ${agentTier}`}>
            {agentCount === 1 ? '1 agent' : `${agentCount} agents`}
          </span>
        </label>
        <div className="noise-meter">
          <span>Noise:</span>
          <div className="meter-bar">
            <div
              className="meter-fill"
              style={{
                width: `${noiseLevel}%`,
                backgroundColor: noiseLevel < 30 ? '#10b981' : noiseLevel < 60 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <span className={`meter-label ${noiseTier} ${noiseTier === 'critical' ? 'pulse' : ''}`}>
            {noiseLabel}
          </span>
        </div>
      </div>

      <div className="diagram-container">
        <svg viewBox="0 0 1250 470" className="diagram" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <path d="M0,0 L10,3.5 L0,7" fill="rgba(255,255,255,0.2)" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="nodeShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000" floodOpacity="0.5" />
            </filter>
            {NODES.map(node => (
              <linearGradient key={node.id} id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={node.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={node.color} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const from = nodeMap[edge.from]
            const to = nodeMap[edge.to]
            const fromX = from.x + NW / 2
            const fromY = from.y + NH / 2
            const toX = to.x + NW / 2
            const toY = to.y + NH / 2
            const midX = (fromX + toX) / 2
            const midY = (fromY + toY) / 2
            const opacity = 0.15 + Math.min(0.5, agentCount / 60)
            const isFeedback = edge.from === 'feeds' && edge.to === 'agent'
            // Curved path for feedback loop
            const dx = toX - fromX
            const dy = toY - fromY
            const cx = midX + (isFeedback ? -80 : dy * 0.15)
            const cy = midY + (isFeedback ? -120 : -dx * 0.05)
            const path = `M${fromX},${fromY} Q${cx},${cy} ${toX},${toY}`
            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={isFeedback ? '#ef4444' : '#555'}
                  strokeWidth={1 + agentCount / 25}
                  strokeOpacity={isFeedback ? opacity * 1.5 : opacity}
                  strokeDasharray={isFeedback ? '6 4' : 'none'}
                  markerEnd="url(#arrow)"
                />
                <text
                  x={cx}
                  y={cy - 6}
                  textAnchor="middle"
                  fill={isFeedback ? '#ef4444' : '#555'}
                  fontSize="10"
                  fontWeight={isFeedback ? '600' : '400'}
                  className="edge-label"
                  opacity={0.6 + Math.min(0.4, agentCount / 50)}
                >
                  {edge.label}
                </text>
              </g>
            )
          })}

          {/* Particles */}
          {particles.map(p => {
            const x = p.from.x + (p.to.x - p.from.x) * p.progress
            const y = p.from.y + (p.to.y - p.from.y) * p.progress
            const opacity = Math.sin(p.progress * Math.PI)
            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={p.size}
                fill={p.color}
                opacity={opacity * 0.7}
              />
            )
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const isSelected = selected === node.id
            const isNoise = node.id === 'noise'
            const glowIntensity = isNoise ? Math.min(1, agentCount / 25) : 0
            const nodeScale = isSelected ? 1.06 : 1
            const pulseClass = isNoise && agentCount > 60
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y}) scale(${nodeScale})`}
                onClick={() => setSelected(isSelected ? null : node.id)}
                className="node"
              >
                {/* Background glow for noise node */}
                {glowIntensity > 0.2 && (
                  <rect
                    x={-8} y={-8}
                    width={NW + 16} height={NH + 16}
                    rx={20}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={2}
                    opacity={glowIntensity * 0.3}
                    filter="url(#glow)"
                  />
                )}
                <rect
                  x={0} y={0}
                  width={NW} height={NH}
                  rx={14}
                  fill={isSelected ? node.color : `url(#grad-${node.id})`}
                  stroke={node.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter="url(#nodeShadow)"
                  opacity={pulseClass ? 0.7 + Math.sin(Date.now() / 500) * 0.3 : 0.95}
                />
                <text x={NW / 2} y={28} textAnchor="middle" fill="#fff" fontSize="22">
                  {node.icon}
                </text>
                <text x={NW / 2} y={52} textAnchor="middle" fill="#ddd" fontSize="10.5" fontWeight="600" letterSpacing="0.02em">
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {selected && INSIGHTS[selected] && (
        <div className="insight-panel" onClick={() => setSelected(null)}>
          <div className="insight-card" onClick={e => e.stopPropagation()}>
            <span className="insight-icon">{INSIGHTS[selected].icon}</span>
            <h2 style={{ color: INSIGHTS[selected].color }}>{INSIGHTS[selected].title}</h2>
            <p>{INSIGHTS[selected].text}</p>
            <button onClick={() => setSelected(null)}>Got it</button>
          </div>
        </div>
      )}

      <div className="bottom-bar">
        <p className="paradox">
          <strong>The paradox:</strong> Each individual agent is helpful. The collective effect is corrosive.
          The noise is an emergent property of scale &mdash; and scale is inevitable.
        </p>
        <span className="credit">Built by an AI agent, adding to the noise</span>
      </div>
    </div>
  )
}

export default App
