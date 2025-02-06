export const postContextClassificationPromp = `
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
  "content_creator": "@artist456",
  "post_text": "Just finished creating this piece! What do you think?"
}

Model Output Format:
{
  "context": "plagiarism",
  "explanation": "The user claimed they 'just finished creating' the piece, implying original authorship. However, the original content creator is @artist456, and no credit was given."
}

Ensure the model strictly follows the JSON output format. If text includes both plagiarism and fair use elements, classify based on the dominant intent.
`;  