import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "ll4sch",
  description: "ll4sch.com — Minecraft, Valheim, and other hosted services.",
};

const links = [
  ["/", "Home"],
  ["/java-minecraft-server", "Java"],
  ["/bettermc-java-minecraft-server", "BetterMC"],
  ["/servermonitor", "Monitor"],
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <header className="site">
            <Link className="brand" href="/">
              ll4sch
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
          <footer>Domain and website ran by Nathan / CoMinder</footer>
        </div>
      </body>
    </html>
  );
}
