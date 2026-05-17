import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  GitBranch,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Menu,
  MessageSquare,
  Network,
  Send,
  Settings,
  Sparkles,
  Users
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchSnapshot, injectDemo, seedDemoData, sendTelegramReply, updateOpportunityStage, updateTaskStatus } from "./api";
import type { Customer, Insight, Opportunity, OpportunityStage, Snapshot, Task } from "./types";

const stages: OpportunityStage[] = ["New Inquiry", "Qualified", "Waiting Reply", "Proposal Needed", "Proposal Sent", "Negotiation", "Won", "Lost"];

const fallbackSnapshot: Snapshot = {
  metrics: { activeConversations: 0, revenueAtRisk: 0, unresolvedIssues: 0, averageResponseTime: "pending" },
  customers: [],
  conversations: [],
  messages: [],
  tasks: [],
  opportunities: [],
  insights: [],
  pipelineCounts: Object.fromEntries(stages.map((stage) => [stage, 0])) as Record<OpportunityStage, number>,
  teamMetrics: [],
  openaiStatus: { configured: false, status: "pending_missing_secret" },
  telegramStatus: { configured: false, status: "pending_missing_secret", outboundEnabled: false },
  verificationLog: [],
  updatedAt: new Date().toISOString()
};

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/graph", label: "Operations Graph", icon: Network },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot>(fallbackSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  async function refresh() {
    try {
      const next = await fetchSnapshot();
      setSnapshot(next);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "API unavailable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="app-shell" data-testid="app-shell">
      <aside className={`sidebar ${navOpen ? "is-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <div>
            <strong>Syntra</strong>
            <span>Telegram ops intelligence</span>
          </div>
        </div>
        <nav aria-label="Primary navigation">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} onClick={() => setNavOpen(false)}>
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <button className="icon-button mobile-only" aria-label="Open navigation" data-testid="mobile-menu-button" onClick={() => setNavOpen(!navOpen)}>
            <Menu size={18} />
          </button>
          <div className="topbar-title">
            <strong>ApertureOne Events</strong>
            <span>Last updated {formatTime(snapshot.updatedAt)}</span>
          </div>
          <div className="status-strip">
            <StatusPill label="Telegram" status={snapshot.telegramStatus.status} icon={<MessageSquare size={14} />} />
            <StatusPill label="OpenAI" status={snapshot.openaiStatus.status} icon={<Bot size={14} />} />
          </div>
          {error && <span className="error-pill">API offline: {error}</span>}
        </header>
        {loading ? <section className="page"><h1>Loading Syntra</h1></section> : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard snapshot={snapshot} refresh={refresh} />} />
            <Route path="/inbox" element={<InboxPage snapshot={snapshot} refresh={refresh} />} />
            <Route path="/customers" element={<CustomersPage snapshot={snapshot} />} />
            <Route path="/pipeline" element={<PipelinePage snapshot={snapshot} refresh={refresh} />} />
            <Route path="/tasks" element={<TasksPage snapshot={snapshot} refresh={refresh} />} />
            <Route path="/insights" element={<InsightsPage snapshot={snapshot} />} />
            <Route path="/graph" element={<GraphPage snapshot={snapshot} />} />
            <Route path="/settings" element={<SettingsPage snapshot={snapshot} refresh={refresh} />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

function Dashboard({ snapshot, refresh }: { snapshot: Snapshot; refresh: () => Promise<void> }) {
  const urgent = snapshot.conversations.filter((conversation) => conversation.priority === "high").slice(0, 5);
  return (
    <section className="page">
      <PageHeader title="Command Center" subtitle="Live customer operations from Telegram conversations." action={<button onClick={async () => { await injectDemo(); await refresh(); }}><Sparkles size={16} /> Inject Demo Message</button>} />
      <div className="metric-strip">
        <Metric icon={<Activity />} label="Active Conversations" value={snapshot.metrics.activeConversations} />
        <Metric icon={<CircleDollarSign />} label="Revenue at Risk" value={money(snapshot.metrics.revenueAtRisk)} />
        <Metric icon={<ListTodo />} label="Unresolved Issues" value={snapshot.metrics.unresolvedIssues} />
        <Metric icon={<Clock />} label="Average Response Time" value={snapshot.metrics.averageResponseTime} />
      </div>
      <div className="dashboard-grid">
        <Panel title="AI Daily Brief" className="brief-panel">
          <p>Corporate leads and payment confirmations need the fastest action today. Refund and delivery complaints carry the highest sentiment risk.</p>
          <div className="brief-actions">
            <button><CheckCircle2 size={15} /> Assign urgent queue</button>
            <button className="secondary"><Send size={15} /> Draft follow-ups</button>
          </div>
        </Panel>
        <Panel title="Pipeline Health">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stages.map((stage) => ({ stage: shortStage(stage), count: snapshot.pipelineCounts[stage] ?? 0 }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#5E6AD2" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Urgent Queue" className="wide">
          <DataTable headers={["Customer", "Intent", "Priority", "Sentiment", "Owner", "Suggested Action"]}>
            {urgent.map((conversation) => {
              const customer = customerFor(snapshot, conversation.customerId);
              return (
                <tr key={conversation.id}>
                  <td>{customer?.name}</td>
                  <td>{conversation.intent}</td>
                  <td><Badge tone={conversation.priority}>{conversation.priority}</Badge></td>
                  <td>{conversation.sentiment}</td>
                  <td>{conversation.owner}</td>
                  <td>{conversation.suggestedAction}</td>
                </tr>
              );
            })}
          </DataTable>
        </Panel>
        <Panel title="Support Load">
          {snapshot.insights.slice(0, 4).map((insight) => <InsightRow key={insight.id} insight={insight} />)}
        </Panel>
        <Panel title="Team Performance">
          {snapshot.teamMetrics.map((member) => (
            <div className="team-row" key={member.owner}>
              <span>{member.owner}</span>
              <strong>{member.openTasks} open</strong>
              <meter value={member.workload} max={100}>{member.workload}</meter>
            </div>
          ))}
        </Panel>
        <Panel title="Recent Telegram Activity" className="wide">
          <ActivityStream snapshot={snapshot} />
        </Panel>
      </div>
    </section>
  );
}

function InboxPage({ snapshot, refresh }: { snapshot: Snapshot; refresh: () => Promise<void> }) {
  const [selectedId, setSelectedId] = useState(snapshot.conversations[0]?.id);
  const selected = snapshot.conversations.find((conversation) => conversation.id === selectedId) ?? snapshot.conversations[0];
  const messages = snapshot.messages.filter((message) => message.conversationId === selected?.id);
  const customer = selected ? customerFor(snapshot, selected.customerId) : undefined;

  return (
    <section className="page">
      <PageHeader title="Inbox Intelligence" subtitle="Telegram threads converted into customer operations." />
      <div className="inbox-layout">
        <aside className="list-pane">
          <FilterTabs labels={["All", "Urgent", "Leads", "Support", "Complaints", "Waiting Reply", "Unassigned", "High Value"]} />
          {snapshot.conversations.map((conversation) => (
            <button key={conversation.id} data-testid="conversation-row" className={`conversation-row ${conversation.id === selected?.id ? "selected" : ""}`} onClick={() => setSelectedId(conversation.id)}>
              <strong>{customerFor(snapshot, conversation.customerId)?.name}</strong>
              <span>{conversation.intent}</span>
              <Badge tone={conversation.priority}>{conversation.priority}</Badge>
            </button>
          ))}
        </aside>
        <section className="thread-pane">
          <h2>{selected?.title ?? "Conversation"}</h2>
          <p className="muted">Telegram source conversation with extracted evidence.</p>
          <div className="message-list">
            {messages.map((message) => <div key={message.id} className={`bubble ${message.direction}`}>{message.text}</div>)}
          </div>
        </section>
        <aside className="inspector">
          <h2>AI Intelligence Panel</h2>
          <Field label="Customer Summary" value={selected?.aiSummary} />
          <Field label="Extracted Fields" value={`${selected?.intent}, ${selected?.priority}, ${selected?.sentiment}`} />
          <Field label="Suggested Next Action" value={selected?.suggestedAction} />
          <Field label="Generated Reply" value={`Thanks ${customer?.name?.split(" ")[0] ?? "there"}, we are checking this now and will confirm the next step today.`} />
          <Field label="Linked Tasks" value={snapshot.tasks.filter((task) => task.conversationId === selected?.id).map((task) => task.title).join(", ") || "No tasks yet"} />
          <Field label="Source and Confidence" value={`Telegram message, ${Math.round((selected?.confidence ?? 0) * 100)}% confidence`} />
          <div className="button-row">
            <button>Use Reply</button>
            <button className="secondary">Edit Reply</button>
            <button className="secondary" onClick={async () => selected && sendTelegramReply(selected.id, "Syntra follow-up from the dashboard.").catch(() => undefined)}>Send via Telegram</button>
            <button className="secondary">Create Task</button>
            <button className="secondary">Escalate</button>
            <button className="secondary" onClick={refresh}>Mark Resolved</button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function CustomersPage({ snapshot }: { snapshot: Snapshot }) {
  const [selected, setSelected] = useState<Customer | null>(null);
  return (
    <section className="page">
      <PageHeader title="Customers" subtitle="Operational memory built from Telegram history." />
      <FilterTabs labels={["All", "At Risk", "Leads", "Corporate", "Negative", "Unassigned"]} />
      <DataTable headers={["Customer", "Telegram", "Status", "Segment", "Sentiment", "Latest Intent", "Value", "Open Issues", "Owner"]}>
        {snapshot.customers.map((customer) => (
          <tr key={customer.id} data-testid="customer-row" onClick={() => setSelected(customer)} tabIndex={0}>
            <td>{customer.name}</td>
            <td>{customer.telegramHandle ?? "Telegram linked"}</td>
            <td>{customer.status}</td>
            <td>{customer.segment}</td>
            <td>{customer.sentiment}</td>
            <td>{customer.latestIntent}</td>
            <td>{money(customer.value)}</td>
            <td>{customer.openIssues}</td>
            <td>{customer.owner}</td>
          </tr>
        ))}
      </DataTable>
      {selected && (
        <Drawer title={selected.name} onClose={() => setSelected(null)}>
          <div className="tabs"><span>Overview</span><span>Conversations</span><span>Tasks</span><span>Timeline</span><span>Insights</span></div>
          <Field label="Overview" value={`${selected.segment}, ${selected.sentiment}, ${selected.latestIntent}`} />
          <Field label="Timeline" value="Telegram-derived operational memory is updated whenever new messages arrive." />
        </Drawer>
      )}
    </section>
  );
}

function PipelinePage({ snapshot, refresh }: { snapshot: Snapshot; refresh: () => Promise<void> }) {
  return (
    <section className="page">
      <PageHeader title="Pipeline" subtitle="Telegram leads moving through operational stages." />
      <Panel title="AI Pipeline Insight"><p>Corporate demand is healthy, but invoice response delay is the main conversion bottleneck.</p></Panel>
      <div className="kanban">
        {stages.map((stage) => (
          <section key={stage} className="kanban-column">
            <h2>{stage}</h2>
            {snapshot.opportunities.filter((opportunity) => opportunity.stage === stage).map((opportunity) => (
              <LeadCard key={opportunity.id} opportunity={opportunity} snapshot={snapshot} onAdvance={async () => { await updateOpportunityStage(opportunity.id, "Negotiation"); await refresh(); }} />
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

function TasksPage({ snapshot, refresh }: { snapshot: Snapshot; refresh: () => Promise<void> }) {
  const [source, setSource] = useState<Task | null>(null);
  return (
    <section className="page">
      <PageHeader title="Tasks" subtitle="Every task keeps source message traceability." />
      <div className="metric-strip compact">
        <Metric label="Open" value={snapshot.tasks.filter((task) => task.status === "open").length} />
        <Metric label="Due Today" value={snapshot.tasks.length} />
        <Metric label="Blocked" value={snapshot.tasks.filter((task) => task.status === "blocked").length} />
        <Metric label="Done" value={snapshot.tasks.filter((task) => task.status === "done").length} />
      </div>
      <DataTable headers={["Task", "Source Customer", "Owner", "Priority", "Due Date", "Status", "Source Message"]}>
        {snapshot.tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{customerFor(snapshot, task.customerId)?.name}</td>
            <td>{task.owner}</td>
            <td><Badge tone={task.priority}>{task.priority}</Badge></td>
            <td>{formatTime(task.dueAt)}</td>
            <td><button className="text-button" onClick={async () => { await updateTaskStatus(task.id, task.status === "done" ? "open" : "done"); await refresh(); }}>{task.status}</button></td>
            <td><button data-testid="source-action" className="text-button" onClick={() => setSource(task)}>View Source Conversation</button></td>
          </tr>
        ))}
      </DataTable>
      {source && <Drawer title="Original Telegram Evidence" onClose={() => setSource(null)}><p>{source.sourceText}</p><Field label="Source Conversation" value={source.conversationId} /></Drawer>}
    </section>
  );
}

function InsightsPage({ snapshot }: { snapshot: Snapshot }) {
  const sentimentData = snapshot.conversations.map((conversation, index) => ({ name: `T${index + 1}`, sentiment: sentimentScore(conversation.sentiment), delay: index + 1 }));
  return (
    <section className="page">
      <PageHeader title="Insights" subtitle="Recurring complaints, response delays, sentiment, and revenue risk." />
      <div className="insights-grid">
        <Panel title="Recurring Issue Clusters">{snapshot.insights.map((insight) => <InsightRow key={insight.id} insight={insight} />)}</Panel>
        <Panel title="Customer Sentiment Trend">
          <div data-testid="sentiment-chart">
            <ResponsiveContainer width="100%" height={220}><LineChart data={sentimentData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="sentiment" stroke="#5E6AD2" strokeWidth={2} /></LineChart></ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Response Delay Analysis">
          <ResponsiveContainer width="100%" height={220}><AreaChart data={sentimentData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area dataKey="delay" stroke="#176B87" fill="#E4F4FA" /></AreaChart></ResponsiveContainer>
        </Panel>
        <Panel title="Revenue Risk"><p className="big-number">{money(snapshot.metrics.revenueAtRisk)}</p><p>Open opportunities with urgent response or churn risk.</p></Panel>
        <Panel title="AI Recommendations" className="wide">{snapshot.insights.slice(0, 4).map((insight) => <p key={insight.id}>{insight.recommendation}</p>)}</Panel>
      </div>
    </section>
  );
}

function GraphPage({ snapshot }: { snapshot: Snapshot }) {
  const first = snapshot.conversations[0];
  const [selected, setSelected] = useState("Customer");
  const customer = first ? customerFor(snapshot, first.customerId) : undefined;
  const nodes = [
    { id: "Customer", label: customer?.name ?? "Customer", x: 12, y: 42 },
    { id: "Conversation", label: first?.intent ?? "Conversation", x: 34, y: 18 },
    { id: "Task", label: snapshot.tasks[0]?.title ?? "Task", x: 58, y: 46 },
    { id: "Risk", label: "Revenue Risk", x: 82, y: 24 },
    { id: "Owner", label: first?.owner ?? "Owner", x: 72, y: 70 }
  ];
  return (
    <section className="page">
      <PageHeader title="Operations Graph" subtitle="How Telegram messages become operational state." />
      <div className="graph-layout">
        <div className="graph-canvas" aria-label="graph canvas">
          <svg viewBox="0 0 100 80" role="img" aria-label="Operations graph canvas">
            <path d="M18 42 L34 18 L58 46 L82 24 M58 46 L72 70" fill="none" stroke="#C8C0B3" strokeWidth="0.8" />
            {nodes.map((node, index) => (
              <g key={node.id} data-node-id={node.id} data-testid="graph-node" role="button" tabIndex={0} onClick={() => setSelected(node.id)}>
                <circle cx={node.x} cy={node.y} r="5.8" fill={index === 0 ? "#5E6AD2" : "#FFFEFA"} stroke="#5E6AD2" strokeWidth="0.8" />
                <text x={node.x} y={node.y + 11} textAnchor="middle" fontSize="3.2" fill="#151617">{node.label.slice(0, 18)}</text>
              </g>
            ))}
          </svg>
        </div>
        <aside className="inspector"><h2>Node Inspector</h2><Field label="Selected Node" value={selected} /><Field label="Evidence" value={first?.aiSummary ?? "No conversation selected"} /><Field label="Linked Objects" value="customer, conversation, task, opportunity, insight" /><Field label="Next Action" value={first?.suggestedAction ?? "Wait for Telegram message"} /></aside>
      </div>
    </section>
  );
}

function SettingsPage({ snapshot, refresh }: { snapshot: Snapshot; refresh: () => Promise<void> }) {
  return (
    <section className="page">
      <PageHeader title="Settings and Verification" subtitle="Real API status, setup guidance, and demo controls." />
      <div className="settings-grid">
        <Panel title="OpenAI API Status"><StatusDetail status={snapshot.openaiStatus.status} configured={snapshot.openaiStatus.configured} /><p>Model: {snapshot.openaiStatus.model ?? "gpt-4.1-mini"}</p><button>Verify OpenAI</button></Panel>
        <Panel title="Telegram Bot Status"><StatusDetail status={snapshot.telegramStatus.status} configured={snapshot.telegramStatus.configured} /><p>Bot: {snapshot.telegramStatus.botUsername ? `@${snapshot.telegramStatus.botUsername}` : "not verified"}</p><button>Verify Telegram</button></Panel>
        <Panel title="Dashboard/Database Status"><p>JSON persistence is active. Snapshot updates every 2 seconds.</p><button onClick={async () => { await seedDemoData(); await refresh(); }}>Seed Demo Data</button></Panel>
        <Panel title="Design QA Status"><p>Design QA uses `DESIGN.md`, impeccable preflight, and browser screenshots.</p><button>Run Real API Checks</button></Panel>
        <Panel title="Setup Instructions" className="wide"><p>Set `OPENAI_API_KEY` and `TELEGRAM_BOT_TOKEN` in `.env.local`, then run `RUN_ALL.bat` to start the frontend, API, and Telegram bot worker.</p><button onClick={async () => { await injectDemo(); await refresh(); }}>Inject Demo Message</button></Panel>
        <Panel title="Verification Console" className="wide">{snapshot.verificationLog.slice(0, 8).map((line) => <code key={line}>{line}</code>)}</Panel>
      </div>
    </section>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><h2>{title}</h2>{children}</section>;
}

function Metric({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return <div className="metric">{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function StatusPill({ label, status, icon }: { label: string; status: string; icon?: React.ReactNode }) {
  return <span className={`status-pill ${status}`}>{icon}{label}: {status.replaceAll("_", " ")}</span>;
}

function StatusDetail({ status, configured }: { status: string; configured: boolean }) {
  return <div className="status-detail"><StatusPill label={configured ? "configured" : "pending"} status={status} /> </div>;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="field"><span>{label}</span><strong>{value || "Pending"}</strong></div>;
}

function FilterTabs({ labels }: { labels: string[] }) {
  return <div className="filter-tabs">{labels.map((label, index) => <button className={index === 0 ? "active" : ""} key={label}>{label}</button>)}</div>;
}

function Drawer({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <aside className="drawer"><button aria-label="Close details" onClick={onClose}>Close</button><h2>{title}</h2>{children}</aside>;
}

function InsightRow({ insight }: { insight: Insight }) {
  return <div className="insight-row"><Badge tone={insight.severity}>{insight.severity}</Badge><div><strong>{insight.title}</strong><span>{insight.count} cases, trend {insight.trend}</span></div></div>;
}

function LeadCard({ opportunity, snapshot, onAdvance }: { opportunity: Opportunity; snapshot: Snapshot; onAdvance: () => Promise<void> }) {
  const customer = customerFor(snapshot, opportunity.customerId);
  return <article className="lead-card"><strong>{customer?.name}</strong><span>{opportunity.intent}</span><span>Value {money(opportunity.value)}</span><span>Sentiment {opportunity.sentiment}</span><span>Next action: {opportunity.nextAction}</span><span>Risk: {opportunity.risk}</span><span>Source: {opportunity.source}</span><button onClick={onAdvance}>Open lead detail</button></article>;
}

function ActivityStream({ snapshot }: { snapshot: Snapshot }) {
  return <div className="activity-stream">{snapshot.messages.slice(-8).reverse().map((message) => <div key={message.id}><span>{formatTime(message.createdAt)}</span><strong>{customerFor(snapshot, message.customerId)?.name}</strong><p>{message.text}</p></div>)}</div>;
}

function customerFor(snapshot: Snapshot, customerId: string) {
  return snapshot.customers.find((customer) => customer.id === customerId);
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatTime(value?: string) {
  if (!value) return "pending";
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }).format(new Date(value));
}

function shortStage(stage: string) {
  return stage.replace("Proposal ", "Prop. ");
}

function sentimentScore(sentiment: string) {
  return sentiment === "positive" ? 4 : sentiment === "neutral" ? 3 : sentiment === "frustrated" ? 2 : 1;
}
