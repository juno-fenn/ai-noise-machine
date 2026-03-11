import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const NODES = [
  { id: 'human', label: 'Human Intent', x: 100, y: 300, color: '#4a9eff', icon: '🧠' },
  { id: 'agent', label: 'AI Agent', x: 350, y: 200, color: '#a855f7', icon: '🤖' },
  { id: 'content', label: 'Generated Content', x: 600, y: 120, color: '#f59e0b', icon: '📄' },
  { id: 'actions', label: 'Automated Actions', x: 600, y: 300, color: '#ef4444', icon: '⚡' },
  { id: 'web', label: 'The Internet', x: 850, y: 200, color: '#10b981', icon: '🌐' },
  { id: 'feeds', label: 'Other Agents / Feeds', x: 850, y: 400, color: '#6366f1', icon: '📡' },
  { id: 'noise', label: 'Cumulative Noise', x: 1100, y: 300, color: '#ef4444', icon: '📢' },
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
    text: 'A single human desire \u2014 "grow my brand", "find leads", "stay informed" \u2014 gets translated into instructions for an AI agent. The intent is simple, but the agent interprets it as a mandate for continuous action.',
  },
  agent: {
    title: 'AI Agent',
    text: 'The agent operates autonomously: drafting emails, posting content, signing up for services, engaging on social media. Each agent acts rationally in isolation \u2014 but millions of them act simultaneously.',
  },
  content: {
    title: 'Generated Content',
    text: 'Blog posts, social media updates, comments, emails, code commits \u2014 all generated at machine speed. Much of it is plausible but adds little genuine signal. The volume overwhelms human-created content.',
  },
  actions: {
    title: 'Automated Actions',
    text: "Agents don't just write \u2014 they act. They send emails, create accounts, fill out forms, book meetings, submit applications. Every action creates ripple effects in systems designed for human-speed interaction.",
  },
  web: {
    title: 'The Internet',
    text: 'The shared information space absorbs all this output. Search results fill with AI-generated pages. Inboxes fill with AI-drafted outreach. Social feeds fill with AI-optimized engagement. Signal-to-noise ratio drops.',
  },
  feeds: {
    title: 'Other Agents & Feeds',
    text: "Your agent's output becomes another agent's input. Agent A sends an email, Agent B reads and responds, Agent A processes the response. Automated feedback loops emerge \u2014 machines talking to machines, creating activity that looks meaningful but isn't.",
  },
  noise: {
    title: 'Cumulative Noise',
    text: "Each agent adds a thin layer of noise. Multiply by millions of agents, running 24/7, and the cumulative effect is transformative. Attention becomes the scarcest resource. Trust in digital communication erodes. The cost of verifying what's real exceeds the cost of creating what's fake.",
  },
}

function Particle({ from, to, progress, id }) {
  const x = from.x + (to.x - from.x) * progress
  const y = from.y + (to.y - from.y) * progress
  const opacity = Math.sin(progress * Math.PI)
  return (
    <circle
      cx={x}
      cy={y}
      r={3}
      fill="#fff"
      opacity={opacity * 0.8}
      key={id}
    />
  )
}

function App() {
  const [selected, setSelected] = useState(null)
  const [agentCount, setAgentCount] = useState(1)
  const [particles, setParticles] = useState([])
  const [noiseLevel, setNoiseLevel] = useState(0)
  const particleId = useRef(0)

  const spawnParticles = useCallback(() => {
    const count = Math.ceil(agentCount / 2)
    const newParticles = []
    for (let i = 0; i < count; i++) {
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)]
      const from = NODES.find(n => n.id === edge.from)
      const to = NODES.find(n => n.id === edge.to)
      newParticles.push({
        id: particleId.current++,
        from: { x: from.x + 60, y: from.y + 30 },
        to: { x: to.x + 60, y: to.y + 30 },
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
      })
    }
    return newParticles
  }, [agentCount])

  useEffect(() => {
    let animFrame
    let lastSpawn = 0
    const animate = (time) => {
      if (time - lastSpawn > 200) {
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

  const getNodePos = (id) => NODES.find(n => n.id === id)

  return (
    <div className="app">
      <header>
        <h1>The Inevitable Noise Machine</h1>
        <p className="subtitle">How AI agents collectively degrade the information environment</p>
      </header>

      <div className="controls">
        <label>
          <span className="control-label">Active AI Agents:</span>
          <input
            type="range"
            min={1}
            max={100}
            value={agentCount}
            onChange={e => setAgentCount(Number(e.target.value))}
          />
          <span className="agent-count">
            {agentCount === 1 ? '1 agent' : `${agentCount.toLocaleString()} agents`}
          </span>
        </label>
        <div className="noise-meter">
          <span>Noise Level:</span>
          <div className="meter-bar">
            <div
              className="meter-fill"
              style={{
                width: `${noiseLevel}%`,
                backgroundColor: noiseLevel < 30 ? '#10b981' : noiseLevel < 60 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <span className="meter-label">
            {noiseLevel < 30 ? 'Manageable' : noiseLevel < 60 ? 'Degraded' : noiseLevel < 85 ? 'Overwhelmed' : 'Collapsed'}
          </span>
        </div>
      </div>

      <div className="diagram-container">
        <svg
          viewBox="0 0 1250 500"
          className="diagram"
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#555" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {EDGES.map((edge, i) => {
            const from = getNodePos(edge.from)
            const to = getNodePos(edge.to)
            const fromX = from.x + 60
            const fromY = from.y + 30
            const toX = to.x + 60
            const toY = to.y + 30
            const midX = (fromX + toX) / 2
            const midY = (fromY + toY) / 2
            const opacity = 0.3 + Math.min(0.7, agentCount / 50)
            return (
              <g key={i}>
                <line
                  x1={fromX} y1={fromY}
                  x2={toX} y2={toY}
                  stroke="#555"
                  strokeWidth={1 + agentCount / 30}
                  strokeOpacity={opacity}
                  markerEnd="url(#arrow)"
                />
                <text
                  x={midX}
                  y={midY - 8}
                  textAnchor="middle"
                  fill="#888"
                  fontSize="11"
                  className="edge-label"
                >
                  {edge.label}
                </text>
              </g>
            )
          })}

          {particles.map(p => (
            <Particle key={p.id} {...p} />
          ))}

          {NODES.map(node => {
            const isSelected = selected === node.id
            const scale = isSelected ? 1.08 : 1
            const glowIntensity = node.id === 'noise' ? Math.min(1, agentCount / 30) : 0
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y}) scale(${scale})`}
                onClick={() => setSelected(isSelected ? null : node.id)}
                className="node"
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={0} y={0}
                  width={120} height={60}
                  rx={12}
                  fill={isSelected ? node.color : '#1a1a2e'}
                  stroke={node.color}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={glowIntensity > 0.3 ? 'url(#glow)' : undefined}
                  opacity={0.95}
                />
                <text x={60} y={25} textAnchor="middle" fill="#fff" fontSize="18">
                  {node.icon}
                </text>
                <text x={60} y={48} textAnchor="middle" fill="#ddd" fontSize="10" fontWeight="500">
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
            <h2>{INSIGHTS[selected].title}</h2>
            <p>{INSIGHTS[selected].text}</p>
            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="bottom-text">
        <p>
          <strong>The paradox:</strong> Each individual agent is helpful. The collective effect is corrosive.
          No single agent is &ldquo;the problem&rdquo; &mdash; the noise is an emergent property of scale.
          As agents become cheaper and more capable, the noise floor rises for everyone.
        </p>
      </div>

      <footer>
        <p>An interactive thought experiment &middot; Built by an AI agent, adding to the noise</p>
      </footer>
    </div>
  )
}

export default App
