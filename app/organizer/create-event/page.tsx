'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Plus,
  Minus,
  Save,
  Eye,
  ArrowLeft,
  Upload,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { toast } from 'sonner';

interface TicketType {
  name: string;
  description: string;
  price: number;
  currency: string;
  totalQuantity: number;
  maxPerUser: number;
  saleStartDatetime: string;
  saleEndDatetime: string;
}

interface FormData {
  title: string;
  description: string;
  shortDescription: string;
  bannerImage: string;
  categoryId: number | null;
  venueName: string;
  venueAddress: string;
  startDatetime: string;
  endDatetime: string;
  maxAttendees: number | null;
  minAge: number | null;
  refundPolicy: string;
  termsConditions: string;
  ticketTypes: TicketType[];
}

export default function CreateEventPage() {
  const router = useRouter();
  const { createEvent, getCategories, loading } = useEvents();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    shortDescription: '',
    bannerImage: '',
    categoryId: null,
    venueName: '',
    venueAddress: '',
    startDatetime: '',
    endDatetime: '',
    maxAttendees: null,
    minAge: null,
    refundPolicy: '',
    termsConditions: '',
    ticketTypes: []
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.categories || []);
      }
    };
    fetchCategories();
  }, [getCategories]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTicketType = () => {
    const newTicketType: TicketType = {
      name: '',
      description: '',
      price: 0,
      currency: 'INR',
      totalQuantity: 100,
      maxPerUser: 10,
      saleStartDatetime: formData.startDatetime ? new Date(new Date(formData.startDatetime).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) : '',
      saleEndDatetime: formData.startDatetime || ''
    };
    
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicketType]
    }));
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const removeTicketType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.venueName.trim()) newErrors.venueName = 'Venue name is required';
    if (!formData.venueAddress.trim()) newErrors.venueAddress = 'Venue address is required';
    if (!formData.startDatetime) newErrors.startDatetime = 'Start date and time is required';
    if (!formData.endDatetime) newErrors.endDatetime = 'End date and time is required';
    
    if (formData.startDatetime && formData.endDatetime) {
      if (new Date(formData.startDatetime) >= new Date(formData.endDatetime)) {
        newErrors.endDatetime = 'End date must be after start date';
      }
    }

    if (formData.ticketTypes.length === 0) {
      newErrors.ticketTypes = 'At least one ticket type is required';
    } else {
      formData.ticketTypes.forEach((ticket, index) => {
        if (!ticket.name.trim()) newErrors[`ticket_${index}_name`] = 'Ticket name is required';
        if (ticket.price < 0) newErrors[`ticket_${index}_price`] = 'Price cannot be negative';
        if (ticket.totalQuantity <= 0) newErrors[`ticket_${index}_quantity`] = 'Quantity must be greater than 0';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publishImmediately = false) => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    const eventData = {
      ...formData,
      categoryId: formData.categoryId!,
      maxAttendees: formData.maxAttendees || undefined,
      minAge: formData.minAge || undefined,
      ticketTypes: formData.ticketTypes.map(ticket => ({
        ...ticket,
        price: Number(ticket.price),
        totalQuantity: Number(ticket.totalQuantity),
        maxPerUser: Number(ticket.maxPerUser)
      }))
    };

    const result = await createEvent(eventData);

    if (result.success) {
      toast.success('Event created successfully!');
      router.push(`/organizer/events/${result.event.uuid}`);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => router.push('/organizer')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Create New Event</h1>
                <p className="text-sm text-muted-foreground">Fill in the details to create your event</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              <Button onClick={() => handleSubmit(true)} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Create & Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="Enter event title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.categoryId?.toString() || ''} 
                    onValueChange={(value) => updateFormData('categoryId', parseInt(value))}
                  >
                    <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => updateFormData('shortDescription', e.target.value)}
                  placeholder="Brief description for listings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Provide detailed event description"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerImage">Banner Image URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="bannerImage"
                    value={formData.bannerImage}
                    onChange={(e) => updateFormData('bannerImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload your image to Cloudinary and paste the URL here. If left empty, a default event image will be used.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDatetime">Start Date & Time *</Label>
                  <Input
                    id="startDatetime"
                    type="datetime-local"
                    value={formData.startDatetime}
                    onChange={(e) => updateFormData('startDatetime', e.target.value)}
                    className={errors.startDatetime ? 'border-red-500' : ''}
                  />
                  {errors.startDatetime && <p className="text-sm text-red-500">{errors.startDatetime}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDatetime">End Date & Time *</Label>
                  <Input
                    id="endDatetime"
                    type="datetime-local"
                    value={formData.endDatetime}
                    onChange={(e) => updateFormData('endDatetime', e.target.value)}
                    className={errors.endDatetime ? 'border-red-500' : ''}
                  />
                  {errors.endDatetime && <p className="text-sm text-red-500">{errors.endDatetime}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venue Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Venue Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name *</Label>
                <Input
                  id="venueName"
                  value={formData.venueName}
                  onChange={(e) => updateFormData('venueName', e.target.value)}
                  placeholder="Enter venue name"
                  className={errors.venueName ? 'border-red-500' : ''}
                />
                {errors.venueName && <p className="text-sm text-red-500">{errors.venueName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueAddress">Venue Address *</Label>
                <Textarea
                  id="venueAddress"
                  value={formData.venueAddress}
                  onChange={(e) => updateFormData('venueAddress', e.target.value)}
                  placeholder="Full address of the venue"
                  rows={3}
                  className={errors.venueAddress ? 'border-red-500' : ''}
                />
                {errors.venueAddress && <p className="text-sm text-red-500">{errors.venueAddress}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Event Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Event Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    value={formData.maxAttendees || ''}
                    onChange={(e) => updateFormData('maxAttendees', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Leave blank for unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minAge">Minimum Age</Label>
                  <Input
                    id="minAge"
                    type="number"
                    value={formData.minAge || ''}
                    onChange={(e) => updateFormData('minAge', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Leave blank if no age restriction"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Ticket Types
                </div>
                <Button onClick={addTicketType} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket Type
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.ticketTypes && (
                <p className="text-sm text-red-500">{errors.ticketTypes}</p>
              )}
              
              {formData.ticketTypes.map((ticket, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Ticket Type {index + 1}</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeTicketType(index)}
                      disabled={formData.ticketTypes.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ticket Name *</Label>
                      <Input
                        value={ticket.name}
                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                        placeholder="e.g., General Admission"
                        className={errors[`ticket_${index}_name`] ? 'border-red-500' : ''}
                      />
                      {errors[`ticket_${index}_name`] && (
                        <p className="text-sm text-red-500">{errors[`ticket_${index}_name`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={errors[`ticket_${index}_price`] ? 'border-red-500' : ''}
                      />
                      {errors[`ticket_${index}_price`] && (
                        <p className="text-sm text-red-500">{errors[`ticket_${index}_price`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Total Quantity *</Label>
                      <Input
                        type="number"
                        value={ticket.totalQuantity}
                        onChange={(e) => updateTicketType(index, 'totalQuantity', parseInt(e.target.value) || 0)}
                        placeholder="100"
                        className={errors[`ticket_${index}_quantity`] ? 'border-red-500' : ''}
                      />
                      {errors[`ticket_${index}_quantity`] && (
                        <p className="text-sm text-red-500">{errors[`ticket_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Max per Person</Label>
                      <Input
                        type="number"
                        value={ticket.maxPerUser}
                        onChange={(e) => updateTicketType(index, 'maxPerUser', parseInt(e.target.value) || 1)}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={ticket.description}
                      onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                      placeholder="Describe what this ticket includes"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sale Start Date</Label>
                      <Input
                        type="datetime-local"
                        value={formatDateTime(ticket.saleStartDatetime)}
                        onChange={(e) => updateTicketType(index, 'saleStartDatetime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Sale End Date</Label>
                      <Input
                        type="datetime-local"
                        value={formatDateTime(ticket.saleEndDatetime)}
                        onChange={(e) => updateTicketType(index, 'saleEndDatetime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.ticketTypes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No ticket types added yet</p>
                  <p className="text-sm">Click "Add Ticket Type" to create your first ticket type</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Policies & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="refundPolicy">Refund Policy</Label>
                <Textarea
                  id="refundPolicy"
                  value={formData.refundPolicy}
                  onChange={(e) => updateFormData('refundPolicy', e.target.value)}
                  placeholder="Describe your refund policy"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="termsConditions">Terms & Conditions</Label>
                <Textarea
                  id="termsConditions"
                  value={formData.termsConditions}
                  onChange={(e) => updateFormData('termsConditions', e.target.value)}
                  placeholder="List any terms and conditions for the event"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}