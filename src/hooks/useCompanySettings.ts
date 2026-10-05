import { useEffect, useState } from "react";
import { getCompanySettings, defaultSettings } from "../services/settingsService";
import type { CompanySettings } from "../services/settingsService";

export function useCompanySettings(): CompanySettings {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);

  useEffect(() => {
    let alive = true;
    getCompanySettings().then((data) => {
      if (alive) setSettings(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}