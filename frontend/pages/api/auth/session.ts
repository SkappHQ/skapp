import { parse } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

import { decrypt } from "~community/common/utils/encryption";

const SESSION_COOKIE_NAME = "skapp-session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookieHeader = req.headers.cookie || "";
    const cookies = parse(cookieHeader);
    const encryptedSession = cookies[SESSION_COOKIE_NAME];

    if (!encryptedSession) {
      return res.status(200).json(null);
    }

    try {
      // Decrypt session data
      const decryptedData = decrypt(encryptedSession);
      const session = JSON.parse(decryptedData);

      // Check if session is expired
      const expiryDate = new Date(session.expires);
      if (expiryDate < new Date()) {
        return res.status(200).json(null);
      }

      // Remove sensitive data before sending to client
      if (session.user) {
        delete session.refreshToken;
        delete session.user.refreshToken;
      }

      return res.status(200).json(session);
    } catch (parseError) {
      console.error("Error parsing session cookie:", parseError);
      return res.status(200).json(null);
    }
  } catch (error) {
    console.error("Get session error:", error);
    return res.status(200).json(null);
  }
}
