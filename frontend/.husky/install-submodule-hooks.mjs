import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const huskyDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(huskyDirectory, "..", "..");
const hooksPath = join(huskyDirectory, "_").replaceAll("\\", "/");
const hooksAreEnabled = process.env.HUSKY !== "0";
const isCheckout =
  existsSync(join(repositoryRoot, ".git")) &&
  existsSync(join(repositoryRoot, ".gitmodules"));

const listSubmodulePaths = () =>
  execFileSync(
    "git",
    ["config", "--file", ".gitmodules", "--get-regexp", "^submodule\\..*\\.path$"],
    { cwd: repositoryRoot, encoding: "utf8" }
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => join(repositoryRoot, line.slice(line.indexOf(" ") + 1)));

if (hooksAreEnabled && isCheckout) {
  listSubmodulePaths()
    .filter((submodulePath) => existsSync(join(submodulePath, ".git")))
    .forEach((submodulePath) =>
      execFileSync(
        "git",
        ["-C", submodulePath, "config", "core.hooksPath", hooksPath],
        { stdio: "inherit" }
      )
    );
}
