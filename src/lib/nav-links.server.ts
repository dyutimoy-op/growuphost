import {
  DEFAULT_NAV_LINKS,
  parseNavLinksFileContents,
  serializeNavLinkRecords,
  sortNavLinkRecords,
  type NavLinkRecord,
} from "@/config/nav-links";

function navLinksFilePath(): string {
  const override = process.env["NAV_LINKS_FILE"];
  if (typeof override === "string" && override.trim().length > 0) return override.trim();
  return `${process.cwd()}/data/nav-links.json`;
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && (error as { code?: unknown }).code === "ENOENT"
  );
}

export async function readNavLinks(): Promise<NavLinkRecord[]> {
  const { readFile } = await import("node:fs/promises");
  const filePath = navLinksFilePath();

  let contents: string;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error: unknown) {
    if (!isMissingFile(error)) {
      console.error(`[nav-links] could not read ${filePath}:`, error);
    }
    return sortNavLinkRecords(DEFAULT_NAV_LINKS);
  }

  return parseNavLinksFileContents(contents);
}

async function readNavLinksForWrite(): Promise<NavLinkRecord[]> {
  const { readFile } = await import("node:fs/promises");
  const filePath = navLinksFilePath();

  let contents: string;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error: unknown) {
    if (isMissingFile(error)) return sortNavLinkRecords(DEFAULT_NAV_LINKS);
    console.error(`[nav-links] refusing to write, could not read ${filePath}:`, error);
    throw new Error(
      `Could not read the existing links from ${filePath}, so this change was not saved — applying it would have discarded whatever is in that file. Check the file's permissions and try again.`,
    );
  }

  if (contents.trim().length === 0) return sortNavLinkRecords(DEFAULT_NAV_LINKS);

  try {
    JSON.parse(contents);
  } catch (error: unknown) {
    console.error(`[nav-links] refusing to write, ${filePath} is not valid JSON:`, error);
    throw new Error(
      `The links file at ${filePath} is not valid JSON, so this change was not saved — applying it would have dropped every link in that file. Fix the file, then try again.`,
    );
  }

  return parseNavLinksFileContents(contents);
}

let writeQueue: Promise<unknown> = Promise.resolve();

export async function writeNavLinks(
  update: (current: NavLinkRecord[]) => NavLinkRecord[],
): Promise<NavLinkRecord[]> {
  const run = async (): Promise<NavLinkRecord[]> => {
    const { mkdir, rename, writeFile } = await import("node:fs/promises");
    const { dirname, join } = await import("node:path");

    const current = await readNavLinksForWrite();
    const next = sortNavLinkRecords(update(current));

    const filePath = navLinksFilePath();
    const directory = dirname(filePath);
    await mkdir(directory, { recursive: true });

    const tempPath = join(directory, `.nav-links.${process.pid}.${Date.now()}.tmp`);
    await writeFile(tempPath, serializeNavLinkRecords(next), "utf8");
    await rename(tempPath, filePath);

    return next;
  };

  const chained = writeQueue.then(run, run);
  writeQueue = chained.catch(() => undefined);
  return chained;
}
