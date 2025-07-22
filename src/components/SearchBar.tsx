"use client";

import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  onSearch: (flightNumber: string) => void;
  onRefresh: () => void;
  placeholder?: string;
  recommendation: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onRefresh,
  placeholder = "Enter Flight Number (e.g. B61159)",
  recommendation,
}) => {
  const [flightNumber, setFlightNumber] = useState("");
  const router = useRouter();

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={flightNumber}
            onChange={(e) => {
              setFlightNumber(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full px-4 py-3 text-lg"
          />
        </div>
        <Button
          disabled={!flightNumber.trim()}
          className="flex items-center gap-x-2"
          onClick={() => router.push(`/tracker/${flightNumber}`)}
        >
          <Search className="text-gray-400" />
          Track Callsign
        </Button>
      </div>
      <div className={`flex items-center gap-2 bg-muted rounded-lg`}>
        <Button
          onClick={onRefresh}
          variant="ghost"
          size="icon"
          className="flex items-center gap-1 px-2"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
        <div className="text-gray-400 flex overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {recommendation.length > 0 ? (
            recommendation.map((callSign) => (
              <div
                key={callSign}
                className=" rounded px-2 whitespace-nowrap cursor-pointer"
                onClick={() => router.push(`/tracker/${callSign}`)}
              >
                {callSign}
              </div>
            ))
          ) : (
            <div>No recommendation</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
