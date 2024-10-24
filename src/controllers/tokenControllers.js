import { PrismaClient } from "@prisma/client";
import refreshZaloToken from "../config/refreshZaloToken.js";
import cron from "node-cron";

const prisma = new PrismaClient();

const refreshToken = async (req, res) => {
  try {
    const now = new Date();

    const localTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    // Lấy refresh token duy nhất từ bảng token
    const tokenRecord = await prisma.token.findFirst();

    if (!tokenRecord || !tokenRecord.refresh_token) {
      return res.status(404).send("Refresh token not found");
    }

    const refreshToken = tokenRecord.refresh_token;
    // console.log(refreshToken)
    // Lấy thông tin appId và secretKey từ biến môi trường
    const appId = process.env.ZALO_APP_ID;
    const secretKey = process.env.ZALO_SECRET_KEY;

    // Gọi hàm refresh token với token từ cơ sở dữ liệu
    const refreshedData = await refreshZaloToken(
      refreshToken,
      appId,
      secretKey
    );
    //console.log(refreshedData)
    // Lưu các giá trị mới vào cơ sở dữ liệu
    await prisma.token.update({
      where: { token_id: tokenRecord.token_id },
      data: {
        access_token: refreshedData.access_token,
        refresh_token: refreshedData.refresh_token,
        expires_in: refreshedData.expires_in,
        created_at: localTime,
      },
    });

    res.send("Token refreshed and saved successfully");
  } catch (error) {
    console.error("Error in refresh token handler:", error);
    res.status(500).send("Failed to refresh token");
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

cron.schedule("0 16 * * *", () => {
  console.log("Running the refresh token job...");
  refreshToken();
});

export { refreshToken, getToken };
