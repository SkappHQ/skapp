/* eslint-disable */
import { NextResponse } from "next/server";

import packageJson from "../../../package.json";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    appVersion: packageJson.version
  });
}
