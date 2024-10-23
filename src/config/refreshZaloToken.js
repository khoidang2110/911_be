import axios from 'axios';

const ZALO_API_URL = 'https://oauth.zaloapp.com/v4/oa/access_token';

const refreshZaloToken = async (refreshToken, appId, secretKey) => {
  // Kiểm tra xem secretKey có phải là một chuỗi không
 console.log(secretKey)

  try {
    // Gửi yêu cầu POST đến Zalo API để làm mới token
    const response = await axios.post(
      ZALO_API_URL,
      new URLSearchParams({
        refresh_token: refreshToken,
        app_id: appId,
        grant_type: 'refresh_token',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': secretKey,
        },
      }
    );

    console.log('API Response:', response.data); // Log dữ liệu phản hồi

    const { access_token, refresh_token, expires_in } = response.data;

    // Trả về dữ liệu token mới
    return {
      access_token,
      refresh_token,
      expires_in,
    };
  } catch (error) {
    console.error('Error refreshing Zalo token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to refresh token');
  }
};

export default refreshZaloToken;
