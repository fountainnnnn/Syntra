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
import {
  createTask,
  fetchSnapshot,
  injectDemo,
  seedDemoData,
  sendTelegramReply,
  updateConversationStatus,
  updateOpportunityStage,
  updateTaskStatus,
  verifyOpenAI,
  verifyRealApis,
  verifyTelegram
} from "./api";
import type { Customer, Insight, Opportunity, OpportunityStage, Snapshot, Task } from "./types";

const stages: OpportunityStage[] = ["New Inquiry", "Qualified", "Waiting Reply", "Proposal Needed", "Proposal Sent", "Negotiation", "Won", "Lost"];

const stageGuidance: Record<OpportunityStage, { purpose: string; action: string }> = {
  "New Inquiry": {
    purpose: "Syntra found buying intent in a Telegram conversation and opened the lead for review.",
    action: "Confirm the ask, check value and risk, then qualify or reply from Inbox."
  },
  Qualified: {
    purpose: "The lead has enough customer, value, and intent evidence to continue commercial follow-up.",
    action: "Assign an owner and keep the next reply moving."
  },
  "Waiting Reply": {
    purpose: "The customer needs a response before the opportunity can move forward.",
    action: "Use the source conversation to reply, then update the stage."
  },
  "Proposal Needed": {
    purpose: "The customer is ready for pricing, package details, or an invoice before deciding.",
    action: "Prepare the proposal from the extracted requirements."
  },
  "Proposal Sent": {
    purpose: "Syntra is tracking a sent proposal while the team waits for customer confirmation.",
    action: "Follow up on acceptance, payment, or negotiation signals."
  },
  Negotiation: {
    purpose: "The customer is discussing final terms, timing, or price.",
    action: "Resolve blockers and confirm the booking path."
  },
  Won: {
    purpose: "The opportunity has converted into confirmed work.",
    action: "Keep delivery tasks and customer expectations synchronized."
  },
  Lost: {
    purpose: "The opportunity is no longer active or was declined.",
    action: "Review the risk signal and capture a learning for the next lead."
  }
};

const pipelineGuide = [
  {
    title: "Capture from Telegram",
    body: "Inbound messages are ingested first. Syntra keeps the original conversation attached so every lead stays source-evident."
  },
  {
    title: "Score buying intent",
    body: "The system extracts intent, value, sentiment, and risk, then places the lead in the first useful stage."
  },
  {
    title: "Operator moves the stage",
    body: "A human owner takes the next action, replies or prepares work, then moves the lead when the evidence changes."
  }
];

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

const syntraLogoUrl = new URL("../logo.png", import.meta.url).href;

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot>(fallbackSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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

  function notify(message: string) {
    setNotice(message);
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
          <div className="brand-mark"><img src={syntraLogoUrl} alt="Syntra logo" /></div>
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
          {notice && <span className="notice-pill" role="status">{notice}</span>}
          {error && <span className="error-pill">API offline: {error}</span>}
        </header>
        {loading ? <section className="page"><h1>Loading Syntra</h1></section> : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard snapshot={snapshot} refresh={refresh} notify={notify} />} />
            <Route path="/inbox" element={<InboxPage snapshot={snapshot} refresh={refresh} notify={notify} />} />
            <Route path="/customers" element={<CustomersPage snapshot={snapshot} />} />
            <Route path="/pipeline" element={<PipelinePage snapshot={snapshot} refresh={refresh} notify={notify} />} />
            <Route path="/tasks" element={<TasksPage snapshot={snapshot} refresh={refresh} />} />
            <Route path="/insights" element={<InsightsPage snapshot={snapshot} />} />
            <Route path="/graph" element={<GraphPage snapshot={snapshot} />} />
            <Route path="/settings" element={<SettingsPage snapshot={snapshot} refresh={refresh} notify={notify} />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

function Dashboard({ snapshot, refresh, notify }: { snapshot: Snapshot; refresh: () => Promise<void>; notify: (message: string) => void }) {
  const urgent = snapshot.conversations.filter((conversation) => conversation.priority === "high").slice(0, 5);
  return (
    <section className="page">
      <PageHeader title="Command Center" subtitle="Live customer operations from Telegram conversations." action={<button onClick={async () => { notify("Injecting a demo Telegram message..."); await injectDemo(); await refresh(); notify("Demo message injected into dashboard and inbox."); }}><Sparkles size={16} /> Inject Demo Message</button>} />
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
            <button onClick={() => notify(`Urgent queue assigned: ${urgent.length} high-priority conversations ready for triage.`)}><CheckCircle2 size={15} /> Assign urgent queue</button>
            <button className="secondary" onClick={() => notify("Draft follow-ups prepared from the latest suggested actions.")}><Send size={15} /> Draft follow-ups</button>
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

function InboxPage({ snapshot, refresh, notify }: { snapshot: Snapshot; refresh: () => Promise<void>; notify: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState(snapshot.conversations[0]?.id);
  const [activeFilter, setActiveFilter] = useState("All");
  const [editingReply, setEditingReply] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const filteredConversations = snapshot.conversations.filter((conversation) => {
    const customer = customerFor(snapshot, conversation.customerId);
    if (activeFilter === "Urgent") return conversation.priority === "high";
    if (activeFilter === "Leads") return snapshot.opportunities.some((opportunity) => opportunity.conversationId === conversation.id);
    if (activeFilter === "Support") return !snapshot.opportunities.some((opportunity) => opportunity.conversationId === conversation.id);
    if (activeFilter === "Complaints") return conversation.sentiment === "negative" || conversation.sentiment === "frustrated";
    if (activeFilter === "Waiting Reply") return conversation.status === "waiting_reply" || conversation.status === "open";
    if (activeFilter === "Unassigned") return /unassigned/i.test(conversation.owner);
    if (activeFilter === "High Value") return (customer?.value ?? 0) >= 1000;
    return true;
  });
  const selected = snapshot.conversations.find((conversation) => conversation.id === selectedId) ?? snapshot.conversations[0];
  const messages = snapshot.messages.filter((message) => message.conversationId === selected?.id);
  const customer = selected ? customerFor(snapshot, selected.customerId) : undefined;
  const generatedReply = replyDraft || `Thanks ${customer?.name?.split(" ")[0] ?? "there"}, we are checking this now and will confirm the next step today.`;

  return (
    <section className="page">
      <PageHeader title="Inbox Intelligence" subtitle="Telegram threads converted into customer operations." />
      <div className="inbox-layout">
        <aside className="list-pane">
          <FilterTabs labels={["All", "Urgent", "Leads", "Support", "Complaints", "Waiting Reply", "Unassigned", "High Value"]} value={activeFilter} onChange={setActiveFilter} />
          {filteredConversations.map((conversation) => (
            <button key={conversation.id} data-testid="conversation-row" className={`conversation-row ${conversation.id === selected?.id ? "selected" : ""}`} onClick={() => setSelectedId(conversation.id)}>
              <strong>{customerFor(snapshot, conversation.customerId)?.name}</strong>
              <span>{conversation.intent}</span>
              <Badge tone={conversation.priority}>{conversation.priority}</Badge>
            </button>
          ))}
          {filteredConversations.length === 0 && <p className="muted empty-state">No conversations match this filter.</p>}
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
          {editingReply ? (
            <label className="field">
              <span>Generated Reply</span>
              <textarea aria-label="Generated Reply" value={generatedReply} onChange={(event) => setReplyDraft(event.target.value)} />
            </label>
          ) : (
            <Field label="Generated Reply" value={generatedReply} />
          )}
          <Field label="Linked Tasks" value={snapshot.tasks.filter((task) => task.conversationId === selected?.id).map((task) => task.title).join(", ") || "No tasks yet"} />
          <Field label="Source and Confidence" value={`Telegram message, ${Math.round((selected?.confidence ?? 0) * 100)}% confidence`} />
          <div className="button-row">
            <button onClick={async () => { await navigator.clipboard?.writeText(generatedReply).catch(() => undefined); notify("Reply copied and ready to paste."); }}>Use Reply</button>
            <button className="secondary" onClick={() => { setEditingReply(true); notify("Generated reply is editable."); }}>Edit Reply</button>
            <button className="secondary" onClick={async () => {
              if (!selected) return;
              notify("Sending Telegram reply...");
              try {
                await sendTelegramReply(selected.id, generatedReply);
                notify("Telegram reply sent.");
              } catch {
                notify("Telegram reply needs a live chat id before it can be sent.");
              }
            }}>Send via Telegram</button>
            <button className="secondary" onClick={async () => {
              if (!selected) return;
              await createTask(selected.id, selected.suggestedAction);
              await refresh();
              notify("Task draft created from this conversation.");
            }}>Create Task</button>
            <button className="secondary" onClick={async () => {
              if (!selected) return;
              await updateConversationStatus(selected.id, "escalated");
              await refresh();
              notify("Conversation escalated for owner follow-up.");
            }}>Escalate</button>
            <button className="secondary" onClick={async () => {
              if (!selected) return;
              await updateConversationStatus(selected.id, "resolved");
              await refresh();
              notify("Conversation marked resolved.");
            }}>Mark Resolved</button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function CustomersPage({ snapshot }: { snapshot: Snapshot }) {
  const [selected, setSelected] = useState<Customer | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredCustomers = snapshot.customers.filter((customer) => {
    if (activeFilter === "At Risk") return customer.openIssues > 0 || customer.sentiment === "negative" || customer.sentiment === "frustrated";
    if (activeFilter === "Leads") return customer.status.toLowerCase().includes("lead") || customer.value > 0;
    if (activeFilter === "Corporate") return /corporate|studio|company/i.test(`${customer.segment} ${customer.latestIntent}`);
    if (activeFilter === "Negative") return customer.sentiment === "negative" || customer.sentiment === "frustrated";
    if (activeFilter === "Unassigned") return /unassigned/i.test(customer.owner);
    return true;
  });
  return (
    <section className="page">
      <PageHeader title="Customers" subtitle="Operational memory built from Telegram history." />
      <FilterTabs labels={["All", "At Risk", "Leads", "Corporate", "Negative", "Unassigned"]} value={activeFilter} onChange={setActiveFilter} />
      <DataTable headers={["Customer", "Telegram", "Status", "Segment", "Sentiment", "Latest Intent", "Value", "Open Issues", "Owner"]}>
        {filteredCustomers.map((customer) => (
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
      {filteredCustomers.length === 0 && <p className="muted empty-state">No customers match this filter.</p>}
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

function PipelinePage({ snapshot, refresh, notify }: { snapshot: Snapshot; refresh: () => Promise<void>; notify: (message: string) => void }) {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const selectedOpportunity = snapshot.opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ?? null;
  const selectedCustomer = selectedOpportunity ? customerFor(snapshot, selectedOpportunity.customerId) : undefined;
  const selectedConversation = selectedOpportunity ? conversationFor(snapshot, selectedOpportunity.conversationId) : undefined;
  const selectedMessage = selectedOpportunity ? latestMessageForConversation(snapshot, selectedOpportunity.conversationId) : undefined;
  const bottleneck = stageWithMostLeads(snapshot);

  return (
    <section className="page pipeline-page">
      <PageHeader title="Lead Pipeline" subtitle="Telegram conversations with buying intent, grouped by the next operational decision." />
      <section className="pipeline-guide" aria-label="Pipeline explanation">
        <div className="guide-flow">
          <h2>How this board works</h2>
          <div className="guide-steps">
            {pipelineGuide.map((step, index) => (
              <article className="guide-step" key={step.title}>
                <span className="step-index">{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="bottleneck-panel">
          <span>Bottleneck</span>
          <strong>{bottleneck}</strong>
          <p>{stageGuidance[bottleneck].action}</p>
        </aside>
      </section>
      <div className="kanban">
        {stages.map((stage) => {
          const stageOpportunities = snapshot.opportunities.filter((opportunity) => opportunity.stage === stage);
          return (
            <section key={stage} className="kanban-column">
              <div className="kanban-heading">
                <h2>{stage}</h2>
                <span>{stageOpportunities.length} leads</span>
              </div>
              <p className="stage-purpose">{stageGuidance[stage].purpose}</p>
              {stageOpportunities.map((opportunity) => (
                <LeadCard key={opportunity.id} opportunity={opportunity} snapshot={snapshot} onOpen={() => setSelectedOpportunityId(opportunity.id)} />
              ))}
              {stageOpportunities.length === 0 && <p className="muted empty-state">No leads here. Move a lead only after the owner action is complete.</p>}
            </section>
          );
        })}
      </div>
      {selectedOpportunity && (
        <Drawer title="Lead Detail" onClose={() => setSelectedOpportunityId(null)}>
          <Field label="Lead Id" value={selectedOpportunity.id} />
          <Field label="Customer" value={selectedCustomer?.name} />
          <Field label="Stage" value={selectedOpportunity.stage} />
          <Field label="Why this lead is here" value={stageGuidance[selectedOpportunity.stage].purpose} />
          <Field label="Value" value={money(selectedOpportunity.value)} />
          <Field label="Intent" value={selectedOpportunity.intent} />
          <Field label="Next Action" value={selectedOpportunity.nextAction} />
          <Field label="What happens next" value={stageGuidance[selectedOpportunity.stage].action} />
          <Field label="Risk" value={selectedOpportunity.risk} />
          <Field label="Source Conversation" value={selectedConversation?.title ?? selectedOpportunity.source} />
          <Field label="Source Telegram Evidence" value={selectedMessage?.text ?? selectedOpportunity.source} />
          <div className="button-row">
            <button
              disabled={selectedOpportunity.stage === "Negotiation"}
              onClick={async () => {
                await updateOpportunityStage(selectedOpportunity.id, "Negotiation");
                await refresh();
                notify("Lead moved to Negotiation.");
              }}
            >
              Move to Negotiation
            </button>
          </div>
        </Drawer>
      )}
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
  const [selected, setSelected] = useState("telegram-message");
  const customer = first ? customerFor(snapshot, first.customerId) : undefined;
  const message = first ? latestMessageForConversation(snapshot, first.id) : undefined;
  const task = first ? snapshot.tasks.find((item) => item.conversationId === first.id) ?? snapshot.tasks[0] : snapshot.tasks[0];
  const opportunity = first ? snapshot.opportunities.find((item) => item.conversationId === first.id) ?? snapshot.opportunities[0] : snapshot.opportunities[0];
  const workflowSteps = [
    {
      id: "telegram-message",
      title: "Telegram Message",
      meta: "Raw customer signal",
      summary: message?.text ?? "Waiting for the next inbound Telegram message.",
      why: "This is the source of truth. Every downstream field should be traceable back to the customer message.",
      evidence: message?.text ?? first?.source ?? "No message selected.",
      linked: first ? `conversation ${first.id}, customer ${first.customerId}` : "No linked objects yet",
      nextAction: first?.suggestedAction ?? "Wait for Telegram ingestion."
    },
    {
      id: "ai-extraction",
      title: "AI Extraction",
      meta: "Intent, priority, sentiment",
      summary: first ? `${first.intent}, ${first.priority} priority, ${first.sentiment} sentiment` : "No extraction available yet.",
      why: "Syntra converts the text into operational fields so the team can sort and act without rereading every thread.",
      evidence: first?.aiSummary ?? "No AI summary available.",
      linked: first ? `conversation ${first.id}` : "No linked objects yet",
      nextAction: "Check whether the extracted intent matches the visible source evidence."
    },
    {
      id: "customer-record",
      title: "Customer Record",
      meta: customer?.name ?? "Customer memory",
      summary: customer ? `${customer.segment}, ${customer.sentiment}, owner ${customer.owner}` : "Customer profile appears after ingestion.",
      why: "Customer memory keeps repeated issues, owner assignment, value, and latest intent in one place.",
      evidence: customer?.latestIntent ?? first?.intent ?? "No customer evidence yet.",
      linked: customer ? `customer ${customer.id}, ${customer.telegramHandle ?? "Telegram linked"}` : "No linked objects yet",
      nextAction: customer?.openIssues ? "Review open issues before replying." : "Keep the owner and next reply aligned."
    },
    {
      id: "task-created",
      title: "Task Created",
      meta: task?.owner ?? first?.owner ?? "Owner queue",
      summary: task?.title ?? first?.suggestedAction ?? "Suggested action becomes a task when the owner needs work queued.",
      why: "Tasks turn the extracted customer need into accountable operational work.",
      evidence: task?.sourceText ?? first?.aiSummary ?? "No task evidence yet.",
      linked: task ? `task ${task.id}, conversation ${task.conversationId}` : "Task can be created from Inbox.",
      nextAction: task?.status === "done" ? "Confirm the customer-visible follow-up is complete." : task?.title ?? first?.suggestedAction ?? "Create a task from Inbox."
    },
    {
      id: "pipeline-impact",
      title: "Pipeline Impact",
      meta: opportunity?.stage ?? "Lead stage",
      summary: opportunity ? `${opportunity.intent} at ${money(opportunity.value)} in ${opportunity.stage}` : "Buying intent opens a pipeline lead.",
      why: "This shows whether a message affects revenue, where the lead sits, and which stage blocks conversion.",
      evidence: opportunity?.source ?? first?.source ?? "No opportunity evidence yet.",
      linked: opportunity ? `opportunity ${opportunity.id}, customer ${opportunity.customerId}` : "No linked opportunity yet",
      nextAction: opportunity?.nextAction ?? first?.suggestedAction ?? "Qualify the lead before moving stages."
    },
    {
      id: "owner-action",
      title: "Owner Action",
      meta: first?.owner ?? customer?.owner ?? "Team handoff",
      summary: first?.suggestedAction ?? opportunity?.nextAction ?? "The team sees the next customer-safe action.",
      why: "The workflow ends in a human decision: reply, create work, escalate, or move the lead.",
      evidence: first?.aiSummary ?? opportunity?.risk ?? "No owner evidence yet.",
      linked: first ? `owner ${first.owner}, conversation ${first.id}` : "No linked owner yet",
      nextAction: first?.suggestedAction ?? "Wait for an inbound message."
    }
  ];
  const selectedStep = workflowSteps.find((step) => step.id === selected) ?? workflowSteps[0];
  return (
    <section className="page">
      <PageHeader title="Operations Map" subtitle="Follow one Telegram message as Syntra turns it into work, revenue context, and owner action." />
      <p className="graph-help">Read left to right. The operations graph canvas below shows one message becoming extracted fields, customer memory, tasks, pipeline impact, and a team action.</p>
      <div className="graph-layout">
        <div className="graph-canvas" aria-label="Operations graph canvas">
          <div className="workflow-map">
            {workflowSteps.map((step, index) => (
              <button
                aria-pressed={selectedStep.id === step.id}
                className={`workflow-step ${selectedStep.id === step.id ? "selected" : ""}`}
                data-node-id={step.id}
                data-testid="graph-node"
                key={step.id}
                onClick={() => setSelected(step.id)}
              >
                <span className="workflow-index">{index + 1}</span>
                <span className="workflow-copy">
                  <strong>{step.title}</strong>
                  <small>{step.meta}</small>
                  <span>{step.summary}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <aside className="inspector">
          <h2>Selected Workflow Step</h2>
          <p className="muted">Node Inspector</p>
          <Field label="Selected Node" value={selectedStep.title} />
          <Field label="Why it matters" value={selectedStep.why} />
          <Field label="Source Evidence" value={selectedStep.evidence} />
          <Field label="Linked Objects" value={selectedStep.linked} />
          <Field label="Next Action" value={selectedStep.nextAction} />
        </aside>
      </div>
    </section>
  );
}

function SettingsPage({ snapshot, refresh, notify }: { snapshot: Snapshot; refresh: () => Promise<void>; notify: (message: string) => void }) {
  return (
    <section className="page">
      <PageHeader title="Settings and Verification" subtitle="Real API status, setup guidance, and demo controls." />
      <div className="settings-grid">
        <Panel title="OpenAI API Status"><StatusDetail status={snapshot.openaiStatus.status} configured={snapshot.openaiStatus.configured} /><p>Model: {snapshot.openaiStatus.model ?? "gpt-4.1-mini"}</p><button onClick={async () => { notify("OpenAI verification started..."); await verifyOpenAI().catch(() => undefined); await refresh(); notify("OpenAI verification finished. Check the status panel and console."); }}>Verify OpenAI</button></Panel>
        <Panel title="Telegram Bot Status"><StatusDetail status={snapshot.telegramStatus.status} configured={snapshot.telegramStatus.configured} /><p>Bot: {snapshot.telegramStatus.botUsername ? `@${snapshot.telegramStatus.botUsername}` : "not verified"}</p><button onClick={async () => { notify("Telegram verification started..."); await verifyTelegram().catch(() => undefined); await refresh(); notify("Telegram verification finished. Check the status panel and console."); }}>Verify Telegram</button></Panel>
        <Panel title="Dashboard/Database Status"><p>JSON persistence is active. Snapshot updates every 2 seconds.</p><button onClick={async () => { notify("Resetting seeded demo data..."); await seedDemoData(); await refresh(); notify("Seed demo data restored."); }}>Seed Demo Data</button></Panel>
        <Panel title="Design QA Status"><p>Design QA uses `DESIGN.md`, impeccable preflight, and browser screenshots.</p><button onClick={async () => { notify("Real API checks started..."); await verifyRealApis(); await refresh(); notify("Real API checks finished. Review the verification console."); }}>Run Real API Checks</button></Panel>
        <Panel title="Setup Instructions" className="wide"><p>Set `OPENAI_API_KEY` and `TELEGRAM_BOT_TOKEN` in `.env.local`, then run `RUN_ALL.bat` to start the frontend, API, and Telegram bot worker.</p><button onClick={async () => { notify("Injecting demo message..."); await injectDemo(); await refresh(); notify("Demo message injected through the shared processing pipeline."); }}>Inject Demo Message</button></Panel>
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

function FilterTabs({ labels, value, onChange }: { labels: string[]; value?: string; onChange?: (label: string) => void }) {
  const [localValue, setLocalValue] = useState(labels[0]);
  const activeValue = value ?? localValue;
  return (
    <div className="filter-tabs">
      {labels.map((label) => (
        <button
          aria-pressed={activeValue === label}
          className={activeValue === label ? "active" : ""}
          key={label}
          onClick={() => {
            setLocalValue(label);
            onChange?.(label);
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Drawer({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <aside className="drawer"><button aria-label="Close details" onClick={onClose}>Close</button><h2>{title}</h2>{children}</aside>;
}

function InsightRow({ insight }: { insight: Insight }) {
  return <div className="insight-row"><Badge tone={insight.severity}>{insight.severity}</Badge><div><strong>{insight.title}</strong><span>{insight.count} cases, trend {insight.trend}</span></div></div>;
}

function LeadCard({ opportunity, snapshot, onOpen }: { opportunity: Opportunity; snapshot: Snapshot; onOpen: () => void }) {
  const customer = customerFor(snapshot, opportunity.customerId);
  const conversation = conversationFor(snapshot, opportunity.conversationId);
  return (
    <article className="lead-card" data-testid={`lead-card-${opportunity.id}`}>
      <div className="lead-card-top">
        <div>
          <strong>{customer?.name}</strong>
          <span>{opportunity.intent}</span>
        </div>
        <span className="lead-stage-pill">{opportunity.stage}</span>
      </div>
      <div className="lead-card-stats">
        <span><b>Value</b>{money(opportunity.value)}</span>
        <span><b>Sentiment</b>{opportunity.sentiment}</span>
      </div>
      <span className="lead-card-section"><b>Why it is here</b>{stageGuidance[opportunity.stage].purpose}</span>
      <span className="lead-card-section"><b>Next owner action</b>{opportunity.nextAction}</span>
      <span className="lead-card-section"><b>Risk</b>{opportunity.risk}</span>
      <span className="lead-card-section"><b>Source conversation</b>{conversation?.title ?? opportunity.source}</span>
      <button onClick={onOpen}>Open Lead Detail</button>
    </article>
  );
}

function ActivityStream({ snapshot }: { snapshot: Snapshot }) {
  return <div className="activity-stream">{snapshot.messages.slice(-8).reverse().map((message) => <div key={message.id}><span>{formatTime(message.createdAt)}</span><strong>{customerFor(snapshot, message.customerId)?.name}</strong><p>{message.text}</p></div>)}</div>;
}

function customerFor(snapshot: Snapshot, customerId: string) {
  return snapshot.customers.find((customer) => customer.id === customerId);
}

function conversationFor(snapshot: Snapshot, conversationId: string) {
  return snapshot.conversations.find((conversation) => conversation.id === conversationId);
}

function latestMessageForConversation(snapshot: Snapshot, conversationId: string) {
  return snapshot.messages
    .filter((message) => message.conversationId === conversationId)
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())[0];
}

function stageWithMostLeads(snapshot: Snapshot): OpportunityStage {
  return stages.reduce<OpportunityStage>((current, stage) => {
    const currentCount = snapshot.pipelineCounts[current] ?? 0;
    const stageCount = snapshot.pipelineCounts[stage] ?? 0;
    return stageCount > currentCount ? stage : current;
  }, "New Inquiry");
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
