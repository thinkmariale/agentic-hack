import { OffenseContext } from "./copyrightInfringement";

export interface updateCopyrightInfringementUserArgs {
    userId: string;
    offenseCount?: number;
    firstOffenseTimestamp?: string;
    lastOffenseTimestamp?: string;
    reputationScore?: number;
}

export interface updateReportedPostArgs {
    recordId: string;
    userId: string;
    severityScore?: number;
    derivedContext?: OffenseContext;
    derivedContextExplanation?: string;
}