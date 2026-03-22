import { useState, useEffect } from "react";
import { useUpdateStore } from "@/store/updateStore";
import { useProgramStore } from "@/store/programStore";
import { Team } from "@/types";
import { teamApi } from "@/api/teamApi";
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
  const updates = useUpdateStore((s) => s.updates);
  const getProgram = useProgramStore((s) => s.getProgram);
  const { toast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Handle search with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamApi.getTeams();
      setTeams(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch teams';
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

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      if (search.trim() === "") {
        const data = await teamApi.getTeams();
        setTeams(data);
      } else {
        const data = await teamApi.searchTeams(search);
        setTeams(data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to search teams';
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

  const handleAdd = async () => {
    if (!newName.trim()) return;

    try {
      await teamApi.addTeam(newName.trim());
      setNewName("");
      setModalOpen(false);
      toast({ title: "Team created", description: `"${newName.trim()}" has been added.` });
      // Refresh the team list
      await fetchTeams();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add team';
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

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
          {loading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
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
                {teams.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => setSelectedId(t.id)}>
                    <TableCell className="font-mono text-muted-foreground">{t.id}</TableCell>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-right">{t.updates ?? 0}</TableCell>
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
          <DialogHeader><DialogTitle>{teams.find((t) => t.id === selectedId)?.name}</DialogTitle></DialogHeader>
          {(() => {
            const relatedUpdates = selectedId
              ? updates.filter((u) => u.teamId === selectedId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              : [];
            return relatedUpdates.length === 0 ? (
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
                        <TableCell>{getProgram(u.programId)?.name ?? "—"}</TableCell>
                        <TableCell className="max-w-xs truncate">{u.updateText}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
