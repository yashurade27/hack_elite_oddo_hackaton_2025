"use client";

import { useState, useTransition } from "react";
import { getEvents, type PaginationResult } from "@/app/actions/get-events";
import CardEvent from "@/components/CardEvent";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaginatedEventsProps {
  initialData: PaginationResult;
}

export default function PaginatedEvents({ initialData }: PaginatedEventsProps) {
  const router = useRouter();
  const [data, setData] = useState<PaginationResult>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleBookTicket = (eventId: number, ticketTypeId: number) => {
    console.log(
      `Booking ticket for event ${eventId}, ticket type ${ticketTypeId}`
    );
    router.push(`/events/${eventId}`);
  };

  const handleViewDetails = (eventId: number) => {
    console.log(`Viewing details for event ${eventId}`);
    router.push(`/events/${eventId}`);
  };

  const loadEvents = (page: number) => {
    startTransition(async () => {
      const result = await getEvents(page, 6);
      setData(result);
    });
  };

  const handlePageChange = (page: number) => {
    loadEvents(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationItems = () => {
    const { currentPage, totalPages } = data.pagination;
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <>
      {/* Events Grid Section */}
      <div className="w-full px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <p className="text-sm text-gray-600">
              {data.pagination.totalCount} events found
            </p>
          </div>

          {/* Loading Overlay */}
          {isPending && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading events...</span>
            </div>
          )}

          {/* Events Grid */}
          {!isPending && (
            <>
              {data.events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {data.events.map((event) => (
                    <CardEvent
                      key={event.id}
                      event={event}
                      onBookTicket={handleBookTicket}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Loader2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No events found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No events are currently available. Check back later!
                    </p>
                  </div>
                </div>
              )}

              {/* Pagination Info and Controls */}
              {data.pagination.totalPages > 1 && (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Page {data.pagination.currentPage} of{" "}
                    {data.pagination.totalPages}({data.pagination.totalCount}{" "}
                    total events)
                  </p>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(data.pagination.currentPage - 1)
                          }
                          className={
                            !data.pagination.hasPrevPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-gray-100"
                          }
                        />
                      </PaginationItem>

                      {renderPaginationItems()}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(data.pagination.currentPage + 1)
                          }
                          className={
                            !data.pagination.hasNextPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-gray-100"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
