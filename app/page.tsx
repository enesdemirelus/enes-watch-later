"use client";

import {
  Button,
  TextInput,
  Text,
  Container,
  SimpleGrid,
  Skeleton,
  Box,
} from "@mantine/core";
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
  onDelete,
}: {
  content: Content;
  onToggleWatched: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [meta, setMeta] = useState<OEmbed | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    axios
      .get(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(content.url)}&format=json`,
      )
      .then((res) => setMeta(res.data))
      .catch(() => setMeta(null));
  }, [content.url]);

  if (!meta) {
    return (
      <div style={{
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}>
        <Skeleton style={{ aspectRatio: "16 / 9" }} radius={0} />
        <div style={{ padding: "14px 16px", flex: 1 }}>
          <Skeleton height={13} width="80%" mb={10} radius={4} />
          <Skeleton height={11} width="45%" radius={4} />
        </div>
        <div style={{ display: "flex", gap: 8, padding: "0 16px 14px" }}>
          <Skeleton height={32} radius={8} style={{ flex: 1 }} />
          <Skeleton height={32} width={32} radius={8} />
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* Thumbnail */}
      <a
        href={content.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", display: "block", flexShrink: 0, position: "relative" }}
      >
        <div style={{ aspectRatio: "16 / 9", overflow: "hidden" }}>
          <img
            src={meta.thumbnail_url}
            alt={meta.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              filter: content.isWatched ? "brightness(0.5) grayscale(0.3)" : "none",
            }}
          />
        </div>
        {content.isWatched && (
          <div style={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 6,
            backdropFilter: "blur(4px)",
          }}>
            watched
          </div>
        )}
      </a>

      {/* Info */}
      <div style={{ padding: "12px 16px 0", flex: 1, overflow: "hidden" }}>
        <Text
          fw={600}
          size="13px"
          lineClamp={2}
          style={{
            color: content.isWatched ? "#bbb" : "#1a1a1a",
            lineHeight: 1.4,
          }}
        >
          {meta.title}
        </Text>
        <Text size="11px" mt={4} style={{ color: "#aaa" }}>
          {meta.author_name}
        </Text>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, padding: "8px 12px 12px" }}>
        <button
          onClick={() => onToggleWatched(content.id, content.isWatched)}
          style={{
            flex: 1,
            height: 32,
            borderRadius: 8,
            border: "none",
            backgroundColor: content.isWatched ? "#e6f9ed" : "#f4f4f5",
            color: content.isWatched ? "#1a7f37" : "#666",
            fontWeight: 600,
            fontSize: 11,
            cursor: "pointer",
            transition: "background-color 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = content.isWatched ? "#d1f5db" : "#eaeaeb";
            e.currentTarget.style.color = content.isWatched ? "#157a30" : "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = content.isWatched ? "#e6f9ed" : "#f4f4f5";
            e.currentTarget.style.color = content.isWatched ? "#1a7f37" : "#666";
          }}
        >
          {content.isWatched ? "Watched" : "Not watched"}
        </button>
        <button
          onClick={() => onDelete(content.id)}
          style={{
            height: 32,
            padding: "0 12px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#f4f4f5",
            color: "#bbb",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fde8e8";
            e.currentTarget.style.color = "#e03131";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f4f4f5";
            e.currentTarget.style.color = "#bbb";
          }}
        >
          Remove
        </button>
      </div>
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
      prev.map((c) => (c.id === id ? { ...c, isWatched: !current } : c)),
    );
    await axios.patch("/api/contents", { id, isWatched: !current });
  }

  async function handleDelete(id: string) {
    setContents((prev) => prev.filter((c) => c.id !== id));
    await axios.delete("/api/contents", { data: { id } });
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #e5e5e5",
          padding: "14px 0",
          position: "sticky",
          top: 0,
          backgroundColor: "#f5f5f5",
          zIndex: 10,
        }}
      >
        <Container size="lg">
          <div className="header-inner">
            <span className="header-logo">
              enes watch later<span style={{ color: "#e03131" }}>.</span>
            </span>
            <div className="header-search">
              <TextInput
                placeholder="Paste a YouTube URL and press Enter..."
                value={contentUrl}
                onChange={(e) => {
                  setContentUrl(e.currentTarget.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                error={error}
                style={{ flex: 1, maxWidth: 400 }}
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
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="lg">
            {[...contents]
              .sort((a, b) => Number(a.isWatched) - Number(b.isWatched))
              .map((c) => (
                <YoutubeCard
                  key={c.id}
                  content={c}
                  onToggleWatched={handleToggleWatched}
                  onDelete={handleDelete}
                />
              ))}
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
