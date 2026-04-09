import Link from "next/link";
import Image from "next/image";

export default function BuyingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <Link href="/fleet?mode=buy" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Cars for Sale
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
