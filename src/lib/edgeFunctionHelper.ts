// src/lib/edgeFunctionHelper.ts
import { FunctionsFetchError } from '@supabase/supabase-js';

// Helper function to wait for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Invokes a Supabase Edge Function with retry capability for network errors
 */
export async function invokeEdgeFunction(supabase: any, options: {
  functionName: string;
  body: any;
  retries?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onFinalError?: (error: any) => void;
  onRetry?: (attempt: number, error: any) => void;
}) {
  const { 
    functionName, 
    body, 
    retries = 2,
    onSuccess,
    onError,
    onFinalError,
    onRetry 
  } = options;
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${retries + 1} to call function '${functionName}'`);
      
      // Wait between retries, but not on the first attempt
      if (attempt > 0) {
        const delayMs = attempt * 1000; // Incremental backoff
        if (onRetry) onRetry(attempt, lastError);
        await sleep(delayMs);
      }
      
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (error) {
        lastError = error;
        if (onError) onError(error);
        
        // Only retry for network errors
        if (!(error instanceof FunctionsFetchError)) {
          break;
        }
      } else {
        if (onSuccess) onSuccess(data);
        return { data, error: null };
      }
    } catch (e) {
      lastError = e;
      if (onError) onError(e);
    }
  }
  
  if (onFinalError) onFinalError(lastError);
  return { data: null, error: lastError };
}