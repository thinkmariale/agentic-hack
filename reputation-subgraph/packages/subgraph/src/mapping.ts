import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  NewInfrigmentUser,
  ReportedPost,
} from "../generated/ReputationAgent/ReputationAgent";
import { IReputation,IReportedPost } from "../generated/schema";

export function handleInfrigmentUser(event: NewInfrigmentUser): void {
  let infringementString = event.params.userId.toString();

  let infringement = IReputation.load(infringementString);
  if (infringement === null) {
    infringement = new IReputation(infringementString);
    infringement.userId = event.params.userId;
    infringement.username = event.params.username;
    infringement.platform = event.params.platform;
    infringement.reputationScore = event.params.reputationScore;
    infringement.isOffense = event.params.isOffense;
  } else {
    infringement.reputationScore = event.params.reputationScore;
  }

  infringement.save();
}
export function handleReportedPost(event: ReportedPost): void {
  let postString = event.params.recordId.toString();

  let reputation = IReportedPost.load(postString);
  if (reputation === null) {
    reputation = new IReportedPost(postString);
    reputation.recordId = event.params.recordId;
    reputation.userId = event.params.userId;
    reputation.postText = event.params.postText;
    reputation.postUrl = event.params.postUrl;
    reputation.timestamp = event.params.timestamp;
    reputation.derivedContext = event.params.derivedContext;
    reputation.derivedContextExplanation = event.params.derivedContextExplanation;
    reputation.severityScore = event.params.severityScore;
  } else {
    reputation.severityScore = event.params.severityScore;
  }
  reputation.save();
}
