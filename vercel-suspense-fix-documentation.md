# Vercel Deployment Fix: useSearchParams and Suspense Boundary

## Problem

The Vercel deployment for the `mopres-site` project was failing. Build logs indicated the following error originating from the checkout confirmation page:

```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/checkout/confirmation". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
```

This error typically occurs in Next.js applications when `useSearchParams()` is used in a component that is part of a statically rendered page, but the component itself (or an ancestor that causes it to render based on search params) is not correctly wrapped in a `<Suspense>` boundary. This prevents Next.js from deferring the rendering of the dynamic part of the page until the search parameters are available on the client side.

## Cause

The issue was located in the [`mopres-nextjs/src/app/checkout/confirmation/page.tsx`](mopres-nextjs/src/app/checkout/confirmation/page.tsx:0) file.
The `OrderConfirmationPage` component (the default export) was directly calling `useSearchParams()`. While it did render a `<Suspense>` component, the `useSearchParams()` hook was called in the parent scope of the `<Suspense>` boundary, not by a component *within* it that actually needed the search parameters.

For Next.js to correctly handle static generation up to the dynamic parts, any component that relies on `useSearchParams` (or other client-side hooks that make a page dynamic) must be a child of a `<Suspense>` boundary.

## Solution Implemented

The fix involved refactoring the [`mopres-nextjs/src/app/checkout/confirmation/page.tsx`](mopres-nextjs/src/app/checkout/confirmation/page.tsx:0) file as follows:

1.  **Created a Fallback Component**:
    A `ConfirmationPageFallback` component was defined to be displayed while the main content is loading.
    ```tsx
    function ConfirmationPageFallback() {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-body">
          <div className="text-center p-4">
            <div className="animate-spin h-12 w-12 border-4 border-brand-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-light">Loading order confirmation...</p>
          </div>
        </div>
      );
    }
    ```

2.  **Created a Client Wrapper Component**:
    A new client component, `ConfirmationPageClientWrapper`, was introduced. This component is responsible for calling `useSearchParams()` and retrieving the `order_ref`. It then renders the original `ConfirmationPageContent` component, passing the `orderRef` as a prop.
    ```tsx
    'use client'; // This wrapper is a client component

    // ... other imports ...
    import { useSearchParams } from 'next/navigation';
    // ... ConfirmationPageContent definition ...

    function ConfirmationPageClientWrapper() {
      const searchParams = useSearchParams();
      const orderRef = searchParams ? searchParams.get('order_ref') : null;
      return <ConfirmationPageContent orderRef={orderRef} />;
    }
    ```

3.  **Updated the Default Export Page Component**:
    The main exported `OrderConfirmationPage` component was modified to render the `ConfirmationPageClientWrapper` as a direct child of the `<Suspense>` boundary. This ensures that `useSearchParams()` is called within the Suspense boundary as required.
    ```tsx
    export default function OrderConfirmationPage() {
      return (
        <Suspense fallback={<ConfirmationPageFallback />}>
          <ConfirmationPageClientWrapper />
        </Suspense>
      );
    }
    ```

## Result

After applying these changes (commit `1a19442`) and pushing them to the repository, the Vercel deployment for `mopres-site` completed successfully. The error related to `useSearchParams()` and the missing Suspense boundary was resolved.

This solution adheres to Next.js best practices for handling dynamic data (like search parameters) in pages that are otherwise statically optimizable, by properly isolating the dynamic parts within Suspense boundaries.