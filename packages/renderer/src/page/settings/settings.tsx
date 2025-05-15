import { useState } from "react";
import { useLanguage, Language } from "@/components/language-provider";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Import RadioGroup trực tiếp từ node_modules để tránh lỗi
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";
import { toast } from "sonner";
import { trackFeatureUsage } from "@/services/database";
import { Globe, Palette, Save } from "lucide-react";

// Tạo RadioGroup components inline với đầy đủ TS types
interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  className?: string;
}

const RadioGroup = ({ className, ...props }: RadioGroupProps) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
};

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  className?: string;
}

const RadioGroupItem = ({ className, ...props }: RadioGroupItemProps) => {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
};

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  // State to track the currently selected values (before saving)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(language);
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light" | "blue" | "green">(theme);

  // Save settings to database
  const saveSettings = () => {
    // Track that settings were saved
    trackFeatureUsage("settings_saved").catch(err => {
      console.error("Error tracking settings usage:", err);
    });

    // Update language
    if (currentLanguage !== language) {
      setLanguage(currentLanguage);
    }

    // Update theme
    if (currentTheme !== theme) {
      setTheme(currentTheme);
    }

    // Show success message
    toast.success(t("settings.saved"));
  };

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>{t("settings.language")}</CardTitle>
            </div>
            <CardDescription>
              {t("app.language")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentLanguage}
              onValueChange={(value: string) => setCurrentLanguage(value as Language)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vi" id="vi" />
                <Label htmlFor="vi">{t("language.vi")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en">{t("language.en")}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>{t("settings.theme")}</CardTitle>
            </div>
            <CardDescription>
              {t("app.theme")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentTheme}
              onValueChange={(value: string) => {
                if (value === "dark" || value === "light" || value === "blue" || value === "green") {
                  setCurrentTheme(value);
                }
              }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">{t("theme.dark")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">{t("theme.light")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blue" id="blue" />
                <Label htmlFor="blue">{t("theme.blue")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="green" id="green" />
                <Label htmlFor="green">{t("theme.green")}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {t("app.save")}
        </Button>
      </div>
    </div>
  );
} 