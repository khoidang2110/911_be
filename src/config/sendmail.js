
import dotenv from 'dotenv'
dotenv.config()

import nodemailer from 'nodemailer';

const sendMail = async({
    email,
    subject,
    html
}) =>{
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service:'Gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const message = {
    from: 'ADMIN FORM EBW',
    to: email,
    subject: subject,
    html:html
}

const result = await transporter.sendMail(message)
return result;
};

export default sendMail;