export interface AulaPlayerSummary {
  id: string;
  firstname: string;
  lastname: string;
}

export interface AulaGrupo {
  id: string;
  name: string;
  players: AulaPlayerSummary[];
}

export interface AulaPresenca {
  playerId: string | null;
  playerName: string | null;
  present: boolean | null;
}

export interface AulaSessao {
  id: string;
  grupoId: string;
  grupoName: string;
  date: string;
  presencas: AulaPresenca[];
}
