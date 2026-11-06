import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowLeft, ArrowUpRight, Bot, BriefcaseBusiness, Bug, Check, ChevronDown, Code2, Command, Cpu, FileText, Menu, MessageCircle, PenLine, Plus, Search, Send, Settings2, ShieldCheck, Sparkles, X, Zap } from "lucide-react";

const iconMap = { sparkles: Sparkles, code: Code2, pen: PenLine, briefcase: BriefcaseBusiness, search: Search, bug: Bug };
const fallbackAgents = [
  { id:"general",name:"General Assistant",role:"Everyday problem solver",description:"Ask questions, explore ideas, and get clear, useful answers.",icon:"sparkles",color:"violet",tag:"All-purpose" },
  { id:"developer",name:"Developer Agent",role:"Your coding partner",description:"Understand code, debug errors, and plan software projects.",icon:"code",color:"blue",tag:"Development" },
  { id:"writer",name:"Writing Agent",role:"Words that work",description:"Draft emails, polish writing, and turn rough ideas into clear copy.",icon:"pen",color:"pink",tag:"Writing" },
  { id:"business",name:"Business Strategist",role:"Think bigger, move smarter",description:"Evaluate opportunities, shape strategies, and structure business ideas.",icon:"briefcase",color:"amber",tag:"Business" },
  { id:"research",name:"Research Agent",role:"Make sense of complexity",description:"Organize a topic, compare options, and build structured explanations.",icon:"search",color:"green",tag:"Research" },
  { id:"qa",name:"QA Testing Agent",role:"Quality starts here",description:"Create test cases, analyze bugs, and improve test coverage.",icon:"bug",color:"cyan",tag:"Testing" }
];

function App() {
  const [agents, setAgents] = useState(fallbackAgents);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");
  const [mobileNav, setMobileNav] = useState(false);
  const endRef = useRef(null);
  const selected = agents.find((agent) => agent.id === active);
  const filtered = useMemo(() => agents.filter((agent) => `${agent.name} ${agent.description} ${agent.tag}`.toLowerCase().includes(query.toLowerCase())), [agents, query]);

  useEffect(() => {
    fetch("/api/agents").then((r) => r.ok ? r.json() : Promise.reject()).then((data) => setAgents(data.agents)).catch(() => {});
    fetch("/api/health").then((r) => r.json()).then((data) => setApiStatus(data.configured ? "online" : "setup")).catch(() => setApiStatus("offline"));
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  function openAgent(id) { setActive(id); setMessages([]); setInput(""); setMobileNav(false); }
  async function sendMessage(text = input) {
    const prompt = text.trim();
    if (!prompt || busy || !active) return;
    const next = [...messages, { role: "user", text: prompt }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const response = await fetch("/api/chat", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ agentId:active, messages:next }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      setMessages([...next, { role:"model", text:data.text }]);
    } catch (error) {
      setMessages([...next, { role:"error", text:error.message || "Could not reach the server." }]);
    } finally { setBusy(false); }
  }
  function newChat() { setActive(null); setMessages([]); setInput(""); }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Command size={20}/></div><span>AI Agents <b>Hub</b></span><button className="mobile-close icon-button" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <button className="new-chat" onClick={newChat}><Plus size={17}/> New conversation <span>⌘ K</span></button>
      <div className="side-label">WORKSPACE</div>
      <button className={`nav-item ${!active ? "nav-active" : ""}`} onClick={newChat}><Activity size={17}/> Overview</button>
      <div className="side-label agent-label">YOUR AGENTS <span>{agents.length}</span></div>
      <nav className="agent-nav">{agents.map((agent) => { const Icon = iconMap[agent.icon] || Bot; return <button key={agent.id} className={`nav-item ${active===agent.id ? "nav-active" : ""}`} onClick={()=>openAgent(agent.id)}><span className={`mini-icon ${agent.color}`}><Icon size={15}/></span>{agent.name}</button>; })}</nav>
      {/* <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Zap size={16}/></div><b>Make room for ideas.</b><p>Your AI workspace, ready when you are.</p><span className="plan-label">GEMINI POWERED</span></div><div className="profile"><div className="avatar">H</div><div><b>Hub Workspace</b><small>Personal workspace</small></div><Settings2 size={17} className="profile-settings"/></div></div> */}
    </aside>
    {mobileNav && <div className="scrim" onClick={()=>setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><span className="breadcrumb">Workspace</span><span className="crumb-slash">/</span><span className="breadcrumb-current">{selected?.name || "Overview"}</span></div><div className="topbar-right"><div className={`status-pill ${apiStatus}`}><span className="status-dot"/>{apiStatus==="online"?"Gemini connected":apiStatus==="setup"?"API key needed":apiStatus==="checking"?"Connecting":"Server offline"}</div><div className="top-avatar">H</div></div></header>
      {selected ? <section className="chat-view">
        <div className="chat-heading"><button className="back-link" onClick={newChat}><ArrowLeft size={15}/> All agents</button><div className={`agent-avatar large ${selected.color}`}>{(()=>{const Icon=iconMap[selected.icon]||Bot;return <Icon size={25}/>})()}</div><h1>{selected.name}</h1><p>{selected.role}</p><span className="agent-tag">{selected.tag}</span></div>
        {messages.length===0 ? <div className="chat-empty"><div className="welcome-spark"><Sparkles size={20}/></div><h2>What can I help you with?</h2><p>{selected.description}</p><div className="suggestion-grid">{(active==="developer"?["Help me debug this code","Explain an API with an example","Plan a React project","Review my code for issues"]:active==="writer"?["Write a concise professional email","Improve this paragraph","Brainstorm content ideas","Make this sound more confident"]:active==="business"?["Evaluate a startup idea","Create a simple business plan","Identify risks in this strategy","Suggest ways to find customers"]:active==="qa"?["Create test cases for login","Write negative test scenarios","Review this bug report","Build a regression checklist"]:active==="research"?["Explain a complex topic simply","Compare two approaches","Create a research outline","Summarize key considerations"]:["Help me organize an idea","Explain something step by step","Brainstorm creative solutions","Create an action plan"]).map((s)=><button key={s} className="suggestion" onClick={()=>sendMessage(s)}>{s}<ArrowUpRight size={14}/></button>)}</div></div> : <div className="messages">{messages.map((message,i)=><div className={`message-row ${message.role}`} key={i}><div className="message-avatar">{message.role==="user"?"H":message.role==="error"?<X size={15}/>:<Sparkles size={15}/>}</div><div className="message-content"><span className="message-author">{message.role==="user"?"You":message.role==="error"?"Notice":selected.name}</span><p>{message.text}</p></div></div>)}{busy&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="typing"><i/><i/><i/></div></div>}<div ref={endRef}/></div>}
        <div className="composer-wrap"><form className="composer" onSubmit={(e)=>{e.preventDefault();sendMessage();}}><textarea value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder={`Message ${selected.name}...`} rows="1"/><div className="composer-footer"><span><span className="composer-hint">↵</span> to send · Shift + ↵ for new line</span><button className="send-button" type="submit" disabled={!input.trim()||busy}><Send size={16}/></button></div></form><p className="disclaimer">AI can make mistakes. Check important information.</p></div>
      </section> : <section className="dashboard">
        <div className="hero"><div className="eyebrow"><span className="eyebrow-line"/> YOUR AI WORKSPACE</div><h1>Ideas into action.<br/><span>Meet your agents.</span></h1><p className="hero-copy">A team of focused AI assistants, ready to help you think, create, build, and get things done.</p><div className="hero-meta"><div className="meta-icon"><Sparkles size={16}/></div><span>One workspace. Different ways to think.</span><span className="meta-divider"/> <span className="powered">Powered by Gemini</span></div><div className="hero-orb orb-one"/><div className="hero-orb orb-two"/><div className="hero-art"><div className="art-ring ring-a"/><div className="art-ring ring-b"/><div className="art-core"><Command size={34}/></div><div className="orbit-chip chip-a"><Code2 size={16}/></div><div className="orbit-chip chip-b"><PenLine size={16}/></div><div className="orbit-chip chip-c"><BriefcaseBusiness size={16}/></div><div className="orbit-chip chip-d"><Search size={16}/></div></div></div>
        <div className="section-head"><div><div className="section-kicker">THE LINEUP</div><h2>Choose your agent</h2><p>Each one brings a different skill set to your workspace.</p></div><div className="agent-count"><span>{agents.length.toString().padStart(2,"0")}</span> agents available</div></div>
        <div className="toolbar"><div className="search-box"><Search size={16}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Find an agent..."/><kbd>⌘ K</kbd></div><span className="sort-label">SPECIALIZED FOR YOU</span></div>
        <div className="agent-grid">{filtered.map((agent,index)=>{const Icon=iconMap[agent.icon]||Bot;return <button className="agent-card" key={agent.id} onClick={()=>openAgent(agent.id)} style={{animationDelay:`${index*55}ms`}}><div className="card-top"><div className={`agent-avatar ${agent.color}`}><Icon size={21}/></div><span className="card-arrow"><ArrowUpRight size={17}/></span></div><span className="card-tag">{agent.tag}</span><h3>{agent.name}</h3><p>{agent.description}</p><div className="card-bottom"><span><span className="available-dot"/> READY TO CHAT</span><ArrowDown size={14}/></div></button>})}{filtered.length===0&&<div className="no-results">No agents match “{query}”. Try another search.</div>}</div>
        <footer className="dashboard-footer"><span><ShieldCheck size={14}/> Your API key stays on your server</span><span>BUILT FOR CURIOUS MINDS <Sparkles size={13}/></span></footer>
      </section>}
    </main>
  </div>;
}
export default App;