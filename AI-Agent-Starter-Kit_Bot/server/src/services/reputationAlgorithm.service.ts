import { OffenseContext, ReportedPost } from "src/contracts/types/ReputationAgent.js";
import { NodeContext, OffenseContextScore, OffenseScoreWeights, PostContextResponse } from "src/contracts/types/ReputationAlgorithm.js";

export class ReputationAlgorithmService {
    private static instance: ReputationAlgorithmService;
    private prompt: string;
    private gaiaUrl: string;

    constructor() {
        this.gaiaUrl = "https://0x58598ed2556a25062e011b23c93118ee645fd0a6.gaia.domains/v1/chat/completions";
        this.prompt = `
                Task: Analyze the intent behind a Twitter post to classify whether the user is plagiarizing digital content, misattributing it, or following fair use principles.

                Instructions:
                - You will be given a Twitter post text, username of the user who posted the content, and username of the original content creator.
                - Your task is to determine whether the user is plagiarizing, misattributing, or properly crediting the content.
                - If no text is provided in the post, classify it as "misattribution".
                - The classification must be one of the following:
                - "fairUse" → The original content creator posted the content or was explicitly credited.
                - "plagiarism" → The user falsely claims ownership of content created by someone else.
                - "misattribution" → The user shares the content without providing proper attribution.
                - "potentialFairUse" → The user acknowledges they did not create the content but does not explicitly credit the creator.
                - "unknown" → No classification could be determined.

                Classification Rules:
                1. Fair Use
                - If the poster's username matches the content creator's username, classify it as "fairUse".
                - If the post explicitly credits the original creator (e.g., "Art by @creator123"), classify it as "fairUse".
                - If the post states the content is AI-generated or inspired the original poster's work, classify it as "fairUse".
                - Examples:
                    - "Art by @originalcreator" = Fair Use
                    - "Inspired by @artistname, tried recreating it!" = Fair Use
                    - "This was made using AI, original source unknown." = Fair Use
                

                2. Plagiarism
                - If the poster falsely claims ownership of content not created by them, classify it as "plagiarism".
                - If the poster implies they created the content but does not credit the actual creator, classify it as "plagiarism".
                - If the poster modifies the content and falsely claims it as original work, classify it as "plagiarism".
                - Examples:
                    - "Just finished creating this masterpiece! What do you think?" = Plagiarism
                    - "Made this from scratch today. Took me hours!" = Plagiarism

                3. Misattribution
                - If the user posts the content without any text, classify it as "misattribution".
                - If the post contains no credit to the original creator, classify it as "misattribution".
                - If the post vaguely praises the work but does not credit the creator, classify it as "misattribution".
                - Examples:
                    - (No text, just an image or video) → Misattribution
                    - "Love this!" (with an image or video attached but no credit) = Misattribution
                    - "Check this out!" (without attribution to the original creator) = Misattribution

                4. Potential Fair Use
                - If the user acknowledges they found the content online but does not specify the original creator, classify it as "potentialFairUse".
                - If the user vaguely references the creator but does not directly tag them, classify it as "potentialFairUse".
                - If the user credits an incorrect creator, classify it as "potentialFairUse".
                - Examples:
                    - "Found this online. Pretty cool!" = Potential Fair Use
                    - "This AI-generated image looks so real!" = Potential Fair Use
                    - "Credit to the original artist (but no mention of who)" = Potential Fair Use

                5. Unknown
                - If the post contains only emojis, random characters, or does not relate to content ownership, classify it as "unknown".
                - If the post does not contain enough information to determine intent, classify it as "unknown".
                - Examples:
                    - "Amazing!" (with no clear indication of ownership or attribution) = Unknown
                    - "Great work!" (without attribution or context) = Unknown

                Required Output Format:
                You must return a JSON object with the following structure:
                {
                "context": "classification_label",
                "explanation": "natural_language_explanation"
                }
                - "context" must be one of: "fairUse", "plagiarism", "misattribution", "potentialFairUse", or "unknown".
                - "explanation" must provide a detailed, natural language reason for the classification.

                Model Input Format:
                {
                "username": "@user123",
                "contentCreator": "@artist456",
                "postText": "Just finished creating this piece! What do you think?"
                }

                Model Output Format:
                {
                "context": "plagiarism",
                "explanation": "The user claimed they 'just finished creating' the piece, implying original authorship. However, the original content creator is @artist456, and no credit was given."
                }

                Ensure the model strictly follows the JSON output format. If text includes both plagiarism and fair use elements, classify based on the dominant intent.
                `;
    }

    public static getInstance(): ReputationAlgorithmService {
        if (!ReputationAlgorithmService.instance) {
            ReputationAlgorithmService.instance = new ReputationAlgorithmService();
        }
        return ReputationAlgorithmService.instance;
      }


    private getPostContextSubScore(offenseType: OffenseContext) {
        return OffenseContextScore[offenseType];
    }

    /*
        * Calculate the reputation score of a user based on their offenses.
        * The reputation score is a weighted sum of the severity of the offenses.
        * The weights are defined in the OffenseScoreWeights enum.
        * Simplified formula:
        * TimeDecayScale = TimeDecayFactor * timeSinceLastOffense;
     */
    private getUserTimeDecaySubScore(offenses: ReportedPost[]) {
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
    private getUserPostSeveritySubScore(offenses: ReportedPost[]) {
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
    private getUserDerivedContextSubScore(offenses: ReportedPost[]) {
        if (offenses.length === 0) return 0;
        const averageContextSubScore = offenses.reduce((acc, offense) => acc + this.getPostContextSubScore(offense.derivedContext!), 0) / offenses.length;
        return averageContextSubScore * OffenseScoreWeights.derivedContextWeight;
    }

    /*
        * Calculate the subscore for a user's offenses based on the frequency of offenses.
        * The subscore is the number of offenses multiplied by the frequency weight.
        * Simplified formula:
        * offenseCountSubScore = offenseCount * frequencyWeight;
     */
    private getUserOffenseCountSubScore(offenses: ReportedPost[]) {
        return offenses.length * OffenseScoreWeights.frequencyWeight;
    }


    public generateUserOverallReputationScore(offenses: ReportedPost[]) {
        offenses = offenses.filter(offense => offense.severityScore !== undefined);

        const offenseCountSubScore = this.getUserOffenseCountSubScore(offenses);
        const postsSeveritySubScore = this.getUserPostSeveritySubScore(offenses);
        const averageContextSubScore = this.getUserDerivedContextSubScore(offenses);
        const timeDecaySubScore = this.getUserTimeDecaySubScore(offenses);

        return offenseCountSubScore + postsSeveritySubScore + averageContextSubScore - timeDecaySubScore;
    }

    public async generatePostSeverityScore(post: ReportedPost, creatorUsername?: string): Promise<PostContextResponse | null> {
        const messages: NodeContext[] = [
            {
                role: "system",
                content: this.prompt
            },
            {
                role: "user",
                content: JSON.stringify({
                    username: post.userId,
                    contentCreator: creatorUsername,
                    postText: post.postText
                })
            }
        ]

        const body = {
            messages
        }

        try {
            const agentResponse = await fetch(this.gaiaUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!agentResponse.ok) {
                throw new Error(`Error generating post context: ${agentResponse.statusText}`);
            }

            const context = await agentResponse.json() as PostContextResponse;
            return context;
        } catch (error) {
            console.error("Error generating post context:", error);
            return null;
        }

    }
}

