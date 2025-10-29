export interface Objective {
  id: string;
  period: string;
  title: string;
}

export interface TeamObjective {
  teamObjectiveId: number;
  title: string;
  effectiveTimePeriod: number;
  duration: string;
}

export interface TeamObjectivesResponse {
  status: string;
  results: TeamObjective[];
}
