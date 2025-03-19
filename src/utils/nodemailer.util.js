const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'avinashCodekit@gmail.com',
//         pass: 'iqwr vwjo rilh kqfg'
//     }
// });

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net", // GoDaddy SMTP server
  port: 465, // Secure SMTP port
  secure: true, // Use SSL/TLS
  auth: {
    user: "info@hairsncares.com", // Your GoDaddy email
    pass: "H@irs#321", // Your GoDaddy email password
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "info@hairsncares.com",
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

const sendEmailTemplate = async (to, subject, emailHtml) => {
  const mailOptions = {
    from: "info@hairsncares.com",
    to,
    subject,
    html: emailHtml,
  };
  console.log("ojeroj", mailOptions);
  let re = await transporter.sendMail(mailOptions);
  return re;
};

module.exports = { sendEmail, sendEmailTemplate };
