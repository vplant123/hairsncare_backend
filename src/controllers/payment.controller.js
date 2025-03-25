// const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/payment.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.model.js");
const ApiResponse = require("../utils/ApiResponse.js");
const Order = require("../models/order.model.js");
const ApiError = require("../utils/ApiError.js");
const Cart = require("../models/Cart.model.js");
const { sendEmailTemplate } = require("../utils/nodemailer.util.js");
const userAddresses = require("../models/userAddresses.model.js");
const { WhatsappTextTemplate } = require("../utils/Whatsapp.js");
const CouponsMappingModel = require("../models/CouponsMapping.model.js");
const orderModel = require("../models/order.model.js");
const moment = require("moment");
const CouponsModel = require("../models/Coupons.model.js");
const shipRocket = require("../services/shipRocket.js");
const zohoService = require("../services/zoho.service.js");
const Config = require("../models/config.model.js");
const Invoices = require("../models/invoice.model.js");

const instance = new Razorpay({
  key_id: "rzp_test_IVOsFC0Bobcxcv",
  key_secret: "jrLluVVj1fpEiMNwR7QyBUDZ",
});

const placeOrder = asyncHandler(async (req, res) => {
  try {
    const { amount, products, addressId, mode, htmls, couponId } = req.body;
    const { user } = req;

    let config = await Config.find({});


    if (config?.length > 0) {
      config = config[0];
    }

    const { deliveryCharge = 200, deliveryAmt = 2000 } = config

    console.log(config)

    if (!user || !user._id || products?.length < 1) {
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }
    // let plan = await Config.findOne({ _id: new mongoose.Types.ObjectId("6714362ab526d76306f3c9e3") });

    const order = new Order({
      userId: user._id,
      currency: "INR",
      amount: amount,
      status: "pending",
      orderType: "product Buy",
      products,
      addressId: addressId,
      mode,
      deliveryStatus: mode == "cash" ? "processing" : "pending",
      coupon: couponId || null,
    });
    await order.save();
    if (mode == "cash") {
      let cart = await Cart.findOne({ userId: user._id });
      if (cart) {
        let arr = cart?.items;
        for (let index = 0; index < products.length; index++) {
          const element = products[index];
          arr = arr?.filter((e) => e?.item?._id != element?.item?._id);
        }
        cart.items = arr;
        await cart.save();
      }

      //CREATE SHIP ROCKET####
      let add = await userAddresses.findOne({ _id: order?.addressId });
      let orderC = await CouponsModel.findOne({ _id: couponId });
      let totalD =
        (parseFloat(orderC?.percent || 0) * parseFloat(amount)) / 100;
      let order_items = [],
        Product_Details = [];

      let total = 0;
      products?.map((item) => {
        order_items.push({
          name: item?.item?.name,
          sku: item?.item?._id,
          units: item?.quantity,
          selling_price: item?.item?.price,
          discount: item?.item?.discount,
          tax: item?.item?.gst,
          hsn: item?.item?.hsn,
        });
        // if (item?.item?.zohoProductId)
        if (item?.item?.zohoProductId) {
        }
        total += (item?.item?.price - item?.item?.discount)
        Product_Details.push({
          product: {
            id: item?.item?.zohoProductId,
          },
          quantity: item?.quantity,
          // Discount: item?.item?.discount,
          product_description: item?.item?.description,
          "Unit Price": item?.item?.price - item?.item?.discount,
          "list_price": item?.item?.price - item?.item?.discount,
          line_tax: [
            {
              percentage: item?.item?.gst || 0,
              name: "Sales Tax",
            },
          ],
        });
      });
      let shipRocketOrder = {
        order_id: order._id,
        order_date: moment(new Date()).format("YYYY-MM-DD"),
        pickup_location: "Primary",
        // "channel_id": "",
        // "comment": "Reseller: M/s Goku",
        billing_customer_name: user?.fullname,
        billing_last_name: user?.fullname?.split(" ")?.[1] || "",
        billing_address: add?.fullAdress,
        // "billing_address_2": "Near Hokage House",
        billing_city: add?.city,
        billing_pincode: add?.pin,
        billing_state: add?.state,
        billing_country: "India",
        billing_email: add?.email,
        billing_phone: add?.phone,
        shipping_is_billing: true,
        // "shipping_customer_name": "",
        // "shipping_last_name": "",
        // "shipping_address": "",
        // "shipping_address_2": "",
        // "shipping_city": "",
        // "shipping_pincode": "",
        // "shipping_country": "",
        // "shipping_state": "",
        // "shipping_email": "",
        // "shipping_phone": "",
        order_items: order_items,
        payment_method: "COD",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: totalD,
        sub_total: amount,
        length: 10,
        breadth: 15,
        height: 20,
        weight: 2.5,
      };
      let createOrderShipRocket = await shipRocket.createOrder(shipRocketOrder);
      if (createOrderShipRocket) {
        await Order.updateOne(
          { _id: order._id },
          { shipRocket_order_Id: createOrderShipRocket?.order_id },
        );
      }
      console.log(Product_Details);
      let zohoOrder = {
        data: [
          {
            // "Owner": {
            //     "id": "{{user-id}}"
            // },
            // "Deal_Name": {
            //     "id": "{{deal-id}}"
            // },
            // "Account_Name": {
            //     "id": "{{account-id}}"
            // },
            // "Quote_Name": {
            //     "id": "{{quote-id}}"
            // },
            Contact_Name: {
              id: user?.zohoUserId,
            },
            Discount: totalD,
            // "Description": "Design your own layouts that align your business processes precisely. Assign them to profiles appropriately.",
            // "Customer_No": "Customer_No",
            Shipping_State: add?.state,
            // "Tax": 127.67,
            Billing_Country: "India",
            // "Carrier": "USPS",
            Status: "Created",
            // "Sales_Commission": 127.67,
            // "Due_Date": "2018-01-25",
            Billing_Street: add?.city,
            // "Adjustment": 127.67,
            // "Terms_and_Conditions": "Design your own layouts that align your business processes precisely. Assign them to profiles appropriately.",
            // "Billing_Code": "Billing_Code",
            Product_Details: Product_Details,
            Subject: `Order ${order._id}`,
            // "Excise_Duty": 127.67,
            Shipping_City: add?.city,
            Shipping_Country: "India",
            // "Shipping_Code": "Shipping_Code",
            Billing_City: add?.city,
            // "Purchase_Order": "Purchase_Order",
            Billing_State: add?.state,
            "Adjustment": total > deliveryAmt ? 0 : deliveryCharge,
            // "$line_tax": [
            //     {
            //         "percentage": 12.5,
            //         "name": "Sales Tax"
            //     },
            //     {
            //         "percentage": 8.5,
            //         "name": "Common Tax"
            //     }
            // ],
            // "Pending": "Pending",
            // "Shipping_Street": "Shipping_Street"
          },
        ],
      };
      let record = await zohoService.createRecord({
        module: "Sales_Orders",
        reqData: zohoOrder,
      });
      if (record) {
        await Order.updateOne(
          { _id: order._id },
          { zoho_order_Id: record?.data?.[0]?.details?.id },
        );
      }
      if (add?.email) {
        let email = await sendEmailTemplate(
          add?.email,
          "Order Plaeced Successfully",
          htmls,
        );
        console.log("kfoker", email);
      }
      let couponMexist = await CouponsMappingModel.findOne({
        userId: user._id,
        coupon: couponId,
        status: 1,
        type: 2,
      });
      if (couponMexist) {
        couponMexist.status = 2;
        await couponMexist.save();
      }
      const user1 = await User.findOne({ _id: user._id });

      await WhatsappTextTemplate({
        attr: null,
        name: user1?.fullname,
        phone: user1?.mobile?.toString(),
        campName: "Thank_you_message_after_buy_medicines",
        // media: {
        //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725767430/hair-assessment/xjh0qwivzuacgxvmdlib.jpg",
        //   filename: "file",
        // },
      });
    }

    if (mode != "cash") {
      const paymentData = {
        orderId: order._id,
        userId: user._id,
        totalAmount: amount,
        paymentStatus: "pending",
        paymentMethod: "",
      };
      const payment = new Payment(paymentData);
      await payment.save();
    }

    // const orderUser = await User.findOne({ _id: user._id });
    // const add = await userAddresses.findOne({ _id: order?.addressId });
    await WhatsappTextTemplate({
      attr: null,
      name: "Pharmacist",
      phone: "7007517763",
      campName: "utility_pharmacy_notification_new",
      // media: {
      //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725596233/hair-assessment/bhwlkkh2ul9dig5hnelp.png",
      //   filename: "file",
      // },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, order._id, "Order created successfully"));
  } catch (error) {
    throw new ApiError(400, "Failed to create order", error.message);
  }
});

const generatePaymentLink = asyncHandler(async (req, res) => {
  try {
    const {
      orderId,
      fullname,
      email,
      mobile,
      city,
      state,
      pinCode,
      country,
      Address,
      Appartment,
    } = req.body;
    const { user } = req;

    if (!user || !user._id) {
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(400, "Order not found");
    }

    (order.fullname = fullname), (order.city = city);
    order.state = state;
    order.country = country;
    order.Address = Address;
    order.Appartment = Appartment;
    order.mobile = mobile;
    order.pinCode = pinCode;
    order.email = email;

    await order.save();

    const loggedInUser = await User.findById(user._id);

    const response = await instance.paymentLink.create({
      amount: order.amount,
      currency: "INR",
      accept_partial: false,
      reference_id: order?._id || "",
      description: user._id,
      customer: {
        name: loggedInUser?.name,
        email: loggedInUser?.email,
        contact: loggedInUser?.mobile,
      },
      notify: {
        sms: true,
        email: true,
      },
      upi_link: false,
      reminder_enable: false,
      callback_url: req.body.callbackUrl,
      callback_method: "get",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response.short_url,
          "Payment link generated successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(400, "Failed to generate payment link", error.message);
  }
});

const deleteAllPayments = async () => {
  try {
    const result = await Payment.deleteMany({});
    console.log(`${result.deletedCount} payments deleted successfully.`);
  } catch (error) {
    console.error("Error deleting payments:", error);
  }
};

const updatePaymentOrder = asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    // console.log("userrrrr", user)
    if (!user || !user._id) {
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }
    const loggedInUser = await User.findById(user._id);
    let { orderId, htmls } = req.body;
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      const err = {
        status: 404,
        message: "order not found",
      };
      return err;
    }

    await Payment.findOneAndUpdate(
      { orderId: order._id },
      { paymentStatus: "success" },
    );
    order.deliveryStatus = "processing";
    order.status = "paid";
    await order.save();
    if (order?.coupon) {
      let couponMexist = await CouponsMappingModel.findOne({
        userId: user._id,
        coupon: order?.coupon,
        status: 1,
        type: 2,
      });
      if (couponMexist) {
        couponMexist.status = 2;
        await couponMexist.save();
      }
    }

    let cart = await Cart.findOne({ userId: user._id });
    if (cart) {
      let arr = cart?.items;
      for (let index = 0; index < order?.products.length; index++) {
        const element = order?.products[index];
        arr = arr?.filter((e) => e?.item?._id != element?.item?._id);
      }
      cart.items = arr;
      console.log("mfkmeirjn", arr);
      await cart.save();
    }
    let add = await userAddresses.findOne({ _id: order?.addressId });

    //CREATE SHIP ROCKET####
    let orderC = await CouponsModel.findOne({ _id: order?.coupon });
    let totalD = 0;
    if (order?.coupon)
      totalD = (parseFloat(orderC?.percent || 0) * parseFloat(amount)) / 100;
    let order_items = [],
      Product_Details = [];
    order?.products?.map((item) => {
      order_items.push({
        name: item?.item?.name,
        sku: item?.item?._id,
        units: item?.quantity,
        selling_price: item?.item?.price,
        discount: item?.item?.discount,
        tax: item?.item?.gst,
        hsn: item?.item?.hsn,
      });
      Product_Details.push({
        product: {
          id: item?.item?.zohoProductId,
        },
        quantity: item?.quantity,
        Discount: item?.item?.discount,
        product_description: item?.item?.description,
        "Unit Price": item?.item?.price,
        line_tax: [
          {
            percentage: item?.item?.gst || 0,
            name: "Sales Tax",
          },
        ],
      });
    });
    let shipRocketOrder = {
      order_id: order._id,
      order_date: moment(new Date()).format("YYYY-MM-DD"),
      pickup_location: "Primary",
      // "channel_id": "",
      // "comment": "Reseller: M/s Goku",
      billing_customer_name: user?.fullname,
      billing_last_name: user?.fullname?.split(" ")?.[1] || "singh",
      billing_address: add?.fullAdress,
      // "billing_address_2": "Near Hokage House",
      billing_city: add?.city,
      billing_pincode: add?.pin,
      billing_state: add?.state,
      billing_country: "India",
      billing_email: add?.email,
      billing_phone: add?.phone,
      shipping_is_billing: true,
      // "shipping_customer_name": "",
      // "shipping_last_name": "",
      // "shipping_address": "",
      // "shipping_address_2": "",
      // "shipping_city": "",
      // "shipping_pincode": "",
      // "shipping_country": "",
      // "shipping_state": "",
      // "shipping_email": "",
      // "shipping_phone": "",
      order_items: order_items,
      payment_method: "Prepaid",
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: totalD,
      sub_total: order?.amount,
      length: 10,
      breadth: 15,
      height: 20,
      weight: 2.5,
    };
    console.log("shipRocketOrder===", shipRocketOrder);
    let createOrderShipRocket = await shipRocket.createOrder(shipRocketOrder);
    if (createOrderShipRocket) {
      await Order.updateOne(
        { _id: order._id },
        { shipRocket_order_Id: createOrderShipRocket?.order_id },
      );
    }

    let zohoOrder = {
      data: [
        {
          // "Owner": {
          //     "id": "{{user-id}}"
          // },
          // "Deal_Name": {
          //     "id": "{{deal-id}}"
          // },
          // "Account_Name": {
          //     "id": "{{account-id}}"
          // },
          // "Quote_Name": {
          //     "id": "{{quote-id}}"
          // },
          Contact_Name: {
            id: user?.zohoUserId,
          },
          Discount: totalD,
          // "Description": "Design your own layouts that align your business processes precisely. Assign them to profiles appropriately.",
          // "Customer_No": "Customer_No",
          Shipping_State: add?.state,
          // "Tax": 127.67,
          Billing_Country: "India",
          // "Carrier": "USPS",
          Status: "Created",
          // "Sales_Commission": 127.67,
          // "Due_Date": "2018-01-25",
          Billing_Street: add?.city,
          // "Adjustment": 127.67,
          // "Terms_and_Conditions": "Design your own layouts that align your business processes precisely. Assign them to profiles appropriately.",
          // "Billing_Code": "Billing_Code",
          Product_Details: Product_Details,
          Subject: `Order ${order._id}`,
          // "Excise_Duty": 127.67,
          Shipping_City: add?.city,
          Shipping_Country: "India",
          // "Shipping_Code": "Shipping_Code",
          Billing_City: add?.city,
          // "Purchase_Order": "Purchase_Order",
          Billing_State: add?.state,
          // "$line_tax": [
          //     {
          //         "percentage": 12.5,
          //         "name": "Sales Tax"
          //     },
          //     {
          //         "percentage": 8.5,
          //         "name": "Common Tax"
          //     }
          // ],
          // "Pending": "Pending",
          // "Shipping_Street": "Shipping_Street"
        },
      ],
    };
    let record = await zohoService.createRecord({
      module: "Sales_Orders",
      reqData: zohoOrder,
    });
    if (record) {
      await Order.updateOne(
        { _id: order._id },
        { zoho_order_Id: record?.data?.[0]?.details?.id },
      );
    }
    if (add?.email) {
      let email = await sendEmailTemplate(
        add?.email,
        "Order Plaeced Successfully",
        htmls,
      );
      console.log("kfoker", email);
      const user1 = await User.findOne({ _id: user._id });
      await WhatsappTextTemplate({
        attr: null,
        name: user1?.fullname,
        phone: user1?.mobile?.toString(),
        campName: "Thank_you_message_after_buy_medicines",
        // media: {
        //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725767430/hair-assessment/xjh0qwivzuacgxvmdlib.jpg",
        //   filename: "file",
        // },
      });
    }
    const orderUser = await User.findOne({ _id: order?.userId });
    await WhatsappTextTemplate({
      attr: null,
      name: "Pharmacist",
      phone: "7007517763",
      campName: "utility_pharmacy_notification_new",
      // media: {
      //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725596233/hair-assessment/bhwlkkh2ul9dig5hnelp.png",
      //   filename: "file",
      // },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { paymentStatus: "success" }, "payment updated"),
      );
  } catch (error) {
    console.error("Error deleting payments:", error);
    throw new ApiError(400, "Something wrong", error.message);
  }
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  try {
    let { orderId, status, emailHtml, payment } = req.body;
    let { user } = req;
    // console.log("userrrrr", user)
    if (!orderId || !orderId) {
      return res.status(404).json({ message: "id not found or ID is missing" });
    }

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      const err = {
        status: 404,
        message: "order not found",
      };
      return err;
    }

    if (status) order.deliveryStatus = status;
    if (payment) order.status = payment;
    await order.save();

    if (status) {
      let add = await userAddresses.findOne({ _id: order?.addressId });
      let orderItem = order?.products.map((item, ind) => {
        return {
          ...item,
          rate: item?.item?.price || 0,
          gst: item?.item?.gst || 0,
          discount: item?.item?.discount || 0,
          discountPercent: (
            (parseFloat(item?.item?.discount || 0) /
              parseFloat(item?.item?.price || 0)) *
            100
          )?.toFixed(2),
          total: (
            parseFloat(item["quantity"] || 1) *
            (parseFloat(item?.item?.price || 0) -
              parseFloat(item?.item?.discount || 0)) +
            (parseFloat(item?.quantity || 1) *
              (parseFloat(item?.item?.price || 0) -
                parseFloat(item?.item?.discount || 0)) *
              parseFloat(item?.item?.gst || 0)) /
            100
          )?.toFixed(2),
        };
      });
      if (status == "delivered" && !order?.invoiceId) {
        let orderC = await CouponsModel.findOne({ _id: order?.coupon });
        const orderUser = await User.findOne({ _id: order?.userId });
        let totalD = 0;
        if (orderC)
          totalD =
            (parseFloat(orderC?.percent || 0) * parseFloat(amount)) / 100;
        let input = {
          name: orderUser?.fullname,
          mobile: orderUser?.mobile,
          address: add?.fullAdress,
          date: new Date(),
          // doctor : doctor?._id,
          items: orderItem,
          total: order?.amount,
          paid: 1,
          paidAmt: order?.amount,
          dues: 0,
          orderId: order?._id?.toString(),
          couponDiscount: totalD,
          paymentMode: order?.mode,
        };
        let squence = await Invoices.countDocuments();
        input["invoiceNo"] = squence + 1;
        let invoice = await Invoices.create(input);
        console.log("sdjkfo", order?._id, invoice?._id);
        let xx = await Order.updateOne(
          { _id: order?._id },
          { invoiceId: invoice?._id },
        );
        console.log("sdjkfo", order?._id, invoice?._id?.toString(), xx);

        if (add?.email) {
          let email = await sendEmailTemplate(
            add?.email,
            "Order Plaeced Successfully",
            emailHtml,
          );
          console.log("kfoker", email);
        }
      }

      if (status == "processing") {
        const user = await User.findOne({ _id: order?.userId });
        await WhatsappTextTemplate({
          attr: null,
          name: "Pharmacist",
          phone: "7007517763",
          campName: "utility_pharmacy_notification_new",
          // media: {
          //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725596233/hair-assessment/bhwlkkh2ul9dig5hnelp.png",
          //   filename: "file",
          // },
        });
      }
    }
    if (payment == "paid") {
      let add = await userAddresses.findOne({ _id: order?.addressId });
      if (add?.email) {
        let email = await sendEmailTemplate(
          add?.email,
          "Order Paid Successfully",
          emailHtml,
        );
        console.log("kfoker", email);
      }
    }
    return res.status(200).json(new ApiResponse(200, order, "status updated"));
  } catch (error) {
    console.error("Error deleting payments:", error);
    throw new ApiError(400, "Something wrong", error.message);
  }
});

const shipOrder = asyncHandler(async (req, res) => {
  try {
    console.log("ship rocket order ==== ", req.body);

    return res
      .status(200)
      .json(new ApiResponse(200, "success", "status updated"));
  } catch (error) {
    console.error("Error deleting payments:", error);
    throw new ApiError(400, "Something wrong", error.message);
  }
});

module.exports = {
  placeOrder,
  generatePaymentLink,
  deleteAllPayments,
  updatePaymentOrder,
  changeOrderStatus,
  shipOrder,
};
