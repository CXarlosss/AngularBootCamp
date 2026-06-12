import { useState, useCallback } from "react";

export default function useViewMode() {
  const [mode, setMode] = useState("architecture");

  const toggleMode = useCallback(() => {
    setMode(prev =>
      prev === "architecture" ? "recruiter" : "architecture"
    );
  }, []);

  const setArchitecture = useCallback(() => {
    setMode("architecture");
  }, []);

  const setRecruiter = useCallback(() => {
    setMode("recruiter");
  }, []);

  return {
    mode,
    isArchitecture: mode === "architecture",
    isRecruiter: mode === "recruiter",
    toggleMode,
    setArchitecture,
    setRecruiter
  };
}