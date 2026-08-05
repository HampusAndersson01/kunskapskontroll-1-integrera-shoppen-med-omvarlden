import { useEffect, useState } from "react";

export function useCurrentPath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function handleNavigation() {
      setPath(window.location.pathname);
    }

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  return path;
}
