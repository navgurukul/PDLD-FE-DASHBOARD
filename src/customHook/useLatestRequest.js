import { useCallback, useEffect, useRef } from "react";
import axios from "axios";

/**
 * Only the newest request of a table may update it.
 *
 * Call `startRequest()` before each fetch: it cancels the previous request and returns
 * `{ signal, isLatest }`. Pass `signal` to axios and check `isLatest()` before setting state,
 * so a slow answer for an old filter or page can never overwrite the newer one.
 */
export const useLatestRequest = () => {
  const controllerRef = useRef(null);

  // Cancel whatever is still running when the page closes
  useEffect(() => () => controllerRef.current?.abort(), []);

  return useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return {
      signal: controller.signal,
      isLatest: () => controllerRef.current === controller,
    };
  }, []);
};

// True for the error axios throws when a request was cancelled by a newer one
export const isCancelledRequest = (error) => axios.isCancel(error) || error?.name === "CanceledError";
