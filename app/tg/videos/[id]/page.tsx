"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { VideoCard } from "@/components/tg/video-card";
import { useTGVideo, useRelatedTGVideos } from "@/lib/hooks/useTG";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { formatDate } from "@/lib/helpers/formatDate";
import Link from "next/link";

// Lazy load heavy video player component
const VideoPlayer = dynamic(() => import("@/components/ui/video-player").then((mod) => ({ default: mod.VideoPlayer })), {
  loading: () => <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center"><Loading /></div>,
  ssr: false,
});

export default function TGVideoDetailPage() {
  const params = useParams();
  const videoId = params?.id as string;

  const { data: videoData, isLoading, error } = useTGVideo(videoId);
  const { data: relatedData } = useRelatedTGVideos(videoId);

  const video = videoData?.data;
  const relatedVideos = relatedData?.data?.videos || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Loading />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <ErrorMessage error={error || new Error("Video not found")} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video */}
          <div className="lg:col-span-2">
            <VideoPlayer
              mediaId={video.id}
              poster={video.thumbnailUrl}
              className="w-full mb-6"
            />
            <div>
              <h1 className="text-3xl font-bold mb-4 text-gray-900">{video.news.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>{formatDate(video.news.createdAt, "MMM dd, yyyy")}</span>
                {video.news.category && (
                  <Link
                    href={`/category/${video.news.category.slug}`}
                    className="hover:text-red-600 transition"
                  >
                    {video.news.category.nameEn}
                  </Link>
                )}
                {video.news.author && (
                  <span>By {video.news.author.name}</span>
                )}
              </div>
              <p className="text-gray-700 mb-6">{video.news.summary}</p>
              {video.duration && (
                <div className="text-sm text-gray-600">
                  Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Related Videos</h2>
            {relatedVideos.length > 0 ? (
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <VideoCard key={relatedVideo.id} video={relatedVideo} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No related videos available.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

