import type { MetadataRoute } from "next";

export const dynamic = "force-static";

function getBasePath() {
  if (process.env.GITHUB_PAGES !== "true") return "";
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "fitpush.vg";
  return `/${repoName}`;
}

export default function manifest(): MetadataRoute.Manifest {
  const basePath = getBasePath();

  return {
    name: "FitPush — AI Fitness Coach",
    short_name: "FitPush",
    description: "Track diet, workouts, and get AI coaching for recomposition goals",
    start_url: `${basePath}/`,
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#10b981",
    orientation: "portrait",
    icons: [
      {
        src: `${basePath}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
