'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Mail, LoaderCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { sendOrderEmails } from '@/lib/client/email-service';
import { toast } from 'react-hot-toast';

interface SendEmailsCardProps {
  order: {
    id: string;
    order_ref: string;
    customer_email: string | null;
    status: string;
  };
  onSuccess?: () => void;
}

export default function SendEmailsCard({ order, onSuccess }: SendEmailsCardProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generateNewInvoice, setGenerateNewInvoice] = useState(false);

  // Validate order has email
  const hasEmail = Boolean(order.customer_email);

  const handleSendEmails = async () => {
    if (!hasEmail) {
      setError('Cannot send emails: customer email is missing');
      toast.error('Customer email is missing');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { success, error, message } = await sendOrderEmails(order.id, generateNewInvoice);

      if (!success) {
        throw new Error(error || 'Failed to send emails');
      }

      setSuccess(true);
      toast.success(message || 'Emails sent successfully');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Order Emails
        </CardTitle>
        <CardDescription>
          Send confirmation and invoice emails to the customer
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!hasEmail && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Email</AlertTitle>
            <AlertDescription>
              This order doesn't have a customer email. Emails cannot be sent.
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Emails Sent</AlertTitle>
            <AlertDescription>
              Order confirmation and invoice emails have been sent to {order.customer_email}.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              This will send both the order confirmation and invoice emails to the customer.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="generate-new-invoice"
              checked={generateNewInvoice}
              onCheckedChange={setGenerateNewInvoice}
            />
            <Label htmlFor="generate-new-invoice">Generate new invoice PDF</Label>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
            <p><strong>Order:</strong> #{order.order_ref}</p>
            <p><strong>Status:</strong> {order.status.replace('_', ' ')}</p>
            <p><strong>Email:</strong> {order.customer_email || 'Not available'}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSendEmails} 
          disabled={loading || !hasEmail}
          className="w-full"
        >
          {loading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Sending Emails...
            </>
          ) : (
            'Send Order Emails'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}