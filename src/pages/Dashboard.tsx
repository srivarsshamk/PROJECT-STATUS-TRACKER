import { useMemo, useState } from "react";
import { LayoutDashboard, FolderKanban, Users, FileText } from "lucide-react";
import { useProgramStore } from "@/store/programStore";
import { useTeamStore } from "@/store/teamStore";
import { useUpdateStore } from "@/store/updateStore";
import { StatCard } from "@/components/StatCard";
import { RagBadge } from "@/components/RagBadge";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RagCode } from "@/types";

const Dashboard = () => {
  const programs = useProgramStore((s) => s.programs);
  const teams = useTeamStore((s) => s.teams);
  const updates = useUpdateStore((s) => s.updates);
  const getProgram = useProgramStore((s) => s.getProgram);
  const getTeam = useTeamStore((s) => s.getTeam);

  // Filters
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterRag, setFilterRag] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    let result = [...updates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filterProgram !== "all") result = result.filter((u) => u.programId === Number(filterProgram));
    if (filterTeam !== "all") result = result.filter((u) => u.teamId === Number(filterTeam));
    if (filterRag !== "all") result = result.filter((u) => u.ragCode === filterRag);
    if (dateFrom) result = result.filter((u) => u.createdAt >= dateFrom);
    if (dateTo) result = result.filter((u) => u.createdAt <= dateTo + "T23:59:59Z");
    return result;
  }, [updates, filterProgram, filterTeam, filterRag, dateFrom, dateTo]);

  // Count recent (last 7 days)
  const recentCount = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return updates.filter((u) => new Date(u.createdAt) >= cutoff).length;
  }, [updates]);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Programs" value={programs.length} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard title="Teams" value={teams.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Total Updates" value={updates.length} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Last 7 Days" value={recentCount} icon={<LayoutDashboard className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.programName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.teamName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRag} onValueChange={setFilterRag}>
              <SelectTrigger><SelectValue placeholder="RAG Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="RED">Red</SelectItem>
                <SelectItem value="AMBER">Amber</SelectItem>
                <SelectItem value="GREEN">Green</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
          </div>
        </CardContent>
      </Card>

      {/* Updates table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Latest Updates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No updates found" description="Try adjusting your filters." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="hidden md:table-cell">Update</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell><RagBadge code={u.ragCode} /></TableCell>
                      <TableCell className="font-medium">{getProgram(u.programId)?.programName ?? "—"}</TableCell>
                      <TableCell>{getTeam(u.teamId)?.teamName ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{u.updateText}</TableCell>
                      <TableCell>{u.updatedBy}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
