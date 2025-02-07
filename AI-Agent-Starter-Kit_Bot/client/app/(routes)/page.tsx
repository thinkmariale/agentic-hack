"use client";

import { ReactElement } from "react";
import HelloWorld from "../_components/HelloWorld";
// import TelegramUser from "../_components/TelegramUser";
// import { TwitterLogin } from "../_components/TwitterLogin";
// import { DiscordLogin } from "../_components/DiscordLogin";
// import { GithubLogin } from "../_components/GithubLogin";
import { Subgraph } from "../_components/Subgraph";

export default function Home(): ReactElement {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <HelloWorld />
        <Subgraph />
        {/* <TelegramUser />
        <TwitterLogin />
        <DiscordLogin />
        <GithubLogin /> */}
      </div>
    </main>
  );
}
