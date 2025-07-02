import { NextResponse } from "next/server";
import { JetBlueFlightData, FlightData } from "@/types/flight";
import * as cheerio from "cheerio";

const API_URL = "http://www.flyfi.com/travel/ajax/notification.do";
const SECONDARY_URL = "http://www.flyfi.com/travel/";

/**
 * Maps JetBlue flight data to the universal FlightData format
 */
function mapJetBlueToFlightData(jetBlueData: JetBlueFlightData): FlightData {
  return {
    timestamp: new Date().toISOString(),
    eta: jetBlueData.flightETA,
    flightDuration: jetBlueData.flightTotalDuration,
    flightNumber: "", // Not available in JetBlueFlightData
    latitude: 0, // Not available in JetBlueFlightData
    longitude: 0, // Not available in JetBlueFlightData
    noseId: "", // Not available in JetBlueFlightData
    paState: null, // Not available in JetBlueFlightData
    vehicleId: "", // Not available in JetBlueFlightData
    destination: jetBlueData.destinationIATA ?? jetBlueData.destinationCity ?? "",
    origin: jetBlueData.originIATA ?? jetBlueData.originCity ?? "",
    flightId: "", // Not available in JetBlueFlightData
    airspeed: null,
    airTemperature: null,
    altitude: jetBlueData.altitude ?? 0,
    distanceToGo: null,
    doorState: null,
    groundspeed: jetBlueData.groundspeed ?? 0,
    heading: null,
    timeToGo: jetBlueData.timeToArrival ? parseInt(jetBlueData.timeToArrival) : 0,
    wheelWeightState: "",
    grossWeight: null,
    windSpeed: null,
    windDirection: null,
    flightPhase: jetBlueData.flightStatusText ?? "",
  };
}

export async function GET() {
  try {
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append("actionkey", "FLIGHT_TIME_NOTIFICATIONS");

    // Fetch JetBlue notification data (JSON)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: formData.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jetBlueData: JetBlueFlightData = await response.json();

    // Fetch the HTML page for additional metadata
    const htmlResponse = await fetch(SECONDARY_URL, { cache: "no-store" });
    const html = await htmlResponse.text();
    const $ = cheerio.load(html);

    // Extract values from HTML
    const altitudeText = $("#flightAltitude").text().replace(/[^\d.]/g, "");
    const groundspeedText = $("#flightSpeed").text().replace(/[^\d.]/g, "");
    const terminal = $("#terminal").text().trim() || null;
    const gate = $("#gate").text().trim() || null;
    const currentTemp = $("#currentTemp").text().trim() || null;
    const todayWeather = $("#todayWeather").text().trim() || null;
    const tomorrowWeather = $("#tomorrowWeather").text().trim() || null;
    const lastUpdated = $("#lastTime1").text().trim() || null;

    // Parse origin and destination city from flightInformation h2
    const flightInfoH2 = $("#flightInformation h2").first();
    const h2Html = flightInfoH2.html() || "";
    const [originCity, destinationCity] = h2Html
      .split(/<span[^>]*>to<\/span>/i)
      .map(s => s.replace(/&nbsp;|\s+/g, " ").trim())
      .map(s => s.replace(/<[^>]+>/g, "").trim());

    // Add extracted fields to JetBlueFlightData
    jetBlueData.altitude = altitudeText ? parseInt(altitudeText) : null;
    jetBlueData.groundspeed = groundspeedText ? parseInt(groundspeedText) : null;
    jetBlueData.terminal = terminal;
    jetBlueData.gate = gate;
    jetBlueData.currentTemp = currentTemp;
    jetBlueData.todayWeather = todayWeather;
    jetBlueData.tomorrowWeather = tomorrowWeather;
    jetBlueData.lastUpdated = lastUpdated;
    jetBlueData.originCity = originCity || null;
    jetBlueData.destinationCity = destinationCity || null;

    // Map JetBlueFlightData to FlightData using the utility function
    const flightData = mapJetBlueToFlightData(jetBlueData);

    return NextResponse.json<FlightData>(flightData);
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return NextResponse.json(
      { error: "Failed to fetch flight data" },
      { status: 500 },
    );
  }
}
