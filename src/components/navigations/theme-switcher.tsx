"use client";

import {
  DropdownMenuGroup, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value)}
          >
            <DropdownMenuRadioItem
              aria-label="Switch to Light Mode"
              value="light"
              className="flex items-center gap-1"
            >
              <Sun className="size-4 shrink-0" aria-hidden="true" />
              Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              aria-label="Switch to Dark Mode"
              value="dark"
              className="flex items-center gap-2"
            >
              <Moon className="size-4 shrink-0" aria-hidden="true" />
              Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              aria-label="Switch to System Mode"
              value="system"
              className="flex items-center gap-2"
            >
              <Monitor className="size-4 shrink-0" aria-hidden="true" />
              System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  );
};

export { ThemeSwitcher };