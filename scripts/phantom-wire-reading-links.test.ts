import { expect, test } from "bun:test";
import { statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const documentPath = resolve(import.meta.dir, "../docs/phantom-wire-example-reading.md");

test("relative file links in the reading guide resolve locally", async () => {
  const document = await Bun.file(documentPath).text();
  const destinations = [...document.matchAll(/\]\(<?([^\s)>]+)>?(?:\s+[^)]*)?\)/g)].map(
    (match) => match[1],
  );
  const relativeFiles = destinations.filter(
    (destination) =>
      !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(destination) &&
      destination.split(/[?#]/, 1)[0] !== "",
  );

  expect(relativeFiles.length).toBeGreaterThan(0);
  const missing = relativeFiles.filter((destination) => {
    const path = decodeURIComponent(destination.split(/[?#]/, 1)[0]);
    try {
      return !statSync(resolve(dirname(documentPath), path)).isFile();
    } catch {
      return true;
    }
  });
  expect(missing).toEqual([]);
});
