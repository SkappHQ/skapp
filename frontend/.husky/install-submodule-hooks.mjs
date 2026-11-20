import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HOOKS_FOLDER_SUFFIX = "/frontend/.husky/_";

const huskyDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = resolve(huskyDirectory, "..");
const repositoryRoot = resolve(frontendDirectory, "..");
const hooksPath = join(huskyDirectory, "_").replaceAll("\\", "/");
const hooksAreEnabled = process.env.HUSKY !== "0";
const isCheckout =
  existsSync(join(repositoryRoot, ".git")) &&
  existsSync(join(repositoryRoot, ".gitmodules"));

const listSubmodulePaths = () =>
  execFileSync(
    "git",
    [
      "config",
      "--file",
      ".gitmodules",
      "--get-regexp",
      "^submodule\\..*\\.path$"
    ],
    { cwd: repositoryRoot, encoding: "utf8" }
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => join(repositoryRoot, line.slice(line.indexOf(" ") + 1)));

const readHooksPath = (submodulePath) =>
  spawnSync("git", ["-C", submodulePath, "config", "--get", "core.hooksPath"], {
    encoding: "utf8"
  }).stdout.trim();

const isFrontendCheckout = (submodulePath) =>
  submodulePath.startsWith(frontendDirectory + sep) &&
  existsSync(join(submodulePath, ".git"));

const acceptsSharedHooks = (submodulePath) => {
  const currentHooksPath = readHooksPath(submodulePath);
  return (
    currentHooksPath === "" || currentHooksPath.endsWith(HOOKS_FOLDER_SUFFIX)
  );
};

if (hooksAreEnabled && isCheckout) {
  listSubmodulePaths()
    .filter(isFrontendCheckout)
    .filter(acceptsSharedHooks)
    .forEach((submodulePath) =>
      execFileSync(
        "git",
        ["-C", submodulePath, "config", "core.hooksPath", hooksPath],
        { stdio: "inherit" }
      )
    );
}
