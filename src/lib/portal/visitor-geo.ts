export type VisitorPlace = {
  city: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

const ZONES: Record<string, VisitorPlace> = {
  "America/New_York": { city: "New York", region: "New York", country: "United States", latitude: 40.71, longitude: -74.01 },
  "America/Chicago": { city: "Chicago", region: "Illinois", country: "United States", latitude: 41.88, longitude: -87.63 },
  "America/Denver": { city: "Denver", region: "Colorado", country: "United States", latitude: 39.74, longitude: -104.99 },
  "America/Los_Angeles": { city: "Los Angeles", region: "California", country: "United States", latitude: 34.05, longitude: -118.24 },
  "America/Phoenix": { city: "Phoenix", region: "Arizona", country: "United States", latitude: 33.45, longitude: -112.07 },
  "America/Anchorage": { city: "Anchorage", region: "Alaska", country: "United States", latitude: 61.22, longitude: -149.9 },
  "Pacific/Honolulu": { city: "Honolulu", region: "Hawaii", country: "United States", latitude: 21.31, longitude: -157.86 },
  "America/Toronto": { city: "Toronto", region: "Ontario", country: "Canada", latitude: 43.65, longitude: -79.38 },
  "America/Vancouver": { city: "Vancouver", region: "British Columbia", country: "Canada", latitude: 49.28, longitude: -123.12 },
  "America/Mexico_City": { city: "Mexico City", region: "CDMX", country: "Mexico", latitude: 19.43, longitude: -99.13 },
  "America/Sao_Paulo": { city: "São Paulo", region: "São Paulo", country: "Brazil", latitude: -23.55, longitude: -46.63 },
  "America/Bogota": { city: "Bogotá", region: "Cundinamarca", country: "Colombia", latitude: 4.71, longitude: -74.07 },
  "Europe/London": { city: "London", region: "England", country: "United Kingdom", latitude: 51.51, longitude: -0.13 },
  "Europe/Dublin": { city: "Dublin", region: "Leinster", country: "Ireland", latitude: 53.35, longitude: -6.26 },
  "Europe/Paris": { city: "Paris", region: "Île-de-France", country: "France", latitude: 48.86, longitude: 2.35 },
  "Europe/Berlin": { city: "Berlin", region: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.41 },
  "Europe/Madrid": { city: "Madrid", region: "Madrid", country: "Spain", latitude: 40.42, longitude: -3.7 },
  "Europe/Rome": { city: "Rome", region: "Lazio", country: "Italy", latitude: 41.9, longitude: 12.5 },
  "Europe/Amsterdam": { city: "Amsterdam", region: "North Holland", country: "Netherlands", latitude: 52.37, longitude: 4.9 },
  "Europe/Stockholm": { city: "Stockholm", region: "Stockholm", country: "Sweden", latitude: 59.33, longitude: 18.07 },
  "Asia/Dubai": { city: "Dubai", region: "Dubai", country: "United Arab Emirates", latitude: 25.2, longitude: 55.27 },
  "Asia/Kolkata": { city: "Mumbai", region: "Maharashtra", country: "India", latitude: 19.08, longitude: 72.88 },
  "Asia/Singapore": { city: "Singapore", region: "Singapore", country: "Singapore", latitude: 1.35, longitude: 103.82 },
  "Asia/Manila": { city: "Manila", region: "Metro Manila", country: "Philippines", latitude: 14.6, longitude: 120.98 },
  "Asia/Tokyo": { city: "Tokyo", region: "Tokyo", country: "Japan", latitude: 35.68, longitude: 139.69 },
  "Asia/Seoul": { city: "Seoul", region: "Seoul", country: "South Korea", latitude: 37.57, longitude: 126.98 },
  "Asia/Shanghai": { city: "Shanghai", region: "Shanghai", country: "China", latitude: 31.23, longitude: 121.47 },
  "Asia/Hong_Kong": { city: "Hong Kong", region: "Hong Kong", country: "Hong Kong", latitude: 22.32, longitude: 114.17 },
  "Australia/Sydney": { city: "Sydney", region: "New South Wales", country: "Australia", latitude: -33.87, longitude: 151.21 },
  "Australia/Melbourne": { city: "Melbourne", region: "Victoria", country: "Australia", latitude: -37.81, longitude: 144.96 },
  "Pacific/Auckland": { city: "Auckland", region: "Auckland", country: "New Zealand", latitude: -36.85, longitude: 174.76 },
  "Africa/Johannesburg": { city: "Johannesburg", region: "Gauteng", country: "South Africa", latitude: -26.2, longitude: 28.05 },
  "Africa/Lagos": { city: "Lagos", region: "Lagos", country: "Nigeria", latitude: 6.52, longitude: 3.38 },
};

const CONTINENT: Record<string, { latitude: number; longitude: number }> = {
  America: { latitude: 40, longitude: -97 },
  Europe: { latitude: 50, longitude: 10 },
  Asia: { latitude: 34, longitude: 100 },
  Africa: { latitude: 4, longitude: 22 },
  Australia: { latitude: -25, longitude: 134 },
  Pacific: { latitude: -18, longitude: 175 },
  Atlantic: { latitude: 25, longitude: -40 },
  Indian: { latitude: -20, longitude: 75 },
};

export function placeFromTimezone(timeZone: string): VisitorPlace {
  const zone = timeZone.trim();
  const known = ZONES[zone];
  if (known) return known;
  const [area, city] = zone.split("/");
  const label = (city || area || "Unknown").replaceAll("_", " ");
  const spot = CONTINENT[area] ?? { latitude: 20, longitude: 0 };
  return { city: label, region: "", country: area || "", latitude: spot.latitude, longitude: spot.longitude };
}

export function activityForPath(path: string) {
  const clean = path.split("?")[0] || "/";
  if (clean.includes("/checkout")) return "Checking out";
  if (clean.includes("/account")) return "Viewing their account";
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "store" && parts.length >= 3 && parts[2] !== "checkout") {
    return `Viewing ${decodeURIComponent(parts[2]).replaceAll("-", " ")}`;
  }
  return "Browsing the shop";
}
