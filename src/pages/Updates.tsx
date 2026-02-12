import { useMemo, useState } from "react";
import { useUpdateStore } from "@/store/updateStore";
import { useProgramStore } from "@/store/programStore";
import { useTeamStore } from "@/store/teamStore";
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
import { RagCode } from "@/types";

const Updates = () => {
  const { updates, addUpdate } = useUpdateStore();
  const programs = useProgramStore((s) => s.programs);
  const teams = useTeamStore((s) => s.teams);
  const getProgram = useProgramStore((s) => s.getProgram);
  const getTeam = useTeamStore((s) => s.getTeam);
  const { toast } = useToast();

  // Filters
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterRag, setFilterRag] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Create form
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ programId: "", teamId: "", ragCode: "" as string, updateText: "", updatedBy: "" });

  const filtered = useMemo(() => {
    let result = [...updates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filterProgram !== "all") result = result.filter((u) => u.programId === Number(filterProgram));
    if (filterTeam !== "all") result = result.filter((u) => u.teamId === Number(filterTeam));
    if (filterRag !== "all") result = result.filter((u) => u.ragCode === filterRag);
    if (dateFrom) result = result.filter((u) => u.createdAt >= dateFrom);
    if (dateTo) result = result.filter((u) => u.createdAt <= dateTo + "T23:59:59Z");
    return result;
  }, [updates, filterProgram, filterTeam, filterRag, dateFrom, dateTo]);

  const handleAdd = () => {
    if (!form.programId || !form.teamId || !form.ragCode || !form.updateText.trim() || !form.updatedBy.trim()) return;
    addUpdate({
      programId: Number(form.programId),
      teamId: Number(form.teamId),
      ragCode: form.ragCode as RagCode,
      updateText: form.updateText.trim(),
      updatedBy: form.updatedBy.trim(),
      createdAt: new Date().toISOString(),
    });
    setForm({ programId: "", teamId: "", ragCode: "", updateText: "", updatedBy: "" });
    setModalOpen(false);
    toast({ title: "Update added", description: "Status update has been recorded." });
  };

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
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.programName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.teamName}</SelectItem>)}
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
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<FileText className="h-10 w-10" />} title="No updates found" description="Add your first update or adjust filters." action={<Button onClick={() => setModalOpen(true)}>Add Update</Button>} />
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
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
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
                <Select value={form.programId} onValueChange={(v) => setForm({ ...form, programId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.programName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Team</Label>
                <Select value={form.teamId} onValueChange={(v) => setForm({ ...form, teamId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.teamName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>RAG Status</Label>
              <Select value={form.ragCode} onValueChange={(v) => setForm({ ...form, ragCode: v })}>
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
              <Input value={form.updatedBy} onChange={(e) => setForm({ ...form, updatedBy: e.target.value })} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label>Update Text</Label>
              <Textarea value={form.updateText} onChange={(e) => setForm({ ...form, updateText: e.target.value })} placeholder="Describe the current status…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.programId || !form.teamId || !form.ragCode || !form.updateText.trim() || !form.updatedBy.trim()}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Updates;
