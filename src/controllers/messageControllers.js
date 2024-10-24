import { PrismaClient } from "@prisma/client";
import moment from 'moment';
import axios from 'axios';
import cron from 'node-cron';
const prisma = new PrismaClient();


const getAllMessage = async (req, res) => {
    try {
      // Fetch all messages from the database
      const data = await prisma.message.findMany();
  
      // Send the data back in the response
      res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: data
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
  
      // Send a 500 response in case of an error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
  const getPendingMessage = async (req, res) => {
    try {
      // Fetch all messages with status 'Pending' from the database
      const data = await prisma.message.findMany({
        where: {
          status: 'Pending' // Only get messages with 'Pending' status
        }
      });
  
      // Send the data back in the response
      res.status(200).json({
        success: true,
        message: 'Pending messages retrieved successfully',
        data: data
      });
    } catch (error) {
      console.error('Error fetching pending messages:', error);
  
      // Send a 500 response in case of an error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
  const getMessageById = async (req, res) => {
    try {
    
      let { user_id } = req.params;
      console.log(user_id);
      // Fetch all messages with status 'Pending' from the database
      const data = await prisma.message.findMany({
        where: {
          user_id: user_id // Only get messages with 'Pending' status
        }
      });
  
      // Send the data back in the response
      res.status(200).json({
        success: true,
        message: 'messages retrieved successfully',
        data: data
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
  
      // Send a 500 response in case of an error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
  const getToDayMessage = async (req, res) => {
    try {
      // Get the current date
      const today = new Date();
      
      // Set the start and end of the day
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Next day at 00:00
  
      // Fetch messages where time_send is today
      const data = await prisma.message.findMany({
        where: {
          time_send: {
            gte: startOfDay, // Greater than or equal to start of the day
            lt: endOfDay     // Less than the start of the next day
          }
        }
      });
  
      // Send the data back in the response
      res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: data
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
  
      // Send a 500 response in case of an error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
  
  const getTodayPendingMessages = async (req,res) => {
    try {
      // Get the current date
      const today = new Date();
      
      // Set the start and end of the day
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Next day at 00:00
  
      // Fetch messages where time_send is today
      const data = await prisma.message.findMany({
        where: {
          time_send: {
            gte: startOfDay, // Greater than or equal to start of the day
            lt: endOfDay     // Less than the start of the next day
          },
          status: 'Pending'
        }
      });
  
      // Send the data back in the response
      res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: data
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
  
      // Send a 500 response in case of an error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
  const sendMessageToZalo = async (userId, messageData) => {
    const zaloApiUrl = 'https://openapi.zalo.me/v3.0/oa/message/promotion';
    
    try {
      // Retrieve the access token from the database
      const tokenRecord = await prisma.token.findFirst();
  
      if (!tokenRecord || !tokenRecord.access_token) {
        throw new Error('Access token not found');
      }
  
      const accessToken = tokenRecord.access_token;
  
      // Prepare the payload for the Zalo message
      const payload = {
        recipient: { user_id: userId },
        message: messageData
      };
  
      // Send the message to the Zalo API
      const response = await axios.post(zaloApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'access_token': accessToken // Include the access token in the headers
        }
      });
  
      return response.data;
    } catch (error) {
      console.error('Error sending message to Zalo:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  const updateMessageStatus = async (messageId, status) => {
    await prisma.message.update({
      where: { message_id: messageId },
      data: { status }
    });
  };
  

  const createMessage = async (req, res) => {
    try {
      let { user_id, message, time_send } = req.body; // Expecting `time_send` in DD/MM/YYYY format
  
      // Parse the date using moment with the correct format
      let formattedDate = moment.utc(time_send, 'DD/MM/YYYY');
  
      // Check if the date is valid
      if (!formattedDate.isValid()) {
        throw new Error('Invalid date format. Expected format: DD/MM/YYYY');
      }
  
      // Create the new message object with status and deleted fields
      let newDataMessage = {
        user_id,
        time_send: formattedDate.toISOString(), // Save as timestamp
        message,
        status: 'Pending', // Set status to 'Pending'
        delete: false // Set deleted status to false
      };
  
      // Save to the database
      await prisma.message.create({
        data: newDataMessage
      });
  
      res.send("Created message successfully");
    } catch (error) {
      console.error('Error in createMessage:', error); // Log the error
      res.send(`BE error ${error}`);
    }
  };
  
  
  
const deleteMessage = async (req,res) => {
  // let { token } = req.headers;
  // checkToken(token);
  try {
    let { product_id } = req.params;

    const findItem = await prisma.product.findUnique({
      where: {
        product_id: Number(product_id),
      },
    });
    if (findItem&&findItem.deleted===false) {
      await prisma.product.update({
        where: {
          product_id: Number(product_id),
        },
        data: {
          deleted: true,
        },
      });
      res.send("You just deleted the product");
    } else {
      res.send("product not found");
    }
  } catch (error) {
    console.error(`Backend error: ${error}`);
    res.status(500).send("Internal Server Error");
  }
};
const updateMessage = async (req, res) => {
  let imagePaths = [];
  
  if (req.files && req.files.length > 0) {
    imagePaths = req.files.map(file => file.path);
  }

  try {
    let { product_id, name, price_vnd, price_usd, desc_vi, desc_en, category_id, deleted, visible } = req.body;

    const findItem = await prisma.product.findUnique({
      where: {
        product_id: Number(product_id),
      },
    });

    if (findItem) {
      await prisma.product.update({
        where: {
          product_id: Number(product_id),
        },
        data: {
          name: name || findItem.name,
          price_vnd: price_vnd ? Number(price_vnd) : findItem.price_vnd,
          price_usd: price_usd ? Number(price_usd) : findItem.price_usd,
          desc_vi: desc_vi || findItem.desc_vi,
          desc_en: desc_en || findItem.desc_en,
          category_id: category_id ? Number(category_id) : findItem.category_id,
          deleted: deleted ? JSON.parse(deleted) : findItem.deleted,
          visible: visible ? JSON.parse(visible) : findItem.visible
        },
      });

      if (imagePaths.length > 0) {
        // Delete old images
        await prisma.image.deleteMany({
          where: {
            product_id: Number(product_id),
          },
        });

        // Upload new images
        const newData = imagePaths.map(item => ({
          product_id: Number(product_id),
          img_link: item,
        }));

        await prisma.image.createMany({
          data: newData,
        });
      }

      res.send("You just updated the product");
    } else {
      res.send("Product not found");
    }
  } catch (error) {
    console.error(`Backend error: ${error}`);
    res.status(500).send("Internal Server Error");
  }
};



// cron.schedule('0 8 * * *', async () => {
  cron.schedule('10 16 * * *', async () => {
    console.log('Running the message send job at 16:55...');
    
    try {
      // Fetch today's pending messages
      // const today = new Date();
      const now = new Date();
      const today = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
      
      // Set the start and end of the day
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Next day at 00:00
  
      // Fetch messages where time_send is today and status is 'Pending'
      const messages = await prisma.message.findMany({
        where: {
          time_send: {
            gte: startOfDay, // Greater than or equal to start of the day
            lt: endOfDay     // Less than the start of the next day
          },
          status: 'Pending'
        }
      });
  
      // Ensure that messages are valid
      if (!Array.isArray(messages) || messages.length === 0) {
        console.log('No pending messages to send.');
        return;
      }
  
      console.log('Retrieved messages:', messages);
  
      // Process each message
      messages.forEach((message, index) => {
        // Ensure message is properly structured
        if (!message || typeof message !== 'object') {
          console.error('Invalid message structure:', message);
          return;
        }
  
        const { message_id, user_id, message: messageText } = message;
  
        // Check for required fields
        if (!message_id || !user_id || !messageText) {
          console.error('Message is missing required fields:', message);
          return;
        }
  
        // Schedule each message with a 5-second delay
        setTimeout(async () => {
          try {
            const messageData = {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "promotion",
                  "elements": [
                    {
                      "attachment_id": "aERC3A0iYGgQxim8fYIK6fxzsXkaFfq7ZFRB3RCyZH6RyziRis3RNydebK3iSPCJX_cJ3k1nW1EQufjN_pUL1f6Ypq3rTef5nxp6H_HnXKFDiyD5y762HS-baqRpQe5FdA376lTfq1sRyPr8ypd74ecbaLyA-tGmuJ-97W",
                      "type": "banner"
                    },
                    {
                      "type": "header",
                      "content": "💥💥Ưu đãi thành viên Platinum💥💥"
                    },
                    {
                      "type": "text",
                      "align": "left",
                      "content": messageText  // Message content from the pending messages
                    },
                    {
                      "type": "table",
                      "content": [
                        {
                          "value": "VC09279222",
                          "key": "Voucher"
                        },
                        {
                          "value": "30/12/2023",
                          "key": "Hạn sử dụng"
                        }
                      ]
                    },
                    {
                      "type": "text",
                      "align": "center",
                      "content": "Áp dụng tất cả cửa hàng trên toàn quốc"
                    }
                  ]
                }
              }
            };
  
            // Send the message to the user via Zalo API
            await sendMessageToZalo(user_id, messageData);
  
            // Update the message status to 'sent'
            await updateMessageStatus(message_id, 'Sent');
            console.log(`Message ${message_id} sent successfully.`);
  
          } catch (error) {
            console.error(`Failed to send message ${message_id}:`, error);
          }
        }, index * 5000); // 5 seconds delay between each message
      });
  
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  });
  
  
  



export { getAllMessage,createMessage,deleteMessage,updateMessage,getPendingMessage,getMessageById,getToDayMessage,getTodayPendingMessages };
