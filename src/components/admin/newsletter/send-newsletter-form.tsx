"use client";

import { useState } from "react";
import { useSendNewsletter, useNewsletterSubscribers } from "@/lib/hooks/useNewsletterAdmin";
import { RichTextEditor } from "../rich-text-editor";
import { SendNewsletterConfirmModal } from "./send-newsletter-confirm-modal";
import { useLanguage } from "@/providers/LanguageProvider";

export function SendNewsletterForm() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [lastSentCount, setLastSentCount] = useState<number | null>(null);

  const sendMutation = useSendNewsletter();
  const { t, language } = useLanguage();
  // Get subscriber count for the confirmation modal
  // Backend now returns ALL subscribers (active and inactive), so we need to filter for active ones
  const { data: subscribersData } = useNewsletterSubscribers(1, 1000); // Fetch enough to count all
  const subscribers = subscribersData?.data?.subscribers || [];
  const totalActive = subscribers.filter((s) => s.isActive).length;

  const handleSubmit = () => {
    if (!subject.trim() || !html.trim()) {
      return;
    }
    
    // Prevent sending if there are no active subscribers
    if (totalActive === 0) {
      return;
    }
    
    setShowConfirm(true);
  };

  const confirmSend = () => {
    sendMutation.mutate(
      {
        subject: subject.trim(),
        html: html.trim(),
        text: text.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          // Get the actual count from response
          const sentCount = response?.data?.queuedCount || totalActive;
          setLastSentAt(new Date());
          setLastSentCount(sentCount);
          setSubject("");
          setHtml("");
          setText("");
          setShowConfirm(false);
        },
      }
    );
  };

  const isFormValid = subject.trim() && html.trim();

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("admin.sendNewsletter")}</h2>

        {/* Success Banner */}
        {lastSentAt && lastSentCount !== null && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 mb-1">
                  Newsletter queued successfully!
                </p>
                <p className="text-sm text-green-700">
                  Queued for {lastSentCount} active subscriber{lastSentCount !== 1 ? "s" : ""} at{" "}
                  {lastSentAt.toLocaleTimeString()} on {lastSentAt.toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setLastSentAt(null);
                  setLastSentCount(null);
                }}
                className="text-green-600 hover:text-green-800 transition"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter subject line..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* HTML Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTML Content <span className="text-red-600">*</span>
            </label>
            <RichTextEditor
              value={html}
              onChange={setHtml}
              placeholder="Enter newsletter content..."
            />
          </div>

          {/* Plain Text (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plain Text (Optional)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Plain text version for email clients that don't support HTML..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              If not provided, a plain text version will be generated from HTML.
            </p>
          </div>

          {/* Preview Toggle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {/* Preview */}
          {showPreview && html && (
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              <div className="border border-gray-200 rounded p-4 bg-white">
                <div className="mb-2 font-semibold text-gray-900">{subject}</div>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || sendMutation.isPending || totalActive === 0}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sendMutation.isPending ? "Sending..." : "Send Newsletter"}
            </button>
          </div>
          
          {/* Warning if no active subscribers */}
          {totalActive === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> There are no active subscribers. You cannot send a newsletter until you have at least one active subscriber.
                </p>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will send the newsletter to all active subscribers. The
              emails will be queued and sent asynchronously. You can check the email queue status in
              the backend logs.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <SendNewsletterConfirmModal
          subject={subject}
          htmlPreview={html}
          subscriberCount={totalActive}
          onConfirm={confirmSend}
          onCancel={() => setShowConfirm(false)}
          isLoading={sendMutation.isPending}
        />
      )}
    </>
  );
}

