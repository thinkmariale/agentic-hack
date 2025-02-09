export type OffenseContext =
  | "plagiarism"
  | "misattribution"
  | "potentialFairUse"
  | "fairUse"
  | "unknown";

  
export interface CopyrightInfringementUser {
  userId: string;                     // user id of the person who posted the content
  platform: string;            // platform where the user is active, assuming all are on X for now
  username: string;                   // username of the user
  offenseCount: number;               // number of offenses the user has committed, updated any time the reputation score is updated
  postCount: number;                  // number of posts the user has made, updated any time a new post is reported
  firstOffenseTimestamp?: number;      // timestamp of the first offense
  lastOffenseTimestamp?: number;       // timestamp of the last offense
  reputationScore?: number;           // reputation score of the user, updated any time the reputation score is calculated
}
export interface ReportedPost {
  recordId: string | number;                   // unique identifier for the record
  contentHash: string;                // used to check if the content has been reported before
  userId: string;                     // user id of the person who posted the content
  postText?: string;                  // text of the post
  postUrl?: string;                   // url of the post
  // contentS3Url?: string;
  timestamp: number;                  // timestamp of when the post was created
  // reportedTimestamp: number;          // timestamp of when the post was reported
  severityScore?: number;             // severity score of the offense
  derivedContext?: OffenseContext;    // context of the offense (plagiarism, misattribution, etc.)
  derivedContextExplanation?: string; // explanation of the context
}

export interface AddInfringementReponse {
  userId: string;
  reputationScore: string | number;
  post: {
    offenseContext: OffenseContext;
    offenseContextExplanation: string;
  }
}