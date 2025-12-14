"use client";

import { TGVideo } from "@/lib/api/modules/tg.api";
import { VideoCard } from "./video-card";

interface VideoGridProps {
  videos: TGVideo[];
  className?: string;
}

export function VideoGrid({ videos, className = "" }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-600">No videos available.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

