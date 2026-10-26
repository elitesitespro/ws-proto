// Roughly where the visitor is, from the time zone their browser reports. No
// permission is asked and nothing is sent anywhere: it only turns the globe
// to their side of the world, where the cards fly out from.
import type { LatLon } from "@/components/globe/night-globe";
import { PIN_CITIES } from "./globe-pins-content";

// Zones whose city isn't one of the pin cities by name, at the zone's city
const ZONES: Record<string, LatLon> = {
  "Africa/Abidjan": [5.36, -4.01],
  "Africa/Addis_Ababa": [9.03, 38.74],
  "Africa/Algiers": [36.75, 3.06],
  "Africa/Dar_es_Salaam": [-6.79, 39.21],
  "Africa/Douala": [4.05, 9.77],
  "Africa/Johannesburg": [-26.2, 28.05],
  "Africa/Kampala": [0.35, 32.58],
  "Africa/Kigali": [-1.95, 30.06],
  "Africa/Luanda": [-8.84, 13.23],
  "Africa/Lusaka": [-15.39, 28.32],
  "Africa/Maputo": [-25.97, 32.57],
  "Africa/Tunis": [36.81, 10.18],
  "America/Argentina/Buenos_Aires": [-34.6, -58.38],
  "America/Caracas": [10.48, -66.9],
  "America/Denver": [39.74, -104.99],
  "America/Halifax": [44.65, -63.57],
  "America/Phoenix": [33.45, -112.07],
  "America/Santiago": [-33.45, -70.67],
  "America/Bogota": [4.71, -74.07],
  "America/Sao_Paulo": [-23.55, -46.63],
  "Asia/Calcutta": [22.57, 88.36],
  "Asia/Dhaka": [23.81, 90.41],
  "Asia/Ho_Chi_Minh": [10.82, 106.63],
  "Asia/Jerusalem": [31.77, 35.21],
  "Asia/Kolkata": [22.57, 88.36],
  "Asia/Kuala_Lumpur": [3.14, 101.69],
  "Asia/Qatar": [25.29, 51.53],
  "Asia/Taipei": [25.03, 121.57],
  "Asia/Tehran": [35.69, 51.39],
  "Atlantic/Reykjavik": [64.15, -21.94],
  "Australia/Brisbane": [-27.47, 153.03],
  "Australia/Melbourne": [-37.81, 144.96],
  "Australia/Perth": [-31.95, 115.86],
  "Europe/Amsterdam": [52.37, 4.9],
  "Europe/Athens": [37.98, 23.73],
  "Europe/Brussels": [50.85, 4.35],
  "Europe/Copenhagen": [55.68, 12.57],
  "Europe/Dublin": [53.35, -6.26],
  "Europe/Helsinki": [60.17, 24.94],
  "Europe/Kiev": [50.45, 30.52],
  "Europe/Kyiv": [50.45, 30.52],
  "Europe/Lisbon": [38.72, -9.14],
  "Europe/Oslo": [59.91, 10.75],
  "Europe/Prague": [50.08, 14.44],
  "Europe/Vienna": [48.21, 16.37],
  "Europe/Warsaw": [52.23, 21.01],
  "Europe/Zurich": [47.38, 8.54],
};

/** The visitor's rough place, or null when the zone doesn't say (UTC, as
 *  privacy browsers report, or a zone not listed). */
export function visitorPlace(): LatLon | null {
  let zone = "";
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return null;
  }
  if (ZONES[zone]) return ZONES[zone];
  // Otherwise the zone's own city, when it's one the globe already knows
  const name = zone.split("/").pop()?.replace(/_/g, " ");
  const city = PIN_CITIES.find((c) => c.name === name);
  return city ? [city.lat, city.lon] : null;
}
