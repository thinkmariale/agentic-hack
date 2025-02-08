// @ts-nocheck
import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from "@graphql-mesh/cache-localforage";
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from "@graphql-mesh/graphql"
import BareMerger from "@graphql-mesh/merger-bare";
import { printWithCache } from '@graphql-mesh/utils';
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { ReputationAgentTypes } from './sources/ReputationAgent/types';
import * as importedModule$0 from "./sources/ReputationAgent/introspectionSchema";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };



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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Aggregation_interval: Aggregation_interval;
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']['output']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']['output']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']['output']>;
  OrderDirection: OrderDirection;
  Query: ResolverTypeWrapper<{}>;
  ReportedPostType: ResolverTypeWrapper<ReportedPostType>;
  ReportedPostType_filter: ReportedPostType_filter;
  ReportedPostType_orderBy: ReportedPostType_orderBy;
  ReputationType: ResolverTypeWrapper<ReputationType>;
  ReputationType_filter: ReputationType_filter;
  ReputationType_orderBy: ReputationType_orderBy;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']['output']>;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BigDecimal: Scalars['BigDecimal']['output'];
  BigInt: Scalars['BigInt']['output'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: Scalars['Boolean']['output'];
  Bytes: Scalars['Bytes']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Int8: Scalars['Int8']['output'];
  Query: {};
  ReportedPostType: ReportedPostType;
  ReportedPostType_filter: ReportedPostType_filter;
  ReputationType: ReputationType;
  ReputationType_filter: ReputationType_filter;
  String: Scalars['String']['output'];
  Subscription: {};
  Timestamp: Scalars['Timestamp']['output'];
  _Block_: _Block_;
  _Meta_: _Meta_;
}>;

export type entityDirectiveArgs = { };

export type entityDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = entityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type subgraphIdDirectiveArgs = {
  id: Scalars['String']['input'];
};

export type subgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = subgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type derivedFromDirectiveArgs = {
  field: Scalars['String']['input'];
};

export type derivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = derivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface BigDecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
  name: 'BigDecimal';
}

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  reputationType?: Resolver<Maybe<ResolversTypes['ReputationType']>, ParentType, ContextType, RequireFields<QueryreputationTypeArgs, 'id' | 'subgraphError'>>;
  reputationTypes?: Resolver<Array<ResolversTypes['ReputationType']>, ParentType, ContextType, RequireFields<QueryreputationTypesArgs, 'skip' | 'first' | 'subgraphError'>>;
  reportedPostType?: Resolver<Maybe<ResolversTypes['ReportedPostType']>, ParentType, ContextType, RequireFields<QueryreportedPostTypeArgs, 'id' | 'subgraphError'>>;
  reportedPostTypes?: Resolver<Array<ResolversTypes['ReportedPostType']>, ParentType, ContextType, RequireFields<QueryreportedPostTypesArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_metaArgs>>;
}>;

export type ReportedPostTypeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['ReportedPostType'] = ResolversParentTypes['ReportedPostType']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  recordId?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  postText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  derivedContext?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  derivedContextExplanation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  severityScore?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ReputationTypeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['ReputationType'] = ResolversParentTypes['ReputationType']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  platform?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postCount?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  offenseCount?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  firstOffenseTimestamp?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  lastOffenseTimestamp?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  reputationScore?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  reputationType?: SubscriptionResolver<Maybe<ResolversTypes['ReputationType']>, "reputationType", ParentType, ContextType, RequireFields<SubscriptionreputationTypeArgs, 'id' | 'subgraphError'>>;
  reputationTypes?: SubscriptionResolver<Array<ResolversTypes['ReputationType']>, "reputationTypes", ParentType, ContextType, RequireFields<SubscriptionreputationTypesArgs, 'skip' | 'first' | 'subgraphError'>>;
  reportedPostType?: SubscriptionResolver<Maybe<ResolversTypes['ReportedPostType']>, "reportedPostType", ParentType, ContextType, RequireFields<SubscriptionreportedPostTypeArgs, 'id' | 'subgraphError'>>;
  reportedPostTypes?: SubscriptionResolver<Array<ResolversTypes['ReportedPostType']>, "reportedPostTypes", ParentType, ContextType, RequireFields<SubscriptionreportedPostTypesArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_metaArgs>>;
}>;

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type _Block_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parentHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Int8?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  ReportedPostType?: ReportedPostTypeResolvers<ContextType>;
  ReputationType?: ReputationTypeResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = ReputationAgentTypes.Context & BaseMeshContext;


import { fileURLToPath } from '@graphql-mesh/utils';
const baseDir = pathModule.join(pathModule.dirname(fileURLToPath(import.meta.url)), '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/ReputationAgent/introspectionSchema":
      return Promise.resolve(importedModule$0) as T;
    
    default:
      return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
  }
};

const rootStore = new MeshStore('.graphclient', new FsStoreStorageAdapter({
  cwd: baseDir,
  importFn,
  fileType: "ts",
}), {
  readonly: true,
  validate: false
});

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any
export async function getMeshOptions(): Promise<GetMeshOptions> {
const pubsub = new PubSub();
const sourcesStore = rootStore.child('sources');
const logger = new DefaultLogger("GraphClient");
const cache = new (MeshCache as any)({
      ...({} as any),
      importFn,
      store: rootStore.child('cache'),
      pubsub,
      logger,
    } as any)

const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const reputationAgentTransforms = [];
const additionalTypeDefs = [] as any[];
const reputationAgentHandler = new GraphqlHandler({
              name: "ReputationAgent",
              config: {"endpoint":"https://api.studio.thegraph.com/query/103698/ip-reputationagent/v0.0.1"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("ReputationAgent"),
              logger: logger.child("ReputationAgent"),
              importFn,
            });
sources[0] = {
          name: 'ReputationAgent',
          handler: reputationAgentHandler,
          transforms: reputationAgentTransforms
        }
const additionalResolvers = [] as any[]
const merger = new(BareMerger as any)({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
      })
const documentHashMap = {
        "a5606955ecf88c7ebaf9de6066df6397110c0db6a3b13e038b0b22fa00c434d5": GetPostsDocument,
"94f6c861e14f63cb9d120908bf630b76a4c553c378906d5d36343b2fbb6361a1": GetReputationsDocument
      }
additionalEnvelopPlugins.push(usePersistedOperations({
        getPersistedOperation(key) {
          return documentHashMap[key];
        },
        ...{}
      }))

  return {
    sources,
    transforms,
    additionalTypeDefs,
    additionalResolvers,
    cache,
    pubsub,
    merger,
    logger,
    additionalEnvelopPlugins,
    get documents() {
      return [
      {
        document: GetPostsDocument,
        get rawSDL() {
          return printWithCache(GetPostsDocument);
        },
        location: 'GetPostsDocument.graphql',
        sha256Hash: 'a5606955ecf88c7ebaf9de6066df6397110c0db6a3b13e038b0b22fa00c434d5'
      },{
        document: GetReputationsDocument,
        get rawSDL() {
          return printWithCache(GetReputationsDocument);
        },
        location: 'GetReputationsDocument.graphql',
        sha256Hash: '94f6c861e14f63cb9d120908bf630b76a4c553c378906d5d36343b2fbb6361a1'
      }
    ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  })
}


let meshInstance$: Promise<MeshInstance> | undefined;

export const pollingInterval = null;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    if (pollingInterval) {
      setInterval(() => {
        getMeshOptions()
        .then(meshOptions => getMesh(meshOptions))
        .then(newMesh =>
          meshInstance$.then(oldMesh => {
            oldMesh.destroy()
            meshInstance$ = Promise.resolve(newMesh)
          })
        ).catch(err => {
          console.error("Mesh polling failed so the existing version will be used:", err);
        });
      }, pollingInterval)
    }
    meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
      const id = mesh.pubsub.subscribe('destroy', () => {
        meshInstance$ = undefined;
        mesh.pubsub.unsubscribe(id);
      });
      return mesh;
    });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
  return getSdk<TOperationContext, TGlobalContext>((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
export type GetPostsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPostsQuery = { reportedPostTypes: Array<Pick<ReportedPostType, 'severityScore' | 'userId' | 'recordId' | 'derivedContext' | 'derivedContextExplanation' | 'postText' | 'postUrl'>> };

export type GetReputationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReputationsQuery = { reputationTypes: Array<Pick<ReputationType, 'userId' | 'reputationScore' | 'postCount' | 'platform' | 'offenseCount' | 'lastOffenseTimestamp' | 'firstOffenseTimestamp' | 'username'>> };


export const GetPostsDocument = gql`
    query GetPosts {
  reportedPostTypes(orderBy: createdAt) {
    severityScore
    userId
    recordId
    derivedContext
    derivedContextExplanation
    postText
    postUrl
  }
}
    ` as unknown as DocumentNode<GetPostsQuery, GetPostsQueryVariables>;
export const GetReputationsDocument = gql`
    query GetReputations {
  reputationTypes(orderBy: createdAt, first: 50) {
    userId
    reputationScore
    postCount
    platform
    offenseCount
    lastOffenseTimestamp
    firstOffenseTimestamp
    username
  }
}
    ` as unknown as DocumentNode<GetReputationsQuery, GetReputationsQueryVariables>;



export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    GetPosts(variables?: GetPostsQueryVariables, options?: C): Promise<GetPostsQuery> {
      return requester<GetPostsQuery, GetPostsQueryVariables>(GetPostsDocument, variables, options) as Promise<GetPostsQuery>;
    },
    GetReputations(variables?: GetReputationsQueryVariables, options?: C): Promise<GetReputationsQuery> {
      return requester<GetReputationsQuery, GetReputationsQueryVariables>(GetReputationsDocument, variables, options) as Promise<GetReputationsQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;