import { AxiosError } from "axios"
import { toast } from "sonner"

interface ApiErrorResponse {
  detail?: string | { msg: string }[]
  message?: string
  error?: string
}

/**
 * Extract a human-readable error message from an API error response
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined

    // Handle FastAPI validation errors (array of errors)
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d) => d.msg).join(", ")
    }

    // Handle string detail message
    if (typeof data?.detail === "string") {
      return data.detail
    }

    // Handle other error formats
    if (data?.message) {
      return data.message
    }

    if (data?.error) {
      return data.error
    }

    // Handle network errors
    if (error.code === "ERR_NETWORK") {
      return "Network error. Please check your connection."
    }

    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again."
    }

    // Handle HTTP status codes
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return "Invalid request. Please check your input."
        case 401:
          return "Session expired. Please log in again."
        case 403:
          return "You don't have permission to perform this action."
        case 404:
          return "The requested resource was not found."
        case 409:
          return "A conflict occurred. The resource may already exist."
        case 422:
          return "Invalid data provided. Please check your input."
        case 429:
          return "Too many requests. Please wait and try again."
        case 500:
          return "Server error. Please try again later."
        case 502:
          return "Server is temporarily unavailable."
        case 503:
          return "Service unavailable. Please try again later."
        default:
          return `An error occurred (${error.response.status})`
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}

/**
 * Show an error toast with the extracted error message
 */
export function showErrorToast(error: unknown, fallbackMessage?: string): void {
  const message = getErrorMessage(error)
  toast.error(fallbackMessage || message, {
    duration: 5000,
  })
}

/**
 * Show a success toast
 */
export function showSuccessToast(message: string): void {
  toast.success(message, {
    duration: 3000,
  })
}

/**
 * Show an info toast
 */
export function showInfoToast(message: string): void {
  toast.info(message, {
    duration: 4000,
  })
}

/**
 * Show a warning toast
 */
export function showWarningToast(message: string): void {
  toast.warning(message, {
    duration: 4000,
  })
}

/**
 * Show a loading toast that can be updated
 */
export function showLoadingToast(message: string): string | number {
  return toast.loading(message)
}

/**
 * Update or dismiss a toast
 */
export function dismissToast(toastId: string | number): void {
  toast.dismiss(toastId)
}

/**
 * Show a promise toast that handles loading, success, and error states
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  }
): Promise<T> {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error || ((error) => getErrorMessage(error)),
  })
}
