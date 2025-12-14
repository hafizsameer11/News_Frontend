"use client";

import { usePopularTGVideos } from "@/lib/hooks/useTG";
import { VideoCard } from "./video-card";
import { VideoPlayer } from "@/components/ui/video-player";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import { formatDate } from "@/lib/helpers/formatDate";

export function FeaturedVideoSection() {
  const { data, isLoading, error } = usePopularTGVideos(1);

  if (isLoading) {
    return (
      <div className="mb-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <ErrorMessage error={error} />
      </div>
    );
  }

  const featuredVideo = data?.data?.videos?.[0];

  if (!featuredVideo) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Featured Video</h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative aspect-video bg-gray-900">
          <VideoPlayer
            mediaId={featuredVideo.id}
            poster={featuredVideo.thumbnailUrl}
            className="w-full h-full"
          />
        </div>
        <div className="p-6">
          <Link href={`/tg/videos/${featuredVideo.id}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-red-600 transition">
              {featuredVideo.news.title}
            </h3>
          </Link>
          <p className="text-gray-700 mb-4 line-clamp-3">{featuredVideo.news.summary}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{formatDate(featuredVideo.news.createdAt, "MMM dd, yyyy")}</span>
            {featuredVideo.news.category && (
              <Link
                href={`/category/${featuredVideo.news.category.slug}`}
                className="hover:text-red-600 transition"
              >
                {featuredVideo.news.category.nameEn}
              </Link>
            )}
            {featuredVideo.duration && (
              <span>
                {Math.floor(featuredVideo.duration / 60)}:
                {(featuredVideo.duration % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

