"use client";

import { Button, TextInput, Text, Container, SimpleGrid, Skeleton, Box } from "@mantine/core";
import axios from "axios";
import { useState, useEffect } from "react";

interface Content {
  id: string;
  url: string;
  type: string;
}

interface OEmbed {
  title: string;
  thumbnail_url: string;
  author_name: string;
}

function YoutubeCard({ content }: { content: Content }) {
  const [meta, setMeta] = useState<OEmbed | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    axios
      .get(`https://www.youtube.com/oembed?url=${encodeURIComponent(content.url)}&format=json`)
      .then((res) => setMeta(res.data))
      .catch(() => setMeta(null));
  }, [content.url]);

  if (!meta) {
    return (
      <div>
        <Skeleton style={{ aspectRatio: "16 / 9", borderRadius: 8 }} />
        <Box mt={10}>
          <Skeleton height={14} width="90%" mb={6} radius="sm" />
          <Skeleton height={12} width="50%" radius="sm" />
        </Box>
      </div>
    );
  }

  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          aspectRatio: "16 / 9",
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          transition: "opacity 0.15s ease",
          opacity: hovered ? 0.85 : 1,
        }}
      >
        <img
          src={meta.thumbnail_url}
          alt={meta.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <Box mt={10}>
        <Text
          fw={600}
          size="sm"
          lineClamp={2}
          style={{
            color: hovered ? "#e03131" : "#e8e8e8",
            lineHeight: 1.4,
            transition: "color 0.15s ease",
          }}
        >
          {meta.title}
        </Text>
        <Text size="xs" mt={4} style={{ color: "#666" }}>
          {meta.author_name}
        </Text>
      </Box>
    </a>
  );
}

export default function Page() {
  const [contentUrl, setContentUrl] = useState("");
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get("/api/contents").then((res) => setContents(res.data));
  }, []);

  function isValidYoutubeUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const validHosts = ["www.youtube.com", "youtube.com", "youtu.be"];
      if (!validHosts.includes(parsed.hostname)) return false;
      if (parsed.hostname === "youtu.be") return parsed.pathname.length > 1;
      return parsed.searchParams.has("v");
    } catch {
      return false;
    }
  }

  async function handleAdd() {
    if (!contentUrl.trim()) return;
    if (!isValidYoutubeUrl(contentUrl)) {
      setError("Please enter a valid YouTube URL.");
      return;
    }
    setError(null);
    setLoading(true);
    await axios.post("/api/contents", { url: contentUrl, type: "youtube" });
    setContentUrl("");
    const res = await axios.get("/api/contents");
    setContents(res.data);
    setLoading(false);
  }

  return (
    <div style={{ backgroundColor: "#0f0f0f", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1f1f1f",
          padding: "16px 0",
          position: "sticky",
          top: 0,
          backgroundColor: "#0f0f0f",
          zIndex: 10,
        }}
      >
        <Container size="lg">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
              enes watch later<span style={{ color: "#e03131" }}>.</span>
            </span>
            <div style={{ flex: 1, display: "flex", gap: 8 }}>
              <TextInput
                placeholder="Paste a YouTube URL and press Enter..."
                value={contentUrl}
                onChange={(e) => { setContentUrl(e.currentTarget.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                error={error}
                style={{ flex: 1, maxWidth: 480 }}
                styles={{
                  input: {
                    backgroundColor: "#1a1a1a",
                    border: `1px solid ${error ? "#e03131" : "#2a2a2a"}`,
                    color: "#e8e8e8",
                    fontSize: 13,
                  },
                }}
              />
              <Button
                onClick={handleAdd}
                loading={loading}
                color="red"
                size="sm"
                style={{ flexShrink: 0 }}
              >
                Add
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container size="lg" py={36}>
        {contents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Text style={{ color: "#333", fontSize: 15 }}>
              No videos yet. Paste a YouTube URL above to get started.
            </Text>
          </div>
        ) : (
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="xl">
            {contents.map((c) => (
              <YoutubeCard key={c.id} content={c} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
