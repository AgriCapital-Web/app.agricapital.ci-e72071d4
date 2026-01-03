import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Crown, TrendingUp, Leaf, Plus, Pencil, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Offre = Tables<'offres'>;

const getIcone = (code: string) => {
  switch (code) {
    case 'palm-elite':
      return Crown;
    case 'palm-invest':
      return TrendingUp;
    case 'terra-palm':
      return Leaf;
    default:
      return Crown;
  }
};

const getCouleur = (code: string, couleur?: string | null) => {
  if (couleur) {
    return {
      text: `text-[${couleur}]`,
      bg: `bg-[${couleur}]/10`,
      border: `border-[${couleur}]/30`
    };
  }
  switch (code) {
    case 'palm-elite':
      return { text: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'palm-invest':
      return { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
    case 'terra-palm':
      return { text: 'text-emerald-700', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    default:
      return { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
  }
};

const Offres = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOffre, setEditOffre] = useState<Offre | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: offres, isLoading } = useQuery({
    queryKey: ['offres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offres')
        .select('*')
        .order('ordre', { ascending: true });
      
      if (error) throw error;
      return data as Offre[];
    }
  });

  const updateOffreMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Offre> }) => {
      const { error } = await supabase
        .from('offres')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offres'] });
      toast({
        title: "Offre mise à jour",
        description: "Les modifications ont été enregistrées avec succès."
      });
      setIsDialogOpen(false);
      setEditOffre(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'offre."
      });
      console.error(error);
    }
  });

  const toggleOffreMutation = useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { error } = await supabase
        .from('offres')
        .update({ actif })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offres'] });
    }
  });

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant);
  };

  const handleSave = () => {
    if (!editOffre) return;
    updateOffreMutation.mutate({
      id: editOffre.id,
      updates: {
        nom: editOffre.nom,
        description: editOffre.description,
        montant_da_par_ha: editOffre.montant_da_par_ha,
        contribution_mensuelle_par_ha: editOffre.contribution_mensuelle_par_ha,
        couleur: editOffre.couleur,
        avantages: editOffre.avantages
      }
    });
  };

  const parseAvantages = (avantages: any): string[] => {
    if (Array.isArray(avantages)) return avantages;
    if (typeof avantages === 'string') {
      try {
        return JSON.parse(avantages);
      } catch {
        return [avantages];
      }
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Offres AgriCapital</h2>
          <p className="text-muted-foreground">Gérez les offres de souscription disponibles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {offres?.map((offre) => {
          const IconComponent = getIcone(offre.code);
          const couleurs = getCouleur(offre.code, offre.couleur);
          const avantagesList = parseAvantages(offre.avantages);
          
          return (
            <Card 
              key={offre.id} 
              className={`relative overflow-hidden transition-all ${couleurs.border} ${!offre.actif ? 'opacity-60' : ''}`}
            >
              {/* Header avec icône */}
              <CardHeader className={`${couleurs.bg} pb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full bg-white shadow-sm`}>
                      <IconComponent className={`h-8 w-8 ${couleurs.text}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-xl ${couleurs.text}`}>
                        {offre.nom}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{offre.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={offre.actif ?? true}
                    onCheckedChange={(checked) => toggleOffreMutation.mutate({ id: offre.id, actif: checked })}
                  />
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Droit d'accès */}
                <div>
                  <p className="text-sm text-muted-foreground">Droit d'accès :</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatMontant(offre.montant_da_par_ha)}F
                    </span>
                    <span className="text-sm">/ha</span>
                  </div>
                </div>

                {/* Redevance modulable */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Redevance modulable :</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">{formatMontant(offre.contribution_mensuelle_par_ha)}F</span>
                    <span className="text-sm text-muted-foreground">/ ha / mois</span>
                  </div>
                </div>

                {/* Avantages */}
                <div className="space-y-2 pt-2 border-t">
                  {avantagesList.map((avantage: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{avantage}</span>
                    </div>
                  ))}
                </div>

                {/* Badge de statut et bouton éditer */}
                <div className="pt-2 flex items-center justify-between">
                  <Badge variant={offre.actif ? "default" : "secondary"}>
                    {offre.actif ? "Active" : "Inactive"}
                  </Badge>
                  <Dialog open={isDialogOpen && editOffre?.id === offre.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setEditOffre(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditOffre(offre);
                        setIsDialogOpen(true);
                      }}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier l'offre {editOffre?.nom}</DialogTitle>
                      </DialogHeader>
                      {editOffre && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="nom">Nom de l'offre</Label>
                            <Input 
                              id="nom"
                              value={editOffre.nom}
                              onChange={(e) => setEditOffre({...editOffre, nom: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                              id="description"
                              value={editOffre.description || ''}
                              onChange={(e) => setEditOffre({...editOffre, description: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="montant_da">Montant DA/ha (F)</Label>
                              <Input 
                                id="montant_da"
                                type="number"
                                value={editOffre.montant_da_par_ha}
                                onChange={(e) => setEditOffre({...editOffre, montant_da_par_ha: Number(e.target.value)})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="contribution">Contribution/ha/mois (F)</Label>
                              <Input 
                                id="contribution"
                                type="number"
                                value={editOffre.contribution_mensuelle_par_ha}
                                onChange={(e) => setEditOffre({...editOffre, contribution_mensuelle_par_ha: Number(e.target.value)})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="couleur">Couleur (hex)</Label>
                            <div className="flex gap-2">
                              <Input 
                                id="couleur"
                                value={editOffre.couleur || ''}
                                onChange={(e) => setEditOffre({...editOffre, couleur: e.target.value})}
                                placeholder="#00643C"
                              />
                              <div 
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: editOffre.couleur || '#00643C' }}
                              />
                            </div>
                          </div>
                          <Button 
                            onClick={handleSave} 
                            className="w-full"
                            disabled={updateOffreMutation.isPending}
                          >
                            {updateOffreMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Enregistrer
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Offres;
