"use client";

import dynamic from "next/dynamic";

const TimeBlockMobileApp = dynamic(
  () => import("./timeblock-app"),
  {
    ssr: false,
    loading: () => <div className="min-h-screen" />,
  }
);

export default function TimeBlockMobileAppClient() {
  return <TimeBlockMobileApp />;
}
