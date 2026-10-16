import { useState } from "react";
import { Code, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { env } from "@/env";

const API_BASE = env.API_URL;

const examples = {
  curl: `curl -X POST "${API_BASE}/links" \\
  -H "Authorization: Bearer {API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "key": "my-link"
  }'`,
  javascript: `const response = await fetch("${API_BASE}/links", {
  method: "POST",
  headers: {
    "Authorization": "Bearer {API_KEY}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://example.com",
    key: "my-link",
  }),
});

const data = await response.json();
console.log(data);`,
  python: `import requests

response = requests.post(
    "${API_BASE}/links",
    headers={
        "Authorization": "Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "url": "https://example.com",
        "key": "my-link",
    },
)

print(response.json())`,
  php: `<?php
$ch = curl_init("${API_BASE}/links");

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer {API_KEY}",
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "url" => "https://example.com",
        "key" => "my-link",
    ]),
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;`,
  go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "io"
)

func main() {
    body, _ := json.Marshal(map[string]string{
        "url": "https://example.com",
        "key": "my-link",
    })

    req, _ := http.NewRequest("POST", "${API_BASE}/links", bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer {API_KEY}")
    req.Header.Set("Content-Type", "application/json")

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()

    data, _ := io.ReadAll(resp.Body)
    fmt.Println(string(data))
}`,
};

const langLabels: Record<string, string> = {
  curl: "cURL",
  javascript: "JavaScript",
  python: "Python",
  php: "PHP",
  go: "Go",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-7 w-7 absolute top-2 right-2" onClick={copy}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function ApiExamplesSheet() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon" />}>
        <Code className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>API Examples</SheetTitle>
          <SheetDescription>
            Create short links programmatically using the API.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Tabs defaultValue="curl">
            <TabsList className="w-full">
              {Object.keys(examples).map((lang) => (
                <TabsTrigger key={lang} value={lang} className="text-xs">
                  {langLabels[lang]}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(examples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <div className="relative rounded-lg border bg-muted/50 p-4">
                  <CopyButton text={code} />
                  <pre className="text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all font-mono text-foreground pr-8">
                    {code}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={<a href="https://idm.in/docs/api" target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Full API Reference
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
