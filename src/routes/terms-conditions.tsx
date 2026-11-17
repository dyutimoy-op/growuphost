import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-conditions")({
  beforeLoad: () => {
    throw redirect({ to: "/legal/terms" });
  },
});
