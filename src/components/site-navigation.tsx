"use client";

import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

const pathnames = {
  "/": "Shift Wellbeing",
  "/settings": "Settings",
};

export function SiteNavigation() {
  const pathname = usePathname() as keyof typeof pathnames;
  const router = useRouter();
  const isAtBase = pathname == "/";

  return (
    <div className={cn("flex items-center", { "ms-6": isAtBase, "ms-2":!isAtBase  })}>
      {!isAtBase && (
        <Button
          className="rounded-full"
          size={"icon"}
          variant={"ghost"}
          onClick={router.back}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Button>
      )}

      <h1 className="text-lg font-semibold">{pathnames[pathname]}</h1>
    </div>
  );
}
