export type ContentSource = "x" | "discord" | "instagram" | "other";
export type OffenseContext =
  | "plagiarism"
  | "misattribution"
  | "potentialFairUse"
  | "fairUse"
  | "unknown";

export interface ReportedPost {
  recordId: string;                   // unique identifier for the record
  contentHash: string;                // used to check if the content has been reported before
  userId: string;                     // user id of the person who posted the content
  postText?: string;                  // text of the post
  postUrl?: string;                   // url of the post
  // contentS3Url?: string;
  timestamp: string;                  // timestamp of when the post was created
  reportedTimestamp: string;          // timestamp of when the post was reported
  severityScore?: number;             // severity score of the offense
  derivedContext?: OffenseContext;    // context of the offense (plagiarism, misattribution, etc.)
  derivedContextExplanation?: string; // explanation of the context
}

export interface CopyrightInfringementUser {
  userId: string;                     // user id of the person who posted the content
  platform: ContentSource;            // platform where the user is active, assuming all are on X for now
  username: string;                   // username of the user
  offenseCount: number;               // number of offenses the user has committed, updated any time the reputation score is updated
  postCount: number;                  // number of posts the user has made, updated any time a new post is reported
  firstOffenseTimestamp: string;      // timestamp of the first offense
  lastOffenseTimestamp: string;       // timestamp of the last offense
  reputationScore?: number;           // reputation score of the user, updated any time the reputation score is calculated
}


export interface ReputationAlgorithmRecordResponse {
  recordId: string;
  severityScore: number;
  derivedContext: OffenseContext;
  derivedContextExplanation: string;
}

export interface ReputationAlgorithmReponse {
  userId: string;
  reputationScore: number;
  offenses: ReputationAlgorithmRecordResponse[];
}
