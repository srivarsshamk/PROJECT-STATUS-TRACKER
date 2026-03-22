import { useState, useEffect, useMemo } from "react";
import { programApi } from "@/api/programApi";
import { teamApi } from "@/api/teamApi";
import { updateApi } from "@/api/updateApi";
import { Program, Team } from "@/types";
import { RagBadge } from "@/components/RagBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpdateItem {
  id: number;
  status: string;
  programName: string;
  teamName: string;
  description: string;
  updatedBy: string;
  date: string;
}

const Updates = () => {
  const { toast } = useToast();

  // Data states
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);

  // Filter states
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterRag, setFilterRag] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Create form
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    programId: "",
    teamId: "",
    status: "",
    description: "",
    updatedBy: "",
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch programs and teams on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
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

  // Handle filter changes
  useEffect(() => {
    handleFilterChange();
  }, [filterProgram, filterTeam, filterRag, dateFrom, dateTo]);

  const handleFilterChange = async () => {
    try {
      setFiltering(true);
      setError(null);

      // Check if all filters are empty (all selects are "all" and dates are empty)
      const hasFilters =
        filterProgram !== "all" ||
        filterTeam !== "all" ||
        filterRag !== "all" ||
        dateFrom ||
        dateTo;

      if (!hasFilters) {
        // No filters applied, fetch all updates
        const data = await updateApi.getUpdates();
        setUpdates(data);
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

  const handleAdd = async () => {
    if (!form.programId || !form.teamId || !form.status || !form.description.trim() || !form.updatedBy.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const selectedProgram = programs.find(p => String(p.id) === form.programId);
      const selectedTeam = teams.find(t => String(t.id) === form.teamId);

      if (!selectedProgram || !selectedTeam) {
        throw new Error('Invalid program or team selected');
      }

      await updateApi.addUpdate({
        status: form.status,
        programName: selectedProgram.name,
        teamName: selectedTeam.name,
        description: form.description.trim(),
        updatedBy: form.updatedBy.trim(),
        date: new Date().toISOString().split('T')[0],
      });

      setForm({ programId: "", teamId: "", status: "", description: "", updatedBy: "" });
      setModalOpen(false);
      toast({ title: "Update added", description: "Status update has been recorded." });

      // Refresh updates list
      await handleFilterChange();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add update';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Display updates sorted by date
  const displayedUpdates = useMemo(() => {
    return [...updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [updates]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Updates</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Update
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={filterProgram} onValueChange={setFilterProgram} disabled={filtering}>
              <SelectTrigger><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTeam} onValueChange={setFilterTeam} disabled={filtering}>
              <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
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
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} disabled={filtering} placeholder="From" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} disabled={filtering} placeholder="To" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Loading updates...
            </div>
          ) : displayedUpdates.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-10 w-10" />}
              title="No updates found"
              description="Add your first update or adjust filters."
              action={<Button onClick={() => setModalOpen(true)}>Add Update</Button>}
            />
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
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(u.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Update</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Program</Label>
                <Select value={form.programId} onValueChange={(v) => setForm({ ...form, programId: v })} disabled={submitting}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Team</Label>
                <Select value={form.teamId} onValueChange={(v) => setForm({ ...form, teamId: v })} disabled={submitting}>
                  <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>RAG Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })} disabled={submitting}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GREEN">Green</SelectItem>
                  <SelectItem value="AMBER">Amber</SelectItem>
                  <SelectItem value="RED">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Updated By</Label>
              <Input
                value={form.updatedBy}
                onChange={(e) => setForm({ ...form, updatedBy: e.target.value })}
                placeholder="Your name"
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Update Text</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the current status…"
                rows={3}
                disabled={submitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={!form.programId || !form.teamId || !form.status || !form.description.trim() || !form.updatedBy.trim() || submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Updates;
