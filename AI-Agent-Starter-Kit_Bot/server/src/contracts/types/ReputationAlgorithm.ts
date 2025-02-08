import { OffenseContext } from "./ReputationAgent.js";

export interface GeneratePostContextArgs {
    username: string;
    contentCreator: string;
    postText: string;
}

export interface PostContextResponse {
    context: OffenseContext;
    explanation: string;
}

export interface NodeContext {
    role: "system" | "user";
    content: string;
}

export enum OffenseScoreWeights {
    frequencyWeight = 0.5,          // Each additional offense increases score
    contentSeverityWeight = 1,      // High-severity cases impact score more
    derivedContextWeight = 1.5,     // AI-detected intentional plagiarism adds a heavy penalty
    timeDecayFactor = -0.2          // Older offenses lose impact over time
}

export const OffenseContextScore: { [key in OffenseContext]: number } = {
    plagiarism: 1.5,
    misattribution: 0.5,
    potentialFairUse: 0.2,
    fairUse: 0,
    unknown: 0
}

export type ReputationScoreThresholds = {
    lowRisk: 2.0,                   // From 0 to 2.0 is low risk
    mediumRisk: 5.0                 // From 2.0 to 5.0 is medium risk, etc.
}

export enum SuggestedActions {
    warning = "warning",
    dmca = "DMCA",
    blacklist = "blacklist",
    legalAction = "legalAction"
}