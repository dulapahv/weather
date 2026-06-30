import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";

export default function Page() {
  return (
    <div>
      <h1>Home</h1>
      <Link href="/about">About</Link>
      <ThemeToggle />
    </div>
  );
}
