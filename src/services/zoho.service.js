const { default: axios } = require("axios");
const tokenModel = require("../models/token.model");
const { default: mongoose } = require("mongoose");

class ZohoServies {
  generateToken = async () => {
    try {
      let refresh_token = await tokenModel.findOne({
        _id: new mongoose.Types.ObjectId("6710c68bdd11d7c2675cdd17"),
      });
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://accounts.zoho.in/oauth/v2/token?refresh_token=${refresh_token?.zohoRefreshToken}&client_id=1000.AMST6BPGZKAV4OQ9VS9NMZSS5DREAJ&client_secret=93c698e97dc2675a7455b6464984fac40bd120b9ca&grant_type=refresh_token`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      let result = await axios(config);
      console.log("kkkkkkk",result?.data?.access_token)
      if (result?.status == 200) {
        await tokenModel.updateOne(
          { _id: new mongoose.Types.ObjectId("6710c68bdd11d7c2675cdd17") },
          { zohoToken: result?.data?.access_token }
        );
      }
      return result?.data?.access_token;
    } catch (error) {
      console.log("====>>>login", error);
      return false;
    }
  };

  createRecord = async ({ reqData, module }) => {
    try {
      let access_token = await tokenModel.findOne({
        _id: new mongoose.Types.ObjectId("6710c68bdd11d7c2675cdd17"),
      });
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.in/crm/v2/${module}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Zoho-oauthtoken ${access_token?.zohoToken}`,
        },
        data : JSON.stringify(reqData)
      };
      try {
        let result = await axios(config);
        console.log("resppppppp", result);
        // if (result?.status == 200) {
          return result?.data;
        // }
      } catch (error) {
        console.log("====>>>create-order", error, error?.response?.data);
        if (error && error?.response?.status == 401) {
          let newToken = await this.generateToken();
          if (!newToken) return false;
          console.log("kjkkkkk",newToken)
          config.headers["Authorization"] = `Zoho-oauthtoken ${newToken}`;
          console.log("kkkklllll",config)
          let result = await axios(config);
          return result?.data;
        }
        return false;
      }
    } catch (error) {
      console.log("yyyy", error?.response);
      return false;
    }
  };
}
module.exports = new ZohoServies();
