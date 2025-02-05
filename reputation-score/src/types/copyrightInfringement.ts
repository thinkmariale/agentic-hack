export type ContentSource = "x" | "discord" | "instagram" | "other";
export type OffenseContext =
  | "plagiarism"
  | "misattribution"
  | "potentialFairUse"
  | "fairUse"
  | "unknown";

export interface CopyrightInfringementRecord {
  recordId: string;
  contentHash: string;
  offenderId: string;
  postText?: string;
  url?: string;
  contentS3Url?: string;
  timestamp: string;
  severityScore?: number;
  offenseContext?: OffenseContext;
}

export interface CopyrightInfringementUser {
  userId: string;
  platform: ContentSource;
  username: string;
  offenseCount: number;
  postCount: number;
  firstOffenseTimestamp: string;
  lastOffenseTimestamp: string;
  reputationScore?: number;
}


export interface ReputationAlgorithmRecordResponse {
  recordId: string;
  severityScore: number;
  derivedContext: OffenseContext;
}

export interface ReputationAlgorithmReponse {
  userId: string;
  reputationScore: number;
  offenses: ReputationAlgorithmRecordResponse[];
}
