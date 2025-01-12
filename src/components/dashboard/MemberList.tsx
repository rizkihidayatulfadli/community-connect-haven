import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const members = [
  { 
    id: 1, 
    name: "John Doe", 
    email: "john@example.com", 
    status: "active",
    activeUntil: "2024-05-01" 
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    status: "pending",
    activeUntil: null 
  },
  { 
    id: 3, 
    name: "Mike Johnson", 
    email: "mike@example.com", 
    status: "active",
    activeUntil: "2024-04-15" 
  },
];

export function MemberList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
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
  );
}