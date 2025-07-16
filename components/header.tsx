import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function Header({ absolute = false }: { absolute?: boolean }) {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const headerClass = absolute
        ? "absolute top-0 left-0 w-full z-30 pointer-events-auto"
        : `sticky top-0 left-0 w-full z-40 border-b-2 ${resolvedTheme === 'light' ? 'border-[#7c3aed]' : 'border-[#a78bfa]'}`;

    return (
        <header className={`flex items-center justify-between px-8 py-4 h-16 ${headerClass} ${resolvedTheme === 'light' ? 'bg-[#5330cf] text-white' : 'bg-[#2d1e6b] text-white'}`} style={{ boxShadow: !absolute ? '0 4px 16px 0 #a78bfa33' : undefined }}>
            <Link href="/" className={`text-2xl font-bold ${resolvedTheme === 'light' ? 'text-white' : 'text-primary'} hover:opacity-80 flex items-center gap-2`}>
                CareerBuilder.AI
            </Link>
            <nav className="flex items-center gap-4">
                <Link href="/about" className={`text-base font-medium hover:underline underline-offset-4 transition-colors ${resolvedTheme === 'light' ? 'text-white' : ''}`}>About Us</Link>
                <Link href="/faq" className={`text-base font-medium hover:underline underline-offset-4 transition-colors ${resolvedTheme === 'light' ? 'text-white' : ''}`}>FAQ</Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </nav>
        </header>
    );
}