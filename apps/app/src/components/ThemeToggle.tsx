import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n";

export function ThemeToggle() {
  const { t } = useI18n();
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9" />}>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">{t.common.toggleTheme}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>{t.common.light}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{t.common.dark}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{t.common.system}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
