const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler');


const sendEmail = asyncHandler(async(data,req,res) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          
          user: process.env.MAIL_ID,
          pass: process.env.MP,
        },
      });
      
      // async..await is not allowed in global scope, must use a wrapper
      async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: '"Blessed" mwangiericooh@gmail.com', // sender address
          to: data.to,
          text: data.text, // list of receivers
          subject: data.subject, // Subject line
          html: data.htm, // html body
        });
      
        console.log("Message sent: %s", info.messageId);
    }   
    
    await main();
})

module.exports = sendEmail