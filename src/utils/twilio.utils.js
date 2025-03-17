const twilio = require("twilio")



const accountSid = process.env.ACCOUNTSID
const authToken = process.env.AUTHTOKEN
const twilioPhoneNumber = process.env.TWILIOPHONENUMBER

const client = require('twilio')(accountSid, authToken);

async function sendSMS(phoneNumber, message) {
    try {
        const sentMessage = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber
        });

        console.log('SMS sent successfully:', sentMessage.sid);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

module.exports = { sendSMS };
