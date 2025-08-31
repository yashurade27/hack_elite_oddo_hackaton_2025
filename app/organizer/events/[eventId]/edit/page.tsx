'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, IndianRupee, Plus, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEvents } from '@/hooks/useEvents';
import { toast } from 'sonner';

interface EventFormData {
  title: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  venueName: string;
  venueAddress: string;
  categoryId: string;
  bannerImageUrl: string;
  maxCapacity: number;
  status: 'DRAFT' | 'PUBLISHED';
  isFeatured: boolean;
  isTrending: boolean;
  ticketTypes: Array<{
    name: string;
    description: string;
    price: number;
    totalQuantity: number;
    remainingQuantity: number;
    maxPerUser: number;
  }>;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const { 
    getEventByUuid, 
    updateEvent, 
    getCategories, 
    loading 
  } = useEvents();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDatetime: '',
    endDatetime: '',
    venueName: '',
    venueAddress: '',
    categoryId: '',
    bannerImageUrl: '',
    maxCapacity: 100,
    status: 'DRAFT',
    isFeatured: false,
    isTrending: false,
    ticketTypes: [
      {
        name: 'General Admission',
        description: 'Standard entry ticket',
        price: 0,
        totalQuantity: 100,
        remainingQuantity: 100,
        maxPerUser: 10,
      },
    ],
  });

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load categories
      const categoriesResult = await getCategories();
      if (categoriesResult.success) {
        setCategories(categoriesResult.categories || []);
      }

      // Load event
      const eventResult = await getEventByUuid(eventId);
      if (eventResult.success && eventResult.event) {
        const eventData = eventResult.event;
        
        // Format datetime for input fields
        const formatDatetime = (datetime: string) => {
          return new Date(datetime).toISOString().slice(0, 16);
        };

        setFormData({
          title: eventData.title,
          description: eventData.description,
          startDatetime: formatDatetime(eventData.startDatetime),
          endDatetime: formatDatetime(eventData.endDatetime),
          venueName: eventData.venueName,
          venueAddress: eventData.venueAddress,
          categoryId: eventData.category.id.toString(),
          bannerImageUrl: eventData.bannerImage || '',
          maxCapacity: 100, // Default since not in API
          status: eventData.status as 'DRAFT' | 'PUBLISHED',
          isFeatured: eventData.isFeatured,
          isTrending: eventData.isTrending,
          ticketTypes: eventData.ticketTypes.map(ticket => ({
            name: ticket.name,
            description: '', // Default since not in API
            price: ticket.price,
            totalQuantity: ticket.totalQuantity,
            remainingQuantity: ticket.remainingQuantity,
            maxPerUser: 10, // Default since not in API
          })),
        });
      } else {
        toast.error('Event not found');
        router.push('/organizer');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTicketChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          name: '',
          description: '',
          price: 0,
          totalQuantity: 100,
          remainingQuantity: 100,
          maxPerUser: 10,
        }
      ]
    }));
  };

  const removeTicketType = (index: number) => {
    if (formData.ticketTypes.length > 1) {
      setFormData(prev => ({
        ...prev,
        ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
      }));
    } else {
      toast.error('At least one ticket type is required');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    
    if (new Date(formData.endDatetime) <= new Date(formData.startDatetime)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      const result = await updateEvent(eventId, {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        startDatetime: new Date(formData.startDatetime).toISOString(),
        endDatetime: new Date(formData.endDatetime).toISOString(),
      });

      if (result.success) {
        toast.success('Event updated successfully!');
        router.push('/organizer');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading event data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/organizer')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update your event details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bannerImageUrl">Banner Image URL</Label>
              <Input
                id="bannerImageUrl"
                placeholder="https://example.com/banner.jpg"
                value={formData.bannerImageUrl}
                onChange={(e) => handleInputChange('bannerImageUrl', e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Add a banner image URL for your event (optional)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDatetime">Start Date & Time *</Label>
                <Input
                  id="startDatetime"
                  type="datetime-local"
                  value={formData.startDatetime}
                  onChange={(e) => handleInputChange('startDatetime', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDatetime">End Date & Time *</Label>
                <Input
                  id="endDatetime"
                  type="datetime-local"
                  value={formData.endDatetime}
                  onChange={(e) => handleInputChange('endDatetime', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="venueName">Venue Name *</Label>
              <Input
                id="venueName"
                placeholder="e.g., Convention Center Hall A"
                value={formData.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="venueAddress">Venue Address *</Label>
              <Textarea
                id="venueAddress"
                placeholder="Enter the complete venue address"
                value={formData.venueAddress}
                onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="maxCapacity">Maximum Capacity *</Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                placeholder="100"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Total number of attendees the venue can accommodate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              Ticket Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {formData.ticketTypes.map((ticket, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Ticket Type {index + 1}</h4>
                    {formData.ticketTypes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTicketType(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Ticket Name *</Label>
                      <Input
                        placeholder="e.g., General Admission"
                        value={ticket.name}
                        onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(index, 'price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Brief description of this ticket type"
                      value={ticket.description}
                      onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Total Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="100"
                        value={ticket.totalQuantity}
                        onChange={(e) => handleTicketChange(index, 'totalQuantity', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>

                    <div>
                      <Label>Max per User</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="10"
                        value={ticket.maxPerUser}
                        onChange={(e) => handleTicketChange(index, 'maxPerUser', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addTicketType}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Ticket Type
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Event Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value as 'DRAFT' | 'PUBLISHED')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Draft events are not visible to users. Published events are live.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Featured Event</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this event prominently on the homepage
                  </p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Trending Event</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark this event as trending
                  </p>
                </div>
                <Switch
                  checked={formData.isTrending}
                  onCheckedChange={(checked) => handleInputChange('isTrending', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/organizer')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Updating...' : 'Update Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}