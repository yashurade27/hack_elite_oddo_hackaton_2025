'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchHome from '@/components/User/SearchHome';
import PaginationHome from '@/components/User/PaginationHome';
import CardEvent from '@/components/CardEvent';
import { getPublicEvents, getCategories } from '@/lib/actions/events';
import { Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Custom debounce function
function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const eventsPerPage = 12;
  
  // URL params
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const searchQuery = searchParams.get('search')?.trim() || '';
  const selectedCategory = searchParams.get('category') ? 
    parseInt(searchParams.get('category')!) : null;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.categories) {
          setCategories(result.categories);
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async (search: string, categoryId: number | null, page: number) => {
    setSearchLoading(true);
    setError(null);
    
    try {
      const result = await getPublicEvents({
        search: search || undefined,
        categoryId: categoryId || undefined,
        limit: eventsPerPage,
        offset: (page - 1) * eventsPerPage,
      });
      
      if (result.success && result.events) {
        setEvents(result.events);

        if (result.events.length < eventsPerPage) {
          setTotalEvents((page - 1) * eventsPerPage + result.events.length);
        } else {
          const countResult = await getPublicEvents({
            search: search || undefined,
            categoryId: categoryId || undefined,
            limit: 1,
            offset: page * eventsPerPage,
          });
          const hasMore = countResult.success && countResult.events && countResult.events.length > 0;
          setTotalEvents(hasMore ? (page * eventsPerPage) + 1 : page * eventsPerPage);
        }
      } else {
        setError(result.error || 'Failed to fetch events');
        setEvents([]);
        setTotalEvents(0);
      }
    } catch {
      setError('Failed to fetch events. Please try again.');
      setEvents([]);
      setTotalEvents(0);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  }, [eventsPerPage]);

  const debouncedFetchEvents = useDebounce(fetchEvents, 300);

  useEffect(() => {
    debouncedFetchEvents(searchQuery, selectedCategory, currentPage);
  }, [searchQuery, selectedCategory, currentPage]);

  const updateURL = useCallback((params: { search?: string; category?: number | null; page?: number }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (params.search !== undefined) {
      const trimmedSearch = params.search.trim();
      if (trimmedSearch && trimmedSearch.length >= 2) {
        newParams.set('search', trimmedSearch);
      } else {
        newParams.delete('search');
      }
    }
    
    if (params.category !== undefined) {
      if (params.category && categories.some(cat => cat.id === params.category)) {
        newParams.set('category', params.category.toString());
      } else {
        newParams.delete('category');
      }
    }
    
    if (params.page !== undefined) {
      const validPage = Math.max(1, params.page);
      if (validPage > 1) {
        newParams.set('page', validPage.toString());
      } else {
        newParams.delete('page');
      }
    }
    
    const newURL = `/?${newParams.toString()}`;
    router.push(newURL, { scroll: false });
  }, [searchParams, router, categories]);

  const handleSearch = useCallback((query: string) => {
    updateURL({ search: query.trim(), page: 1 });
  }, [updateURL]);

  const handleCategoryFilter = useCallback((categoryId: number | null) => {
    if (categoryId && !categories.some(cat => cat.id === categoryId)) return;
    updateURL({ category: categoryId, page: 1 });
  }, [updateURL, categories]);

  const handlePageChange = useCallback((page: number) => {
    const currentTotalPages = Math.ceil(totalEvents / eventsPerPage);
    const validPage = Math.max(1, Math.min(page, currentTotalPages));
    updateURL({ page: validPage });
  }, [updateURL, totalEvents, eventsPerPage]);

  const handleBookTicket = useCallback((eventId: string) => {
    router.push(`/events/${eventId}/register`);
  }, [router]);

  const handleViewDetails = useCallback((eventId: string) => {
    router.push(`/events/${eventId}`);
  }, [router]);

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const formatTime = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch {
      return 'Invalid Time';
    }
  }, []);

  const formatPrice = useCallback((price: number, currency: string = 'INR') => {
    if (price === 0) return 'Free';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${currency} ${price}`;
    }
  }, []);

  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  return (
    <div className="min-h-screen bg-background">      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find and attend the best events in your city. From concerts to conferences, we have it all.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <SearchHome onSearch={handleSearch} initialValue={searchQuery} />
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge 
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => handleCategoryFilter(null)}
            >
              All Categories
            </Badge>
            {categories.map(category => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                style={{ 
                  backgroundColor: selectedCategory === category.id && category.colorCode ? category.colorCode : undefined,
                  borderColor: category.colorCode || undefined
                }}
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => {
              const startPrice = event.ticketTypes?.length > 0 
                ? Math.min(...event.ticketTypes.map((t: any) => t.price))
                : 0;
              
              const availableTickets = event.ticketTypes?.reduce(
                (sum: number, ticket: any) => sum + ticket.remainingQuantity, 0
              ) || 0;

              const eventStatus = new Date(event.startDatetime) < new Date() ? 'past' : 
                                availableTickets === 0 ? 'sold-out' : 'available';

              return (
                <CardEvent
                  key={event.uuid}
                  event={{
                    ...event,
                    id: event.uuid,
                    date: formatDate(event.startDatetime),
                    time: formatTime(event.startDatetime),
                    location: event.venueName,
                    price: startPrice,
                    currency: event.ticketTypes?.[0]?.currency || 'INR',
                    formattedPrice: formatPrice(startPrice, event.ticketTypes?.[0]?.currency),
                    attendees: event._count?.bookings || 0,
                    organizerName: `${event.organizer.firstName} ${event.organizer.lastName}`,
                    image: event.bannerImage || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop&crop=center`,
                    category: event.category.name,
                    categoryColor: event.category.colorCode,
                    isFeatured: event.isFeatured,
                    isTrending: event.isTrending,
                    status: eventStatus,
                    availableTickets,
                  }}
                  onBookTicket={(eventUuid: string) => handleBookTicket(eventUuid)}
                  onViewDetails={(eventUuid: string) => handleViewDetails(eventUuid)}
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <PaginationHome
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}
