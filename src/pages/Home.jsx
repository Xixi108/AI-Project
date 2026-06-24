import { Link } from 'react-router-dom'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white/3 border border-white/7 rounded-2xl hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(139,92,246,0.12)] transition-all duration-300 ${className}`}>
      {children}
    </div>
  )
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-sm shrink-0">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-slate-200 mb-0.5">{title}</div>
        <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
      </div>
    </div>
  )
}

function Tag({ children }) {
  return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">{children}</span>
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">

      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.1)_0%,transparent_70%)] pointer-events-none" />

      {/* HERO */}
      <section className="pt-24 pb-20 px-6 text-center max-w-3xl mx-auto relative">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-violet-300 tracking-wide">2 TOOLS · 1 PLATFORM · 0 SUBSCRIPTIONS</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6">
          Smart Tools Built<br />
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">for Real Results</span>
        </h1>

        <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto">
          A live Philippine weather dashboard and a CSV-powered personalized email generator — both free, both running in your browser right now.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/weather" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5">
            Explore Projects ↓
          </Link>
          <a href="mailto:nbaguhin@gmail.com" className="bg-white/6 border border-white/12 hover:bg-white/10 text-slate-300 font-medium text-sm px-6 py-3 rounded-xl transition-all">
            Get in Touch
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 pb-20 max-w-2xl mx-auto">
        <div className="grid grid-cols-3 divide-x divide-white/6 border border-white/6 rounded-2xl overflow-hidden">
          {[
            { n: '2', label: 'Live Projects' },
            { n: '$0', label: 'API Costs' },
            { n: '∞', label: 'Contacts Supported' },
          ].map(s => (
            <div key={s.label} className="bg-gray-950 py-7 text-center">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">{s.n}</div>
              <div className="text-xs text-slate-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECT CARDS */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 tracking-tight">The Projects</h2>
        <p className="text-slate-500 text-sm text-center mb-12">Click any card to open the live tool.</p>

        <div className="flex flex-col gap-8">

          {/* CSV Email Generator */}
          <Card>
            <div className="grid md:grid-cols-2">
              <div className="p-10 flex flex-col gap-7">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">✉️</span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/3 text-violet-400 tracking-wider">PROJECT 01</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">CSV Email Generator</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Upload any spreadsheet and generate hundreds of personalized emails — each automatically tailored to the contact's status.</p>
                </div>
                <div className="flex flex-col gap-4">
                  <FeatureRow icon="📊" title="Status-Based Auto Templates" desc="Detects new lead, follow up, pending, closed and loads the right email instantly." />
                  <FeatureRow icon="⚡" title="Live Preview Per Contact" desc="Click any row to preview the exact email that contact will receive." />
                  <FeatureRow icon="⬇️" title="One-Click Export" desc="Download all emails as a text file or open directly in your mail app." />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to="/email-generator" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                    Open Tool →
                  </Link>
                  <Tag>React</Tag><Tag>Tailwind</Tag><Tag>PapaParse</Tag>
                </div>
              </div>

              {/* Mockup */}
              <div className="bg-gradient-to-br from-violet-500/6 to-indigo-500/4 border-t md:border-t-0 md:border-l border-white/6 p-8 flex items-center justify-center rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">
                <div className="w-full max-w-sm">
                  <div className="flex gap-1.5 bg-black/30 px-4 py-3 rounded-t-xl border-b border-white/6">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="bg-white/3 border border-white/7 border-t-0 rounded-b-xl p-4 text-xs">
                    <div className="rounded-lg overflow-hidden border border-white/6 mb-3">
                      <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-white/3 text-[10px] text-slate-600 font-semibold uppercase border-b border-white/6">
                        <span>Name</span><span>Company</span><span>Status</span>
                      </div>
                      {[
                        { name: 'Maria S.', co: 'TechCorp', status: 'new lead', sc: 'text-violet-400 bg-violet-500/15' },
                        { name: 'Juan D.', co: 'StartupMNL', status: 'follow up', sc: 'text-blue-400 bg-blue-500/15' },
                        { name: 'Ana R.', co: 'DigitalPH', status: 'closed', sc: 'text-emerald-400 bg-emerald-500/15' },
                      ].map((r, i) => (
                        <div key={i} className={`grid grid-cols-3 gap-2 px-3 py-2 ${i === 0 ? 'bg-violet-500/8' : ''} border-b border-white/4 last:border-0`}>
                          <span className="text-slate-300">{r.name}</span>
                          <span className="text-slate-500">{r.co}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${r.sc} font-medium`}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/6">
                      <div className="text-[10px] text-slate-600 mb-1.5 pb-1.5 border-b border-white/6">To: <span className="text-violet-400">maria@example.com</span></div>
                      <div className="text-[10px] text-slate-500 leading-relaxed">Hi <span className="text-violet-400">Maria</span>, I came across <span className="text-violet-400">TechCorp</span> and was truly impressed by what your team is building...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Weather Dashboard */}
          <Card>
            <div className="grid md:grid-cols-2">
              {/* Mockup left */}
              <div className="bg-gradient-to-br from-blue-500/6 to-indigo-500/4 border-b md:border-b-0 md:border-r border-white/6 p-8 flex items-center justify-center rounded-t-2xl md:rounded-t-none md:rounded-l-2xl order-last md:order-first">
                <div className="w-full max-w-sm">
                  <div className="flex gap-1.5 bg-black/30 px-4 py-3 rounded-t-xl border-b border-white/6">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/7 border-t-0 rounded-b-xl p-4 text-xs">
                    <div className="text-[10px] text-slate-500 mb-1">📍 Manila, Metro Manila</div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-4xl font-thin text-white">32°C</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Feels like 38°C · Partly Cloudy</div>
                      </div>
                      <span className="text-4xl">⛅</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[['Humidity','78%'],['Wind','18 km/h'],['Precip.','0 mm']].map(([l,v]) => (
                        <div key={l} className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-[9px] text-slate-600">{l}</div>
                          <div className="text-[11px] font-semibold text-white">{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 overflow-hidden">
                      {[['Now','⛅','32°'],['2PM','☀️','34°'],['4PM','🌦️','31°'],['6PM','🌧️','29°'],['8PM','🌙','27°']].map(([t,i,v]) => (
                        <div key={t} className="bg-white/5 rounded-lg p-2 text-center min-w-[44px]">
                          <div className="text-[9px] text-slate-600">{t}</div>
                          <div className="text-sm">{i}</div>
                          <div className="text-[10px] font-semibold text-white">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 flex flex-col gap-7">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🇵🇭</span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 tracking-wider">PROJECT 02</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Philippine Weather Dashboard</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Live weather for any city in the Philippines — search any location, auto-detect your GPS, and switch between day and night mode.</p>
                </div>
                <div className="flex flex-col gap-4">
                  <FeatureRow icon="🔍" title="Search Any PH Location" desc="Type any city, town or municipality — powered by live geocoding." />
                  <FeatureRow icon="📍" title="Auto-Detect My Location" desc="One click to get instant weather for your current GPS location." />
                  <FeatureRow icon="🌙" title="Day & Night Mode" desc="Toggle between bright and dark themes with 7-day forecast and hourly breakdown." />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to="/weather" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                    Open Tool →
                  </Link>
                  <Tag>React</Tag><Tag>Tailwind</Tag><Tag>Open-Meteo</Tag>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* WHY */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 tracking-tight">Why These Tools?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🆓', t: 'Free APIs', d: 'No hidden costs, no API keys, no surprises.' },
            { icon: '⚡', t: 'Browser-Based', d: 'No server needed — share a link and it works.' },
            { icon: '🛠️', t: 'Customizable', d: 'Clean React components, easy to extend.' },
            { icon: '📱', t: 'Responsive', d: 'Works on desktop, tablet and mobile.' },
          ].map(w => (
            <div key={w.t} className="bg-white/3 border border-white/7 rounded-xl p-5 hover:border-white/15 transition-colors">
              <div className="text-2xl mb-3">{w.icon}</div>
              <div className="text-sm font-semibold text-slate-200 mb-1">{w.t}</div>
              <div className="text-xs text-slate-600 leading-relaxed">{w.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 max-w-xl mx-auto text-center">
        <div className="bg-violet-500/8 border border-violet-500/20 rounded-2xl p-12">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Ready to Move Forward?</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">Both tools are live and ready to use. Want to customize, add features, or deploy to a custom domain? Let's talk.</p>
          <a href="mailto:nbaguhin@gmail.com" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all">
            📧 Email Me
          </a>
        </div>
      </section>

      <footer className="border-t border-white/6 px-6 py-5 text-center">
        <p className="text-xs text-slate-700">Built with React, Tailwind CSS & open APIs · 2026</p>
      </footer>
    </div>
  )
}
