/* eslint-disable */
import packageJson from "../../package.json";

export default function handler(req, res) {
  res.status(200).json({ status: "healthy", appVersion: packageJson.version });
}
