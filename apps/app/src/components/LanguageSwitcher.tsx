import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n";
import { SUPPORTED_LANGUAGES, langTag } from "@/i18n/languages";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className={className ?? "h-9 w-9"} />}
      >
        <Languages className="h-4 w-4" />
        <span className="sr-only">{t.common.language}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            lang={langTag(language.code)}
            onClick={() => setLocale(language.code)}
          >
            <span aria-hidden="true">{language.flag}</span>
            <span className="flex-1">{language.label}</span>
            {language.code === locale && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
