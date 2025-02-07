import { updateCopyrightInfringementUserArgs, updateReportedPostArgs } from "./types/graphApi";

export const updateCopyrightInfringementUser = (args: updateCopyrightInfringementUserArgs) => {
    console.log("Updating user reputation...");
    console.log(args);
    // Call to the graph API to update the user's reputation
    return true;
}

export const updateReportedPost = (args: updateReportedPostArgs) => {
    console.log("Updating reported post...");
    console.log(args);
    // Call to the graph API to update the reported post
    return true;
}