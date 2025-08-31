'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchHome from '@/components/User/SearchHome';
import PaginationHome from '@/components/User/PaginationHome';
import CardEvent from '@/components/CardEvent';
import { getPublicEvents, getCategories } from '@/lib/actions/events';
import { Loader2, Search, Calendar, MapPin, Users } from 'lucide-react';
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
  
  // State with proper error handling
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic configuration
  const eventsPerPage = 12; // Increased for better UX
  
  // URL params with proper parsing and validation
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const searchQuery = searchParams.get('search')?.trim() || '';
  const selectedCategory = searchParams.get('category') ? 
    parseInt(searchParams.get('category')!) : null;

  // Fetch categories with error handling
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.categories) {
          setCategories(result.categories);
        } else {
          console.error('Failed to fetch categories:', result.error);
          setCategories([]); // Graceful fallback
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]); // Graceful fallback
      }
    };
    fetchCategories();
  }, []);

  // Optimized fetch events function with better error handling
  const fetchEvents = useCallback(async (search: string, categoryId: number | null, page: number) => {
    setSearchLoading(true);
    setError(null);
    
    try {
      // Single API call for paginated events
      const result = await getPublicEvents({
        search: search || undefined,
        categoryId: categoryId || undefined,
        limit: eventsPerPage,
        offset: (page - 1) * eventsPerPage,
      });
      
      if (result.success && result.events) {
        setEvents(result.events);
        
        // If we have fewer events than requested, we know the total
        if (result.events.length < eventsPerPage) {
          setTotalEvents((page - 1) * eventsPerPage + result.events.length);
        } else {
          // Only make a second call for count if we have a full page
          const countResult = await getPublicEvents({
            search: search || undefined,
            categoryId: categoryId || undefined,
            limit: 1, // Just need to know if there are more
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
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events. Please try again.');
      setEvents([]);
      setTotalEvents(0);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  }, [eventsPerPage]);

  // Debounced search function - call useDebounce at top level
  const debouncedFetchEvents = useDebounce(fetchEvents, 300);

  // Fetch events when params change
  useEffect(() => {
    debouncedFetchEvents(searchQuery, selectedCategory, currentPage);
  }, [searchQuery, selectedCategory, currentPage]);

  // Dynamic URL management with validation
  const updateURL = useCallback((params: { search?: string; category?: number | null; page?: number }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Handle search parameter
    if (params.search !== undefined) {
      const trimmedSearch = params.search.trim();
      if (trimmedSearch && trimmedSearch.length >= 2) { // Minimum search length
        newParams.set('search', trimmedSearch);
      } else {
        newParams.delete('search');
      }
    }
    
    // Handle category parameter
    if (params.category !== undefined) {
      if (params.category && categories.some(cat => cat.id === params.category)) {
        newParams.set('category', params.category.toString());
      } else {
        newParams.delete('category');
      }
    }
    
    // Handle page parameter
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

  // Enhanced event handlers with validation
  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    updateURL({ search: trimmedQuery, page: 1 });
  }, [updateURL]);

  const handleCategoryFilter = useCallback((categoryId: number | null) => {
    // Validate category exists
    if (categoryId && !categories.some(cat => cat.id === categoryId)) {
      console.warn(`Category ${categoryId} not found`);
      return;
    }
    updateURL({ category: categoryId, page: 1 });
  }, [updateURL, categories]);

  const handlePageChange = useCallback((page: number) => {
    const currentTotalPages = Math.ceil(totalEvents / eventsPerPage);
    const validPage = Math.max(1, Math.min(page, currentTotalPages));
    updateURL({ page: validPage });
  }, [updateURL, totalEvents, eventsPerPage]);

  const handleBookTicket = useCallback((eventId: string) => {
    if (!eventId) {
      console.error('Invalid event ID');
      return;
    }
    router.push(`/events/${eventId}/register`);
  }, [router]);

  const handleViewDetails = useCallback((eventId: string) => {
    if (!eventId) {
      console.error('Invalid event ID');
      return;
    }
    router.push(`/events/${eventId}`);
  }, [router]);

  // Dynamic date and time formatting based on locale
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

  // Dynamic price formatting
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
          
          {/* Category Filters - Dynamic */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge 
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 hover:scale-105 transition-transform"
              onClick={() => handleCategoryFilter(null)}
            >
              All Categories
            </Badge>
            {categories.map(category => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 hover:scale-105 transition-transform"
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

          {/* Results Info - Dynamic */}
          <div className="text-center text-muted-foreground">
            {error ? (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <Search className="w-4 h-4" />
                {error}
              </div>
            ) : loading || searchLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {loading ? 'Loading events...' : 'Searching...'}
              </div>
            ) : (
              <p>
                Showing <strong>{events.length}</strong> of <strong>{totalEvents}</strong> events
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                {currentPage > 1 && ` (Page ${currentPage})`}
              </p>
            )}
          </div>
        </div>

        {/* Events Grid - Fully Dynamic */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading amazing events...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-red-600">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => {
              // Dynamic event data processing
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
                    id: event.uuid, // Use UUID as string ID
                    date: formatDate(event.startDatetime),
                    time: formatTime(event.startDatetime),
                    location: event.venueName,
                    price: startPrice,
                    currency: event.ticketTypes?.[0]?.currency || 'INR',
                    formattedPrice: formatPrice(startPrice, event.ticketTypes?.[0]?.currency),
                    attendees: event._count?.bookings || 0,
                    totalReviews: event._count?.reviews || 0,
                    organizer: `${event.organizer.firstName} ${event.organizer.lastName}`,
                    organizerName: `${event.organizer.firstName} ${event.organizer.lastName}`,
                    image: event.bannerImage || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop&crop=center`,
                    category: event.category.name,
                    categoryColor: event.category.colorCode,
                    isFeatured: event.isFeatured,
                    isTrending: event.isTrending,
                    status: eventStatus,
                    availableTickets,
                    shortDescription: event.shortDescription || event.description.substring(0, 150) + '...'
                  }}
                  onBookTicket={(eventUuid: string) => handleBookTicket(eventUuid)}
                  onViewDetails={(eventUuid: string) => handleViewDetails(eventUuid)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || selectedCategory ? 'No events found' : 'No events available'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory
                ? `Try adjusting your search filters or browse all events`
                : "No events are currently available. Check back later for amazing events!"}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  updateURL({ search: '', category: null, page: 1 });
                }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                View All Events
              </button>
            )}
          </div>
        )}

        {/* Enhanced Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8">
            <PaginationHome
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} • {totalEvents} total events
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
