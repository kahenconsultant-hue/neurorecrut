"use client";

import { Bar, BarChart, CartesianGrid, Legend, Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ReportLike = {
  matchingScore: number;
  globalScore: number;
  coherenceIndex: number;
  sincerityIndex: number;
  recommendation: string;
  candidate: { firstName: string | null; lastName: string | null; email: string };
  analysisJson: unknown;
};

function nameOf(report: ReportLike) {
  return `${report.candidate.firstName ?? ""} ${report.candidate.lastName ?? ""}`.trim() || report.candidate.email;
}

export function CandidateComparisonCharts({ reports }: { reports: ReportLike[] }) {
  const barData = reports.map((report) => ({
    name: nameOf(report),
    matching: Math.round(report.matchingScore),
    global: Math.round(report.globalScore),
    coherence: Math.round(report.coherenceIndex)
  }));

  const radarSource = reports[0]?.analysisJson as { block_scores?: Record<string, number> } | undefined;
  const radarData = Object.entries(radarSource?.block_scores ?? {}).map(([subject, score]) => ({
    subject,
    score
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="panel p-5">
        <h2 className="font-semibold text-ink">Comparaison candidats</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="matching" fill="#2A9D8F" name="Matching" />
              <Bar dataKey="global" fill="#293241" name="Global" />
              <Bar dataKey="coherence" fill="#D95D39" name="Cohérence" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel p-5">
        <h2 className="font-semibold text-ink">Radar du meilleur candidat</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar dataKey="score" stroke="#2A9D8F" fill="#2A9D8F" fillOpacity={0.25} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
