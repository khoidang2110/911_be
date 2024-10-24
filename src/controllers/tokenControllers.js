import { PrismaClient } from "@prisma/client";
import refreshZaloToken from "../config/refreshZaloToken.js";
import cron from "node-cron";
import moment from 'moment';
const prisma = new PrismaClient();

const refreshToken = async (req, res) => {
  try {
    const now = new Date();
    const localTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Vietnam time

    // Get the unique refresh token from the token table
    const tokenRecord = await prisma.token.findFirst();

    if (!tokenRecord || !tokenRecord.refresh_token) {
      // If called from cron job, log the error and return without sending a response
      if (!req || !res) {
        console.error("Refresh token not found");
        return; // Exit the function silently
      }
      return res.status(404).json({ success: false, message: "Refresh token not found" });
    }

    const refreshToken = tokenRecord.refresh_token;

    // Get appId and secretKey from environment variables
    const appId = process.env.ZALO_APP_ID;
    const secretKey = process.env.ZALO_SECRET_KEY;

    // Call the refresh token function with the token from the database
    const refreshedData = await refreshZaloToken(refreshToken, appId, secretKey);

    // Save the new values to the database
    await prisma.token.update({
      where: { token_id: tokenRecord.token_id },
      data: {
        access_token: refreshedData.access_token,
        refresh_token: refreshedData.refresh_token,
        expires_in: refreshedData.expires_in,
        created_at: localTime,
      },
    });

    // Send a success response with localTime and a message
    if (req && res) { // Only send response if req and res are available
      return res.status(200).json({
        success: true,
        message: "Token refreshed and saved successfully",
        localTime: localTime.toISOString(), // Convert localTime to ISO string format
      });
    } else {
      console.log("Token refreshed successfully at", localTime.toISOString());
    }
  } catch (error) {
    console.error("Error in refresh token handler:", error);
    if (req && res) {
      return res.status(500).json({ success: false, message: "Failed to refresh token" });
    }
  }
};


const getToken = async (req, res) => {
  try {
    // Lấy token từ cơ sở dữ liệu
    const token = await prisma.token.findFirst({});

    if (!token) {
      console.log("No token found");
      return null;
    }

    console.log("Token:", token);
    return res.send(token);
  } catch (error) {
    console.error("Error retrieving token:", error);
    throw new Error("Failed to get token");
  } finally {
    await prisma.$disconnect();
  }
};
//cron.schedule("0 6 * * *", () => {
cron.schedule("0 6 * * *", () => {
  console.log("Running the refresh token job...");
  refreshToken();
});

export { refreshToken, getToken };
