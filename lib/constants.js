import { Code, Palette, Sparkles } from "lucide-react";

export const VAULT_PURPOSE_MAPPING = {
  development: {
    label: "Development",
    icon: Code,
    deliverables: [
      {
        id: "github_repo",
        label: "GitHub Repository",
        type: "link",
        rules: [
          "Repository exists",
          "Commit after vault date",
          "Source code detected",
        ],
      },
      {
        id: "live_webapp",
        label: "Deployed Web App (URL)",
        type: "link",
        rules: [
          "Hosted URL reachable",
          "SSL certificate valid",
          "Dynamic content detected",
        ],
      },
      {
        id: "api_endpoint",
        label: "Live API Endpoint",
        type: "link",
        rules: ["Returns 200 OK", "JSON schema valid", "Uptime verification"],
      },
      {
        id: "mobile_app",
        label: "Mobile App (Link/Build)",
        type: "link", // Could be file or link, usually link for TestFlight/Play Store
        rules: [
          "TestFlight/Play Store link valid",
          "App package detected",
          "Bundle ID verification",
        ],
      },
    ],
  },
  design: {
    label: "Creative & Design",
    icon: Palette,
    deliverables: [
      {
        id: "figma_link",
        label: "Figma File",
        type: "link",
        rules: ["Link is valid", "Access granted", "Last modified check"],
      },
      {
        id: "design_handoff",
        label: "Design System / Handoff",
        type: "link", // Often a link to zeroheight or similar, or file. Let's assume link for now or generic.
        rules: ["Documentation detected", "Assets linked", "Specs defined"],
      },
      {
        id: "asset_pack",
        label: "Design Assets (ZIP)",
        type: "file",
        rules: [
          "Minimum size 5MB",
          "High-res formats (SVG/PNG)",
          "Corrupt file check",
        ],
      },
    ],
  },
  content_ai: {
    label: "Media, Content & AI",
    icon: Sparkles,
    deliverables: [
      {
        id: "doc_submission",
        label: "Technical Document",
        type: "file",
        rules: [
          "Word count > 500",
          "No plagiarism detected",
          "Formatting check",
        ],
      },
      {
        id: "audio_video",
        label: "Media Assets (Audio/Video)",
        type: "file",
        rules: [
          "Media duration detected",
          "Codec validation (MP4/WAV)",
          "Resolution > 720p",
        ],
      },
      {
        id: "ai_dataset",
        label: "JSON/CSV Dataset",
        type: "file",
        rules: [
          "Valid format",
          "Minimum 100 entries",
          "Data structure integrity",
        ],
      },
    ],
  },
};
