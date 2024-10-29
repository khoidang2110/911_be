import express from "express";
import { getAllMessage,createMessage,deleteMessage,updateMessage,getPendingMessage,getMessageById, getToDayMessage, getTodayPendingMessages, getTomorrowMessage } from "../controllers/messageControllers.js";




const messageRoutes = express.Router();
messageRoutes.get('/get-all-mess',getAllMessage)
messageRoutes.get('/get-pending-mess',getPendingMessage)
messageRoutes.get('/get-mess-by-id/:user_id', getMessageById)
messageRoutes.get('/get-today-pending-mess', getTodayPendingMessages)
messageRoutes.get('/get-today-mess', getToDayMessage)
messageRoutes.post('/create-mess',createMessage)
messageRoutes.get('/delete-mess/:user_id',deleteMessage)
messageRoutes.put('/update-mess' ,updateMessage)
messageRoutes.get('/get-tmr-mess', getTomorrowMessage)

export default messageRoutes;