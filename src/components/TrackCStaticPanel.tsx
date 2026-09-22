import React from "react";

import { cn, analysisSourceMode, analysisSourceLabel } from "../lib/utils";
import { TrackCResult } from "../types";
import { HIDE_TOOL_NAMES } from "../config";

interface TrackCStaticPanelProps {
	result?: TrackCResult;
}

const toneByStatus: Record<string, string> = {
	completed: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
	degraded: "text-amber-300 border-amber-500/40 bg-amber-500/10",
	skipped: "text-slate-300 border-slate-500/40 bg-slate-500/10"
};

export function TrackCStaticPanel({ result }: TrackCStaticPanelProps): React.JSX.Element {
	if (!result) {
		return (
			<section className="rounded-xl border border-[var(--ds-border-default)] bg-cyan-500/5 p-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Code Depth</p>
						<h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">No static code-depth result yet</h3>
					</div>
				</div>
			</section>
		);
	}

	const statusTone = toneByStatus[result.status] || toneByStatus.skipped;
	const codeDepth = result.code_depth;
	const overallScore = codeDepth?.overall_score ?? 0;
	const highExploit = codeDepth?.high_exploit_count ?? 0;
	const secrets = codeDepth?.secrets_found ?? 0;
	const codeDepthResults = codeDepth?.results;
	const results = Array.isArray(codeDepthResults) ? codeDepthResults : [];
	const analyzedCount = result.decompiled_methods ?? results.length;

	return (
		<section className="relative overflow-hidden rounded-xl border border-[var(--ds-border-default)] bg-slate-900/70 p-4 shadow-panel">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.10),transparent_50%)]" />
			<div className="relative">
				<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Code Depth</p>
						<h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">
							{HIDE_TOOL_NAMES ? "Static Code Depth" : "JADX + Evidence Triage Static Depth"}
						</h3>
					</div>
					<span className={cn("rounded-full border px-3 py-1 text-sm font-semibold", statusTone)}>
						{result.status.toUpperCase()}
					</span>
				</div>

				<div className="grid gap-3 md:grid-cols-4">
					<Metric label="Code Depth Score" value={`${Math.round(overallScore)}/100`} />
					<Metric label="Decompiled Methods" value={String(result.decompiled_methods || 0)} />
					<Metric label="Scored Results" value={String(results.length)} />
					<Metric label="High Exploitability" value={String(highExploit)} />
					<Metric label="Hardcoded Secrets" value={String(secrets)} />
				</div>

				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<div className="rounded-lg border border-navy-600 bg-navy-800/60 p-3">
						<p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Analysis Status</p>
						<p className="text-sm text-slate-200">
							{analysisSourceMode(result.model_enabled)}
						</p>
						{result.model_error ? <p className="mt-2 text-xs text-amber-300">{result.model_error}</p> : null}
					</div>

					<div className="rounded-lg border border-navy-600 bg-navy-800/60 p-3">
						<p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Notes</p>
						<p className="text-sm text-slate-200">
							{overallScore === 0
								? analyzedCount === 0
									? "No methods were decompiled, so code depth remained empty. This is expected when JADX cannot recover usable method bodies from an obfuscated or optimized APK."
									: `Code-depth analysis completed across ${analyzedCount} methods, but no high-risk code-path misconfigurations were scored.`
								: result.reason || "Code-depth analysis mapped findings to code paths and exploitability scores."}
						</p>
					</div>
				</div>

				{results.length > 0 ? (
					<div className="mt-4 rounded-lg border border-navy-600 bg-navy-800/60 p-3">
						<p className="mb-3 text-xs uppercase tracking-wider text-slate-400">Code Depth Results</p>
						<div className="space-y-3">
							{results.map((item) => (
								<div key={item.finding_id} className="rounded-md border border-navy-600 bg-slate-950/40 p-3">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<p className="text-sm font-semibold text-slate-100">{item.finding_id}</p>
										<span className="rounded-full border border-[var(--ds-border-subtle)] px-2 py-0.5 text-xs text-cyan-200">
											{item.exploitability} · {Math.round(item.confidence * 100)}%
										</span>
									</div>
									<p className="mt-2 text-sm text-slate-300">Attack vector: {item.attack_vector}</p>
									<p className="mt-1 text-xs text-slate-400">
										Source: {analysisSourceLabel(item.analysis_source)}{item.hardcoded_secret_detected ? " · secret detected" : ""}
									</p>
									{item.code_analyzed ? (
										<pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-black/30 p-2 text-[11px] leading-5 text-slate-300">
											{item.code_analyzed}
										</pre>
									) : null}
								</div>
							))}
						</div>
					</div>
				) : null}
			</div>
		</section>
	);
}

function Metric({ label, value }: { label: string; value: string }): React.JSX.Element {
	return (
		<div className="rounded-lg border border-navy-600 bg-navy-800/50 px-3 py-2">
			<p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
			<p className="mt-1 font-mono text-lg font-semibold text-slate-100">{value}</p>
		</div>
	);
}
