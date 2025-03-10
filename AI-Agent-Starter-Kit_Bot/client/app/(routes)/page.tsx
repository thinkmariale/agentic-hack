"use client";

import { ReactElement } from "react";
import HelloWorld from "../_components/HelloWorld";
// import TelegramUser from "../_components/TelegramUser";
// import { TwitterLogin } from "../_components/TwitterLogin";
// import { DiscordLogin } from "../_components/DiscordLogin";
// import { GithubLogin } from "../_components/GithubLogin";
import { ReputationGraph } from "../_components/ReputationGraph";


export default function Home(): ReactElement {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full mx-auto" style={{ 
        height: "100%",
        maxWidth: "1800px",
        padding: "10px 20px"
        }}>
          <div style={{
            width: "100%",
            color: "#fff",
            padding: "10px 20px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "left",
          }}>
            <img src={"./img/defender-logo.png"} className="App-logo" alt="IP" style={{ width: "200px", height: "200px" }} />

            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 600 }}>Welcome to Infringer Defender</h1>
              <p style={{ fontSize: "22px", fontWeight: 400 }}>Where your IP is controlled and your reputation is protected</p>
            </div>
          </div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "flex-start",

        }}>
          <HelloWorld />
          <ReputationGraph />
        </div>
        {/* <TelegramUser />
        <TwitterLogin />
        <DiscordLogin />
        <GithubLogin /> */}
      </div>
    </main>
  );
}
