"use client";
import React, { useEffect } from 'react'

import { Button } from "@/components/ui/button";
import {  useState } from "react";
import { GetReputationsDocument, GetPostsDocument, execute } from '../../.graphclient';

export function ReputationGraph() {
  const [isLoading, setIsLoading] = useState(false);
  const [reputations, setReputations] = React.useState<GetReputationsDocument>()
  const [posts, setPosts] = React.useState<GetPostsDocument>()

  function callGraph() {
    execute(GetReputationsDocument, {}).then((result: { data: any; }) => {
      setReputations(result?.data)
    })
    execute(GetPostsDocument, {}).then((result: { data: any; }) => {
      setPosts(result?.data)
    })
  }
  useEffect(() => {
    callGraph()
  }, [setReputations])

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
      callGraph()
      // sessionStorage.setItem("github_redirect_url", window.location.href);
      // window.location.href = data.authUrl;
    } catch (error: unknown) {
      setIsLoading(false);
    }
  };

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
            <form>
              <label>CopyrightInfringementUser</label>
              <br />
              <textarea style={{ width: "100%" }} value={JSON.stringify(reputations, null, 2)} readOnly rows={25} />
            </form>
          )}
          {posts && (
            <form>
              <label>GetPostsDocument</label>
              <br />
              <textarea style={{ width: "100%" }} value={JSON.stringify(posts, null, 2)} readOnly rows={25} />
            </form>
          )}
      </div>
    </div>
  );
}
