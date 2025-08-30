"use client";

import SearchHome from "@/components/User/SearchHome";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="">
      <SearchHome/>
      </div>

      <div className="bg-green-300">
        Hi there
      </div>
      <div className="bg-purple-300">
        Hi there
      </div>
    </div>
  );
}
