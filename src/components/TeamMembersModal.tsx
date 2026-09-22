import React, { useState } from "react";
import { X, Plus, Trash2, Shield, ShieldCheck, Eye } from "lucide-react";
import { cn } from "../lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  joinedDate: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const roleIcons: Record<string, React.ReactNode> = {
  Admin: <ShieldCheck className="h-3.5 w-3.5" />,
  Editor: <Shield className="h-3.5 w-3.5" />,
  Viewer: <Eye className="h-3.5 w-3.5" />,
};

const roleColors: Record<string, string> = {
  Admin: "bg-red-500/10 text-red-300 border-red-500/20",
  Editor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Viewer: "bg-slate-500/10 text-slate-300 border-slate-500/20",
};

export function TeamMembersModal({ isOpen, onClose }: Props): React.JSX.Element | null {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      joinedDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Editor",
      joinedDate: "2024-02-20",
    },
    {
      id: "3",
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "Viewer",
      joinedDate: "2024-03-10",
    },
  ]);

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"Admin" | "Editor" | "Viewer">("Viewer");

  const handleAddMember = () => {
    if (newEmail.trim()) {
      const newMember: TeamMember = {
        id: String(members.length + 1),
        name: newEmail.split("@")[0],
        email: newEmail,
        role: newRole,
        joinedDate: new Date().toISOString().split("T")[0],
      };
      setMembers([...members, newMember]);
      setNewEmail("");
      setNewRole("Viewer");
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-xl border border-[var(--ds-border-default)] bg-navy-800 p-6 shadow-panel animate-slide-up">
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between border-b border-[var(--ds-border-default)] pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
              Access Control
            </p>
            <h2 className="text-base font-semibold text-slate-100 font-heading">
              Manage Team Members
            </h2>
          </div>
          <button
            data-testid="team-modal-close-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700 text-slate-400 transition hover:bg-navy-600 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ADD MEMBER FORM */}
        <div className="mb-6 rounded-xl border border-[var(--ds-border-default)] bg-navy-750/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-200 font-heading">
            Add New Team Member
          </h3>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              data-testid="team-modal-email-input"
              type="email"
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--ds-border-default)] bg-navy-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-cyan-400"
            />
            <select
              data-testid="team-modal-role-select"
              value={newRole}
              onChange={(e) =>
                setNewRole(e.target.value as "Admin" | "Editor" | "Viewer")
              }
              className="rounded-lg border border-[var(--ds-border-default)] bg-navy-800 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-cyan-400"
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
            <button
              data-testid="team-modal-add-btn"
              onClick={handleAddMember}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 px-4 py-2 text-xs font-semibold text-navy-900 transition hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {/* MEMBERS LIST */}
        <div className="mb-4 max-h-96 overflow-y-auto scrollbar-thin">
          {members && members.length > 0 ? (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--ds-border-default)] bg-navy-750/30 p-4 transition hover:border-[var(--ds-border-hover)]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-xs font-semibold text-slate-300">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 font-heading">
                          {member.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-600">
                      Joined: {member.joinedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold", roleColors[member.role])}
                    >
                      {roleIcons[member.role]}
                      {member.role}
                    </span>
                    {member.role !== "Admin" && (
                      <button
                        data-testid={`team-modal-remove-${member.id}-btn`}
                        onClick={() => handleRemoveMember(member.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-700 text-red-400 transition hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No team members
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-[var(--ds-border-default)] pt-4">
          <button
            data-testid="team-modal-close-bottom-btn"
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
