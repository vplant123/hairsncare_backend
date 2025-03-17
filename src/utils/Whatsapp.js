const axios = require("axios");

const WhatsappTextTemplate = async (input) => {
    let {attr,phone,name,campName,media} = input;
    console.log("====whatsappInput",input )
  try {
    let d1 = {
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZDE4ZGYyYTRlNGY5MGI5MTA1MmNkYyIsIm5hbWUiOiJIYWlyc25DYXJlcyAtIFlvdXIgSGFpciBFeHBlcnQgODQ4MiIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NmQxOGRmMWE0ZTRmOTBiOTEwNTJjZDciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTcyNTAwOTM5NH0.CAT3Mjre7GorkXgsQDM-QQPfqUYd46Fuid136qUAQa4",
      campaignName: campName,
      destination: `+91${phone}`,
      userName: name,
    };
    if(attr) d1.templateParams = attr
    if(media) d1.media =media

    const data = JSON.stringify(d1);

    let config = {
        method: "post",
        url: "https://backend.aisensy.com/campaign/t1/api/v2",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      
    let response = await axios(config);
    console.log("sjofr",response?.data);
    return response?.data;

  } catch (error) {
    console.log("err---",error,error?.response);
    return false;
  }
};

// textTemplate({attr : ["naren","300","200"],name : "naren",phone: "8272891195",campName : "hairtest"})

module.exports = { WhatsappTextTemplate };

