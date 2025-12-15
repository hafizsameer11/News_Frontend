"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  sportsApi,
  SportsVideo,
  StandingTeam,
  Country,
  League,
  Fixture,
} from "@/lib/api/modules/sports.api";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

export function SportsPageClient() {
  const { language, t } = useLanguage();

  // Countries & Leagues
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");

  // Standings
  const [standings, setStandings] = useState<{
    total: StandingTeam[];
    home: StandingTeam[];
    away: StandingTeam[];
  } | null>(null);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [standingsView, setStandingsView] = useState<"total" | "home" | "away">("total");

  // Fixtures
  const [fixturesDateFrom, setFixturesDateFrom] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [fixturesDateTo, setFixturesDateTo] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [fixturesError, setFixturesError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | number>("");

  // Videos
  const [videos, setVideos] = useState<SportsVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setCountriesLoading(true);
      try {
        const response = await sportsApi.getCountries();
        if (response.success === 1 && response.result) {
          setCountries(response.result);
        }
      } catch (error) {
        console.error("Failed to load countries:", error);
      } finally {
        setCountriesLoading(false);
      }
    };
    loadCountries();
  }, []);

  // Load leagues when country is selected
  useEffect(() => {
    if (selectedCountryId) {
      const loadLeagues = async () => {
        setLeaguesLoading(true);
        setLeagues([]);
        setSelectedLeagueId("");
        try {
          const response = await sportsApi.getLeagues(selectedCountryId);
          if (response.success === 1 && response.result) {
            setLeagues(response.result);
          }
        } catch (error) {
          console.error("Failed to load leagues:", error);
        } finally {
          setLeaguesLoading(false);
        }
      };
      loadLeagues();
    } else {
      setLeagues([]);
      setSelectedLeagueId("");
    }
  }, [selectedCountryId]);

  const handleFetchStandings = async () => {
    if (!selectedLeagueId.trim()) {
      setStandingsError("Please select a league");
      return;
    }

    setStandingsLoading(true);
    setStandingsError(null);
    setStandings(null);

    try {
      const response = await sportsApi.getStandings(selectedLeagueId);
      if (response.success === 1 && response.result) {
        const hasData =
          response.result.total.length > 0 ||
          response.result.home.length > 0 ||
          response.result.away.length > 0;
        if (hasData) {
          setStandings(response.result);
          setStandingsError(null);
        } else {
          setStandings(null);
          setStandingsError(
            language === "it"
              ? "Nessuna classifica disponibile per questo campionato."
              : "No standings available for this league."
          );
        }
      } else {
        setStandings(null);
        setStandingsError(
          language === "it"
            ? "Nessuna classifica disponibile per questo campionato."
            : "No standings available for this league."
        );
      }
    } catch (error: any) {
      setStandings(null);
      setStandingsError(
        language === "it"
          ? "Impossibile caricare la classifica. Riprova più tardi."
          : "Unable to load standings. Please try again later."
      );
    } finally {
      setStandingsLoading(false);
    }
  };

  const handleFetchFixtures = async () => {
    if (!fixturesDateFrom || !fixturesDateTo) {
      setFixturesError("Please select date range");
      return;
    }

    setFixturesLoading(true);
    setFixturesError(null);
    setFixtures([]);
    setSelectedEventId("");

    try {
      const response = await sportsApi.getFixtures(
        fixturesDateFrom,
        fixturesDateTo,
        selectedLeagueId || undefined,
        selectedCountryId || undefined
      );
      if (response.success === 1 && response.result) {
        if (response.result.length === 0) {
          setFixtures([]);
          setFixturesError(
            language === "it"
              ? "Nessuna partita trovata per i criteri selezionati. Prova a modificare la data o i filtri."
              : "No matches found for the selected criteria. Try adjusting the date range or filters."
          );
        } else {
          setFixtures(response.result);
          setFixturesError(null);
        }
      } else {
        setFixtures([]);
        setFixturesError(
          language === "it"
            ? "Nessuna partita disponibile per i criteri selezionati."
            : "No matches available for the selected criteria."
        );
      }
    } catch (error: any) {
      setFixtures([]);
      setFixturesError(
        language === "it"
          ? "Impossibile caricare le partite. Riprova più tardi."
          : "Unable to load matches. Please try again later."
      );
    } finally {
      setFixturesLoading(false);
    }
  };

  const handleFetchVideos = async (eventId: string | number) => {
    const eventIdStr = String(eventId).trim();
    if (!eventIdStr) {
      setVideosError("Please select a match");
      return;
    }

    setVideosLoading(true);
    setVideosError(null);
    setVideos([]);

    try {
      const response = await sportsApi.getVideos(eventIdStr);
      if (response.success === 1 && response.result) {
        if (response.result.length === 0) {
          setVideos([]);
          setVideosError(
            language === "it"
              ? "Nessun video disponibile per questa partita."
              : "No videos available for this match."
          );
        } else {
          setVideos(response.result);
          setVideosError(null);
        }
      } else {
        setVideos([]);
        setVideosError(
          language === "it"
            ? "Nessun video disponibile per questa partita."
            : "No videos available for this match."
        );
      }
    } catch (error: any) {
      setVideos([]);
      setVideosError(
        language === "it"
          ? "Impossibile caricare i video. Riprova più tardi."
          : "Unable to load videos. Please try again later."
      );
    } finally {
      setVideosLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
            {language === "it" ? "Sport" : "Sports"}
          </h1>
          <p className="text-gray-600 text-lg">
            {language === "it"
              ? "Guarda gli highlights del calcio, controlla le classifiche e visualizza le partite"
              : "Watch football highlights, check league standings and view fixtures"}
          </p>
        </div>

        <div className="space-y-8">
          {/* Selection Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {language === "it" ? "Selezione" : "Selection"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "it" ? "Paese" : "Country"} {language === "it" ? "(Opzionale)" : "(Optional)"}
                </label>
                <select
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={countriesLoading}
                >
                  <option value="">
                    {countriesLoading
                      ? language === "it"
                        ? "Caricamento..."
                        : "Loading..."
                      : language === "it"
                      ? "Tutti i paesi"
                      : "All Countries"}
                  </option>
                  {countries.map((country) => (
                    <option key={country.country_key} value={country.country_key}>
                      {country.country_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "it" ? "Campionato" : "League"} {language === "it" ? "(Opzionale)" : "(Optional)"}
                </label>
                <select
                  value={selectedLeagueId}
                  onChange={(e) => setSelectedLeagueId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={leaguesLoading || !selectedCountryId}
                >
                  <option value="">
                    {leaguesLoading
                      ? language === "it"
                        ? "Caricamento..."
                        : "Loading..."
                      : language === "it"
                      ? "Seleziona un campionato"
                      : "Select a league"}
                  </option>
                  {leagues.map((league) => (
                    <option key={league.league_key} value={league.league_key}>
                      {league.league_name} ({league.country_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Standings Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {language === "it" ? "Classifiche" : "Standings"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {language === "it"
                ? "Seleziona un campionato per visualizzare le classifiche"
                : "Select a league to view standings"}
            </p>

            <div className="mb-4">
              <button
                onClick={handleFetchStandings}
                disabled={standingsLoading || !selectedLeagueId.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {standingsLoading
                  ? language === "it"
                    ? "Caricamento..."
                    : "Loading..."
                  : language === "it"
                  ? "Carica Classifica"
                  : "Load Standings"}
              </button>
            </div>

            {standingsError && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-yellow-800">{standingsError}</p>
                </div>
              </div>
            )}

            {standingsLoading && (
              <div className="py-8">
                <Loading />
              </div>
            )}

            {!standingsLoading && standings && (
              <div className="space-y-4">
                <div className="flex gap-2 border-b border-gray-200 pb-2">
                  <button
                    onClick={() => setStandingsView("total")}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      standingsView === "total"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {language === "it" ? "Totale" : "Total"}
                  </button>
                  <button
                    onClick={() => setStandingsView("home")}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      standingsView === "home"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {language === "it" ? "Casa" : "Home"}
                  </button>
                  <button
                    onClick={() => setStandingsView("away")}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      standingsView === "away"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {language === "it" ? "Trasferta" : "Away"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Pos</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900">
                          {language === "it" ? "Squadra" : "Team"}
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-900">P</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-900">W</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-900">D</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-900">L</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-900">F</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-900">A</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-900">GD</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-900">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {standings[standingsView].map((team, index) => (
                        <tr
                          key={index}
                          className={index < 3 ? "bg-green-50" : ""}
                        >
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {team.standing_place}
                          </td>
                          <td className="px-3 py-2 text-gray-900">{team.standing_team}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{team.standing_P}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{team.standing_W}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{team.standing_D}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{team.standing_L}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{team.standing_F}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{team.standing_A}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{team.standing_GD}</td>
                          <td className="px-3 py-2 text-center font-semibold text-gray-900">
                            {team.standing_PTS}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Fixtures Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {language === "it" ? "Partite" : "Fixtures"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {language === "it"
                ? "Seleziona un intervallo di date per visualizzare le partite"
                : "Select a date range to view fixtures"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "it" ? "Data Inizio" : "From Date"}
                </label>
                <input
                  type="date"
                  value={fixturesDateFrom}
                  onChange={(e) => setFixturesDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "it" ? "Data Fine" : "To Date"}
                </label>
                <input
                  type="date"
                  value={fixturesDateTo}
                  onChange={(e) => setFixturesDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleFetchFixtures}
                  disabled={fixturesLoading}
                  className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {fixturesLoading
                    ? language === "it"
                      ? "Caricamento..."
                      : "Loading..."
                    : language === "it"
                    ? "Carica Partite"
                    : "Load Fixtures"}
                </button>
              </div>
            </div>

            {fixturesError && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-yellow-800">{fixturesError}</p>
                </div>
              </div>
            )}

            {fixturesLoading && (
              <div className="py-8">
                <Loading />
              </div>
            )}

            {!fixturesLoading && fixtures.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {language === "it"
                    ? `${fixtures.length} partite trovate`
                    : `${fixtures.length} fixtures found`}
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fixtures.map((fixture) => (
                    <div
                      key={fixture.event_key}
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        String(selectedEventId) === String(fixture.event_key)
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        const eventKey = String(fixture.event_key);
                        setSelectedEventId(eventKey);
                        handleFetchVideos(fixture.event_key);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {fixture.home_team_logo ? (
                              <img
                                src={fixture.home_team_logo}
                                alt={fixture.event_home_team}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                {fixture.event_home_team.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold text-gray-900">
                              {fixture.event_home_team}
                            </span>
                            <span className="text-gray-500">vs</span>
                            <span className="font-semibold text-gray-900">
                              {fixture.event_away_team}
                            </span>
                            {fixture.away_team_logo ? (
                              <img
                                src={fixture.away_team_logo}
                                alt={fixture.event_away_team}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                {fixture.event_away_team.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">{fixture.league_name}</span>
                            {fixture.league_round && (
                              <>
                                {" • "}
                                <span>{fixture.league_round}</span>
                              </>
                            )}
                            {fixture.league_season && (
                              <>
                                {" • "}
                                <span>{fixture.league_season}</span>
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {fixture.event_stadium && (
                              <>
                                <span>{fixture.event_stadium}</span>
                                {" • "}
                              </>
                            )}
                            <span>
                              {new Date(fixture.event_date).toLocaleDateString(
                                language === "it" ? "it-IT" : "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}{" "}
                              {fixture.event_time}
                            </span>
                          </div>
                          {fixture.event_final_result &&
                            fixture.event_final_result !== "-" &&
                            fixture.event_final_result.trim() !== "" && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {fixture.event_final_result}
                                </span>
                                {fixture.event_status && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      fixture.event_status === "Finished"
                                        ? "bg-green-100 text-green-700"
                                        : fixture.event_status === "Live"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {fixture.event_status}
                                  </span>
                                )}
                                {fixture.event_halftime_result &&
                                  fixture.event_halftime_result !== "-" &&
                                  fixture.event_halftime_result.trim() !== "" && (
                                    <span className="text-xs text-gray-500">
                                      (HT: {fixture.event_halftime_result})
                                    </span>
                                  )}
                              </div>
                            )}
                          {(!fixture.event_final_result ||
                            fixture.event_final_result === "-" ||
                            fixture.event_final_result.trim() === "") && (
                            <div className="mt-2">
                              <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-700">
                                {language === "it" ? "In programma" : "Scheduled"}
                              </span>
                            </div>
                          )}
                        </div>
                        {String(selectedEventId) === String(fixture.event_key) && (
                          <div className="ml-4 text-red-600">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!fixturesLoading && fixtures.length === 0 && !fixturesError && (
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 mb-2">
                  {language === "it"
                    ? "Nessuna partita caricata"
                    : "No fixtures loaded"}
                </p>
                <p className="text-sm text-gray-500">
                  {language === "it"
                    ? "Seleziona un intervallo di date e clicca 'Carica Partite' per visualizzare le partite"
                    : "Select a date range and click 'Load Fixtures' to view matches"}
                </p>
              </div>
            )}
          </div>

          {/* Videos Section */}
          {selectedEventId && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {language === "it" ? "Video Highlights" : "Video Highlights"}
              </h2>

              {videosError && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-yellow-800">{videosError}</p>
                  </div>
                </div>
              )}

              {videosLoading && (
                <div className="py-8">
                  <Loading />
                </div>
              )}

              {!videosLoading && videos.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {language === "it"
                      ? `${videos.length} video trovati`
                      : `${videos.length} videos found`}
                  </p>
                  <div className="space-y-4">
                    {videos.map((video, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {video.video_title_full || video.video_title}
                        </h3>
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <iframe
                            src={video.video_url}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={video.video_title_full || video.video_title}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!videosLoading && videos.length === 0 && !videosError && (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    {language === "it"
                      ? "Seleziona una partita dalle partite sopra per visualizzare i video"
                      : "Select a match from fixtures above to view videos"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
