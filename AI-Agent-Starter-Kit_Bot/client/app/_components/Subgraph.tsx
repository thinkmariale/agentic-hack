"use client";

import { Button } from "@/components/ui/button";
import {  useState } from "react";

export function Subgraph() {
  const [isLoading, setIsLoading] = useState(false);


  const handleAddInfringerSubgraph = async (e: React.MouseEvent) => {
    console.log('handleAddInfringerSubgraph')
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/subgraph/add`, {
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
      // sessionStorage.setItem("github_redirect_url", window.location.href);
      // window.location.href = data.authUrl;
    } catch (error: unknown) {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full my-4">
      <Button
        type="button"
        onClick={handleAddInfringerSubgraph}
        disabled={isLoading}
        className="flex items-center gap-2 bg-[#24292e] hover:bg-[#1c2024] text-white rounded"
      >
        {isLoading ? "Connecting..." : "Add Infringer"}
      </Button>
    </div>
  );
}
