// @rootcodelabs/skapp-ui ships an `@import url("https://fonts.googleapis.com/...")`
// in the middle of its stylesheet. Once Tailwind inlines that stylesheet the
// import no longer sits at the top of the file, which Turbopack's CSS parser
// rejects outright. Inter is already loaded through next/font in pages/_app.tsx,
// so the remote import is redundant and safe to drop.
const stripRemoteImports = () => ({
  postcssPlugin: "strip-remote-imports",
  OnceExit(root) {
    root.walkAtRules("import", (rule) => {
      if (/^url\(\s*["']?https?:/i.test(rule.params)) {
        rule.remove();
      }
    });
  }
});
stripRemoteImports.postcss = true;

const config = {
  plugins: ["@tailwindcss/postcss", stripRemoteImports()]
};

export default config;
