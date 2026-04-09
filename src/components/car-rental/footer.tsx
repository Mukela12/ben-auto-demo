import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-surface-dark py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={120} height={40} className="h-10 w-auto" />
            <p className="mt-3 text-sm text-white/50">
              Premium car rental. Worldwide.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Fleet</h4>
            <ul className="mt-3 space-y-2">
              {["Sedans", "SUVs", "Convertibles", "Luxury"].map((item) => (
                <li key={item}>
                  <Link href="/fleet" className="text-sm text-white/60 hover:text-white">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Company</h4>
            <ul className="mt-3 space-y-2">
              {["About", "Locations", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-sm text-white/60 hover:text-white">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Support</h4>
            <ul className="mt-3 space-y-2">
              {["Help Center", "Terms", "Privacy", "Cookies"].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-sm text-white/60 hover:text-white">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/30">&copy; 2026 Ben Auto. All rights reserved.</p>
          <div className="mt-4 flex gap-4 md:mt-0">
            {["Instagram", "LinkedIn", "Twitter"].map((social) => (
              <span key={social} className="cursor-pointer text-xs text-white/30 hover:text-white/60">{social}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
