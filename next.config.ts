import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
if (basePath && !/^\/[a-zA-Z0-9/_-]+$/.test(basePath)) {
  throw new Error(
    "NEXT_PUBLIC_BASE_PATH deve iniziare con / e contenere un percorso valido.",
  );
}
if (basePath.endsWith("/")) {
  throw new Error("NEXT_PUBLIC_BASE_PATH non deve terminare con /.");
}

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default config;
