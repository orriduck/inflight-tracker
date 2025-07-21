"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/src/components/SearchBar";
import StatusBar, { StatusType } from "@/src/components/StatusBar";
import { getFlightsRecommendation } from "../lib/tauri-client";
// Using browser native geolocation API instead of Tauri plugin

export default function HomePage() {
  const [status, setStatus] = useState<{
    statusType: StatusType;
    message: string;
  } | null>({
    statusType: StatusType.INFO,
    message: "Welcome to Inflight Tracker",
  });
  const [recommendationCallSign, setRecommendationCallSign] = useState<
    string[]
  >([]);

  const getRecommendation = async () => {
    setStatus({
      statusType: StatusType.LOADING,
      message: "Getting recommendation...",
    });
    await getFlightsRecommendation()
      .then((res) => {
        setRecommendationCallSign(res);
        setStatus({
          statusType: StatusType.SUCCESS,
          message: `Found ${res.length} flights`,
        });
      })
      .catch((err) => {
        setStatus({
          statusType: StatusType.ERROR,
          message: err.message,
        });
      });
  };

  useEffect(() => {
    getRecommendation();
  }, []);

  const handleSearch = (flightNumber: string) => {
    setStatus({
      statusType: StatusType.LOADING,
      message: `Searching for flight ${flightNumber}...`,
    });
  };

  return (
    <div className="relative h-screen w-full">
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="grid grid-cols-1 gap-8 text-center">
          <h1 className="text-5xl font-bold">Inflight Tracker</h1>
          <SearchBar onSearch={handleSearch} />
          <div
            className={`transition-all duration-100 ${!!status ? "opacity-100" : "opacity-0"}`}
          >
            <StatusBar
              message={status?.message ?? ""}
              statusType={status?.statusType ?? StatusType.INFO}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
