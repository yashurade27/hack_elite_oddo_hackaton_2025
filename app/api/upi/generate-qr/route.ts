import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, transactionId, description, merchantVPA, merchantName } = body;

    // Validate required fields
    if (!amount || !transactionId || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, transactionId, description' },
        { status: 400 }
      );
    }

    // Default merchant details - REPLACE WITH YOUR ACTUAL UPI DETAILS
    const defaultMerchantVPA = process.env.UPI_MERCHANT_VPA || merchantVPA || 'eventhive@paytm'; // Replace with your actual UPI ID
    const defaultMerchantName = process.env.UPI_MERCHANT_NAME || merchantName || 'EventHive'; // Replace with your business name

    // Generate UPI QR Code string according to NPCI standards
    const upiQRString = [
      `upi://pay?pa=${defaultMerchantVPA}`,
      `pn=${encodeURIComponent(defaultMerchantName)}`,
      `tr=${transactionId}`,
      `tn=${encodeURIComponent(description)}`,
      `am=${amount}`,
      `cu=INR`,
      `mc=5411` // Merchant category code for general retail
    ].join('&');

    return NextResponse.json({
      success: true,
      upiQRString,
      merchantVPA: defaultMerchantVPA,
      merchantName: defaultMerchantName,
      amount: amount,
      transactionId: transactionId,
      description: description
    });

  } catch (error) {
    console.error('Error generating UPI QR:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate UPI QR code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}