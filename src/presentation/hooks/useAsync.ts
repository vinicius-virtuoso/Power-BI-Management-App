import { useState } from "react";
import { handleGlobalError } from "../utils/errorHandler";

export function useAsync() {
  const [loading, setLoading] = useState(false);

  const run = async <T>(promise: Promise<T>): Promise<T | null> => {
    setLoading(true);
    try {
      const data = await promise;
      return data;
    } catch (error) {
      handleGlobalError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, run };
}
