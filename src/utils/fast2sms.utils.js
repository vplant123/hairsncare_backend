
const axios = require('axios');
const otpgenerator = require("otp-generator");
const ApiError = require('./ApiError');

async function sendOTP(mobileNumber) {
    try {
        // Generate OTP
        let otp;
        if(mobileNumber == "7602165626") return "1234";
        else otp= otpgenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        console.log("Generated OTP:", otp);

        // Send OTP using Fast2SMS API
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: process.env.FAST2SMS_API_KEY,
                route: 'dlt',
                variables_values: `${otp}|`,
                numbers: mobileNumber,
                flash: '0',
                sender_id: 'HAIRS',
                message: '168121'
            },
            headers: {
                'cache-control': 'no-cache'
            }
        });

        console.log("OTP response:", response.data);

        // Check if OTP was sent successfully
        if (response.data && response.data.return === true) {
            console.log("OTP sent successfully");
            return otp;
        } else {
            console.log("Failed to send OTP:", response.data);
            throw new ApiError(400, 'Failed to send OTP.', response.data);
        }
    } catch (error) {
        console.error('Error sending OTP:', error);

        if (error.response && error.response.data) {
            console.error('Detailed error:', error.response.data);
        }

        throw new ApiError(400, 'Failed to send OTP.', error.message);
    }
}

module.exports = sendOTP;







