export interface AnalyticsData {
  jobsFound: number;
  jobsFoundDelta: number;
  applied: number;
  appliedDelta: number;
  callbackRate: number;
  callbackRateDelta: number;
  interviews: number;
  interviewsDelta: number;
  funnel: FunnelStage[];
  topSources: SourceStat[];
  interviewProgress: ProgressPoint[];
}

export interface FunnelStage {
  label: string;
  count: number;
  color: string;
}

export interface SourceStat {
  name: string;
  count: number;
}

export interface ProgressPoint {
  category: string;
  before: number;
  after: number;
  delta: number;
}
