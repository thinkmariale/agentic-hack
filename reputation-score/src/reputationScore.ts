import { CopyrightInfringementRecord, OffenseContext } from "./types/copyrightInfringement"

enum OffenseScoreWeights {
    frequencyWeight = 0.5,          // Each additional offense increases score
    contentSeverityWeight = 1,      // High-severity cases impact score more
    derivedContextWeight = 1.5,     // AI-detected intentional plagiarism adds a heavy penalty
    timeDecayFactor = -0.2          // Older offenses lose impact over time
}

const OffenseContextScore: { [key in OffenseContext]: number } = {
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

const getPostContextSubScore = (offenseType: OffenseContext) => {
    return OffenseContextScore[offenseType];
}

/*
    * Calculate the reputation score of a user based on their offenses.
    * The reputation score is a weighted sum of the severity of the offenses.
    * The weights are defined in the OffenseScoreWeights enum.
    * Simplified formula:
    * TimeDecayScale = TimeDecayFactor * timeSinceLastOffense;
 */
const getUserTimeDecaySubScore = (offenses: CopyrightInfringementRecord[]) => {
    if (offenses.length === 0) return 0;
    const now = new Date();
    const latestOffense = offenses.reduce((acc, offense) => {
        const offenseDate = new Date(offense.timestamp);
        return offenseDate > acc ? offenseDate : acc;
    }, new Date(0));
    const timeSinceLastOffense = (now.getTime() - latestOffense.getTime()) / 1000 / 60 / 60 / 24 / 30;
    return OffenseScoreWeights.timeDecayFactor * timeSinceLastOffense;
}

/*
    * Calculate the overall subscore for a  user's offenses based on the severity of the content.
    * The subscore is the average severity score of all offenses, multiplied by the content severity weight.
    * Simplified formula:
    * averagePostSeverity = sum(severityScore) / offenseCount;
    * postSeveritySubScore = averagePostSeverity * contentSeverityWeight;
 */
const getUserPostSeveritySubScore = (offenses: CopyrightInfringementRecord[]) => {
    if (offenses.length === 0) return 0;
    const averagePostSeverity = offenses.reduce((acc, offense) => acc + offense.severityScore!, 0) / offenses.length;
    return averagePostSeverity * OffenseScoreWeights.contentSeverityWeight;
}

/*
    * Calculate the overall subscore for a user's offenses based on the context of the content.
    * The subscore is the average context score of all offenses, multiplied by the context severity weight.
    * Simplified formula:
    * averageContextSubScore = sum(contextScore) / offenseCount;
    * contextSubScore = averageContextSubScore * contextSeverityWeight;
 */
const getUserDerivedContextSubScore = (offenses: CopyrightInfringementRecord[]) => {
    if (offenses.length === 0) return 0;
    const averageContextSubScore = offenses.reduce((acc, offense) => acc + getPostContextSubScore(offense.offenseContext!), 0) / offenses.length;
    return averageContextSubScore * OffenseScoreWeights.derivedContextWeight;
}

/*
    * Calculate the subscore for a user's offenses based on the frequency of offenses.
    * The subscore is the number of offenses multiplied by the frequency weight.
    * Simplified formula:
    * offenseCountSubScore = offenseCount * frequencyWeight;
 */
const getUserOffenseCountSubScore = (offenses: CopyrightInfringementRecord[]) => {
    return offenses.length * OffenseScoreWeights.frequencyWeight;
}


export const generateUserOverallReputationScore = (offenses: CopyrightInfringementRecord[]) => {
    offenses = offenses.filter(offense => offense.severityScore !== undefined);

    const offenseCountSubScore = getUserOffenseCountSubScore(offenses);
    const postsSeveritySubScore = getUserPostSeveritySubScore(offenses);
    const averageContextSubScore = getUserDerivedContextSubScore(offenses);
    const timeDecaySubScore = getUserTimeDecaySubScore(offenses);

    return offenseCountSubScore + postsSeveritySubScore + averageContextSubScore - timeDecaySubScore;
}