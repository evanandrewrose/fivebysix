import { Mutex } from "async-mutex";
import { Id, toast, ToastOptions } from "react-toastify";

export const showError = (error: string | Error, options?: ToastOptions, log?: boolean): Id => {
  if (error instanceof Error) {
    return showError(error.message);
  }

  if (log) {
    console.error(error);
  }

  return toast.error(error, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};

export const showSuccess = (message: string) =>
  toast.success(message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

const toastMutex = new Mutex();

/**
 * Toast de-duplication by id doesn't seem to work correctly if the toasts are emitted from multiple threads at the same
 * time, which can happen if multiple re-renders happen and the toast is asynchronously emitted via useEffect in the
 * renders.
 *
 * This method wraps toaster with a mutex.
 */
export const sequentialToast = async (...args: Parameters<typeof toast>): Promise<ReturnType<typeof toast>> => {
  await toastMutex.acquire();
  const id = toast(...args);

  let unsubscribe: null | (() => void) = null;

  const listenerUnsubscribe = toast.onChange((item) => {
    if (item.id === id && item.status === "removed") {
      toastMutex.release();

      if (unsubscribe) {
        unsubscribe();
      }
    }
  });

  unsubscribe = listenerUnsubscribe;

  return id;
};
