// Canonical site identity. Everything user-facing that names the domain or the
// contact address reads from here, so a domain move is one edit, not a hunt.
//
// ponytail: plain constants, not env vars — these are public, identical across
// every environment, and needed at module scope by metadata/robots/sitemap.
// Move to env only if a deploy ever needs a different domain than the source.

export const SITE_URL = "https://unbig.app";
export const CONTACT_EMAIL = "contact@unbig.app";
