const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: { // ข้อมูลการเข้าสู่ระบบ
      user: process.env.SENDEREMAIL, // email user ของเรา
      pass: process.env.SENDERPASSWORD // email password
    }
   });


   module.exports = transporter