"use client";

import { Button, TextInput } from "@mantine/core";
import axios from "axios";
import { useState, useEffect } from "react";

export default function Page() {
  const [contentUrl, setContentUrl] = useState("");
  const [contents, setContents] = useState([]);

  useEffect(() => {
    axios.get("/api/contents").then((res) => setContents(res.data));
  }, []);

  async function handleClick() {
    await axios.post("/api/contents", {
      url: contentUrl,
      type: "youtube",
    });
    setContentUrl("");
    const res = await axios.get("/api/contents");
    setContents(res.data);
  }

  return (
    <div>
      <TextInput
        radius="xl"
        placeholder="Input placeholder"
        value={contentUrl}
        onChange={(event) => setContentUrl(event.currentTarget.value)}
      />
      <Button onClick={handleClick}>Click me</Button>
      {contents.map((c: any) => (
        <div key={c.id}>{c.url}</div>
      ))}
    </div>
  );
}
