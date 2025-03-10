"use client";
import React, { useEffect, useMemo } from 'react'

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GetReputationsDocument, GetPostsDocument, execute } from '../../.graphclient';
import { DataTable, TableColumn } from '@/components/ui/grid/grid';
import { Card } from '@/components/ui/card';

export function ReputationGraph() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshingGraphs, setRefreshingGraphs] = useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [reputations, setReputations] = React.useState<GetReputationsDocument>()
  const [posts, setPosts] = React.useState<GetPostsDocument>()

  const callUsersGraph = async () => {
    return new Promise((resolve, reject) => {
      execute(GetReputationsDocument, {}).then((result: { data: any; }) => {
        setReputations(result?.data?.reputationTypes)
        resolve(result)
      }).catch((error: any) => {
        reject(error)
      })
    })
  }

  const callPostsGraph = async () => {
    return new Promise((resolve, reject) => {
      execute(GetPostsDocument, {}).then((result: { data: any; }) => {
        setPosts(result?.data?.reportedPostTypes)
        resolve(result)
      }).catch((error: any) => {
        reject(error)
      })
    })
  }

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    callUsersGraph()
    callPostsGraph()
  }, [setReputations, setPosts])

  const handleRefreshGraph = async () => {
    setRefreshingGraphs(true);
    try {
      await callUsersGraph()
      await callPostsGraph()
    } catch (error) {
      console.error("Error refreshing graph", error);
    } finally {
      setRefreshingGraphs(false);
    }
  }

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
  // const handleVerify = async (e: React.MouseEvent) => {
  //   console.log('handleVerify')
  //   e.preventDefault();
  //   setIsLoading(true);

  //   const info ={
  //     wallet: 'na',
  //     contentURL: 'https://pbs.twimg.com/media/GjSzA2HWgAAWVFD?format=jpg'
  //   }
  //   try {
  //     const response = await fetch(`/api/reputation/verify/file`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(info)
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     alert(data.message)
    
  //     setIsLoading(false);
  //     callUsersGraph()

  //   } catch (error: unknown) {
  //     setIsLoading(false);
  //   }
  // };
  // const handleMint = async (e: React.MouseEvent) => {
  //   console.log('handleMint')
  //   e.preventDefault();
  //   setIsLoading(true);

  //   const createCert ={
  //     name: 'funkyfrogs',
  //     wallet: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
  //     description: 'Certificate created from IP Defender Agent chat',
  //     usingAI: true,
  //     contentURL: 'https://pbs.twimg.com/media/GjSzA2HWgAAWVFD?format=jpg'
  //   }
  //   try {
  //     const response = await fetch(`/api/reputation/mint/file`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(createCert)
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     alert(data.message)
    
  //     setIsLoading(false);
  //     callUsersGraph()

  //   } catch (error: unknown) {
  //     setIsLoading(false);
  //   }
  // };
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
    <Card style={{ 
      marginTop: "15px",
      padding: "20px",
      flex: 1,
      display: "flex",
      width: "60%",
      }}>
      
      {/* <Button
          type="button"
          onClick={handleAddInfringerSubgraph}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#24292e] hover:bg-[#1c2024] text-white rounded"
        >
          {isLoading ? "Connecting..." : "Add Infringer"}
        </Button> */}

      <div className="flex flex-col" style={{ width: "100%", maxWidth: "70vw", marginTop: "15px", gap: "15px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 600 }}>Reputation Graphs</h1>
        <h3 style={{ fontSize: "18px", fontWeight: 500 }}>Smart Contract (Base): 0x984B06553b696d813A0D2C4475ba9aF5405EeeEe</h3>
        <h1 style={{ fontSize: "15px", fontWeight: 300 }}>Subgraph: https://thegraph.com/studio/subgraph/ip-reputationagent</h1>

        {/* create a grid with 2 columns */}
        <div style={{
          // grid has 2 columns and spans the full width
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "15px",
          width: "100%",
        }}>
          {/* <Button
            type="button"
            onClick={handleAddInfringerSubgraph}
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#24292e] hover:bg-[#1c2024] text-white rounded"
          >
            {isLoading ? "Connecting..." : "Add Infringer"}
          </Button> */}
          {!isLoading && mounted && (
            <Button
              type="button"
              onClick={handleRefreshGraph}
              disabled={refreshingGraphs}
              className="flex items-center gap-2 bg-[#24292e] hover:bg-[#1c2024] text-white rounded"
            >
              {refreshingGraphs ? "Refreshing..." : "Refresh Graphs"}
            </Button>
          )}
        </div>
        {mounted &&
          <div style={{ 
              padding: "20px 0 25px", 
              display: "flex", 
              flexDirection: "column", 
              width: "100%", 
              gap: "40px" 
              }}
            >
            <DataTable title='Users' columns={reputationGraphColumnDefs} data={reputations} />
            <DataTable title='Reported Posts' columns={postsColumnDefs} data={posts} />
          </div>}
      </div>
    </Card>
  );
}
