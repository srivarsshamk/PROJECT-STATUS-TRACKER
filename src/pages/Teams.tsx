import { useState } from "react";
import { useTeamStore } from "@/store/teamStore";
import { useUpdateStore } from "@/store/updateStore";
import { useProgramStore } from "@/store/programStore";
import { RagBadge } from "@/components/RagBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Teams = () => {
  const { teams, addTeam } = useTeamStore();
  const updates = useUpdateStore((s) => s.updates);
  const getProgram = useProgramStore((s) => s.getProgram);
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = teams.filter((t) =>
    t.teamName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    addTeam(newName.trim());
    setNewName("");
    setModalOpen(false);
    toast({ title: "Team created", description: `"${newName.trim()}" has been added.` });
  };

  const selectedTeam = teams.find((t) => t.id === selectedId);
  const relatedUpdates = selectedId
    ? updates.filter((u) => u.teamId === selectedId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search teams…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Team
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<Users className="h-10 w-10" />} title="No teams yet" description="Create your first team to get started." action={<Button onClick={() => setModalOpen(true)}>Add Team</Button>} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead className="text-right">Updates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => setSelectedId(t.id)}>
                    <TableCell className="font-mono text-muted-foreground">{t.id}</TableCell>
                    <TableCell className="font-medium">{t.teamName}</TableCell>
                    <TableCell className="text-right">{updates.filter((u) => u.teamId === t.id).length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Team</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input id="team-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Backend Engineering" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail modal */}
      <Dialog open={selectedId !== null} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedTeam?.teamName}</DialogTitle></DialogHeader>
          {relatedUpdates.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No updates for this team yet.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Update</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedUpdates.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell><RagBadge code={u.ragCode} /></TableCell>
                      <TableCell>{getProgram(u.programId)?.programName ?? "—"}</TableCell>
                      <TableCell className="max-w-xs truncate">{u.updateText}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
