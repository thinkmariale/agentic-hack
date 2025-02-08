import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import {
  NewInfrigmentUser,
  ReportedPost,
  UpdateInfrigmentUser,
  UpdatedReportedPost
} from "../generated/ReputationAgent/ReputationAgent";
import { ReputationType, ReportedPostType } from "../generated/schema";

export function handleInfrigmentUser(event: NewInfrigmentUser): void {
  let infringementString = event.params.userId.toString();
  let infringement = ReputationType.load(infringementString);
  if (infringement === null) {
    infringement = new ReputationType(infringementString);
    infringement.userId = event.params.userId;
    infringement.username = event.params.username;
    infringement.platform = event.params.platform;
  } 
  infringement.reputationScore = event.params.reputationScore;
  infringement.firstOffenseTimestamp = event.params.firstOffenseTimestamp;
  infringement.lastOffenseTimestamp = event.params.lastOffenseTimestamp;
  infringement.postCount = event.params.postCount;
  infringement.offenseCount = event.params.offenseCount;
  infringement.createdAt = event.block.timestamp;

  infringement.save();
}
export function handleUpdateInfrigmentUser(event: UpdateInfrigmentUser): void {
  
  let infringementString = event.params.userId.toString();
  let infringement = ReputationType.load(infringementString);
  if (infringement != null) {
    infringement.reputationScore = event.params.reputationScore;
    infringement.firstOffenseTimestamp = event.params.firstOffenseTimestamp;
    infringement.lastOffenseTimestamp = event.params.lastOffenseTimestamp;
    infringement.postCount = event.params.postCount;
    infringement.offenseCount = event.params.offenseCount;
    infringement.createdAt = event.block.timestamp;
  
    infringement.save();
  }
}

export function handleReportedPost(event: ReportedPost): void {
  let postString = event.params.recordId.toString();

  let reputation = ReportedPostType.load(postString);
  if (reputation === null) {
    reputation = new ReportedPostType(postString);
    reputation.recordId = event.params.recordId;
    reputation.userId = event.params.userId;
    reputation.postText = event.params.postText;
    reputation.postUrl = event.params.postUrl;
    reputation.timestamp = event.params.timestamp;
  } 
  reputation.derivedContext = event.params.derivedContext;
  reputation.derivedContextExplanation = event.params.derivedContextExplanation;
  reputation.severityScore = event.params.severityScore;
  reputation.createdAt = event.block.timestamp;

  reputation.save();
}
