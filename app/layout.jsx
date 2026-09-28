import "./globals.css";
import Link from "next/link";
import { Schibsted_Grotesk, IBM_Plex_Mono } from "next/font/google";

const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata = {
  title: "ll4sch",
  description: "Public addresses and live status for the ll4sch server.",
};

const links = [
  ["/", "Home"],
  ["/java-minecraft-server", "Java"],
  ["/valheim", "Valheim"],
  ["/servermonitor", "Monitor"],
  ["/ai", "AI"],
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className={sans.className}>
        <div className="wrap">
          <header className="site">
            <Link className="brand" href="/">
              ll4sch <span>server</span>
            </Link>
            <nav>
              {links.map(([href, label]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          </header>
          <main>{children}</main>
          <footer>Zrionix</footer>
        </div>
      </body>
    </html>
  );
}
