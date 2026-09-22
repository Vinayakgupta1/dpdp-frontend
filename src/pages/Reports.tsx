import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { cn } from "../lib/utils";
import { GradeBadge } from "../components/GradeBadge";
import { getAllScans } from "../services/api";

export default function Reports(): React.JSX.Element {
  const { data: scans = [], isLoading } = useQuery({
    queryKey: ["reports-list"],
    queryFn: getAllScans
  });

  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [dpdpFilter, setDpdpFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return scans.filter((scan) => {
      const searchMatch =
        scan.app_name.toLowerCase().includes(query.toLowerCase()) ||
        scan.package_name.toLowerCase().includes(query.toLowerCase());
      const gradeMatch = gradeFilter === "ALL" || scan.grade === gradeFilter;
      const dpdpMatch =
        dpdpFilter === "ALL" ||
        (dpdpFilter === "COMPLIANT" && scan.dpdp_compliant) ||
        (dpdpFilter === "NON_COMPLIANT" && !scan.dpdp_compliant);
      return searchMatch && gradeMatch && dpdpMatch;
    });
  }, [scans, query, gradeFilter, dpdpFilter]);

  if (isLoading) {
    return <div className="text-slate-300">Loading reports...</div>;
  }

  return (
    <section className="space-y-4 rounded-xl border border-[var(--ds-border-default)] bg-navy-700 p-5 shadow-panel">
      <div className="flex flex-wrap gap-3">
        <input
          data-testid="reports-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search app or package"
          className="min-w-52 rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm transition focus:border-cyan-400 focus:outline-none"
        />
        <select
          data-testid="reports-grade-select"
          value={gradeFilter}
          onChange={(event) => setGradeFilter(event.target.value)}
          className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm transition focus:border-cyan-400 focus:outline-none"
        >
          <option value="ALL">All Grades</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <select
          data-testid="reports-dpdp-select"
          value={dpdpFilter}
          onChange={(event) => setDpdpFilter(event.target.value)}
          className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm transition focus:border-cyan-400 focus:outline-none"
        >
          <option value="ALL">All DPDP States</option>
          <option value="COMPLIANT">Compliant</option>
          <option value="NON_COMPLIANT">Non-Compliant</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm text-slate-300">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="pb-3">App Name</th>
              <th className="pb-3">Package</th>
              <th className="pb-3">Grade</th>
              <th className="pb-3">Score</th>
              <th className="pb-3">DPDP</th>
              <th className="pb-3">Scanned</th>
              <th className="pb-3">View</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((scan) => (
              <tr key={scan.scan_id} className="border-t border-navy-600 transition hover:bg-cyan-500/5">
                <td className="py-3">{scan.app_name}</td>
                <td className="py-3 font-mono text-xs">{scan.package_name}</td>
                <td className="py-3">
                  <GradeBadge grade={scan.grade} />
                </td>
                <td className="py-3 font-mono">{scan.score}</td>
                <td className="py-3">
                  <span className={cn(scan.dpdp_compliant ? "text-emerald-300" : "text-red-300")}>
                    {scan.dpdp_compliant ? "Compliant" : "Non-Compliant"}
                  </span>
                </td>
                <td className="py-3">{new Date(scan.scan_time).toLocaleString()}</td>
                <td className="py-3">
                  {String(scan.status).toLowerCase() === "completed" ? (
                    <Link to={`/report/${scan.scan_id}`} data-testid={`reports-open-link-${scan.scan_id}`} className="text-teal-400 hover:text-teal-300">
                      Open
                    </Link>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
