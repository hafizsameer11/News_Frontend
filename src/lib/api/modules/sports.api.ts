/**
 * AllSportsAPI integration
 * API Documentation: https://allsportsapi.com
 * Using Next.js API route as proxy to avoid CORS issues
 */

const PROXY_URL = "/api/sports";

export interface SportsVideo {
  event_key: string;
  video_title_full: string;
  video_title: string;
  video_url: string;
}

export interface SportsVideosResponse {
  success: number;
  result: SportsVideo[];
}

export interface StandingTeam {
  standing_place: string;
  standing_place_type: string | null;
  standing_team: string;
  standing_P: string;
  standing_W: string;
  standing_D: string;
  standing_L: string;
  standing_F: string;
  standing_A: string;
  standing_GD: string;
  standing_PTS: string;
  team_key: string;
  league_key: string;
  league_season: string;
  league_round: string;
  standing_updated?: string;
  fk_stage_key?: string;
  stage_name?: string;
}

export interface SportsStandingsResponse {
  success: number;
  result: {
    total: StandingTeam[];
    home: StandingTeam[];
    away: StandingTeam[];
  };
}

export interface Country {
  country_key: string;
  country_name: string;
  country_iso2: string | null;
  country_logo: string;
}

export interface CountriesResponse {
  success: number;
  result: Country[];
}

export interface League {
  league_key: string;
  league_name: string;
  country_key: string;
  country_name: string;
  league_logo: string;
  country_logo: string;
}

export interface LeaguesResponse {
  success: number;
  result: League[];
}

export interface Fixture {
  event_key: string;
  event_date: string;
  event_time: string;
  event_home_team: string;
  home_team_key: string;
  event_away_team: string;
  away_team_key: string;
  event_halftime_result: string;
  event_final_result: string;
  event_ft_result: string;
  event_penalty_result: string;
  event_status: string;
  country_name: string;
  league_name: string;
  league_key: string;
  league_round: string;
  league_season: string;
  event_live: string;
  event_stadium?: string;
  event_referee?: string;
  home_team_logo?: string;
  away_team_logo?: string;
  event_country_key: string;
  league_logo?: string;
  country_logo?: string;
}

export interface FixturesResponse {
  success: number;
  result: Fixture[];
}

/**
 * Get videos for a specific event
 * @param eventId - Event internal ID
 */
export async function getSportsVideos(eventId: string | number): Promise<SportsVideosResponse> {
  try {
    const url = `${PROXY_URL}?met=Videos&eventId=${eventId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sports videos:", error);
    throw error;
  }
}

/**
 * Get standings for a specific league
 * @param leagueId - League internal code
 */
export async function getSportsStandings(leagueId: string | number): Promise<SportsStandingsResponse> {
  try {
    const url = `${PROXY_URL}?met=Standings&leagueId=${leagueId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sports standings:", error);
    throw error;
  }
}

/**
 * Get list of countries
 */
export async function getCountries(): Promise<CountriesResponse> {
  try {
    const url = `${PROXY_URL}?met=Countries`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
}

/**
 * Get list of leagues
 * @param countryId - Optional country ID to filter leagues
 */
export async function getLeagues(countryId?: string | number): Promise<LeaguesResponse> {
  try {
    let url = `${PROXY_URL}?met=Leagues`;
    if (countryId) {
      url += `&countryId=${countryId}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching leagues:", error);
    throw error;
  }
}

/**
 * Get fixtures/matches
 * @param from - Start date (yyyy-mm-dd)
 * @param to - End date (yyyy-mm-dd)
 * @param leagueId - Optional league ID to filter fixtures
 * @param countryId - Optional country ID to filter fixtures
 */
export async function getFixtures(
  from: string,
  to: string,
  leagueId?: string | number,
  countryId?: string | number
): Promise<FixturesResponse> {
  try {
    let url = `${PROXY_URL}?met=Fixtures&from=${from}&to=${to}`;
    if (leagueId) {
      url += `&leagueId=${leagueId}`;
    }
    if (countryId) {
      url += `&countryId=${countryId}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    throw error;
  }
}

export const sportsApi = {
  getVideos: getSportsVideos,
  getStandings: getSportsStandings,
  getCountries: getCountries,
  getLeagues: getLeagues,
  getFixtures: getFixtures,
};

