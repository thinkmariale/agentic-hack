// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace ReputationAgentTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export type Aggregation_interval =
  | 'hour'
  | 'day';

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  reputationType?: Maybe<ReputationType>;
  reputationTypes: Array<ReputationType>;
  reportedPostType?: Maybe<ReportedPostType>;
  reportedPostTypes: Array<ReportedPostType>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryreputationTypeArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryreputationTypesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ReputationType_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ReputationType_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryreportedPostTypeArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryreportedPostTypesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ReportedPostType_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ReportedPostType_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type ReportedPostType = {
  id: Scalars['ID']['output'];
  recordId: Scalars['BigInt']['output'];
  userId?: Maybe<Scalars['Bytes']['output']>;
  postText?: Maybe<Scalars['String']['output']>;
  postUrl?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['BigInt']['output']>;
  derivedContext?: Maybe<Scalars['String']['output']>;
  derivedContextExplanation?: Maybe<Scalars['String']['output']>;
  severityScore: Scalars['BigInt']['output'];
  createdAt: Scalars['BigInt']['output'];
};

export type ReportedPostType_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  recordId?: InputMaybe<Scalars['BigInt']['input']>;
  recordId_not?: InputMaybe<Scalars['BigInt']['input']>;
  recordId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  recordId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  recordId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  recordId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  recordId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  recordId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  userId?: InputMaybe<Scalars['Bytes']['input']>;
  userId_not?: InputMaybe<Scalars['Bytes']['input']>;
  userId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  userId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  userId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  userId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  userId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  userId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  userId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  userId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  postText?: InputMaybe<Scalars['String']['input']>;
  postText_not?: InputMaybe<Scalars['String']['input']>;
  postText_gt?: InputMaybe<Scalars['String']['input']>;
  postText_lt?: InputMaybe<Scalars['String']['input']>;
  postText_gte?: InputMaybe<Scalars['String']['input']>;
  postText_lte?: InputMaybe<Scalars['String']['input']>;
  postText_in?: InputMaybe<Array<Scalars['String']['input']>>;
  postText_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  postText_contains?: InputMaybe<Scalars['String']['input']>;
  postText_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  postText_not_contains?: InputMaybe<Scalars['String']['input']>;
  postText_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  postText_starts_with?: InputMaybe<Scalars['String']['input']>;
  postText_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  postText_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  postText_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  postText_ends_with?: InputMaybe<Scalars['String']['input']>;
  postText_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  postText_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  postText_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  postUrl?: InputMaybe<Scalars['String']['input']>;
  postUrl_not?: InputMaybe<Scalars['String']['input']>;
  postUrl_gt?: InputMaybe<Scalars['String']['input']>;
  postUrl_lt?: InputMaybe<Scalars['String']['input']>;
  postUrl_gte?: InputMaybe<Scalars['String']['input']>;
  postUrl_lte?: InputMaybe<Scalars['String']['input']>;
  postUrl_in?: InputMaybe<Array<Scalars['String']['input']>>;
  postUrl_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  postUrl_contains?: InputMaybe<Scalars['String']['input']>;
  postUrl_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  postUrl_not_contains?: InputMaybe<Scalars['String']['input']>;
  postUrl_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  postUrl_starts_with?: InputMaybe<Scalars['String']['input']>;
  postUrl_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  postUrl_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  postUrl_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  postUrl_ends_with?: InputMaybe<Scalars['String']['input']>;
  postUrl_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  postUrl_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  postUrl_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  derivedContext?: InputMaybe<Scalars['String']['input']>;
  derivedContext_not?: InputMaybe<Scalars['String']['input']>;
  derivedContext_gt?: InputMaybe<Scalars['String']['input']>;
  derivedContext_lt?: InputMaybe<Scalars['String']['input']>;
  derivedContext_gte?: InputMaybe<Scalars['String']['input']>;
  derivedContext_lte?: InputMaybe<Scalars['String']['input']>;
  derivedContext_in?: InputMaybe<Array<Scalars['String']['input']>>;
  derivedContext_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  derivedContext_contains?: InputMaybe<Scalars['String']['input']>;
  derivedContext_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContext_not_contains?: InputMaybe<Scalars['String']['input']>;
  derivedContext_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContext_starts_with?: InputMaybe<Scalars['String']['input']>;
  derivedContext_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContext_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  derivedContext_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContext_ends_with?: InputMaybe<Scalars['String']['input']>;
  derivedContext_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContext_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  derivedContext_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_not?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_gt?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_lt?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_gte?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_lte?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_in?: InputMaybe<Array<Scalars['String']['input']>>;
  derivedContextExplanation_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  derivedContextExplanation_contains?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_not_contains?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_starts_with?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_ends_with?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  derivedContextExplanation_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  severityScore?: InputMaybe<Scalars['BigInt']['input']>;
  severityScore_not?: InputMaybe<Scalars['BigInt']['input']>;
  severityScore_gt?: InputMaybe<Scalars['BigInt']['input']>;
  severityScore_lt?: InputMaybe<Scalars['BigInt']['input']>;
  severityScore_gte?: InputMaybe<Scalars['BigInt']['input']>;
  severityScore_lte?: InputMaybe<Scalars['BigInt']['input']>;
  severityScore_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  severityScore_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ReportedPostType_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ReportedPostType_filter>>>;
};

export type ReportedPostType_orderBy =
  | 'id'
  | 'recordId'
  | 'userId'
  | 'postText'
  | 'postUrl'
  | 'timestamp'
  | 'derivedContext'
  | 'derivedContextExplanation'
  | 'severityScore'
  | 'createdAt';

export type ReputationType = {
  id: Scalars['ID']['output'];
  userId: Scalars['Bytes']['output'];
  username?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  postCount?: Maybe<Scalars['BigInt']['output']>;
  offenseCount?: Maybe<Scalars['BigInt']['output']>;
  firstOffenseTimestamp?: Maybe<Scalars['BigInt']['output']>;
  lastOffenseTimestamp?: Maybe<Scalars['BigInt']['output']>;
  reputationScore: Scalars['BigInt']['output'];
  createdAt: Scalars['BigInt']['output'];
};

export type ReputationType_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  userId?: InputMaybe<Scalars['Bytes']['input']>;
  userId_not?: InputMaybe<Scalars['Bytes']['input']>;
  userId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  userId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  userId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  userId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  userId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  userId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  userId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  userId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  username_not?: InputMaybe<Scalars['String']['input']>;
  username_gt?: InputMaybe<Scalars['String']['input']>;
  username_lt?: InputMaybe<Scalars['String']['input']>;
  username_gte?: InputMaybe<Scalars['String']['input']>;
  username_lte?: InputMaybe<Scalars['String']['input']>;
  username_in?: InputMaybe<Array<Scalars['String']['input']>>;
  username_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  username_contains?: InputMaybe<Scalars['String']['input']>;
  username_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  username_not_contains?: InputMaybe<Scalars['String']['input']>;
  username_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  username_starts_with?: InputMaybe<Scalars['String']['input']>;
  username_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  username_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  username_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  username_ends_with?: InputMaybe<Scalars['String']['input']>;
  username_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  username_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  username_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  platform_not?: InputMaybe<Scalars['String']['input']>;
  platform_gt?: InputMaybe<Scalars['String']['input']>;
  platform_lt?: InputMaybe<Scalars['String']['input']>;
  platform_gte?: InputMaybe<Scalars['String']['input']>;
  platform_lte?: InputMaybe<Scalars['String']['input']>;
  platform_in?: InputMaybe<Array<Scalars['String']['input']>>;
  platform_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  platform_contains?: InputMaybe<Scalars['String']['input']>;
  platform_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  platform_not_contains?: InputMaybe<Scalars['String']['input']>;
  platform_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  platform_starts_with?: InputMaybe<Scalars['String']['input']>;
  platform_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  platform_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  platform_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  platform_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  platform_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  postCount?: InputMaybe<Scalars['BigInt']['input']>;
  postCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  postCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  postCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  postCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  postCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  postCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  postCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  offenseCount?: InputMaybe<Scalars['BigInt']['input']>;
  offenseCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  offenseCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  offenseCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  offenseCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  offenseCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  offenseCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  offenseCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstOffenseTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  firstOffenseTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstOffenseTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstOffenseTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstOffenseTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstOffenseTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstOffenseTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstOffenseTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastOffenseTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  lastOffenseTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastOffenseTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastOffenseTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastOffenseTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastOffenseTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastOffenseTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastOffenseTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  reputationScore?: InputMaybe<Scalars['BigInt']['input']>;
  reputationScore_not?: InputMaybe<Scalars['BigInt']['input']>;
  reputationScore_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reputationScore_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reputationScore_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reputationScore_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reputationScore_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  reputationScore_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ReputationType_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ReputationType_filter>>>;
};

export type ReputationType_orderBy =
  | 'id'
  | 'userId'
  | 'username'
  | 'platform'
  | 'postCount'
  | 'offenseCount'
  | 'firstOffenseTimestamp'
  | 'lastOffenseTimestamp'
  | 'reputationScore'
  | 'createdAt';

export type Subscription = {
  reputationType?: Maybe<ReputationType>;
  reputationTypes: Array<ReputationType>;
  reportedPostType?: Maybe<ReportedPostType>;
  reportedPostTypes: Array<ReportedPostType>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionreputationTypeArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionreputationTypesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ReputationType_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ReputationType_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionreportedPostTypeArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionreportedPostTypesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ReportedPostType_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ReportedPostType_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

  export type QuerySdk = {
      /** null **/
  reputationType: InContextSdkMethod<Query['reputationType'], QueryreputationTypeArgs, MeshContext>,
  /** null **/
  reputationTypes: InContextSdkMethod<Query['reputationTypes'], QueryreputationTypesArgs, MeshContext>,
  /** null **/
  reportedPostType: InContextSdkMethod<Query['reportedPostType'], QueryreportedPostTypeArgs, MeshContext>,
  /** null **/
  reportedPostTypes: InContextSdkMethod<Query['reportedPostTypes'], QueryreportedPostTypesArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  reputationType: InContextSdkMethod<Subscription['reputationType'], SubscriptionreputationTypeArgs, MeshContext>,
  /** null **/
  reputationTypes: InContextSdkMethod<Subscription['reputationTypes'], SubscriptionreputationTypesArgs, MeshContext>,
  /** null **/
  reportedPostType: InContextSdkMethod<Subscription['reportedPostType'], SubscriptionreportedPostTypeArgs, MeshContext>,
  /** null **/
  reportedPostTypes: InContextSdkMethod<Subscription['reportedPostTypes'], SubscriptionreportedPostTypesArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["ReputationAgent"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
