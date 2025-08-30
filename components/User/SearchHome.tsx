"use client";

import React, { useState } from "react";
import { Search, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const SearchHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const categories = [
    { value: "music", label: "Music" },
    { value: "sports", label: "Sports" },
    { value: "technology", label: "Technology" },
    { value: "business", label: "Business" },
    { value: "food", label: "Food" },
    { value: "arts", label: "Arts" },
  ];

  const locations = [
    { value: "chandigarh", label: "Chandigarh" },
    { value: "patiala", label: "Patiala" },
    { value: "ludhiana", label: "Ludhiana" },
    { value: "amritsar", label: "Amritsar" },
  ];

  const handleSearch = () => {
    console.log({
      query: searchQuery,
      category: selectedCategory,
      location: selectedLocation,
      date: startDate?.toISOString(),
    });
  };

  const formatDate = (date: number | Date | null | undefined) => {
    if (!date) return "Any Date";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Hero Section */}
      {/* <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Discover Amazing Events
        </h1>
        <p className="text-muted-foreground text-lg">
          Find and book the perfect events happening around you
        </p>
      </div> */}

      {/* Search Bar */}
      <div className="bg-card border rounded-xl shadow-lg p-6">
        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events, concerts, workshops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">
              Category
            </label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-40 h-12">
                <SelectValue placeholder="Any Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">
              Location
            </label>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-40 h-12">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Any Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">
              Date
            </label>
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-36 h-12 justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(startDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={startDate ?? undefined}
                  onSelect={(date) => {
                    setStartDate(date ?? null);
                    setIsDateOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            size="lg"
            className="px-8 h-12 bg-primary hover:bg-primary/90"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location */}
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="h-11">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Search Row */}
          <div className="flex gap-3">
            {/* Date */}
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 h-11 justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(startDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={startDate ?? undefined}
                  onSelect={(date) => {
                    setStartDate(date ?? null);
                    setIsDateOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Search Button */}
            <Button onClick={handleSearch} size="lg" className="px-6 h-11">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedCategory || selectedLocation || startDate) && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(undefined);
                setSelectedLocation(undefined);
                setStartDate(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHome;
