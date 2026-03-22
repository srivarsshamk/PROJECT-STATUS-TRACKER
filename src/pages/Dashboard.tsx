import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, FolderKanban, Users, FileText, TrendingUp } from "lucide-react";
import { programApi } from "@/api/programApi";
import { teamApi } from "@/api/teamApi";
import { updateApi } from "@/api/updateApi";
import { Program, Team } from "@/types";
import { useThemeStore } from "@/store/themeStore";
import { StatCard } from "@/components/StatCard";
import { RagBadge } from "@/components/RagBadge";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface UpdateItem {
  id: number;
  status: string;
  programName: string;
  teamName: string;
  description: string;
  updatedBy: string;
  date: string;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  date: string;
  updates: number;
}

interface ProgramData {
  name: string;
  updates: number;
}

interface TeamData {
  name: string;
  updates: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { dark } = useThemeStore();

  // Theme-aware colors
  const themeColors = {
    text: dark ? "#e5e7eb" : "#1f2937",
    textMuted: dark ? "#9ca3af" : "#6b7280",
    grid: dark ? "#374151" : "#e5e7eb",
    tooltip: dark ? "#1f2937" : "#ffffff",
    tooltipBorder: dark ? "#4b5563" : "#e5e7eb",
  };

  // Data states
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [allUpdates, setAllUpdates] = useState<UpdateItem[]>([]);

  // Chart data states
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [programData, setProgramData] = useState<ProgramData[]>([]);
  const [teamData, setTeamData] = useState<TeamData[]>([]);

  // Filter states
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterRag, setFilterRag] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [programsData, teamsData, updatesData] = await Promise.all([
        programApi.getAllPrograms(),
        teamApi.getTeams(),
        updateApi.getUpdates(),
      ]);
      setPrograms(programsData);
      setTeams(teamsData);
      setUpdates(updatesData);
      setAllUpdates(updatesData);

      // Transform data for charts
      transformChartData(updatesData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Transform updates data for charts
  const transformChartData = (updatesData: UpdateItem[]) => {
    // Status distribution
    const statusCounts = updatesData.reduce(
      (acc, u) => {
        acc[u.status] = (acc[u.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const statusColors: Record<string, string> = {
      GREEN: "#22c55e",
      AMBER: "#f59e0b",
      RED: "#ef4444",
    };

    const statusChartData: StatusData[] = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: statusColors[status] || "#888",
    }));
    setStatusData(statusChartData);

    // Updates trend by date
    const trendCounts = updatesData.reduce(
      (acc, u) => {
        acc[u.date] = (acc[u.date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const trendChartData: TrendData[] = Object.entries(trendCounts)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        updates: count,
      }));
    setTrendData(trendChartData);

    // Program performance
    const programCounts = updatesData.reduce(
      (acc, u) => {
        acc[u.programName] = (acc[u.programName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const programChartData: ProgramData[] = Object.entries(programCounts)
      .map(([name, count]) => ({ name, updates: count }))
      .sort((a, b) => b.updates - a.updates)
      .slice(0, 5);
    setProgramData(programChartData);

    // Team workload
    const teamCounts = updatesData.reduce(
      (acc, u) => {
        acc[u.teamName] = (acc[u.teamName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const teamChartData: TeamData[] = Object.entries(teamCounts)
      .map(([name, count]) => ({ name, updates: count }))
      .sort((a, b) => b.updates - a.updates)
      .slice(0, 5);
    setTeamData(teamChartData);
  };

  // Handle filter changes
  useEffect(() => {
    handleFilterChange();
  }, [filterProgram, filterTeam, filterRag, dateFrom, dateTo]);

  const handleFilterChange = async () => {
    try {
      setFiltering(true);
      setError(null);

      // Check if all filters are empty
      const hasFilters =
        filterProgram !== "all" ||
        filterTeam !== "all" ||
        filterRag !== "all" ||
        dateFrom ||
        dateTo;

      if (!hasFilters) {
        // No filters, use all updates
        setUpdates(allUpdates);
      } else {
        // Apply filters
        const selectedProgram = filterProgram !== "all" ? programs.find(p => String(p.id) === filterProgram)?.name : undefined;
        const selectedTeam = filterTeam !== "all" ? teams.find(t => String(t.id) === filterTeam)?.name : undefined;
        const selectedStatus = filterRag !== "all" ? filterRag : undefined;

        const data = await updateApi.filterUpdates({
          status: selectedStatus,
          programName: selectedProgram,
          teamName: selectedTeam,
          startDate: dateFrom,
          endDate: dateTo,
        });
        setUpdates(data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to filter updates';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setFiltering(false);
    }
  };

  // Calculate summary statistics
  const recentCount = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return allUpdates.filter((u) => new Date(u.date) >= cutoff).length;
  }, [allUpdates]);

  // Sort updates by date descending
  const displayedUpdates = useMemo(() => {
    return [...updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [updates]);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Programs" value={programs.length} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard title="Teams" value={teams.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Total Updates" value={allUpdates.length} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Last 7 Days" value={recentCount} icon={<LayoutDashboard className="h-5 w-5" />} />
      </div>

      {/* Charts Section */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Distribution Pie Chart */}
          <Card className={dark ? "bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition-shadow" : "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-1 h-4 bg-yellow-400 rounded-full" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: themeColors.tooltip,
                        border: `1px solid ${themeColors.tooltipBorder}`,
                        color: themeColors.text,
                        borderRadius: "6px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No status data available</p>
              )}
            </CardContent>
          </Card>

          {/* Updates Trend Line Chart */}
          <Card className={dark ? "bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition-shadow" : "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                Updates Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                    <XAxis dataKey="date" stroke={themeColors.text} style={{ fontSize: "12px" }} />
                    <YAxis stroke={themeColors.text} style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: themeColors.tooltip,
                        border: `1px solid ${themeColors.tooltipBorder}`,
                        color: themeColors.text,
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="updates"
                      stroke="#f59e0b"
                      dot={{ fill: "#f59e0b", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No trend data available</p>
              )}
            </CardContent>
          </Card>

          {/* Program Performance Bar Chart */}
          <Card className={dark ? "bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition-shadow lg:col-span-2" : "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow lg:col-span-2"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-yellow-400" />
                Program Performance (Top 5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {programData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={programData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12, fill: themeColors.text }}
                      stroke={themeColors.text}
                    />
                    <YAxis stroke={themeColors.text} style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: themeColors.tooltip,
                        border: `1px solid ${themeColors.tooltipBorder}`,
                        color: themeColors.text,
                        borderRadius: "6px",
                      }}
                    />
                    <Bar dataKey="updates" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No program data available</p>
              )}
            </CardContent>
          </Card>

          {/* Team Workload Bar Chart */}
          <Card className={dark ? "bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition-shadow lg:col-span-2" : "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow lg:col-span-2"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                Team Workload (Top 5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12, fill: themeColors.text }}
                      stroke={themeColors.text}
                    />
                    <YAxis stroke={themeColors.text} style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: themeColors.tooltip,
                        border: `1px solid ${themeColors.tooltipBorder}`,
                        color: themeColors.text,
                        borderRadius: "6px",
                      }}
                    />
                    <Bar dataKey="updates" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No team data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className={dark ? "bg-slate-900" : "bg-white"}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={filterProgram} onValueChange={setFilterProgram} disabled={filtering}>
              <SelectTrigger><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTeam} onValueChange={setFilterTeam} disabled={filtering}>
              <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRag} onValueChange={setFilterRag} disabled={filtering}>
              <SelectTrigger><SelectValue placeholder="RAG Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="RED">Red</SelectItem>
                <SelectItem value="AMBER">Amber</SelectItem>
                <SelectItem value="GREEN">Green</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" disabled={filtering} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" disabled={filtering} />
          </div>
        </CardContent>
      </Card>

      {/* Updates table */}
      <Card className={dark ? "bg-slate-900" : "bg-white"}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Latest Updates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Loading updates...
            </div>
          ) : displayedUpdates.length === 0 ? (
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
                  {displayedUpdates.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell><RagBadge code={u.status as "RED" | "AMBER" | "GREEN"} /></TableCell>
                      <TableCell className="font-medium">{u.programName}</TableCell>
                      <TableCell>{u.teamName}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{u.description}</TableCell>
                      <TableCell>{u.updatedBy}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(u.date).toLocaleDateString()}
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
