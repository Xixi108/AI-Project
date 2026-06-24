import { useState, useRef, useMemo } from 'react'
import Papa from 'papaparse'


const SAMPLE_CSV = `name,email,company,role,status
Maria Santos,maria@example.com,TechCorp PH,CEO,new lead
Juan Dela Cruz,juan@example.com,StartupMNL,CTO,follow up
Ana Reyes,ana@example.com,DigitalPH,Marketing Head,closed
Rico Bautista,rico@example.com,WebPH Inc,Developer,pending
Liza Cruz,liza@example.com,CloudMNL,COO,new lead`

const STATUS_DEFAULTS = {
  'new lead': {
    subject: `Introduction â€” Exciting Opportunity for {{company}}`,
    body: `Hi {{name}},

I hope this message finds you well! I came across {{company}} and was truly impressed by what your team is building.

As the {{role}}, I believe you'd appreciate how our solution can help accelerate your goals. I'd love to set up a quick 15-minute intro call to share how we've helped similar companies.

Are you available for a brief chat this week or next?

Looking forward to connecting!

Best regards,
[Your Name]`,
  },
  'follow up': {
    subject: `Following Up â€” {{company}}`,
    body: `Hi {{name}},

I wanted to follow up on my previous message regarding a potential collaboration with {{company}}.

I understand you're busy, so I'll keep this brief â€” I truly believe there's a strong fit here and would love just 15 minutes of your time to explore it further.

Would any of these times work for you?
â€¢ Monday at 10am
â€¢ Wednesday at 2pm
â€¢ Friday at 11am

Feel free to suggest a time that works better for you.

Best regards,
[Your Name]`,
  },
  'pending': {
    subject: `Quick Check-In â€” {{company}}`,
    body: `Hi {{name}},

Just a quick check-in regarding our ongoing conversation about {{company}}.

I wanted to make sure you have everything you need from our end to move things forward. If there are any questions, concerns, or additional information I can provide, please don't hesitate to reach out.

I'm here to help make this as smooth as possible for you.

Looking forward to your update!

Best regards,
[Your Name]`,
  },
  'closed': {
    subject: `Thank You, {{name}} â€” Welcome Aboard!`,
    body: `Hi {{name}},

Congratulations and welcome! We're thrilled to have {{company}} on board.

As the {{role}}, your vision and trust mean a lot to us, and we're committed to delivering exceptional results for your team.

Here's what happens next:
â€¢ Our onboarding team will reach out within 24 hours
â€¢ You'll receive login credentials to your dashboard
â€¢ A kickoff call will be scheduled at your convenience

Thank you again for choosing us. We look forward to a great partnership!

Warmly,
[Your Name]`,
  },
}

const FALLBACK_TEMPLATE = {
  subject: `A Message for {{name}} at {{company}}`,
  body: `Hi {{name}},

Thank you for your time. I wanted to reach out regarding {{company}} and explore how we might be able to work together.

Please feel free to reply to this email or reach out at your convenience.

Best regards,
[Your Name]`,
}

function normalizeStatus(s) {
  return (s ?? '').toLowerCase().trim()
}

function fillTemplate(template, row) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => row[key] ?? `{{${key}}}`)
}

function Badge({ children, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-100 text-violet-700 border border-violet-200',
    green: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border border-blue-200',
    red: 'bg-red-100 text-red-700 border border-red-200',
    gray: 'bg-gray-100 text-gray-600 border border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  )
}

const STATUS_COLORS = ['violet', 'blue', 'amber', 'green', 'red']

function statusColor(status, statusList) {
  const i = statusList.indexOf(normalizeStatus(status))
  return STATUS_COLORS[i % STATUS_COLORS.length] ?? 'gray'
}

function Step({ n, label, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${done ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
        {done ? 'âœ“' : n}
      </div>
      <span className={`text-sm ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{label}</span>
    </div>
  )
}

export default function EmailGenerator() {
  const [rows, setRows] = useState([])
  const [headers, setHeaders] = useState([])
  const [fileName, setFileName] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [copied, setCopied] = useState(null)

  // status column key (auto-detected)
  const [statusKey, setStatusKey] = useState(null)
  // per-status templates: { [normalizedStatus]: { subject, body } }
  const [statusTemplates, setStatusTemplates] = useState({})
  // which status tab is open in the editor
  const [editingStatus, setEditingStatus] = useState(null)

  const fileRef = useRef()

  // unique normalized statuses from data
  const statusList = useMemo(() => {
    if (!statusKey) return []
    const seen = new Set()
    rows.forEach(r => {
      const s = normalizeStatus(r[statusKey])
      if (s) seen.add(s)
    })
    return [...seen]
  }, [rows, statusKey])

  function parseCSV(text) {
    const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: true })
    if (result.data.length === 0) return
    const hdrs = Object.keys(result.data[0])
    setRows(result.data)
    setHeaders(hdrs)
    setActiveIndex(0)

    // auto-detect status column
    const key = hdrs.find(h => normalizeStatus(h) === 'status') ?? null
    setStatusKey(key)

    if (key) {
      // build initial templates from defaults
      const seen = new Set()
      result.data.forEach(r => {
        const s = normalizeStatus(r[key])
        if (s) seen.add(s)
      })
      const init = {}
      seen.forEach(s => {
        init[s] = STATUS_DEFAULTS[s] ?? { ...FALLBACK_TEMPLATE }
      })
      setStatusTemplates(init)
      setEditingStatus([...seen][0] ?? null)
    }
  }

  function handleFile(file) {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => parseCSV(e.target.result)
    reader.readAsText(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
  }

  function loadSample() {
    setFileName('sample.csv')
    parseCSV(SAMPLE_CSV)
  }

  function insertPlaceholder(field) {
    if (!editingStatus) return
    setStatusTemplates(prev => ({
      ...prev,
      [editingStatus]: {
        ...prev[editingStatus],
        body: (prev[editingStatus]?.body ?? '') + `{{${field}}}`,
      },
    }))
  }

  function updateTemplate(status, field, value) {
    setStatusTemplates(prev => ({
      ...prev,
      [status]: { ...prev[status], [field]: value },
    }))
  }

  // get the right template for a given row
  function getTemplate(row) {
    if (statusKey) {
      const s = normalizeStatus(row[statusKey])
      if (s && statusTemplates[s]) return statusTemplates[s]
    }
    return FALLBACK_TEMPLATE
  }

  async function copyEmail(text) {
    await navigator.clipboard.writeText(text)
    setCopied(activeIndex)
    setTimeout(() => setCopied(null), 2000)
  }

  function downloadAll() {
    const content = rows.map((row, i) => {
      const tpl = getTemplate(row)
      const sub = fillTemplate(tpl.subject, row)
      const body = fillTemplate(tpl.body, row)
      const status = statusKey ? ` [${row[statusKey]}]` : ''
      return `=== Email ${i + 1}${status} â€” ${row.email ?? ''} ===\nSubject: ${sub}\n\n${body}`
    }).join('\n\n' + 'â”€'.repeat(60) + '\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'personalized-emails.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentRow = rows[activeIndex] ?? {}
  const currentTemplate = getTemplate(currentRow)
  const previewSubject = fillTemplate(currentTemplate.subject, currentRow)
  const previewBody = fillTemplate(currentTemplate.body, currentRow)
  const hasUnfilled = previewBody.includes('{{') || previewSubject.includes('{{')
  const currentStatus = statusKey ? normalizeStatus(currentRow[statusKey]) : null

  const editingTpl = editingStatus ? (statusTemplates[editingStatus] ?? FALLBACK_TEMPLATE) : null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">âœ‰</div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-none">CSV Email Generator</h1>
            <p className="text-xs text-gray-400 mt-0.5">Personalized emails from spreadsheet data</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Step n={1} label="Upload CSV" done={rows.length > 0} />
          <div className="w-6 h-px bg-gray-300" />
          <Step n={2} label="Templates" done={rows.length > 0} />
          <div className="w-6 h-px bg-gray-300" />
          <Step n={3} label="Export" done={false} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* CSV Upload */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">1. Upload CSV</h2>
              {rows.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge color="green">{rows.length} contacts</Badge>
                  {statusKey && <Badge color="violet">Status: "{statusKey}"</Badge>}
                </div>
              )}
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
            >
              <div className="text-3xl mb-2">ðŸ“‚</div>
              <p className="text-sm font-medium text-gray-700">Drop a CSV file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">{fileName ?? 'No file selected â€” include a "status" column for auto-templates'}</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <button onClick={loadSample} className="text-sm text-violet-600 hover:text-violet-800 font-medium underline underline-offset-2 text-center">
              Load sample CSV (includes status column)
            </button>

            {/* CSV table */}
            {rows.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      {headers.map(h => (
                        <th key={h} className={`px-3 py-2 text-left font-medium ${h === statusKey ? 'text-violet-600' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} onClick={() => setActiveIndex(i)} className={`cursor-pointer border-t border-gray-100 transition-colors ${i === activeIndex ? 'bg-violet-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        {headers.map(h => (
                          <td key={h} className="px-3 py-2 text-gray-700 max-w-[120px] truncate">
                            {h === statusKey
                              ? <Badge color={statusColor(row[h], statusList)}>{row[h]}</Badge>
                              : row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Template Editor */}
          {rows.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
              <h2 className="font-semibold text-gray-900">2. Email Templates by Status</h2>

              {!statusKey && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                  No "status" column detected. Add a <code className="bg-amber-100 px-1 rounded">status</code> column to your CSV to get auto-generated templates per status.
                </div>
              )}

              {/* Status tabs */}
              {statusList.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {statusList.map(s => (
                    <button
                      key={s}
                      onClick={() => setEditingStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${editingStatus === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {editingTpl && editingStatus && (
                <>
                  {/* Placeholder chips */}
                  {headers.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Insert field into body:</p>
                      <div className="flex flex-wrap gap-2">
                        {headers.filter(h => h !== statusKey).map(h => (
                          <button key={h} onClick={() => insertPlaceholder(h)} className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-mono rounded-lg border border-violet-200 transition-colors">
                            {`{{${h}}}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      Subject
                      <Badge color={statusColor(editingStatus, statusList)}>{editingStatus}</Badge>
                    </label>
                    <input
                      value={editingTpl.subject}
                      onChange={e => updateTemplate(editingStatus, 'subject', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Body</label>
                    <textarea
                      value={editingTpl.body}
                      onChange={e => updateTemplate(editingStatus, 'body', e.target.value)}
                      rows={14}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition resize-none leading-relaxed"
                    />
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        {/* RIGHT COLUMN â€” Preview */}
        <div className="flex flex-col gap-6">
          <section className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 sticky top-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-gray-900">3. Preview & Export</h2>
              {rows.length > 0 && (
                <button onClick={downloadAll} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
                  â¬‡ Download All ({rows.length})
                </button>
              )}
            </div>

            {rows.length === 0 ? (
              <div className="text-center py-16 text-gray-300">
                <div className="text-5xl mb-3">âœ‰ï¸</div>
                <p className="text-sm">Upload a CSV to see previews here</p>
              </div>
            ) : (
              <>
                {/* Contact selector */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveIndex(i => Math.max(0, i - 1))} disabled={activeIndex === 0} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-30 transition">â€¹</button>
                  <div className="flex-1 text-center">
                    <span className="text-sm text-gray-600">
                      Contact <span className="font-semibold text-gray-900">{activeIndex + 1}</span> of {rows.length}
                      {currentRow.name && <span className="text-gray-400"> â€” {currentRow.name}</span>}
                    </span>
                    {currentStatus && (
                      <div className="mt-1 flex justify-center">
                        <Badge color={statusColor(currentStatus, statusList)}>
                          Template: {currentStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setActiveIndex(i => Math.min(rows.length - 1, i + 1))} disabled={activeIndex === rows.length - 1} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-30 transition">â€º</button>
                </div>

                {hasUnfilled && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 flex items-center gap-2">
                    âš ï¸ Some placeholders don't match your CSV columns.
                  </div>
                )}

                {/* Email preview */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex flex-col gap-1">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 w-12 shrink-0">To:</span>
                      <span className="text-gray-700 font-medium">{currentRow.email ?? 'â€”'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 w-12 shrink-0">Subject:</span>
                      <span className="text-gray-900 font-medium">{previewSubject || 'â€”'}</span>
                    </div>
                  </div>
                  <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                    {previewBody || <span className="text-gray-300">Your email body will appear hereâ€¦</span>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyEmail(`Subject: ${previewSubject}\n\n${previewBody}`)}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-sm font-medium py-2.5 rounded-xl transition-colors text-gray-700"
                  >
                    {copied === activeIndex ? 'âœ“ Copied!' : 'ðŸ“‹ Copy Email'}
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${currentRow.email ?? ''}?subject=${encodeURIComponent(previewSubject)}&body=${encodeURIComponent(previewBody)}`)}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-sm font-medium py-2.5 rounded-xl transition-colors text-gray-700"
                  >
                    ðŸ“¨ Open in Mail
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

