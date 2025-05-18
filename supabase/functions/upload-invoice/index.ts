import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Parse request body
    const { orderId, pdfBase64 } = await req.json()
    
    if (!orderId || !pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('order_ref')
      .eq('id', orderId)
      .single()
      
    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Convert base64 to Uint8Array for storage
    const base64Str = pdfBase64.replace(/^data:application\/pdf;base64,/, '')
    const binaryData = Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0))
    
    // Upload PDF to Supabase Storage
    const filename = `invoice_${order.order_ref}.pdf`
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('invoices')
      .upload(filename, binaryData, {
        contentType: 'application/pdf',
        upsert: true
      })
      
    if (uploadError) {
      console.error('Error uploading invoice:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload invoice' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Get the public URL for the invoice
    const { data: publicUrlData } = supabaseClient
      .storage
      .from('invoices')
      .getPublicUrl(filename)
      
    return new Response(
      JSON.stringify({
        success: true,
        filename,
        publicUrl: publicUrlData.publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
