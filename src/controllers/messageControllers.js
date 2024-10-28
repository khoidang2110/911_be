import { PrismaClient } from "@prisma/client";
import moment from 'moment';
import axios from 'axios';
import cron from 'node-cron';
const prisma = new PrismaClient();


const getAllMessage = async (req, res) => {
  try {
      // Fetch all messages from the database
      const data = await prisma.message.findMany();

      // Convert time_send to Vietnam time and format it without 'Z'
      const convertedData = data.map(message => {
          const timeSendUTC = new Date(message.time_send); // Assuming time_send is in UTC
          const timeSendVN = new Date(timeSendUTC.getTime() + (7 * 60 * 60 * 1000));  // Convert to Vietnam time
          
          return {
              ...message,
              time_send: timeSendVN.toISOString().slice(0, -1) // Remove the 'Z' at the end
          };
      });

      // Send the data back in the response
      res.status(200).json({
          success: true,
          message: 'Messages retrieved successfully',
          data: convertedData // Send converted data
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
        
        // Fetch all messages for the given user_id from the database
        const data = await prisma.message.findMany({
            where: {
                user_id: user_id // Get messages for the specified user_id
            }
        });

        // Convert time_send to Vietnam time and format it without 'Z'
        const convertedData = data.map(message => {
            const timeSendUTC = new Date(message.time_send); // Assuming time_send is in UTC
            const timeSendVN = new Date(timeSendUTC.getTime() + (7 * 60 * 60 * 1000));  // Convert to Vietnam time
            
            return {
                ...message,
                time_send: timeSendVN.toISOString().slice(0, -1) // Remove the 'Z' at the end
            };
        });

        // Send the data back in the response
        res.status(200).json({
            success: true,
            message: 'Messages retrieved successfully',
            data: convertedData // Send converted data
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
    
    const today = new Date();  // This is in UTC
    const vietnamTime = new Date(today.getTime() + (7 * 60 * 60 * 1000));  // Add 7 hours in milliseconds
    
    // Format to YYYY-MM-DDTHH:mm:ss.sss (Vietnam time)
    const formattedDate = vietnamTime.toISOString().slice(0, -1);  // Remove the 'Z' at the end
    console.log(formattedDate);   // Displays the current time in Vietnam
    
    // Set the start and end of the day (Vietnam time)
    const startOfDay = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate());
    const endOfDay = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate() + 1); // Next day at 00:00

      // Fetch messages where time_send is today
      const data = await prisma.message.findMany({
          where: {
              time_send: {
                  gte: startOfDay, // Greater than or equal to start of the day
                  lt: endOfDay     // Less than the start of the next day
              }
          }
      });

      // Convert time_send to Vietnam time and format it without 'Z'
      const convertedData = data.map(message => {
          const timeSendUTC = new Date(message.time_send); // Assuming time_send is in UTC
          const timeSendVN = new Date(timeSendUTC.getTime() + (7 * 60 * 60 * 1000));  // Convert to Vietnam time
          
          return {
              ...message,
              time_send: timeSendVN.toISOString().slice(0, -1) // Remove the 'Z' at the end
          };
      });

      // Send the data back in the response
      res.status(200).json({
          success: true,
          message: 'Messages retrieved successfully',
          data: convertedData // Send converted data
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

  
  const getTodayPendingMessages = async (req, res) => {
    try {
      // Get the current date
      const today = new Date();  // This is in UTC
      const vietnamTime = new Date(today.getTime() + (7 * 60 * 60 * 1000));  // Add 7 hours in milliseconds
      
      // Format to YYYY-MM-DDTHH:mm:ss.sss (Vietnam time)
      const formattedDate = vietnamTime.toISOString().slice(0, -1);  // Remove the 'Z' at the end
      console.log(formattedDate);   // Displays the current time in Vietnam
      
      // Set the start and end of the day (Vietnam time)
      const startOfDay = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate());
      const endOfDay = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate() + 1); // Next day at 00:00
  
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
      
      // Convert time_send to Vietnam time before sending the response
      const convertedData = data.map(message => {
        const timeSendUTC = new Date(message.time_send);
        const timeSendVN = new Date(timeSendUTC.getTime() + (7 * 60 * 60 * 1000));  // Convert to Vietnam time
        return {
          ...message,
          time_send: timeSendVN.toISOString().slice(0, -1)  // Format without 'Z'
        };
      });
  
      // Send the data back in the response
      res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        today: formattedDate,
        data: convertedData  // Send converted data
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

      const timePart = Date.now().toString().slice(-4); // Last 4 digits of current timestamp
      const randomPart = Math.floor(Math.random() * 9000) + 1000; // 4 random digits
      const combined = `${timePart}${randomPart}`; // 8-digit string
      
  
      
      // Check if the date is valid
      if (!formattedDate.isValid()) {
        throw new Error('Invalid date format. Expected format: DD/MM/YYYY');
      }
  
      // Create the new message object with status and deleted fields
      let newDataMessage = {
        message_id:parseInt(combined),
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
  cron.schedule('0 7 * * *', async () => {
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
                      "type": "header",
                      "content": "💥💥911 GARAGE💥💥"
                    },
                    {
                      "type": "text",
                      "align": "left",
                      "content": messageText  // Message content from the pending messages
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
  
  // Tạo cron job chạy mỗi phút
  // cron.schedule('37 12 * * *', () => {
  //   const now = new Date();
  //   console.log('Time now (Vietnamese):', now.toLocaleString('vi-VN'));
  // });
  



export { getAllMessage,createMessage,deleteMessage,updateMessage,getPendingMessage,getMessageById,getToDayMessage,getTodayPendingMessages };
