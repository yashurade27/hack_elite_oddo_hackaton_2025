-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('ATTENDEE', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "public"."AddressType" AS ENUM ('HOME', 'WORK', 'BILLING');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED', 'BUY_X_GET_Y');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('BOOKING_CONFIRMATION', 'PAYMENT_CONFIRMATION', 'EVENT_REMINDER', 'EVENT_CANCELLATION', 'EVENT_UPDATE', 'PROMOTIONAL', 'CHECK_IN_SUCCESS');

-- CreateEnum
CREATE TYPE "public"."SocialMedia" AS ENUM ('FACEBOOK', 'TWITTER', 'INSTAGRAM', 'WHATSAPP', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "public"."LoyaltyTransactionType" AS ENUM ('EARNED', 'REDEEMED', 'EXPIRED', 'BONUS');

-- CreateEnum
CREATE TYPE "public"."ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "image" TEXT,
    "userType" "public"."UserType" NOT NULL DEFAULT 'ATTENDEE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAddress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "addressType" "public"."AddressType" NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "colorCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "organizerId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "bannerImage" TEXT,
    "venueName" TEXT NOT NULL,
    "venueAddress" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "startDatetime" TIMESTAMP(3) NOT NULL,
    "endDatetime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "maxAttendees" INTEGER,
    "minAge" INTEGER,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "refundPolicy" TEXT,
    "termsConditions" TEXT,
    "liveStreamUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventImage" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TicketType" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "totalQuantity" INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL,
    "maxPerUser" INTEGER NOT NULL DEFAULT 10,
    "saleStartDatetime" TIMESTAMP(3) NOT NULL,
    "saleEndDatetime" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "finalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "bookingStatus" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancellationDate" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "attendeeName" TEXT NOT NULL,
    "attendeeEmail" TEXT NOT NULL,
    "attendeePhone" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingItem" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "ticketTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ticket" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "ticketTypeId" INTEGER NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "attendeeEmail" TEXT NOT NULL,
    "attendeePhone" TEXT,
    "isCheckedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkInDatetime" TIMESTAMP(3),
    "checkInLocation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "paymentGateway" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "gatewayResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromotionalCode" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "public"."DiscountType" NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minPurchaseAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxDiscountAmount" DECIMAL(10,2),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "userUsageLimit" INTEGER NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionalCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoUsage" (
    "id" SERIAL NOT NULL,
    "promoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventAnalytics" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "totalTicketsSold" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAttendees" INTEGER NOT NULL DEFAULT 0,
    "checkedInCount" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DECIMAL(5,4),
    "averageTicketPrice" DECIMAL(10,2),
    "refundedTickets" INTEGER NOT NULL DEFAULT 0,
    "refundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventReview" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialShare" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "platform" "public"."SocialMedia" NOT NULL,
    "shareUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoyaltyTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "transactionType" "public"."LoyaltyTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Referral" (
    "id" SERIAL NOT NULL,
    "referrerId" INTEGER NOT NULL,
    "referredId" INTEGER NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" "public"."ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "rewardPoints" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_EventToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventToTicket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "public"."User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "public"."User"("userType");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "public"."User"("isActive");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE INDEX "User_isVerified_idx" ON "public"."User"("isVerified");

-- CreateIndex
CREATE INDEX "UserAddress_userId_idx" ON "public"."UserAddress"("userId");

-- CreateIndex
CREATE INDEX "UserAddress_city_state_idx" ON "public"."UserAddress"("city", "state");

-- CreateIndex
CREATE INDEX "UserAddress_postalCode_idx" ON "public"."UserAddress"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "public"."Category"("isActive");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_uuid_key" ON "public"."Event"("uuid");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "public"."Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_categoryId_idx" ON "public"."Event"("categoryId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "public"."Event"("status");

-- CreateIndex
CREATE INDEX "Event_startDatetime_idx" ON "public"."Event"("startDatetime");

-- CreateIndex
CREATE INDEX "Event_endDatetime_idx" ON "public"."Event"("endDatetime");

-- CreateIndex
CREATE INDEX "Event_isFeatured_idx" ON "public"."Event"("isFeatured");

-- CreateIndex
CREATE INDEX "Event_isTrending_idx" ON "public"."Event"("isTrending");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "public"."Event"("createdAt");

-- CreateIndex
CREATE INDEX "Event_latitude_longitude_idx" ON "public"."Event"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Event_venueName_idx" ON "public"."Event"("venueName");

-- CreateIndex
CREATE INDEX "Event_title_idx" ON "public"."Event"("title");

-- CreateIndex
CREATE INDEX "Event_status_startDatetime_idx" ON "public"."Event"("status", "startDatetime");

-- CreateIndex
CREATE INDEX "Event_categoryId_status_idx" ON "public"."Event"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Event_organizerId_status_idx" ON "public"."Event"("organizerId", "status");

-- CreateIndex
CREATE INDEX "EventImage_eventId_idx" ON "public"."EventImage"("eventId");

-- CreateIndex
CREATE INDEX "EventImage_eventId_displayOrder_idx" ON "public"."EventImage"("eventId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TicketType_uuid_key" ON "public"."TicketType"("uuid");

-- CreateIndex
CREATE INDEX "TicketType_eventId_idx" ON "public"."TicketType"("eventId");

-- CreateIndex
CREATE INDEX "TicketType_isActive_idx" ON "public"."TicketType"("isActive");

-- CreateIndex
CREATE INDEX "TicketType_saleStartDatetime_saleEndDatetime_idx" ON "public"."TicketType"("saleStartDatetime", "saleEndDatetime");

-- CreateIndex
CREATE INDEX "TicketType_price_idx" ON "public"."TicketType"("price");

-- CreateIndex
CREATE INDEX "TicketType_remainingQuantity_idx" ON "public"."TicketType"("remainingQuantity");

-- CreateIndex
CREATE INDEX "TicketType_eventId_isActive_idx" ON "public"."TicketType"("eventId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_uuid_key" ON "public"."Booking"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingReference_key" ON "public"."Booking"("bookingReference");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "public"."Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_eventId_idx" ON "public"."Booking"("eventId");

-- CreateIndex
CREATE INDEX "Booking_bookingStatus_idx" ON "public"."Booking"("bookingStatus");

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "public"."Booking"("paymentStatus");

-- CreateIndex
CREATE INDEX "Booking_bookingDate_idx" ON "public"."Booking"("bookingDate");

-- CreateIndex
CREATE INDEX "Booking_attendeeEmail_idx" ON "public"."Booking"("attendeeEmail");

-- CreateIndex
CREATE INDEX "Booking_userId_bookingStatus_idx" ON "public"."Booking"("userId", "bookingStatus");

-- CreateIndex
CREATE INDEX "Booking_eventId_bookingStatus_idx" ON "public"."Booking"("eventId", "bookingStatus");

-- CreateIndex
CREATE INDEX "Booking_bookingDate_bookingStatus_idx" ON "public"."Booking"("bookingDate", "bookingStatus");

-- CreateIndex
CREATE INDEX "BookingItem_bookingId_idx" ON "public"."BookingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BookingItem_ticketTypeId_idx" ON "public"."BookingItem"("ticketTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_uuid_key" ON "public"."Ticket"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "public"."Ticket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_barcode_key" ON "public"."Ticket"("barcode");

-- CreateIndex
CREATE INDEX "Ticket_bookingId_idx" ON "public"."Ticket"("bookingId");

-- CreateIndex
CREATE INDEX "Ticket_ticketTypeId_idx" ON "public"."Ticket"("ticketTypeId");

-- CreateIndex
CREATE INDEX "Ticket_attendeeEmail_idx" ON "public"."Ticket"("attendeeEmail");

-- CreateIndex
CREATE INDEX "Ticket_isCheckedIn_idx" ON "public"."Ticket"("isCheckedIn");

-- CreateIndex
CREATE INDEX "Ticket_isActive_idx" ON "public"."Ticket"("isActive");

-- CreateIndex
CREATE INDEX "Ticket_ticketNumber_idx" ON "public"."Ticket"("ticketNumber");

-- CreateIndex
CREATE INDEX "Ticket_barcode_idx" ON "public"."Ticket"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_uuid_key" ON "public"."Payment"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "public"."Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "public"."Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "public"."Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_paymentStatus_idx" ON "public"."Payment"("paymentStatus");

-- CreateIndex
CREATE INDEX "Payment_paymentGateway_idx" ON "public"."Payment"("paymentGateway");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "public"."Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "public"."Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_paymentStatus_createdAt_idx" ON "public"."Payment"("paymentStatus", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionalCode_code_key" ON "public"."PromotionalCode"("code");

-- CreateIndex
CREATE INDEX "PromotionalCode_eventId_idx" ON "public"."PromotionalCode"("eventId");

-- CreateIndex
CREATE INDEX "PromotionalCode_code_idx" ON "public"."PromotionalCode"("code");

-- CreateIndex
CREATE INDEX "PromotionalCode_isActive_idx" ON "public"."PromotionalCode"("isActive");

-- CreateIndex
CREATE INDEX "PromotionalCode_validFrom_validUntil_idx" ON "public"."PromotionalCode"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "PromotionalCode_createdBy_idx" ON "public"."PromotionalCode"("createdBy");

-- CreateIndex
CREATE INDEX "PromotionalCode_discountType_idx" ON "public"."PromotionalCode"("discountType");

-- CreateIndex
CREATE INDEX "PromotionalCode_isActive_validFrom_validUntil_idx" ON "public"."PromotionalCode"("isActive", "validFrom", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "PromoUsage_bookingId_key" ON "public"."PromoUsage"("bookingId");

-- CreateIndex
CREATE INDEX "PromoUsage_promoId_idx" ON "public"."PromoUsage"("promoId");

-- CreateIndex
CREATE INDEX "PromoUsage_userId_idx" ON "public"."PromoUsage"("userId");

-- CreateIndex
CREATE INDEX "PromoUsage_usedAt_idx" ON "public"."PromoUsage"("usedAt");

-- CreateIndex
CREATE INDEX "PromoUsage_promoId_userId_idx" ON "public"."PromoUsage"("promoId", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_eventId_idx" ON "public"."Notification"("eventId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "public"."Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_idx" ON "public"."Notification"("scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_sentAt_idx" ON "public"."Notification"("sentAt");

-- CreateIndex
CREATE INDEX "Notification_channel_idx" ON "public"."Notification"("channel");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_type_idx" ON "public"."Notification"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "EventAnalytics_eventId_key" ON "public"."EventAnalytics"("eventId");

-- CreateIndex
CREATE INDEX "EventAnalytics_totalTicketsSold_idx" ON "public"."EventAnalytics"("totalTicketsSold");

-- CreateIndex
CREATE INDEX "EventAnalytics_totalRevenue_idx" ON "public"."EventAnalytics"("totalRevenue");

-- CreateIndex
CREATE INDEX "EventAnalytics_lastUpdated_idx" ON "public"."EventAnalytics"("lastUpdated");

-- CreateIndex
CREATE INDEX "EventReview_eventId_idx" ON "public"."EventReview"("eventId");

-- CreateIndex
CREATE INDEX "EventReview_userId_idx" ON "public"."EventReview"("userId");

-- CreateIndex
CREATE INDEX "EventReview_rating_idx" ON "public"."EventReview"("rating");

-- CreateIndex
CREATE INDEX "EventReview_isVisible_idx" ON "public"."EventReview"("isVisible");

-- CreateIndex
CREATE INDEX "EventReview_createdAt_idx" ON "public"."EventReview"("createdAt");

-- CreateIndex
CREATE INDEX "EventReview_eventId_rating_idx" ON "public"."EventReview"("eventId", "rating");

-- CreateIndex
CREATE INDEX "EventReview_eventId_isVisible_idx" ON "public"."EventReview"("eventId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "EventReview_eventId_userId_key" ON "public"."EventReview"("eventId", "userId");

-- CreateIndex
CREATE INDEX "SocialShare_eventId_idx" ON "public"."SocialShare"("eventId");

-- CreateIndex
CREATE INDEX "SocialShare_userId_idx" ON "public"."SocialShare"("userId");

-- CreateIndex
CREATE INDEX "SocialShare_platform_idx" ON "public"."SocialShare"("platform");

-- CreateIndex
CREATE INDEX "SocialShare_createdAt_idx" ON "public"."SocialShare"("createdAt");

-- CreateIndex
CREATE INDEX "SocialShare_eventId_platform_idx" ON "public"."SocialShare"("eventId", "platform");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_userId_idx" ON "public"."LoyaltyTransaction"("userId");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_transactionType_idx" ON "public"."LoyaltyTransaction"("transactionType");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_createdAt_idx" ON "public"."LoyaltyTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_referenceId_idx" ON "public"."LoyaltyTransaction"("referenceId");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_userId_transactionType_idx" ON "public"."LoyaltyTransaction"("userId", "transactionType");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referralCode_key" ON "public"."Referral"("referralCode");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "public"."Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_referredId_idx" ON "public"."Referral"("referredId");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "public"."Referral"("status");

-- CreateIndex
CREATE INDEX "Referral_referralCode_idx" ON "public"."Referral"("referralCode");

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "public"."Referral"("createdAt");

-- CreateIndex
CREATE INDEX "Referral_completedAt_idx" ON "public"."Referral"("completedAt");

-- CreateIndex
CREATE INDEX "Referral_referrerId_status_idx" ON "public"."Referral"("referrerId", "status");

-- CreateIndex
CREATE INDEX "_EventToTicket_B_index" ON "public"."_EventToTicket"("B");

-- AddForeignKey
ALTER TABLE "public"."UserAddress" ADD CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventImage" ADD CONSTRAINT "EventImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingItem" ADD CONSTRAINT "BookingItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "public"."TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "public"."TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromotionalCode" ADD CONSTRAINT "PromotionalCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromotionalCode" ADD CONSTRAINT "PromotionalCode_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoUsage" ADD CONSTRAINT "PromoUsage_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "public"."PromotionalCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoUsage" ADD CONSTRAINT "PromoUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoUsage" ADD CONSTRAINT "PromoUsage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventAnalytics" ADD CONSTRAINT "EventAnalytics_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventReview" ADD CONSTRAINT "EventReview_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventReview" ADD CONSTRAINT "EventReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialShare" ADD CONSTRAINT "SocialShare_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialShare" ADD CONSTRAINT "SocialShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToTicket" ADD CONSTRAINT "_EventToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToTicket" ADD CONSTRAINT "_EventToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
