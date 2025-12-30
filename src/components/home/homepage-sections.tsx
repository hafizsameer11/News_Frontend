"use client";

import Link from "next/link";
import { HomepageSection } from "@/lib/api/modules/homepage.api";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getImageUrl } from "@/lib/helpers/imageUrl";
import { formatRelativeTime, formatDate } from "@/lib/helpers/formatDate";
import { News } from "@/types/news.types";

interface HomepageSectionsProps {
  sections: HomepageSection[];
}

export function HomepageSections({ sections }: HomepageSectionsProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {sections.map((section) => (
        <HomepageSectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

function HomepageSectionRenderer({ section }: { section: HomepageSection }) {
  const news = section.data || [];

  // If section has no data, show empty state
  if (!news || news.length === 0) {
    return (
      <div className="mb-12 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
        {section.title && (
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            {section.title}
          </h2>
        )}
        <p className="text-gray-500 text-sm">
          {section.dataSource === "manual"
            ? "No news items selected for this manual list. Please configure news items in the admin panel."
            : "No content available for this section. Please check the data source configuration."}
        </p>
      </div>
    );
  }

  switch (section.type) {
    case "HERO_SLIDER":
      return <HeroSliderSection section={section} news={news} />;
    case "BREAKING_TICKER":
      return <BreakingTickerSection section={section} news={news} />;
    case "FEATURED_SECTION":
      return <FeaturedSection section={section} news={news} />;
    case "CATEGORY_BLOCK":
      return <CategoryBlockSection section={section} news={news} />;
    case "MANUAL_LIST":
      return <ManualListSection section={section} news={news} />;
    default:
      return null;
  }
}

function HeroSliderSection({
  section,
  news,
}: {
  section: HomepageSection;
  news: News[];
}) {
  const mainStory = news[0];
  const sideStories = news.slice(1, 4);

  return (
    <div className="mb-12">
      {section.title && (
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          {section.title}
        </h2>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Story */}
        <div className="lg:col-span-8">
          {mainStory && (
            <Link href={`/news/${mainStory.slug || mainStory.id}`}>
              <div className="group cursor-pointer">
                <div className="relative h-96 mb-4 overflow-hidden rounded-lg">
                  {mainStory.mainImage && mainStory.mainImage.trim() !== "" ? (
                    mainStory.mainImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <div className="relative w-full h-full">
                        <video
                          src={getImageUrl(mainStory.mainImage)}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/90 rounded-full p-4">
                            <svg
                              className="w-12 h-12 text-gray-900"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <OptimizedImage
                        src={getImageUrl(mainStory.mainImage)}
                        alt={mainStory.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority
                        loading="eager"
                        quality={85}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
                  {mainStory.title}
                </h1>
                {mainStory.summary && (
                  <p className="text-gray-600 mb-3 line-clamp-3">
                    {mainStory.summary}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatDate(mainStory.createdAt, "MMM dd, yyyy")}</span>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Side Stories */}
        <div className="lg:col-span-4 space-y-4">
          {sideStories.map((story) => (
            <Link key={story.id} href={`/news/${story.slug || story.id}`}>
              <div className="group cursor-pointer">
                <div className="relative h-32 mb-2 overflow-hidden rounded">
                  {story.mainImage && story.mainImage.trim() !== "" ? (
                    story.mainImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <div className="relative w-full h-full">
                        <video
                          src={getImageUrl(story.mainImage)}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/80 rounded-full p-2">
                            <svg
                              className="w-6 h-6 text-gray-900"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <OptimizedImage
                        src={getImageUrl(story.mainImage)}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        quality={75}
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(story.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function BreakingTickerSection({
  section,
  news,
}: {
  section: HomepageSection;
  news: News[];
}) {
  return (
    <div className="mb-12">
      {section.title && (
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {section.title}
        </h2>
      )}
      <div className="bg-red-600 text-white p-4 rounded-lg">
        <div className="space-y-2">
          {news.slice(0, 5).map((story) => (
            <Link key={story.id} href={`/news/${story.slug || story.id}`}>
              <div className="group cursor-pointer hover:bg-red-700 p-2 rounded transition">
                <h3 className="font-bold line-clamp-1 group-hover:underline">
                  {story.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedSection({
  section,
  news,
}: {
  section: HomepageSection;
  news: News[];
}) {
  return (
    <div className="mb-12">
      {section.title && (
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          {section.title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.slice(0, 6).map((story) => (
          <Link key={story.id} href={`/news/${story.slug || story.id}`}>
            <div className="group cursor-pointer">
              <div className="relative h-48 mb-3 overflow-hidden rounded">
                {story.mainImage && story.mainImage.trim() !== "" ? (
                  story.mainImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <div className="relative w-full h-full">
                      <video
                        src={getImageUrl(story.mainImage)}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="bg-white/80 rounded-full p-3">
                          <svg
                            className="w-8 h-8 text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <OptimizedImage
                      src={getImageUrl(story.mainImage)}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
                {story.title}
              </h3>
              {story.summary && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {story.summary}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {formatRelativeTime(story.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategoryBlockSection({
  section,
  news,
}: {
  section: HomepageSection;
  news: News[];
}) {
  return (
    <div className="mb-12">
      {section.title && (
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          {section.title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {news.slice(0, 8).map((story) => (
          <Link key={story.id} href={`/news/${story.slug || story.id}`}>
            <div className="group cursor-pointer">
              <div className="relative h-32 mb-2 overflow-hidden rounded">
                {story.mainImage ? (
                  story.mainImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <div className="relative w-full h-full">
                      <video
                        src={getImageUrl(story.mainImage)}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="bg-white/80 rounded-full p-2">
                          <svg
                            className="w-6 h-6 text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <OptimizedImage
                      src={getImageUrl(story.mainImage)}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2">
                {story.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatRelativeTime(story.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ManualListSection({
  section,
  news,
}: {
  section: HomepageSection;
  news: News[];
}) {
  return (
    <div className="mb-12">
      {section.title && (
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          {section.title}
        </h2>
      )}
      <div className="space-y-4">
        {news.map((story) => (
          <Link key={story.id} href={`/news/${story.slug || story.id}`}>
            <div className="flex gap-4 group cursor-pointer border-b border-gray-200 pb-4 hover:bg-gray-50 p-2 rounded transition">
              <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded">
                {story.mainImage ? (
                  story.mainImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <div className="relative w-full h-full">
                      <video
                        src={getImageUrl(story.mainImage)}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="bg-white/80 rounded-full p-2">
                          <svg
                            className="w-5 h-5 text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <OptimizedImage
                      src={getImageUrl(story.mainImage)}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2">
                  {story.title}
                </h3>
                {story.summary && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {story.summary}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {formatRelativeTime(story.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
