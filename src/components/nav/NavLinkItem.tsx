import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { sanitizeUrl } from "@/config/whmcs";
import type { NavLinkRow } from "@/hooks/use-nav-links";
import { asInternalPath } from "@/lib/internal-links";

interface NavLinkItemProps {
  link: NavLinkRow;
  className?: string | undefined;

  onNavigate?: (() => void) | undefined;

  children?: ReactNode | undefined;
}

export function NavLinkItem({ link, className, onNavigate, children }: NavLinkItemProps) {
  const href = sanitizeUrl(link.url, "");
  if (href.length === 0) return null;

  const internal = asInternalPath(href);
  const newTabProps = link.open_in_new_tab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : ({} as Record<string, never>);

  const content = (
    <>
      {children ?? link.label}
      {link.open_in_new_tab && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );

  if (internal) {
    return (
      <Link to={internal} className={className} onClick={onNavigate} {...newTabProps}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={className} onClick={onNavigate} {...newTabProps}>
      {content}
    </a>
  );
}
