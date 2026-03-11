"use client";

import { Button, TextInput, Text, Container, SimpleGrid, Skeleton, Box } from "@mantine/core";
import axios from "axios";
import { useState, useEffect } from "react";

interface Content {
  id: string;
  url: string;
  type: string;
  isWatched: boolean;
}

interface OEmbed {
  title: string;
  thumbnail_url: string;
  author_name: string;
}

function YoutubeCard({
  content,
  onToggleWatched,
}: {
  content: Content;
  onToggleWatched: (id: string, current: boolean) => void;
}) {
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
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", display: "block" }}
        >
          <div style={{ aspectRatio: "16 / 9" }}>
            <img
              src={meta.thumbnail_url}
              alt={meta.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.2s ease",
                transform: hovered ? "scale(1.03)" : "scale(1)",
                filter: content.isWatched ? "brightness(0.4)" : "none",
              }}
            />
          </div>
        </a>

        {/* Hover overlay with toggle */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <button
            onClick={() => onToggleWatched(content.id, content.isWatched)}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              border: "none",
              backgroundColor: content.isWatched ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.92)",
              color: content.isWatched ? "#fff" : "#111",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              backdropFilter: "blur(6px)",
              letterSpacing: "0.2px",
              transition: "background-color 0.15s ease",
              pointerEvents: "auto",
            }}
          >
            {content.isWatched ? "↩️ unmark" : "👁️ mark as watched"}
          </button>
        </div>

        {/* Persistent watched indicator */}
        {content.isWatched && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#2f9e44",
              boxShadow: "0 0 0 2px rgba(47,158,68,0.3)",
            }}
          />
        )}
      </div>

      {/* Info */}
      <Box mt={10}>
        <Text
          fw={600}
          size="sm"
          lineClamp={2}
          style={{
            color: content.isWatched ? "#aaa" : "#111",
            lineHeight: 1.4,
          }}
        >
          {meta.title}
        </Text>
        <Text size="xs" mt={4} style={{ color: "#888" }}>
          {meta.author_name}
        </Text>
      </Box>
    </div>
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

  async function handleToggleWatched(id: string, current: boolean) {
    // Optimistic update
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isWatched: !current } : c))
    );
    await axios.patch("/api/contents", { id, isWatched: !current });
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #e5e5e5",
          padding: "16px 0",
          position: "sticky",
          top: 0,
          backgroundColor: "#f5f5f5",
          zIndex: 10,
        }}
      >
        <Container size="lg">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#111", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
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
                    backgroundColor: "#fff",
                    border: `1px solid ${error ? "#e03131" : "#ddd"}`,
                    color: "#111",
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
            <Text style={{ color: "#aaa", fontSize: 15 }}>
              No videos yet. Paste a YouTube URL above to get started.
            </Text>
          </div>
        ) : (
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="xl">
            {[...contents]
              .sort((a, b) => Number(a.isWatched) - Number(b.isWatched))
              .map((c) => (
                <YoutubeCard key={c.id} content={c} onToggleWatched={handleToggleWatched} />
              ))}
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
