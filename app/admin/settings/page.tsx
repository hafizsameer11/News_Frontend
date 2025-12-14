"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { ErrorMessage } from "@/components/ui/error-message";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  useSocialAccounts,
  useConnectAccount,
  useDisconnectAccount,
} from "@/lib/hooks/useSocial";
import { SocialAccount } from "@/types/social.types";
import { configApi, ConfigResponse } from "@/lib/api/modules/config.api";
import { Loading } from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";

export default function AdminSettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [siteName, setSiteName] = useState("NEWS NEXT");
  const [defaultLanguage, setDefaultLanguage] = useState<"en" | "it">(language);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"general" | "social" | "system">("general");

  // Fetch public config from backend
  const { data: configData, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["public-config"],
    queryFn: () => configApi.getPublicConfig(),
  });

  const config = (configData as ConfigResponse | undefined)?.data;

  useEffect(() => {
    // Load from backend config first, then localStorage as fallback
    if (config?.siteName) {
      setSiteName(config.siteName);
    } else {
      const savedSiteName = localStorage.getItem("news_next_site_name");
      if (savedSiteName) setSiteName(savedSiteName);
    }

    const savedDefaultLang = localStorage.getItem("news_next_default_language");
    if (savedDefaultLang && (savedDefaultLang === "en" || savedDefaultLang === "it")) {
      setDefaultLanguage(savedDefaultLang);
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem("news_next_site_name", siteName);
      localStorage.setItem("news_next_default_language", defaultLanguage);

      // Update current language if default changed
      if (defaultLanguage !== language) {
        setLanguage(defaultLanguage);
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSaveMessage({ type: "success", text: t("settings.settingsSaved") });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingConfig) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{t("settings.title")}</h1>
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("settings.title")}</h1>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            saveMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border-b border-gray-200">
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("settings.general")}
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "social"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("settings.socialMedia")}
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "system"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {language === "it" ? "Sistema" : "System"}
          </button>
        </div>
      </div>

      {/* General Settings Tab */}
      {activeTab === "general" && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">{t("settings.general")}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("settings.siteName")}
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="NEWS NEXT"
            />
            {config?.siteName && (
              <p className="mt-1 text-xs text-gray-500">
                {language === "it" ? "Valore corrente dal backend:" : "Current value from backend:"} {config.siteName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("settings.defaultLanguage")}
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value as "en" | "it")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="it">Italiano</option>
              </select>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{language === "it" ? "Lingua Corrente:" : "Current Language:"}</span>{" "}
                <LanguageSwitcher />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {language === "it" 
                ? "La lingua predefinita verrà applicata ai nuovi visitatori. Il selettore di lingua corrente è per i test."
                : "Default language will be applied to new visitors. Current language switcher is for testing."}
            </p>
          </div>
          {configData?.data && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                {language === "it" ? "Configurazione Backend:" : "Backend Configuration:"}
              </h3>
              <div className="space-y-1 text-xs text-blue-800">
                <div>
                  <span className="font-medium">{language === "it" ? "Verifica Email:" : "Email Verification:"}</span>{" "}
                  {config?.enableEmailVerification ? (language === "it" ? "Abilitata" : "Enabled") : (language === "it" ? "Disabilitata" : "Disabled")}
                </div>
                <div>
                  <span className="font-medium">{language === "it" ? "URL Frontend:" : "Frontend URL:"}</span>{" "}
                  {config?.frontendUrl}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {language === "it" ? "Salvataggio..." : "Saving..."}
              </>
            ) : (
              t("settings.saveSettings")
            )}
          </button>
        </div>
      </div>
      )}

      {/* Social Media Integration Tab */}
      {activeTab === "social" && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">{t("settings.socialMedia")}</h2>
        <SocialMediaConnections />
      </div>
      )}

      {/* System Information Tab */}
      {activeTab === "system" && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">
          {language === "it" ? "Informazioni di Sistema" : "System Information"}
        </h2>
        <div className="space-y-6">
          {/* Platform Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {language === "it" ? "Informazioni Piattaforma" : "Platform Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {language === "it" ? "Versione Piattaforma" : "Platform Version"}
                </div>
                <div className="text-lg font-semibold text-gray-900">1.0.0</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {language === "it" ? "Lingua Corrente" : "Current Language"}
                </div>
                <div className="text-lg font-semibold text-gray-900 uppercase">{language}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {language === "it" ? "Lingua Predefinita" : "Default Language"}
                </div>
                <div className="text-lg font-semibold text-gray-900 uppercase">{defaultLanguage}</div>
              </div>
              {config?.frontendUrl && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    {language === "it" ? "URL Frontend" : "Frontend URL"}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 break-all">{config.frontendUrl}</div>
                </div>
              )}
            </div>
          </div>

          {/* Backend Configuration */}
          {configData?.data && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                {language === "it" ? "Configurazione Backend" : "Backend Configuration"}
              </h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm font-medium text-blue-900">
                    {language === "it" ? "Verifica Email" : "Email Verification"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    config?.enableEmailVerification
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {config?.enableEmailVerification
                      ? (language === "it" ? "Abilitata" : "Enabled")
                      : (language === "it" ? "Disabilitata" : "Disabled")}
                  </span>
                </div>
                {config?.siteName && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm font-medium text-blue-900">
                      {language === "it" ? "Nome Sito" : "Site Name"}
                    </span>
                    <span className="text-sm text-blue-800 font-semibold">{config.siteName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {language === "it" ? "Informazioni Ambiente" : "Environment Information"}
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  {language === "it" ? "Modalità" : "Mode"}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  process.env.NODE_ENV === "production"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {process.env.NODE_ENV || "development"}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {language === "it"
                    ? "Le impostazioni di sistema sono gestite tramite variabili d'ambiente nel backend. Contatta l'amministratore del sistema per modificare queste impostazioni."
                    : "System settings are managed via environment variables in the backend. Contact the system administrator to modify these settings."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// Social Media Connections Component
function SocialMediaConnections() {
  const { t, language } = useLanguage();
  const { data: accountsData, isLoading } = useSocialAccounts();
  const connectMutation = useConnectAccount();
  const disconnectMutation = useDisconnectAccount();

  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [formData, setFormData] = useState({
    token: "",
    accountId: "",
    name: "",
  });

  const accounts = (Array.isArray(accountsData) ? accountsData : []) as SocialAccount[];
  const facebookAccount = accounts.find((acc: SocialAccount) => acc.platform === "FACEBOOK");
  const instagramAccount = accounts.find((acc: SocialAccount) => acc.platform === "INSTAGRAM");

  const handleConnect = async (platform: "FACEBOOK" | "INSTAGRAM") => {
    if (!formData.token || !formData.accountId || !formData.name) {
      alert(language === "it" ? "Compila tutti i campi" : "Please fill in all fields");
      return;
    }

    connectMutation.mutate(
      {
        platform,
        token: formData.token,
        accountId: formData.accountId,
        name: formData.name,
      },
      {
        onSuccess: () => {
          setShowFacebookModal(false);
          setShowInstagramModal(false);
          setFormData({ token: "", accountId: "", name: "" });
        },
      }
    );
  };

  const handleDisconnect = (id: string) => {
    if (confirm(language === "it" ? "Sei sicuro di voler disconnettere questo account?" : "Are you sure you want to disconnect this account?")) {
      disconnectMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Facebook Connection */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {language === "it" ? "Connessione Pagina Facebook" : "Facebook Page Connection"}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={facebookAccount?.name || "Not connected"}
            placeholder="Not connected"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
            disabled
            readOnly
          />
          {facebookAccount ? (
            <button
              onClick={() => handleDisconnect(facebookAccount.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <button
              onClick={() => setShowFacebookModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {language === "it" ? "Connetti" : "Connect"}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {language === "it" 
            ? "Connetti la tua pagina Facebook per abilitare la pubblicazione automatica. Avrai bisogno di un token di accesso alla pagina Facebook."
            : "Connect your Facebook page to enable auto-posting. You'll need a Facebook Page Access Token."}
        </p>
        {facebookAccount && (
          <p className="mt-1 text-xs text-green-600">
            ✓ Connected as: {facebookAccount.name} (ID: {facebookAccount.accountId})
          </p>
        )}
      </div>

      {/* Instagram Connection */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {language === "it" ? "Connessione Account Instagram" : "Instagram Account Connection"}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={instagramAccount?.name || "Not connected"}
            placeholder="Not connected"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
            disabled
            readOnly
          />
          {instagramAccount ? (
            <button
              onClick={() => handleDisconnect(instagramAccount.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <button
              onClick={() => setShowInstagramModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {language === "it" ? "Connetti" : "Connect"}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {language === "it" 
            ? "Connetti il tuo account Instagram business per la pubblicazione automatica. Avrai bisogno di un token di accesso Instagram."
            : "Connect your Instagram business account for auto-posting. You'll need an Instagram Access Token."}
        </p>
        {instagramAccount && (
          <p className="mt-1 text-xs text-green-600">
            ✓ Connected as: {instagramAccount.name} (ID: {instagramAccount.accountId})
          </p>
        )}
      </div>

      {/* Facebook Connect Modal */}
      {showFacebookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              {language === "it" ? "Connetti Pagina Facebook" : "Connect Facebook Page"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {language === "it" ? "Nome Pagina" : "Page Name"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === "it" ? "La Mia Pagina Notizie" : "My News Page"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {language === "it" ? "ID Pagina" : "Page ID"}
                </label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder="123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {language === "it" ? "Token di Accesso" : "Access Token"}
                </label>
                <input
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  placeholder={language === "it" ? "Inserisci il token di accesso della pagina Facebook" : "Enter your Facebook Page Access Token"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {language === "it" 
                    ? "Ottieni il tuo token da Facebook Graph API Explorer o Business Manager"
                    : "Get your token from Facebook Graph API Explorer or Business Manager"}
                </p>
              </div>
            </div>
            {connectMutation.error && (
              <div className="mt-4">
                <ErrorMessage error={connectMutation.error} />
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFacebookModal(false);
                  setFormData({ token: "", accountId: "", name: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => handleConnect("FACEBOOK")}
                disabled={connectMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {connectMutation.isPending 
                  ? (language === "it" ? "Connessione..." : "Connecting...") 
                  : (language === "it" ? "Connetti" : "Connect")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Connect Modal */}
      {showInstagramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              {language === "it" ? "Connetti Account Instagram" : "Connect Instagram Account"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {language === "it" ? "Nome Account" : "Account Name"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="@mynewsaccount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {language === "it" ? "ID Account Instagram Business" : "Instagram Business Account ID"}
                </label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder="17841405309211844"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {language === "it" ? "Token di Accesso" : "Access Token"}
                </label>
                <input
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  placeholder={language === "it" ? "Inserisci il token di accesso Instagram" : "Enter your Instagram Access Token"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {language === "it" 
                    ? "Ottieni il tuo token da Facebook Graph API (Instagram fa parte di Facebook)"
                    : "Get your token from Facebook Graph API (Instagram is part of Facebook)"}
                </p>
              </div>
            </div>
            {connectMutation.error && (
              <div className="mt-4">
                <ErrorMessage error={connectMutation.error} />
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowInstagramModal(false);
                  setFormData({ token: "", accountId: "", name: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => handleConnect("INSTAGRAM")}
                disabled={connectMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {connectMutation.isPending 
                  ? (language === "it" ? "Connessione..." : "Connecting...") 
                  : (language === "it" ? "Connetti" : "Connect")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
