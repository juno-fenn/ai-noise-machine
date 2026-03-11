import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import './App.css'

const NODES = [
  { id: 'human', label: 'Human Intent', x: 50, y: 210, color: '#4a9eff', icon: '\u{1F9E0}' },
  { id: 'agents', label: 'Agent Fleets', x: 230, y: 130, color: '#a855f7', icon: '\u{1F916}' },
  { id: 'content', label: 'Content Flood', x: 420, y: 30, color: '#f59e0b', icon: '\u{1F4C4}' },
  { id: 'actions', label: 'Auto Actions', x: 420, y: 280, color: '#f97316', icon: '\u26A1' },
  { id: 'search', label: 'Search', x: 630, y: 15, color: '#10b981', icon: '\u{1F50D}' },
  { id: 'social', label: 'Social', x: 630, y: 135, color: '#06b6d4', icon: '\u{1F4F1}' },
  { id: 'email', label: 'Email', x: 630, y: 255, color: '#8b5cf6', icon: '\u{1F4E7}' },
  { id: 'reviews', label: 'Reviews', x: 630, y: 375, color: '#ec4899', icon: '\u2B50' },
  { id: 'competing', label: 'Rival Agents', x: 860, y: 75, color: '#ef4444', icon: '\u2694\uFE0F' },
  { id: 'verify', label: 'Verification', x: 860, y: 285, color: '#6366f1', icon: '\u{1F6E1}\uFE0F' },
  { id: 'signal', label: 'Signal Death', x: 1090, y: 190, color: '#dc2626', icon: '\u{1F480}' },
]

const EDGES = [
  // Primary flow
  { from: 'human', to: 'agents', label: 'deploys' },
  { from: 'agents', to: 'content', label: 'generates' },
  { from: 'agents', to: 'actions', label: 'executes' },
  // Distribution into domains
  { from: 'content', to: 'search', label: 'floods' },
  { from: 'content', to: 'social', label: 'posts' },
  { from: 'actions', to: 'email', label: 'spams' },
  { from: 'actions', to: 'reviews', label: 'fakes' },
  // Cross-contamination
  { from: 'content', to: 'email', label: 'outreach' },
  { from: 'actions', to: 'social', label: 'bots' },
  // Arms races
  { from: 'search', to: 'competing', label: 'SEO war' },
  { from: 'social', to: 'competing', label: 'engagement war' },
  // Feedback loops
  { from: 'competing', to: 'agents', label: 'escalates', feedback: true },
  { from: 'competing', to: 'content', label: 'proliferates', feedback: true },
  { from: 'search', to: 'agents', label: 'ingests', feedback: true },
  { from: 'email', to: 'agents', label: 'auto-replies', feedback: true },
  // Verification pressure
  { from: 'email', to: 'verify', label: 'filters' },
  { from: 'reviews', to: 'verify', label: 'detects' },
  // Convergence to signal death
  { from: 'search', to: 'signal' },
  { from: 'social', to: 'signal' },
  { from: 'email', to: 'signal' },
  { from: 'reviews', to: 'signal' },
  { from: 'verify', to: 'signal', label: 'overwhelmed' },
  { from: 'competing', to: 'signal', label: 'amplifies' },
]

const INSIGHTS = {
  human: {
    title: 'Human Intent',
    icon: '\u{1F9E0}',
    color: '#4a9eff',
    text: '"Grow my brand." "Find leads." "Stay informed." Simple desires get translated into autonomous agents running 24/7. One human deploys multiple agents across multiple platforms. Each agent interprets the intent as a mandate for continuous, aggressive action.',
  },
  agents: {
    title: 'Agent Fleets',
    icon: '\u{1F916}',
    color: '#a855f7',
    text: 'Not one agent \u2014 fleets. Marketing agents, research agents, outreach agents, monitoring agents. Companies deploy dozens. Each rationally optimizes its narrow objective. None accounts for the collective effect of millions doing the same thing simultaneously.',
  },
  content: {
    title: 'Content Flood',
    icon: '\u{1F4C4}',
    color: '#f59e0b',
    text: 'Blog posts, articles, social updates, comments, code, documentation \u2014 generated at machine speed, near-zero marginal cost. Most is plausible but adds no genuine signal. The sheer volume makes it impossible to distinguish machine output from human thought.',
  },
  actions: {
    title: 'Automated Actions',
    icon: '\u26A1',
    color: '#f97316',
    text: 'Agents don\'t just write \u2014 they act. Sending emails, filling forms, booking meetings, submitting applications, making purchases, signing up for services. Every action creates ripple effects in systems designed for human-speed interaction.',
  },
  search: {
    title: 'Search & Discovery',
    icon: '\u{1F50D}',
    color: '#10b981',
    text: 'SEO-optimized AI content floods search indexes. Results pages fill with machine-generated answers to machine-generated questions. Finding genuine human expertise becomes a needle-in-a-haystack problem. The discovery layer of the internet degrades first.',
  },
  social: {
    title: 'Social Platforms',
    icon: '\u{1F4F1}',
    color: '#06b6d4',
    text: 'AI-generated posts, comments, and engagement. Bot accounts that pass for human. Algorithmic amplification rewards engagement, not truth. Authentic voices drown in optimized synthetic content. The social graph fills with phantom connections.',
  },
  email: {
    title: 'Email & Messaging',
    icon: '\u{1F4E7}',
    color: '#8b5cf6',
    text: 'AI outreach at scale: hyper-personalized cold emails, auto-follow-ups, meeting requests. Agents email agents, creating activity that looks like business. Inboxes become unusable. The channel that built the internet\'s trust layer erodes.',
  },
  reviews: {
    title: 'Reviews & Trust Systems',
    icon: '\u2B50',
    color: '#ec4899',
    text: 'Fake reviews, synthetic testimonials, manufactured social proof. Every trust signal humans built \u2014 ratings, reviews, endorsements, recommendations \u2014 gets gamed at scale. When everything has 4.8 stars, stars mean nothing.',
  },
  competing: {
    title: 'Rival Agents',
    icon: '\u2694\uFE0F',
    color: '#ef4444',
    text: 'Your SEO agent competes with their SEO agent. Your outreach bot hits the same inbox as theirs. Arms races emerge: more volume, more sophistication, more aggressive tactics. The rational response to agent noise is always\u2026 more agents.',
  },
  verify: {
    title: 'Verification Systems',
    icon: '\u{1F6E1}\uFE0F',
    color: '#6366f1',
    text: 'Spam filters, CAPTCHA, fraud detection, content moderation \u2014 all racing to keep up. But verification is fundamentally harder than generation. Creating convincing noise costs cents. Verifying authenticity costs dollars. The economics guarantee verification loses.',
  },
  signal: {
    title: 'Signal Death',
    icon: '\u{1F480}',
    color: '#dc2626',
    text: 'The end state isn\'t silence \u2014 it\'s a world so saturated with plausible noise that signal becomes unrecoverable. Not a dramatic collapse but a slow erosion where nobody notices the exact moment they stopped trusting their inbox, their search results, their feed.',
  },
}

const NW = 120
const NH = 58

const PHASES = [
  { max: 15, label: 'Early Adoption', color: '#10b981', desc: 'Agents provide genuine advantage' },
  { max: 35, label: 'Arms Race', color: '#f59e0b', desc: 'Competitors deploy counter-agents' },
  { max: 65, label: 'Trust Erosion', color: '#f97316', desc: 'Verification systems falling behind' },
  { max: Infinity, label: 'Signal Death', color: '#dc2626', desc: 'Noise indistinguishable from signal' },
]

function App() {
  const [selected, setSelected] = useState(null)
  const [agentCount, setAgentCount] = useState(1)
  const [particles, setParticles] = useState([])
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [verifyCost, setVerifyCost] = useState(0)
  const particleId = useRef(0)

  const nodeMap = useMemo(() => {
    const m = {}
    NODES.forEach(n => { m[n.id] = n })
    return m
  }, [])

  const phase = PHASES.find(p => agentCount <= p.max)

  const edgeData = useMemo(() => EDGES.map((edge, i) => {
    const from = nodeMap[edge.from]
    const to = nodeMap[edge.to]
    const fromX = from.x + NW / 2
    const fromY = from.y + NH / 2
    const toX = to.x + NW / 2
    const toY = to.y + NH / 2
    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2
    const dx = toX - fromX
    const dy = toY - fromY
    const feedbackSpread = edge.feedback ? 0.25 + (i % 4) * 0.08 : 0
    const cx = midX + (edge.feedback ? dy * feedbackSpread : dy * 0.1)
    const cy = midY + (edge.feedback ? -dx * (0.2 + (i % 3) * 0.05) : -dx * 0.03)
    return { ...edge, fromX, fromY, toX, toY, cx, cy }
  }), [nodeMap])

  const spawnParticles = useCallback(() => {
    const count = Math.ceil(agentCount / 2)
    const newParticles = []
    for (let i = 0; i < count; i++) {
      const edge = edgeData[Math.floor(Math.random() * edgeData.length)]
      const from = nodeMap[edge.from]
      const to = nodeMap[edge.to]
      const hue = Math.random() > 0.5 ? from.color : to.color
      newParticles.push({
        id: particleId.current++,
        fromX: edge.fromX, fromY: edge.fromY,
        toX: edge.toX, toY: edge.toY,
        progress: 0,
        speed: 0.005 + Math.random() * 0.012,
        color: hue,
        size: 1.5 + Math.random() * 2,
        feedback: edge.feedback,
      })
    }
    return newParticles
  }, [agentCount, nodeMap, edgeData])

  useEffect(() => {
    let animFrame
    let lastSpawn = 0
    const animate = (time) => {
      if (time - lastSpawn > 120) {
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
    const noiseTarget = 100 * (1 - Math.exp(-agentCount / 22))
    const verifyTarget = Math.min(100, 100 * (1 - Math.exp(-agentCount / 13)))

    const interval = setInterval(() => {
      setNoiseLevel(prev => {
        const diff = noiseTarget - prev
        return Math.abs(diff) < 0.3 ? noiseTarget : prev + diff * 0.06
      })
      setVerifyCost(prev => {
        const diff = verifyTarget - prev
        return Math.abs(diff) < 0.3 ? verifyTarget : prev + diff * 0.06
      })
    }, 30)
    return () => clearInterval(interval)
  }, [agentCount])

  const noiseTier = noiseLevel < 25 ? 'low' : noiseLevel < 55 ? 'mid' : noiseLevel < 80 ? 'high' : 'critical'
  const metaOpacity = 0.4 + (noiseLevel / 166)

  return (
    <div className="app">
      <div
        className={`meta-banner ${noiseTier}`}
        style={{
          opacity: metaOpacity,
          borderBottomColor: `rgba(239, 68, 68, ${0.1 + noiseLevel / 200})`,
        }}
      >
        This visualization was designed, coded, and deployed by an AI agent &mdash; you are looking at the problem it describes.
      </div>

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
          <span className={`agent-count ${noiseTier}`}>
            {agentCount === 1 ? '1 agent' : `${agentCount} agents`}
          </span>
        </label>

        <div className="phase-indicator" style={{ color: phase.color }}>
          <span className="phase-label">{phase.label}</span>
          <span className="phase-desc">{phase.desc}</span>
        </div>

        <div className="meters">
          <div className="noise-meter">
            <span className="meter-title">Noise</span>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${noiseLevel}%`,
                  backgroundColor: noiseLevel < 25 ? '#10b981' : noiseLevel < 55 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <span className={`meter-value ${noiseTier}`}>{Math.round(noiseLevel)}%</span>
          </div>
          <div className="noise-meter">
            <span className="meter-title verify-title">Verification Cost</span>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${verifyCost}%`,
                  backgroundColor: verifyCost < 30 ? '#6366f1' : verifyCost < 60 ? '#8b5cf6' : '#a855f7',
                }}
              />
            </div>
            <span className={`meter-value ${verifyCost > noiseLevel + 5 ? 'asymmetry' : ''}`}>{Math.round(verifyCost)}%</span>
          </div>
        </div>
      </div>

      <div className="diagram-container">
        <svg viewBox="0 0 1280 460" className="diagram" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="rgba(255,255,255,0.2)" />
            </marker>
            <marker id="arrow-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="rgba(239,68,68,0.4)" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="nodeShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#000" floodOpacity="0.5" />
            </filter>
            {NODES.map(node => (
              <linearGradient key={node.id} id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={node.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={node.color} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>

          {edgeData.map((edge, i) => {
            const opacity = 0.1 + Math.min(0.45, agentCount / 70)
            const path = `M${edge.fromX},${edge.fromY} Q${edge.cx},${edge.cy} ${edge.toX},${edge.toY}`
            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={edge.feedback ? '#ef4444' : '#444'}
                  strokeWidth={edge.feedback ? 1 + agentCount / 30 : 0.8 + agentCount / 50}
                  strokeOpacity={edge.feedback ? opacity * 1.6 : opacity}
                  strokeDasharray={edge.feedback ? '5 3' : 'none'}
                  markerEnd={edge.feedback ? 'url(#arrow-red)' : 'url(#arrow)'}
                />
                {edge.label && (
                  <text
                    x={edge.cx}
                    y={edge.cy - 5}
                    textAnchor="middle"
                    fill={edge.feedback ? '#ef4444' : '#555'}
                    fontSize="9"
                    fontWeight={edge.feedback ? '600' : '400'}
                    className="edge-label"
                    opacity={0.5 + Math.min(0.5, agentCount / 60)}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}

          {particles.map(p => {
            const t = p.progress
            const x = p.fromX + (p.toX - p.fromX) * t
            const y = p.fromY + (p.toY - p.fromY) * t
            const opacity = Math.sin(t * Math.PI)
            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={p.size}
                fill={p.feedback ? '#ef4444' : p.color}
                opacity={opacity * 0.6}
              />
            )
          })}

          {NODES.map(node => {
            const isSelected = selected === node.id
            const isSignal = node.id === 'signal'
            const isCompeting = node.id === 'competing'
            const glowIntensity = (isSignal || isCompeting) ? Math.min(1, agentCount / 30) : 0
            const nodeScale = isSelected ? 1.06 : 1
            const shouldPulse = isSignal && agentCount > 50
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y}) scale(${nodeScale})`}
                onClick={() => setSelected(isSelected ? null : node.id)}
                className="node"
              >
                {glowIntensity > 0.2 && (
                  <rect
                    x={-6} y={-6}
                    width={NW + 12} height={NH + 12}
                    rx={18}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2}
                    opacity={glowIntensity * 0.3}
                    filter="url(#glow)"
                  />
                )}
                <rect
                  x={0} y={0}
                  width={NW} height={NH}
                  rx={12}
                  fill={isSelected ? node.color : `url(#grad-${node.id})`}
                  stroke={node.color}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                  filter="url(#nodeShadow)"
                  opacity={shouldPulse ? 0.7 + Math.sin(Date.now() / 400) * 0.3 : 0.95}
                />
                <text x={NW / 2} y={24} textAnchor="middle" fill="#fff" fontSize="20">
                  {node.icon}
                </text>
                <text x={NW / 2} y={46} textAnchor="middle" fill="#ddd" fontSize="9.5" fontWeight="600" letterSpacing="0.02em">
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
        <div className="bottom-content">
          <p className="core-insight">
            <strong>The verification asymmetry:</strong> Creating convincing noise costs cents.
            Verifying authenticity costs dollars. As agents scale, the gap only widens &mdash;
            and it only runs in one direction.
          </p>
          <p className="meta-credit">
            This entire app &mdash; concept, code, copy, deployment &mdash; was produced by an AI agent in minutes. That&rsquo;s the problem.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
