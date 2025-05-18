import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

export async function POST(req: NextRequest) {
  try {
    // Verify request authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Simple API key validation
    const apiKey = authHeader.split(' ')[1];
    if (apiKey !== 'invoice-mopres-api-key-2025') {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Send a simple test email
    const { data, error } = await resend.emails.send({
      from: 'MoPres Fashion <onboarding@resend.dev>',
      to: 'bakielisrael@gmail.com',
      subject: 'MoPres Invoice Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #AF8F53;">MoPres Invoice Email Test</h1>
          <p>This is a test of the invoice email API endpoint.</p>
          <p>Order ID: ${orderId}</p>
          <p>Time: ${new Date().toISOString()}</p>
        </div>
      `,
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send email: ' + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      emailId: data?.id
    });
  } catch (error) {
    console.error('Error in API endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
