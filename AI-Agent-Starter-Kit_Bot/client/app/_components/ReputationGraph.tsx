"use client";
import React, { useEffect, useMemo } from 'react'

import { Button } from "@/components/ui/button";
import {  useState } from "react";
import { GetReputationsDocument, GetPostsDocument, execute } from '../../.graphclient';
import { DataTable, TableColumn } from '@/components/ui/grid/grid';

export function ReputationGraph() {
  const [isLoading, setIsLoading] = useState(false);
  const [reputations, setReputations] = React.useState<GetReputationsDocument>()
  const [posts, setPosts] = React.useState<GetPostsDocument>()

  function callUsersGraph() {
    execute(GetReputationsDocument, {}).then((result: { data: any; }) => {
      setReputations(result?.data)
    })
  }

  function callPostsGraph() {
    execute(GetPostsDocument, {}).then((result: { data: any; }) => {
      setPosts(result?.data)
    })
  }

  useEffect(() => {
    callUsersGraph()
    callPostsGraph()
  }, [setReputations, setPosts])

  const handleAddInfringerSubgraph = async (e: React.MouseEvent) => {
    console.log('handleAddInfringerSubgraph')
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reputation/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      alert("Added successfully")
      setIsLoading(false);
      callUsersGraph()
      // sessionStorage.setItem("github_redirect_url", window.location.href);
      // window.location.href = data.authUrl;
    } catch (error: unknown) {
      setIsLoading(false);
    }
  };

  const reputationGraphColumnDefs: TableColumn[] = useMemo(() => [
    {
      title: 'User ID',
      id: 'userId',
    },
    {
      title: 'Reputation Score',
      id: 'reputationScore',
    },
    {
      title: 'Post Count',
      id: 'postCount',
    },
    {
      title: 'Platform',
      id: 'platform',
    },
    {
      title: 'Offense Count',
      id: 'offenseCount',
    },
    {
      title: 'Last Offense Timestamp',
      id: 'lastOffenseTimestamp',
    },
    {
      title: 'First Offense Timestamp',
      id: 'firstOffenseTimestamp',
    },
    {
      title: 'Username',
      id: 'username',
    },
  ], [])


  const postsColumnDefs: TableColumn[] = useMemo(() => [
    {
      title: 'User ID',
      id: 'userId',
    },
    {
      title: 'Record ID',
      id: 'recordId',
    },
    {
      title: 'Severity Score',
      id: 'severityScore',
    },
    {
      title: 'Derived Context',
      id: 'derivedContext',
    },
    {
      title: 'Derived Context Explanation',
      id: 'derivedContextExplanation',
    },
    {
      title: 'Post Text',
      id: 'postText',
    },
    {
      title: 'Post URL',
      id: 'postUrl',
    },
  ], [])

  return (
    <div className="flex flex-col">
      <Button
        type="button"
        onClick={handleAddInfringerSubgraph}
        disabled={isLoading}
        className="flex items-center gap-2 bg-[#24292e] hover:bg-[#1c2024] text-white rounded"
      >
        {isLoading ? "Connecting..." : "Add Infringer"}
      </Button>

      <div style={{ width: "1200px" }}>

          {reputations && (
              <DataTable title='Users' columns={reputationGraphColumnDefs} data={reputations?.copyrightInfringementUsers} />
          )}
          {posts && (
              <DataTable title='Reported Posts' columns={postsColumnDefs} data={posts?.reportedPosts} />
          )}
        </div>
    </div>
  );
}
