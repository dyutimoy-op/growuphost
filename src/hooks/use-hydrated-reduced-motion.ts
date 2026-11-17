import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function useHydratedReducedMotion(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated && prefersReducedMotion === true;
}
