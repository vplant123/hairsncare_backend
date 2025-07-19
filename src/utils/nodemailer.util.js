const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'avinashCodekit@gmail.com',
//         pass: 'iqwr vwjo rilh kqfg'
//     }
// });

// const transporter = nodemailer.createTransport({
//   host: "smtpout.secureserver.net",
//   port: 465,
//   secure: true, // <== REQUIRED for port 465
//   auth: {
//     user: "info@hairsncares.com",
//     pass: "911@Hairs007",
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 587,
  secure: false, // TLS starts after connection
  auth: {
    user: "info@hairsncares.com",
    pass: "911@Hairsncares",
  },
});

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "work26mohit@gmail.com",
//     pass: "tzci ujtt atay ciap",
//   },
// });

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

// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=work26mohit@gmail.com
// SMTP_PASS=tzci ujtt atay ciap
