"use client";

import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { SubscriptionForm } from "@/components/newsletter/subscription-form";
import { AdSlot } from "@/components/ads/ad-slot";
import { useCategories } from "@/lib/hooks/useCategories";

// Social Media Icons Component
function SocialIcon({ name, href }: { name: string; href?: string }) {
  if (!href) return null;

  const iconContent = () => {
    switch (name.toLowerCase()) {
      case "facebook":
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "twitter":
      case "x":
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case "instagram":
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "youtube":
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-red-600 transition-colors duration-200"
      aria-label={name}
    >
      {iconContent()}
    </a>
  );
}

export function Footer() {
  const { t, language } = useLanguage();
  const { data: categoriesData } = useCategories(true);

  // Flatten categories for sitemap
  const flattenCategories = (cats: any[]): any[] => {
    const result: any[] = [];
    for (const cat of cats || []) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children));
      }
    }
    return result;
  };

  const allCategories = categoriesData?.data
    ? flattenCategories(categoriesData.data)
    : [];
  const displayCategories = allCategories.slice(0, 10); // Show first 10 categories

  // Social media links from env vars
  const socialLinks = {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  };

  return (
    <footer className="bg-gray-900 text-white mt-20">
      {/* Footer Ad Slot */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-3 bg-gray-800">
        <AdSlot slot="FOOTER" />
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 lg:gap-8 xl:gap-10">
          {/* About Section */}
          <div className="sm:col-span-2 lg:col-span-2 flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-white">NEWS NEXT</h3>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              {t("footer.about.description")}
            </p>

            {/* Contact Information */}
            <div className="space-y-2 text-sm text-gray-400 mb-6">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
                <p>
                  <span className="font-semibold text-white">
                    {t("footer.about.email")}:
                  </span>{" "}
                  <a
                    href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                    className="hover:text-red-600 transition-colors"
                  >
                    {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
                  </a>
                </p>
              )}
              {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
                <p>
                  <span className="font-semibold text-white">
                    {t("footer.about.phone")}:
                  </span>{" "}
                  <a
                    href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}
                    className="hover:text-red-600 transition-colors"
                  >
                    {process.env.NEXT_PUBLIC_CONTACT_PHONE}
                  </a>
                </p>
              )}
              {process.env.NEXT_PUBLIC_CONTACT_ADDRESS && (
                <p>
                  <span className="font-semibold text-white">
                    {t("footer.about.address")}:
                  </span>{" "}
                  {process.env.NEXT_PUBLIC_CONTACT_ADDRESS}
                </p>
              )}
            </div>

            {/* Social Media */}
            {(socialLinks.facebook ||
              socialLinks.twitter ||
              socialLinks.instagram ||
              socialLinks.youtube) && (
              <div>
                <p className="text-sm font-semibold text-white mb-3">
                  {t("footer.social.follow")}
                </p>
                <div className="flex items-center gap-4">
                  {socialLinks.facebook && (
                    <SocialIcon name="facebook" href={socialLinks.facebook} />
                  )}
                  {socialLinks.twitter && (
                    <SocialIcon name="twitter" href={socialLinks.twitter} />
                  )}
                  {socialLinks.instagram && (
                    <SocialIcon name="instagram" href={socialLinks.instagram} />
                  )}
                  {socialLinks.youtube && (
                    <SocialIcon name="youtube" href={socialLinks.youtube} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-4 text-white text-base">
              {t("footer.quickLinks.title")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.quickLinks.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/weather"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.quickLinks.weather")}
                </Link>
              </li>
              <li>
                <Link
                  href="/horoscope"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.quickLinks.horoscope")}
                </Link>
              </li>
              <li>
                <Link
                  href="/sports"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {language === "it" ? "Sport" : "Sports"}
                </Link>
              </li>
              <li>
                <Link
                  href="/transport"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.quickLinks.transport")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tg"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.quickLinks.tgCalabria")}
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.quickLinks.search")}
                </Link>
              </li>
              <li>
                <Link
                  href="/bookmarks"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.quickLinks.bookmarks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.quickLinks.report")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-4 text-white text-base">
              {t("footer.categories.title")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {displayCategories.length > 0 ? (
                displayCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      prefetch={true}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      {language === "it" ? category.nameIt : category.nameEn}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href="/category/politics"
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      {language === "it" ? "Politica" : "Politics"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/category/sports"
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      {language === "it" ? "Sport" : "Sports"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/category/economy"
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      {language === "it" ? "Economia" : "Economy"}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Content Section */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-4 text-white text-base">
              {t("footer.content.title")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.content.latestNews")}
                </Link>
              </li>
              <li>
                <Link
                  href="/?breaking=true"
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.content.breakingNews")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tg"
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.content.videos")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Services */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-4 text-white text-base">
              {t("footer.regionalServices.title")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/weather"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.regionalServices.weather")}
                </Link>
              </li>
              <li>
                <Link
                  href="/horoscope"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.regionalServices.horoscope")}
                </Link>
              </li>
              <li>
                <Link
                  href="/transport"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.regionalServices.transport")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tg"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.regionalServices.tgVideos")}
                </Link>
              </li>
            </ul>
          </div>

          {/* User Services */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-4 text-white text-base">
              {t("footer.userServices.title")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/profile"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.userServices.profile")}
                </Link>
              </li>
              <li>
                <Link
                  href="/bookmarks"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.userServices.bookmarks")}
                </Link>
              </li>
              <li>
                <Link
                  href="#newsletter"
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.userServices.newsletter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  prefetch={true}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  {t("footer.userServices.reportContent")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div id="newsletter" className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-2xl">
            <h4 className="font-semibold mb-2 text-white text-lg">
              {t("footer.newsletter.title")}
            </h4>
            <p className="text-gray-400 mb-4 text-sm">
              {t("footer.newsletter.description")}
            </p>
            <div className="[&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder-gray-500 [&_p]:text-gray-300">
              <SubscriptionForm />
            </div>
            <div className="mt-3">
              <Link
                href="/newsletter/unsubscribe"
                className="text-sm text-gray-400 hover:text-red-600 transition-colors underline"
              >
                {language === "it" ? "Annulla iscrizione" : "Unsubscribe"}
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Links & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          {/* Legal Links Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-6">
            <Link
              href="/terms"
              className="hover:text-red-600 transition-colors"
            >
              {t("footer.legal.termsOfUse")}
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/privacy"
              className="hover:text-red-600 transition-colors"
            >
              {t("footer.legal.privacyPolicy")}
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/cookies"
              className="hover:text-red-600 transition-colors"
            >
              {t("footer.legal.manageCookies")}
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/ad-choices"
              className="hover:text-red-600 transition-colors"
            >
              {t("footer.legal.adChoices")}
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/accessibility"
              className="hover:text-red-600 transition-colors"
            >
              {t("footer.legal.accessibility")}
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/about"
              className="hover:text-red-600 transition-colors"
            >
              {t("footer.legal.about")}
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/newsletter"
              className="hover:text-red-600 transition-colors"
            >
              {t("footer.legal.newsletters")}
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/transcripts"
              className="hover:text-red-600 transition-colors"
            >
              {t("footer.legal.transcripts")}
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">{t("footer.copyright.text")}</p>
            <p className="text-xs text-gray-500">
              {t("footer.copyright.trademark")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
