const { default: axios } = require("axios");

class ShipRocket {
  login = async () => {
    try {
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://apiv2.shiprocket.in/v1/external/auth/login",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD,
        },
      };

      let result = await axios(config);
      if (result?.status == 200) {
        return result?.data?.token;
      }
    } catch (error) {
      console.log("====>>>login", error);
      return false;
    }
  };

  createOrder = async (reqData) => {
    try {
      let token = await this.login();
      if (!token) return false;
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: JSON.stringify(reqData),
      };

      let result = await axios(config);
      if (result?.status == 200) {
        return result?.data;
      }
    } catch (error) {
      console.log("====>>>create-order", error, error?.response?.data);
      return false;
    }
  };
}
module.exports = new ShipRocket();
