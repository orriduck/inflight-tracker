"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface SearchBarProps {
  onSearch: (flightNumber: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Enter Flight Number (e.g. B61159)",
  className = "",
}) => {
  const [flightNumber, setFlightNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flightNumber.trim()) {
      onSearch(flightNumber.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-2 w-full max-w-md ${className}`}
    >
      <div className="relative flex-1">
        <Input
          type="text"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-10 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      <Button type="submit" disabled={!flightNumber.trim()}>
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
