import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Edit, Users, Building2, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PERMISSIONS = [
  { id: "view_dashboard", label: "Voir le tableau de bord", category: "Général" },
  { id: "manage_users", label: "Gérer les utilisateurs", category: "Utilisateurs" },
  { id: "manage_planteurs", label: "Gérer les planteurs", category: "Planteurs" },
  { id: "manage_plantations", label: "Gérer les plantations", category: "Plantations" },
  { id: "manage_paiements", label: "Gérer les paiements", category: "Paiements" },
  { id: "validate_documents", label: "Valider les documents", category: "Documents" },
  { id: "view_reports", label: "Voir les rapports", category: "Rapports" },
  { id: "manage_commissions", label: "Gérer les commissions", category: "Finances" },
  { id: "manage_tickets", label: "Gérer les tickets", category: "Support" },
  { id: "manage_settings", label: "Gérer les paramètres", category: "Paramètres" },
  { id: "view_analytics", label: "Voir les statistiques avancées", category: "Rapports" },
  { id: "export_data", label: "Exporter les données", category: "Général" },
];

// Unified roles - technico_commercial replaces commercial and technicien
const ROLES_DEFINITIONS = [
  { 
    role: "super_admin",
    nom: "Super Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    color: "destructive",
    niveau: 1
  },
  { 
    role: "pdg",
    nom: "PDG",
    description: "Direction générale et vision stratégique",
    color: "default",
    niveau: 2
  },
  { 
    role: "directeur_general",
    nom: "Directeur Général",
    description: "Gestion opérationnelle globale",
    color: "default",
    niveau: 3
  },
  { 
    role: "directeur_technico_commercial",
    nom: "Directeur Technico-Commercial",
    description: "Direction de l'activité technico-commerciale",
    color: "secondary",
    niveau: 4
  },
  { 
    role: "responsable_operations",
    nom: "Responsable Opérations",
    description: "Gestion des opérations terrain",
    color: "secondary",
    niveau: 5
  },
  { 
    role: "responsable_service_client",
    nom: "Responsable Service Client",
    description: "Gestion de la relation client",
    color: "secondary",
    niveau: 5
  },
  { 
    role: "responsable_zone",
    nom: "Responsable de Zone",
    description: "Gestion d'une zone géographique",
    color: "outline",
    niveau: 6
  },
  { 
    role: "chef_equipe",
    nom: "Chef d'Équipe",
    description: "Encadrement d'une équipe terrain",
    color: "outline",
    niveau: 7
  },
  { 
    role: "technico_commercial",
    nom: "Technico-Commercial",
    description: "Acquisition, suivi technique et commercial des planteurs",
    color: "outline",
    niveau: 8
  },
  { 
    role: "agent_service_client",
    nom: "Agent Service Client",
    description: "Support et assistance client",
    color: "outline",
    niveau: 8
  },
];

const GestionRoles = () => {
  const { toast } = useToast();
  const [roles] = useState(ROLES_DEFINITIONS);

  const groupedPermissions = PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof PERMISSIONS>);

  const getNiveauLabel = (niveau: number) => {
    switch(niveau) {
      case 1: return "Direction Suprême";
      case 2: case 3: return "Direction";
      case 4: case 5: return "Management";
      case 6: case 7: return "Encadrement";
      case 8: return "Opérationnel";
      default: return "Autre";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestion des Rôles et Permissions
              </CardTitle>
              <CardDescription>
                Gérer les rôles utilisateurs et leurs permissions (Rôles unifiés Technico-Commercial)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.role}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={role.color as any}>{role.nom}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getNiveauLabel(role.niveau)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{role.description}</span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Voir les permissions
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Permissions - {role.nom}</DialogTitle>
                              <DialogDescription>
                                Configuration des permissions pour ce rôle
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className="space-y-2">
                                  <h4 className="font-medium text-sm">{category}</h4>
                                  <div className="space-y-2 pl-4">
                                    {perms.map((permission) => (
                                      <div key={permission.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                          id={`${role.role}-${permission.id}`}
                                          checked={role.role === "super_admin"}
                                          disabled={role.role === "super_admin"}
                                        />
                                        <label
                                          htmlFor={`${role.role}-${permission.id}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {permission.label}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={role.role === "super_admin"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Hiérarchie des Rôles - Structure Unifiée
                </CardTitle>
                <CardDescription>
                  Structure hiérarchique avec rôles Technico-Commercial (fusion Commercial + Technique)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-destructive pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-destructive" />
                      <p className="font-semibold">Direction Suprême</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Super Admin</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Direction</p>
                    </div>
                    <p className="text-sm text-muted-foreground">PDG → Directeur Général</p>
                  </div>
                  <div className="border-l-4 border-secondary pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-secondary-foreground" />
                      <p className="font-semibold">Management</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Directeur Technico-Commercial / Responsable Opérations / Responsable Service Client
                    </p>
                  </div>
                  <div className="border-l-4 border-accent pl-4 py-2">
                    <p className="font-semibold">Terrain</p>
                    <p className="text-sm text-muted-foreground">
                      Responsable de Zone → Chef d'Équipe → <span className="font-medium text-primary">Technico-Commercial</span> / Agent Service Client
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">⚠️ Note importante</h4>
                  <p className="text-sm text-amber-700">
                    Les anciens rôles "Commercial" et "Technicien" ont été fusionnés en un seul rôle 
                    <strong> "Technico-Commercial"</strong> pour une meilleure gestion des équipes terrain.
                    Ce rôle combine les responsabilités commerciales et techniques.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionRoles;
