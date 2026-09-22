import React, { useState } from "react";
import { Settings, Bell, Shield, Users, Save, SlidersHorizontal } from "lucide-react";
import { TeamMembersModal } from "../components/TeamMembersModal";
import { GlassPanel } from "../components/shared/GlassPanel";

export default function SettingsPage(): React.JSX.Element {
  const [autoScan, setAutoScan] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  return (
    <div className="animate-fade-in space-y-6">
      {/* HEADER */}
      <GlassPanel className="rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
              Configuration
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-100 font-heading">Settings</h1>
            <p className="mt-1 text-sm text-slate-400">
              Configure compliance monitoring preferences
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10">
            <Settings className="h-7 w-7 text-cyan-400" />
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SCAN SETTINGS */}
        <GlassPanel className="rounded-xl p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-100 font-heading">
            <Shield className="h-5 w-5 text-cyan-400" />
            Scan Settings
          </h2>
          <div className="space-y-3">
            <SettingToggle
              label="Automatic Scans"
              description="Automatically scan apps when new APKs are uploaded"
              enabled={autoScan}
              onChange={setAutoScan}
            />
            <SettingToggle
              label="Deep Analysis"
              description="Enable advanced DPDP section mapping and behavior analysis"
              enabled={true}
              onChange={() => {}}
            />
            <SettingToggle
              label="SDK Threat Detection"
              description="Monitor third-party SDKs for known DPDP violations"
              enabled={true}
              onChange={() => {}}
            />
          </div>
        </GlassPanel>

        {/* NOTIFICATION SETTINGS */}
        <GlassPanel className="rounded-xl p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-100 font-heading">
            <Bell className="h-5 w-5 text-cyan-400" />
            Notifications
          </h2>
          <div className="space-y-3">
            <SettingToggle
              label="Email Notifications"
              description="Send alerts when critical compliance issues are detected"
              enabled={emailNotifications}
              onChange={setEmailNotifications}
            />
            <SettingToggle
              label="Weekly Compliance Report"
              description="Receive a summary of portfolio compliance status every Monday"
              enabled={weeklyReport}
              onChange={setWeeklyReport}
            />
            <SettingToggle
              label="Violation Alerts"
              description="Immediate notification on new DPDP violations"
              enabled={true}
              onChange={() => {}}
            />
          </div>
        </GlassPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* COMPLIANCE PREFERENCES */}
        <GlassPanel className="rounded-xl p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-100 font-heading">
            <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
            Compliance Preferences
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400">
                Compliance Threshold
              </label>
              <select data-testid="settings-threshold-select" className="mt-2 w-full rounded-lg border border-[var(--ds-border-default)] bg-navy-800 px-3 py-2 text-sm text-slate-300 outline-none transition focus:border-cyan-400">
                <option>Grade A (80+ score)</option>
                <option>Grade B (60-79 score)</option>
                <option>Grade C (40-59 score)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400">
                DPDP Sections to Monitor
              </label>
              <div className="mt-3 space-y-2">
                {[
                  "Section 4 - Principle of Storage",
                  "Section 5 - Principle of Processing",
                  "Section 6 - Principle of Transparency",
                  "Section 8 - Rights of User",
                  "Section 9 - Grievance",
                  "Section 10 - Accountability",
                  "Section 16 - Data Protection",
                ].map((label) => (
                  <CheckboxSetting key={label} label={label} />
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* TEAM & ACCESS */}
        <GlassPanel className="rounded-xl p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-100 font-heading">
            <Users className="h-5 w-5 text-cyan-400" />
            Team & Access
          </h2>
          <p className="mb-4 text-sm text-slate-400">
            Manage team members and their access levels
          </p>
          <button
            data-testid="settings-manage-team-btn"
            onClick={() => setTeamModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--ds-border-default)] bg-cyan-500/5 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/15"
          >
            <Users className="h-4 w-4" />
            Manage Team Members
          </button>
        </GlassPanel>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex items-center justify-between rounded-xl border border-[var(--ds-border-default)] bg-navy-700/60 p-4">
        <p className="text-xs text-slate-500">
          Changes are saved locally in your browser
        </p>
        <div className="flex gap-3">
          <button data-testid="settings-cancel-btn" className="rounded-lg border border-[var(--ds-border-default)] bg-navy-800/60 px-5 py-2 text-xs font-semibold text-slate-300 transition hover:border-[var(--ds-border-hover)] hover:bg-navy-800">
            Cancel
          </button>
          <button data-testid="settings-save-btn" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 px-5 py-2 text-xs font-semibold text-navy-900 transition hover:shadow-lg hover:shadow-cyan-500/20">
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>

      <TeamMembersModal isOpen={teamModalOpen} onClose={() => setTeamModalOpen(false)} />
    </div>
  );
}

function SettingToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--ds-border-default)] bg-navy-800/40 p-4 transition hover:border-[var(--ds-border-hover)]">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <label className="relative ml-4 inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          data-testid={`settings-toggle-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className="peer sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="peer h-6 w-11 rounded-full bg-navy-600 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-navy-300 after:transition-all after:content-[''] peer-checked:bg-cyan-500/50 peer-checked:after:translate-x-full peer-checked:after:bg-cyan-300" />
      </label>
    </div>
  );
}

function CheckboxSetting({ label }: { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--ds-border-default)] bg-navy-800/30 px-3 py-2 transition hover:border-[var(--ds-border-hover)]">
      <input
        type="checkbox"
        data-testid={`settings-checkbox-${label.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-")}`}
        defaultChecked
        className="h-4 w-4 rounded border-[var(--ds-border-default)] bg-navy-700 text-cyan-400 focus:ring-cyan-400/30"
      />
      <span className="text-xs text-slate-400">{label}</span>
    </label>
  );
}
