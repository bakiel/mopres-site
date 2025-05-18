/**
 * Error handler function for Supabase authentication errors
 * Returns a user-friendly error message based on the error code or message
 */
export const handleAuthError = (error: any): string => {
  if (!error) return "An unknown error occurred";
  
  // If we have a structured error object with message property
  const errorMessage = error.message || error.toString();
  
  // Common auth errors and their user-friendly messages
  if (errorMessage.includes("Invalid login credentials")) {
    return "Invalid email or password. Please try again.";
  } else if (errorMessage.includes("Email not confirmed")) {
    return "Email not confirmed. Please check your inbox or request a new confirmation email.";
  } else if (errorMessage.includes("User already registered")) {
    return "An account with this email already exists. Please login or use a different email.";
  } else if (errorMessage.includes("Password should be at least 6 characters")) {
    return "Password must be at least 6 characters long.";
  } else if (errorMessage.includes("invalid") && errorMessage.includes("token")) {
    return "Your session or link has expired. Please try again.";
  } else if (errorMessage.includes("expired")) {
    return "Your session or link has expired. Please try again.";
  } else if (errorMessage.includes("rate limit")) {
    return "Too many attempts. Please try again later.";
  } else if (errorMessage.includes("network")) {
    return "Network error. Please check your internet connection and try again.";
  } else if (errorMessage.includes("Unable to validate email address")) {
    return "Invalid email address format. Please use a valid email.";
  }
  
  // If no specific error is matched, provide a generic message
  // but log the actual error for debugging
  console.error("Unhandled auth error:", error);
  return "Authentication failed. Please try again later.";
};

/**
 * Validates a password
 * Returns true if valid, or an error message if invalid
 */
export const validatePassword = (password: string, confirmPassword?: string): string | true => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return "Passwords do not match.";
  }
  
  // Password is valid
  return true;
};
