import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Check,
  Eye,
  FileText,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { GlassPanel } from "../components/shared/GlassPanel";

const ArrowRight = ArrowUpRight;
const ChevronDown = ArrowUpRight;
const FileCheck2 = FileText;
const TriangleAlert = AlertTriangle;
const UserRound = Users;
const UsersRound = Users;

type Language = "en" | "hi";
type Audience = "person" | "team";
interface LandingProps { language?: Language; }

const principles = [
  { number: "01", icon: AlertCircle, title: "Ask clearly", short: "Tell people what you need and why.", detail: "A person should understand what data an app wants, the reason for it, and what will happen next before they agree." },
  { number: "02", icon: Users, title: "Give choice", short: "Consent should be real, not hidden.", detail: "Consent should be informed and specific. People should not be forced to share unrelated data just to use an essential feature." },
  { number: "03", icon: Eye, title: "Stay accountable", short: "Protect data and respond to people.", detail: "Organisations need sensible safeguards, a way to handle requests, and evidence that their privacy promises are being followed." },
];

const journey = [
  { label: "Collect", icon: Shield, text: "An app asks for your location, contacts, or identity details." },
  { label: "Explain", icon: AlertCircle, text: "The app explains the purpose in language a person can understand." },
  { label: "Choose", icon: Users, text: "The person decides whether to allow that specific use." },
  { label: "Protect", icon: ShieldCheck, text: "The organisation keeps the information secure and uses it responsibly." },
];

const findings = [
  { label: "Consent", title: "Contacts are requested before the reason is clear", plain: "The app may be asking for more personal information than a person expects.", action: "Show the purpose before asking, and make the choice optional where possible.", severity: "Needs attention", tone: "amber" },
  { label: "Purpose", title: "A broad storage permission is used", plain: "A permission that can reach many files should have a clear, narrow reason.", action: "Check whether a smaller permission or a more limited data flow will work.", severity: "Review", tone: "cyan" },
  { label: "Security", title: "Sensitive data may be stored without enough protection", plain: "If someone gets access to the device, private information could be easier to read.", action: "Protect stored data and document who can access it and why.", severity: "High priority", tone: "red" },
];

const dpdpRules = [
  { id: "notice", section: "Act Section 5", title: "Explain before you collect", plain: "Before asking for personal data, tell people what you want and why in a clear notice.", example: "A finance app explains that it needs PAN details to complete KYC, instead of hiding the reason in a long policy.", action: "Check every collection point for a visible purpose, data category, and contact for questions.", icon: FileText },
  { id: "consent", section: "Act Section 6", title: "Consent must be meaningful", plain: "Consent should be free, specific, informed, and easy to withdraw.", example: "A user can allow notifications without being forced to share contacts that the feature does not need.", action: "Separate unrelated choices and record what the person agreed to.", icon: Users },
  { id: "purpose", section: "Act Section 8", title: "Use data responsibly", plain: "The organisation handling data remains responsible for safeguards, accuracy, and honoring its promises.", example: "An app does not quietly reuse a loan application’s contacts for unrelated advertising.", action: "Map each data use to a stated purpose and review third-party access.", icon: ShieldCheck },
  { id: "security", section: "Act Section 8 + Rules", title: "Protect it in practice", plain: "Put reasonable security safeguards around personal data and be ready to respond when something goes wrong.", example: "A team limits access, protects stored data, watches for suspicious activity, and keeps an incident plan ready.", action: "Test access controls, logging, recovery, and breach escalation before release.", icon: Shield },
  { id: "children", section: "Act Section 9", title: "Extra care for children", plain: "Children’s data needs stronger care, including consent and limits on harmful tracking or targeted activity.", example: "A children’s learning app avoids behavioral tracking and verifies the responsible adult’s consent where required.", action: "Identify child-directed flows and review profiling, tracking, and consent controls.", icon: Eye },
  { id: "rights", section: "Act Sections 11-14", title: "Respect user requests", plain: "People can ask what data is held about them, seek correction or erasure where applicable, and raise a grievance.", example: "A user can find a clear route to request correction of an old phone number and hear back within the stated process.", action: "Give users an understandable request channel, identity checks, owners, and response timelines.", icon: Scale },
];

const ruleQuiz = [
  { question: "An app asks for contacts but never explains why. Which idea is most directly involved?", answer: "notice", options: ["Notice", "Children’s data", "Breach response"] },
  { question: "A user wants to stop an optional data use. What should the experience support?", answer: "consent", options: ["Permanent consent", "Easy withdrawal", "More permissions"] },
  { question: "A team discovers suspicious access to personal data. What should already exist?", answer: "security", options: ["An incident response plan", "A hidden policy", "A marketing campaign"] },
];

const INTAKE_URL = process.env.REACT_APP_INTAKE_URL || "";

type FormStatus = "idle" | "submitting" | "submitted" | "error";

function ReviewForm(): React.JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submissionId, setSubmissionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!INTAKE_URL) {
      setStatus("error");
      setErrorMessage("The intake endpoint is not configured. Set REACT_APP_INTAKE_URL and rebuild.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");
    setSubmissionId("");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (apkFile) formData.append("apk", apkFile);
    try {
      const response = await fetch(INTAKE_URL, { method: "POST", body: formData });
      const body: { id?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || `Upload failed with status ${response.status}.`);
      }
      setSubmissionId(body.id ?? "");
      setStatus("submitted");
    } catch (error: unknown) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-cyan-300/20 bg-[#07161d]/90 p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Start a review</p>
          <h3 className="mt-2 text-2xl font-semibold text-white font-heading">See what your APK tells people.</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Upload your Android APK to start a privacy review. Files are received by the DPDP Sentinel intake service and stored for review.</p>
        </div>
        <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200 sm:inline-flex">Live intake</span>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-200">Your name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10" placeholder="Ananya Sharma" /></label>
        <label className="block text-sm font-medium text-slate-200">Work email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10" placeholder="ananya@company.com" /></label>
      </div>
      <label className="mt-5 block text-sm font-medium text-slate-200">Android APK<span className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-300/30 bg-cyan-300/[0.04] px-5 py-7 text-center transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.08]"><FileText className="h-7 w-7 text-cyan-200" /><span className="mt-3 font-semibold text-white">{apkFile ? apkFile.name : "Choose an APK file"}</span><span className="mt-1 text-xs text-slate-500">APK only · up to 100 MB</span><input required type="file" accept=".apk,application/vnd.android.package-archive" onChange={(event) => setApkFile(event.target.files?.[0] ?? null)} className="sr-only" /></span></label>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-slate-500">By submitting, your APK will be uploaded to the DPDP Sentinel intake service for review.</p><button type="submit" disabled={status === "submitting"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#09242c] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">{status === "submitting" ? "Uploading…" : "Submit for review"} <ArrowRight className="h-4 w-4" /></button></div>
      {status === "submitting" ? <div role="status" className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-100">Uploading {apkFile?.name || "APK"} for review…</div> : null}
      {status === "submitted" ? <div role="status" className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm leading-6 text-emerald-100"><Check className="mr-2 inline h-4 w-4" />Thanks, {name || "there"}. We received {apkFile?.name || "your APK"}{submissionId ? <> (submission <span className="font-semibold">{submissionId}</span>)</> : null}. A review team will follow up at {email}.</div> : null}
      {status === "error" ? <div role="alert" className="mt-5 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm leading-6 text-red-100"><TriangleAlert className="mr-2 inline h-4 w-4" />{errorMessage} <button type="button" onClick={() => setStatus("idle")} className="ml-1 font-semibold underline">Try again</button></div> : null}
    </form>
  );
}

export default function Landing({ language = "en" }: LandingProps): React.JSX.Element {
  const [audience, setAudience] = useState<Audience>("person");
  const [activePrinciple, setActivePrinciple] = useState(0);
  const [activeJourney, setActiveJourney] = useState(0);
  const [activeFinding, setActiveFinding] = useState(0);
  const [activeRule, setActiveRule] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const hindi = language === "hi";
  const principle = principles[activePrinciple];
  const finding = findings[activeFinding];
  const rule = dpdpRules[activeRule];
  const quiz = ruleQuiz[quizStep];
  const PrincipleIcon = principle.icon;
  const JourneyIcon = journey[activeJourney].icon;
  const RuleIcon = rule.icon;

  return (
    <div className="space-y-10 pb-16">
      <section id="top" className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#10232b] px-5 py-10 shadow-[0_28px_100px_rgba(0,0,0,0.3)] sm:px-10 sm:py-16">
        <div className="absolute right-[-8%] top-[-25%] h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200"><Sparkles className="h-4 w-4" /> {hindi ? "सरल भाषा में privacy review" : "Privacy reviews, made human"}</div>
            <p className="mb-4 text-sm font-medium text-cyan-200">DPDP Sentinel / Android privacy guide</p>
            <h2 className="max-w-3xl text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl font-heading">{hindi ? "DPDP Act को समझें। बेहतर apps बनाएं।" : "Understand the DPDP Act. Build apps people can trust."}</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">{hindi ? "DPDP Sentinel technical findings को आसान भाषा में बदलता है, ताकि हर व्यक्ति समझ सके कि app कौन-सा data लेता है, क्यों लेता है और क्या सुधारना है।" : "DPDP Sentinel turns technical findings into plain-English answers: what an app collects, why it matters, and what to fix before release."}</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#dpdp-basics" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#09242c] transition hover:-translate-y-0.5 hover:bg-cyan-200">Learn the basics <ArrowRight className="h-4 w-4" /></a><a href="#demo" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10">Explore an example</a></div>
            <p className="mt-5 text-xs text-slate-400">Technical decision support only. This is not legal advice.</p>
          </div>
          <div className="relative rounded-[1.5rem] border border-white/10 bg-[#07161d]/90 p-5 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Example app review</p><p className="mt-1 text-lg font-semibold text-white">PayProve UPI</p></div><span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-200">Review</span></div>
            <div className="py-5"><p className="text-sm text-slate-400">Privacy readiness</p><div className="mt-3 flex items-end gap-3"><span className="text-6xl font-semibold tracking-tight text-white">38</span><span className="pb-2 text-sm text-slate-400">/ 100</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[38%] rounded-full bg-gradient-to-r from-red-400 via-amber-300 to-cyan-300" /></div></div>
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center"><div><p className="text-xl font-semibold text-red-300">2</p><p className="mt-1 text-[11px] text-slate-400">urgent</p></div><div><p className="text-xl font-semibold text-amber-200">3</p><p className="mt-1 text-[11px] text-slate-400">to review</p></div><div><p className="text-xl font-semibold text-emerald-300">7</p><p className="mt-1 text-[11px] text-slate-400">understood</p></div></div>
            <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4"><div className="flex gap-3"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" /><div><p className="text-sm font-semibold text-amber-100">The important bit</p><p className="mt-1 text-sm leading-6 text-amber-50/75">People may not understand why contacts are requested before consent.</p></div></div></div>
          </div>
        </div>
      </section>

      <section id="dpdp-basics" className="scroll-mt-24">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">The simple version</p><h3 className="mt-2 text-3xl font-semibold text-white font-heading">What does the DPDP Act mean?</h3></div><div className="inline-flex w-fit rounded-xl border border-white/10 bg-white/5 p-1"><button type="button" onClick={() => setAudience("person")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${audience === "person" ? "bg-cyan-300 text-[#09242c]" : "text-slate-400 hover:text-white"}`}><UserRound className="h-4 w-4" />For everyone</button><button type="button" onClick={() => setAudience("team")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${audience === "team" ? "bg-cyan-300 text-[#09242c]" : "text-slate-400 hover:text-white"}`}><UsersRound className="h-4 w-4" />For product teams</button></div></div>
        <GlassPanel className="rounded-[1.5rem] border-cyan-300/15 p-6 sm:p-8"><div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><div><p className="text-xl leading-8 text-slate-100">{audience === "person" ? "It is India's data protection law. It gives people more say over their digital personal data and asks organisations to handle that data responsibly." : "It is a practical checklist for building trust: know what personal data you use, explain the purpose, get valid consent where required, protect the data, and be ready to respond."}</p><div className="mt-5 flex items-center gap-2 text-sm text-cyan-200"><FileCheck2 className="h-4 w-4" /> Personal data = information that can identify a person</div></div><div className="grid gap-3 sm:grid-cols-3">{principles.map((item, index) => { const Icon = item.icon; return <button key={item.number} type="button" onClick={() => setActivePrinciple(index)} className={`group rounded-2xl border p-4 text-left transition ${activePrinciple === index ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}><div className="flex items-center justify-between"><Icon className={`h-5 w-5 ${activePrinciple === index ? "text-cyan-200" : "text-slate-400"}`} /><span className="text-xs text-slate-500">{item.number}</span></div><p className="mt-6 font-semibold text-white">{item.title}</p><p className="mt-2 text-sm leading-6 text-slate-400">{item.short}</p></button>; })}</div></div><div className="mt-8 flex items-start gap-4 rounded-xl border border-white/10 bg-black/15 p-4"><div className="rounded-lg bg-cyan-300/15 p-2 text-cyan-200"><PrincipleIcon className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">In practice</p><p className="mt-1 text-sm leading-6 text-slate-300">{principle.detail}</p></div></div></GlassPanel>
      </section>

      <section id="how-it-works" className="scroll-mt-24 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><GlassPanel className="rounded-[1.5rem] p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">A useful mental model</p><h3 className="mt-2 text-3xl font-semibold text-white font-heading">The privacy journey</h3><p className="mt-3 text-sm leading-7 text-slate-300">Every time an app touches personal data, ask four simple questions. Tap a step to see what “good” looks like.</p><div className="mt-7 space-y-2">{journey.map((item, index) => { const Icon = item.icon; return <button key={item.label} type="button" onClick={() => setActiveJourney(index)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${activeJourney === index ? "border-cyan-300/45 bg-cyan-300/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeJourney === index ? "bg-cyan-300 text-[#09242c]" : "bg-white/10 text-slate-400"}`}><Icon className="h-4 w-4" /></span><span className="flex-1 text-sm font-semibold text-white">{item.label}</span><ChevronDown className={`h-4 w-4 text-slate-500 transition ${activeJourney === index ? "-rotate-90 text-cyan-200" : ""}`} /></button>; })}</div></GlassPanel><div className="relative overflow-hidden rounded-[1.5rem] border border-cyan-300/20 bg-[#16313a] p-6 sm:p-8"><div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-cyan-300/20" /><div className="relative flex h-full flex-col justify-between"><div><p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Step {String(activeJourney + 1).padStart(2, "0")} / 04</p><JourneyIcon className="mt-10 h-10 w-10 text-cyan-200" /><h3 className="mt-5 text-3xl font-semibold text-white font-heading">{journey[activeJourney].label}</h3><p className="mt-4 max-w-md text-lg leading-8 text-slate-200">{journey[activeJourney].text}</p></div><div className="mt-10 border-t border-white/15 pt-5 text-sm text-cyan-100"><Check className="mr-2 inline h-4 w-4" /> This is the kind of evidence DPDP Sentinel helps teams review.</div></div></div></section>

      <section id="demo" className="scroll-mt-24"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Try the product thinking</p><h3 className="mt-2 text-3xl font-semibold text-white font-heading">One finding, explained three ways</h3><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Technical scanners produce signals. A useful review translates each signal into impact and a next step.</p></div><GlassPanel className="rounded-[1.5rem] p-5 sm:p-7"><div className="flex flex-wrap gap-2 border-b border-white/10 pb-5">{findings.map((item, index) => <button key={item.label} type="button" onClick={() => setActiveFinding(index)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeFinding === index ? "bg-white text-[#0b1a20]" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}>{item.label}</button>)}</div><div className="grid gap-5 pt-6 lg:grid-cols-[1.1fr_0.9fr]"><div><div className="flex items-start gap-3"><div className={`rounded-lg p-2 ${finding.tone === "red" ? "bg-red-400/15 text-red-300" : finding.tone === "amber" ? "bg-amber-300/15 text-amber-200" : "bg-cyan-300/15 text-cyan-200"}`}><TriangleAlert className="h-5 w-5" /></div><div><span className="text-xs uppercase tracking-[0.18em] text-slate-500">Raw signal</span><h4 className="mt-1 text-xl font-semibold text-white">{finding.title}</h4></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plain English</p><p className="mt-2 text-sm leading-6 text-slate-200">{finding.plain}</p></div><div className="rounded-xl border border-emerald-300/15 bg-emerald-300/5 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Next step</p><p className="mt-2 text-sm leading-6 text-slate-200">{finding.action}</p></div></div></div><div className="rounded-xl border border-white/10 bg-[#091820] p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Decision support</p><div className="mt-4 flex items-center justify-between gap-3"><p className="text-2xl font-semibold text-white">{finding.severity}</p><span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">Example</span></div><p className="mt-4 text-sm leading-7 text-slate-400">The tool helps a team decide what to investigate next. It does not replace a legal review or a person’s judgement.</p><button type="button" onClick={() => setActiveFinding((activeFinding + 1) % findings.length)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-white">See another example <ArrowRight className="h-4 w-4" /></button></div></div></GlassPanel></section>

      <section id="product" className="grid gap-6 border-t border-white/10 pt-8 lg:grid-cols-[1.15fr_0.85fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">A calmer release review</p><h3 className="mt-2 text-3xl font-semibold text-white font-heading">From “is this okay?” to a clear next action.</h3><p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">Upload an Android release candidate, bring security and privacy signals into one view, and give every finding a reason, an owner, and a recommended action.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{["See what changed", "Understand why it matters", "Share evidence with your team"].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><Check className="h-5 w-5 text-emerald-300" /><p className="mt-4 text-sm font-semibold leading-6 text-white">{item}</p></div>)}</div></div><GlassPanel className="rounded-[1.5rem] p-6"><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-emerald-300" /><div><p className="text-sm font-semibold text-white">Release snapshot</p><p className="text-xs text-slate-500">PayProve UPI · v4.2.1</p></div></div><div className="mt-6 space-y-3">{[{ label: "Privacy purpose explained", value: "Needs review", tone: "text-amber-200" }, { label: "Sensitive data protected", value: "Action needed", tone: "text-red-300" }, { label: "Evidence ready to share", value: "Ready", tone: "text-emerald-300" }].map((item) => <div key={item.label} className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm"><span className="text-slate-300">{item.label}</span><span className={`font-semibold ${item.tone}`}>{item.value}</span></div>)}</div></GlassPanel></section>

      <section id="early-access" className="rounded-[1.5rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 to-emerald-300/5 p-6 sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Private beta</p><h3 className="mt-2 text-2xl font-semibold text-white font-heading">Help make privacy reviews easier to understand.</h3><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">Explore the workflow with your Android app, challenge the findings, and help shape a clearer way to prepare for release.</p></div><a href="https://forms.gle/x3X9RuekxCU2Gjb16" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#09242c] transition hover:-translate-y-0.5 hover:bg-cyan-200">Request early access <ArrowRight className="h-4 w-4" /></a></div></section>
      <section id="rules" className="scroll-mt-24 border-t border-white/10 pt-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Learn by doing</p><h3 className="mt-2 text-3xl font-semibold text-white font-heading">DPDP rules, without the legal fog.</h3><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Pick a rule to see what it means, what it looks like inside an app, and the practical question a team should ask next.</p></div><div className="flex flex-wrap gap-4"><a href="https://www.meity.gov.in/content/digital-personal-data-protection-act-2023" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-white">Official Act <ArrowRight className="h-4 w-4" /></a><a href="https://www.meity.gov.in/content/digital-personal-data-protection-rules-2025" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-white">Official Rules 2025 <ArrowRight className="h-4 w-4" /></a></div></div>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"><GlassPanel className="rounded-[1.5rem] p-5 sm:p-7"><div className="grid gap-2">{dpdpRules.map((item, index) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setActiveRule(index)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${activeRule === index ? "border-cyan-300/45 bg-cyan-300/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activeRule === index ? "bg-cyan-300 text-[#09242c]" : "bg-white/10 text-slate-400"}`}><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{item.title}</span><span className="mt-1 block text-xs text-slate-500">{item.section}</span></span><ArrowRight className={`h-4 w-4 shrink-0 transition ${activeRule === index ? "text-cyan-200" : "text-slate-600"}`} /></button>; })}</div></GlassPanel><div className="rounded-[1.5rem] border border-cyan-300/20 bg-[#16313a] p-6 sm:p-8"><div className="flex items-center justify-between gap-3"><span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Rule {String(activeRule + 1).padStart(2, "0")} / {dpdpRules.length}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{rule.section}</span></div><RuleIcon className="mt-8 h-9 w-9 text-cyan-200" /><h4 className="mt-5 text-2xl font-semibold text-white font-heading">{rule.title}</h4><p className="mt-3 text-base leading-7 text-slate-200">{rule.plain}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">App example</p><p className="mt-2 text-sm leading-6 text-slate-300">{rule.example}</p></div><div className="rounded-xl border border-emerald-300/15 bg-emerald-300/5 p-4"><p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Team action</p><p className="mt-2 text-sm leading-6 text-slate-300">{rule.action}</p></div></div></div></div>
        <div className="mt-6 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/[0.06] p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Quick check</p><p className="mt-2 text-lg font-semibold text-white">{quiz.question}</p></div><span className="text-xs text-slate-500">{quizStep + 1} / {ruleQuiz.length}</span></div><div className="mt-5 grid gap-2 sm:grid-cols-3">{quiz.options.map((option) => { const selected = quizAnswer === option; const correct = option.toLowerCase().replace(/\s/g, "") === quiz.answer; return <button key={option} type="button" onClick={() => setQuizAnswer(option)} className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${selected ? correct ? "border-emerald-300/60 bg-emerald-300/15 text-emerald-100" : "border-red-300/60 bg-red-300/10 text-red-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"}`}>{option}</button>; })}</div>{quizAnswer ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className={`text-sm ${quizAnswer.toLowerCase().replace(/\s/g, "") === quiz.answer ? "text-emerald-200" : "text-amber-100"}`}>{quizAnswer.toLowerCase().replace(/\s/g, "") === quiz.answer ? "Correct. Nice catch." : `The best answer is ${quiz.options.find((option) => option.toLowerCase().replace(/\s/g, "") === quiz.answer)}.`}</p><button type="button" onClick={() => { setQuizStep((quizStep + 1) % ruleQuiz.length); setQuizAnswer(null); }} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-white">Next question <ArrowRight className="h-4 w-4" /></button></div> : null}</div>
      </section>

      <section id="upload" className="scroll-mt-24 grid gap-6 border-t border-white/10 pt-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Your next step</p>
          <h3 className="mt-2 text-3xl font-semibold text-white font-heading">Turn an APK into a clearer privacy conversation.</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">Share a few details and choose an APK to explore the kind of evidence, plain-language explanations, and release actions DPDP Sentinel can bring together.</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <p><Check className="mr-2 inline h-4 w-4 text-emerald-300" />Understand what data the app may touch</p>
            <p><Check className="mr-2 inline h-4 w-4 text-emerald-300" />See privacy risks without reading security jargon</p>
            <p><Check className="mr-2 inline h-4 w-4 text-emerald-300" />Prepare a review your team can act on</p>
          </div>
        </div>
        <ReviewForm />
      </section>

      <footer className="border-t border-white/10 pt-6 text-center"><p className="text-sm font-semibold text-cyan-200">DPDP Sentinel</p><p className="mt-2 text-xs leading-6 text-slate-500">Technical compliance analysis and decision support only. Not legal advice or a guarantee of regulatory compliance.</p></footer>
    </div>
  );
}
