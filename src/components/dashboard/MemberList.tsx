import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Instagram } from "lucide-react";

const members = [
  { 
    id: 1, 
    name: "John Doe", 
    email: "john@example.com", 
    status: "active",
    activeUntil: "2024-05-01",
    birthday: "1990-05-15",
    instagram: "johndoe"
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    status: "pending",
    activeUntil: null,
    birthday: "1992-08-22",
    instagram: "janesmith"
  },
  { 
    id: 3, 
    name: "Mike Johnson", 
    email: "mike@example.com", 
    status: "active",
    activeUntil: "2024-04-15",
    birthday: "1988-12-03",
    instagram: "mikej"
  },
];

export function MemberList() {
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Community Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div 
                key={member.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                    <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.activeUntil && (
                      <p className="text-sm text-muted-foreground">
                        Active until: {new Date(member.activeUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={member.status === "active" ? "default" : "secondary"}>
                  {member.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`} />
                  <AvatarFallback>{selectedMember.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <div>
                  <p className="font-medium">Membership Status</p>
                  <Badge variant={selectedMember.status === "active" ? "default" : "secondary"} className="mt-1">
                    {selectedMember.status}
                  </Badge>
                </div>
                {selectedMember.activeUntil && (
                  <div>
                    <p className="font-medium">Active Until</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedMember.activeUntil).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="font-medium">Birthday</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedMember.birthday).toLocaleDateString()}
                  </p>
                </div>
                {selectedMember.instagram && (
                  <div>
                    <p className="font-medium">Instagram</p>
                    <a 
                      href={`https://instagram.com/${selectedMember.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      @{selectedMember.instagram}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}