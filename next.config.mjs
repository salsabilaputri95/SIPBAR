import fs from "node:fs";

// Fix Node.js 24 on Windows regression where fs.readlink on regular files returns EISDIR instead of EINVAL/UNKNOWN
const origReadlink = fs.readlink;
const origReadlinkSync = fs.readlinkSync;

if (origReadlink) {
  fs.readlink = function (path, options, callback) {
    const cb = typeof options === "function" ? options : callback;
    const opts = typeof options === "function" ? undefined : options;
    return origReadlink.call(fs, path, opts, (err, linkString) => {
      if (err && (err.code === "EISDIR" || err.code === "UNKNOWN")) {
        err.code = "EINVAL";
      }
      if (cb) cb(err, linkString);
    });
  };
}

if (origReadlinkSync) {
  fs.readlinkSync = function (path, options) {
    try {
      return origReadlinkSync.call(fs, path, options);
    } catch (err) {
      if (err && (err.code === "EISDIR" || err.code === "UNKNOWN")) {
        err.code = "EINVAL";
      }
      throw err;
    }
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: ".next_app",
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
