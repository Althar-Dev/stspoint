import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/assets/img/icon.png"
      alt="STSPoint Logo"
      width={100}
      height={100}
      className={cn("object-contain", className)}
      priority
    />
  );
}
