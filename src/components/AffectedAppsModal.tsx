import React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface App {
  id: string;
  name: string;
  package: string;
  severity: string;
  status: string;
}

interface ApiApp {
  app_name: string;
  package_name: string;
  version?: string;
  severity: string;
  status: string;
}

type ModalApp = App | ApiApp;

interface Props {
  isOpen: boolean;
  sdkName: string;
  affectedApps: ModalApp[];
  onClose: () => void;
}

export function AffectedAppsModal({ isOpen, sdkName, affectedApps, onClose }: Props): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-xl border border-[var(--ds-border-default)] bg-navy-800 p-6 shadow-panel animate-slide-up">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--ds-border-default)] pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
              Affected Apps
            </p>
            <h2 className="text-base font-semibold text-slate-100 font-heading">{sdkName}</h2>
          </div>
          <button
            data-testid="affected-apps-modal-close-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700 text-slate-400 transition hover:bg-navy-600 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 max-h-96 overflow-y-auto scrollbar-thin">
          {affectedApps && affectedApps.length > 0 ? (
            <div className="space-y-2">
              {affectedApps.map((app) => (
                <div
                  key={
                    "id" in app
                      ? app.id
                      : `${app.package_name}-${app.version ?? ""}`
                  }
                  className="rounded-xl border border-[var(--ds-border-default)] bg-navy-750/50 p-4 transition hover:border-[var(--ds-border-hover)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-200 font-heading">
                        {"name" in app ? app.name : app.app_name}
                      </h3>
                      <p className="font-mono text-xs text-slate-500">
                        {"package" in app ? app.package : app.package_name}
                      </p>
                    </div>
                    <span
                      className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold", app.severity === "CRITICAL" ? "bg-red-500/10 text-red-300" : app.severity === "HIGH" ? "bg-orange-500/10 text-orange-300" : "bg-amber-500/10 text-amber-300")}
                    >
                      {app.severity}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[var(--ds-border-default)] pt-2 text-xs">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-medium text-slate-300">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No affected apps found
            </p>
          )}
        </div>

        <div className="border-t border-[var(--ds-border-default)] pt-4">
          <button
            data-testid="affected-apps-close-bottom-btn"
            onClick={onClose}
            className="w-full rounded-lg border border-[var(--ds-border-default)] bg-navy-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-navy-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
