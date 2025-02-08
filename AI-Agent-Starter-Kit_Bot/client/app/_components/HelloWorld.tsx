"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, AlertCircle } from "lucide-react";
import ChatBox from "@/components/ui/chatBox/chatBox";

export default function HelloWorld() {
  const [isConfigured, setIsConfigured] = useState<boolean>(
    !!process.env.NEXT_PUBLIC_API_URL
  );
  const [data, setData] = useState<any>(null);
  const [messageResponse, setMessageResponse] = useState<string>('');
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsConfigured(!!process.env.NEXT_PUBLIC_API_URL);
  }, []);

  useEffect(() => {
    if (isConfigured) {
      axios
        .get("/api/hello/collabland")
        .then((res) => setData(res.data))
        .catch((err) => setError(err.message));
    }
  }, [isConfigured]);

  const onSendMessage = useCallback(async (message: string, file?: File) => {
    try {
      const response = await fetch(`/api/hello/chat`, {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log('response',response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessageResponse(data)
     
      return data
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Failed to send message",
      }
    }
   
  }, []);

  return (
    <div className="flex flex-col items-center w-full space-y-6 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Welcome to Infringer Defender</CardTitle>
          <CardDescription>
           Where your IP is controlled and your reputation is protected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChatBox onSendMessage={onSendMessage} />
          {/* <Alert variant={isConfigured ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Configuration Status</AlertTitle>
            <AlertDescription>
              {isConfigured
                ? "API URL is properly configured"
                : "API URL is not configured"}
            </AlertDescription>
          </Alert> */}

          {isConfigured && (
            <>
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Server Configuration</AlertTitle>
                    <AlertDescription>
                      Get started on the server by editing{" "}
                      <code className="font-bold text-blue-500">
                        /server/src/routes/hello.ts
                      </code>
                    </AlertDescription>
                  </Alert> */}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Response Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-secondary/50 p-4 overflow-auto w-full whitespace-pre-wrap bg-slate-100 rounded-lg">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
