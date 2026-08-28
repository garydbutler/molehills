import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LegalDocumentProps = {
  fileName: "privacy-policy.md" | "terms-of-service.md";
};

function legalHref(href: string | undefined) {
  if (href === "./privacy-policy.md") return "/privacy-policy";
  if (href === "./terms-of-service.md") return "/terms-of-service";
  return href;
}

export default async function LegalDocument({ fileName }: LegalDocumentProps) {
  const source = await readFile(path.join(process.cwd(), "legal", fileName), "utf8");
  const currentPage = fileName === "privacy-policy.md" ? "privacy" : "terms";

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="legal-nav">
        <div className="container legal-nav-inner">
          <Link className="brand" href="/" aria-label="Molehill home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path
                  d="M2.5 12.5 L6.5 5.5 L9 9.5 L11 6.5 L13.5 12.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Molehill<span className="dot">.</span>
          </Link>
          <nav className="legal-links" aria-label="Legal pages">
            <Link href="/">Home</Link>
            <Link href="/privacy-policy" aria-current={currentPage === "privacy" ? "page" : undefined}>
              Privacy
            </Link>
            <Link href="/terms-of-service" aria-current={currentPage === "terms" ? "page" : undefined}>
              Terms
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="legal-main">
        <div className="container">
          <article className="legal-document">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, title }) => (
                  <a href={legalHref(href)} title={title}>
                    {children}
                  </a>
                ),
              }}
            >
              {source}
            </ReactMarkdown>
          </article>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="container legal-footer-inner">
          <span>© 2026 Molehill · MoleHills.app</span>
          <nav aria-label="Footer legal links">
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms-of-service">Terms</Link>
            <a href="mailto:hello@molehills.app">Contact</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
