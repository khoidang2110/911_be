import express from "express";

import {getToken, refreshToken} from '../controllers/tokenControllers.js'



const tokenRoutes = express.Router();
tokenRoutes.post('/refresh-token',refreshToken)
tokenRoutes.get('/get-token', getToken)
export default tokenRoutes;