import { createContext, useContext, useEffect, useState } from "react";
import { getSetting, saveSetting } from "@/services/database";

type Theme = "dark" | "light" | "blue" | "green";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "app-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from database when component mounts
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await getSetting(storageKey);
        if (savedTheme && (savedTheme === "dark" || savedTheme === "light" || savedTheme === "blue" || savedTheme === "green")) {
          setTheme(savedTheme as Theme);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load theme from database:", error);
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded) return;
    
    const root = window.document.documentElement;
    root.classList.remove("dark", "light", "blue", "green");
    root.classList.add(theme);
    
    // Store theme as data attribute for CSS access
    root.setAttribute("data-theme", theme);
  }, [theme, isLoaded]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      saveSetting(storageKey, newTheme).catch(error => {
        console.error("Failed to save theme to database:", error);
      });
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
