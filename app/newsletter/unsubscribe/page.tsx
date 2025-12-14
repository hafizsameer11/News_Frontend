"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUnsubscribeNewsletter } from "@/lib/hooks/useNewsletter";
import { validateEmail } from "@/lib/helpers/form-validation";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useLanguage } from "@/providers/LanguageProvider";

export default function UnsubscribePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const unsubscribeMutation = useUnsubscribeNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      await unsubscribeMutation.mutateAsync({ email });
      setSuccess(true);
      setEmail("");
      // Redirect to homepage after 3 seconds
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to unsubscribe. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            {language === "it" ? "Annulla Iscrizione" : "Unsubscribe"}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === "it"
              ? "Inserisci il tuo indirizzo email per annullare l'iscrizione alla newsletter."
              : "Enter your email address to unsubscribe from the newsletter."}
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                {language === "it"
                  ? "Ti sei disiscritto con successo. Verrai reindirizzato alla homepage tra pochi secondi."
                  : "You have been successfully unsubscribed. You will be redirected to the homepage in a few seconds."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Indirizzo Email" : "Email Address"}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder={language === "it" ? "tua@email.com" : "your@email.com"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={unsubscribeMutation.isPending}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition"
              >
                {unsubscribeMutation.isPending
                  ? language === "it"
                    ? "Annullamento in corso..."
                    : "Unsubscribing..."
                  : language === "it"
                  ? "Annulla Iscrizione"
                  : "Unsubscribe"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

