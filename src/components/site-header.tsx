import {
  BarChartIcon,
  ChevronLeftIcon,
  DotsVerticalIcon,
} from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { SiteNavigation } from "./site-navigation";
import Link from "next/link";

export function Header() {
  return (
    <nav className="z-40 w-full">
      <div className="me-6 flex h-14 items-center justify-between gap-2">
        <SiteNavigation />
        <div className="flex items-center">
          {/* <Button className="rounded-full" size={"icon"} variant={"ghost"}>
            <BarChartIcon className="h-5 w-5" />
          </Button> */}
          <Link href="/settings">
            <Button className="rounded-full" size={"icon"} variant={"ghost"}>
              <DotsVerticalIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
