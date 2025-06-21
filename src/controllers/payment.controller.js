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
const Product = require("../models/products.models.js");
const Appointment = require("../models/Appointment.model.js");
const Plan = require("../models/plan.model.js");
const HairTest = require("../models/hairTest.model.js");

const instance = new Razorpay({
  key_id: "rzp_test_IVOsFC0Bobcxcv",
  key_secret: "jrLluVVj1fpEiMNwR7QyBUDZ",
});

const placeOrder = asyncHandler(async (req, res) => {
  try {
    const { amount, products, addressId, mode, htmls, couponId } = req.body;
    console.log("Request Body:", req.body);
    const { user } = req;

    if (!user || !user._id || !products?.length) {
      console.log("User not found or no products provided");
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, "User not found or no products provided")
        );
    }

    // Fetch config
    let config = await Config.findOne({});
    const { deliveryCharge = 200.0, deliveryAmt = 2000 } = config || {};
    console.log("Config fetched:", config);

    // Validate address
    const address = await userAddresses.findOne({
      _id: addressId,
      userId: user._id,
    });
    if (!address) {
      console.log("Invalid or unauthorized address:", addressId);
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid or unauthorized address"));
    }

    // Calculate order items and subtotal
    let subTotal = 0;
    const orderItems = products.map((item) => {
      const itemPrice = item.item.price - (parseFloat(item.item.discount) || 0);
      const itemTotal = itemPrice * item.quantity;
      subTotal += itemTotal;

      return {
        name: item.item.name,
        sku: item.item._id,
        units: item.quantity,
        selling_price: item.item.price,
        discount: item.item.discount || 0,
        tax: item.item.gst || 0,
        hsn: item.item.hsn || "",
      };
    });
    console.log("Subtotal:", subTotal);

    // Apply coupon discount
    let totalDiscount = 0;
    let coupon = null;
    if (couponId) {
      coupon = await CouponsModel.findOne({
        _id: couponId,
        isActive: true,
      });
      if (!coupon || (coupon.validity && coupon.validity < new Date())) {
        console.log("Invalid or expired coupon:", couponId);
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Invalid or expired coupon"));
      }
      const couponMapping = await CouponsMappingModel.findOne({
        userId: user._id,
        coupon: couponId,
        status: 1,
        type: 2,
      });
      if (!couponMapping) {
        console.log("Coupon not applicable:", couponId);
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Coupon not applicable"));
      }
      totalDiscount = (parseFloat(coupon.percent || 0) * subTotal) / 100;
      console.log("Total Discount Applied:", totalDiscount);
    }

    // Calculate delivery charge
    const deliveryChargeCalc =
      subTotal - totalDiscount > deliveryAmt ? 0 : deliveryCharge;
    console.log("Delivery Charge Calculated:", deliveryChargeCalc);

    const totalAmount =
      Number(subTotal) - Number(totalDiscount) + Number(deliveryChargeCalc);
    console.log("Total Amount:", totalAmount);

    // Create order
    const order = new Order({
      userId: user._id,
      currency: "INR",
      amount: amount,
      subTotal,
      totalAmount,
      status: "pending",
      orderType: "product Buy",
      products: products.map((item) => ({
        item: {
          _id: item.item._id,
          name: item.item.name,
          description: item.item.description,
          price: item.item.price,
          discount: item.item.discount || 0,
          gst: item.item.gst || 0,
          hsn: item.item.hsn || "",
          src: item.item.src,
          zohoProductId: item.item.zohoProductId,
        },
        quantity: item.quantity,
      })),
      addressId,
      mode,
      deliveryStatus: mode === "cash" ? "processing" : "pending",
      coupon: couponId || null,
      deliveryCharges: deliveryChargeCalc,
      totalDiscount,
    });

    console.log("Order created:", order);

    await order.save();

    if (mode === "cash") {
      // Clear cart
      let cart = await Cart.findOne({ userId: user._id });
      if (cart) {
        cart.items = cart.items.filter(
          (e) => !products.some((p) => p.item._id === e.item._id)
        );
        await cart.save();
        console.log("Cart updated:", cart);
      }

      // Create Shiprocket order
      let shipRocketOrder = {
        order_id: order._id,
        order_date: moment(new Date()).format("YYYY-MM-DD"),
        pickup_location: "Primary",
        billing_customer_name: user?.fullname,
        billing_last_name: user?.fullname?.split(" ")?.[1] || "",
        billing_address: address?.fullAdress,
        billing_city: address?.city,
        billing_pincode: address?.pin,
        billing_state: address?.state,
        billing_country: "India",
        billing_email: address?.email,
        billing_phone: address?.phone,
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: "COD",
        shipping_charges: deliveryChargeCalc,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: totalDiscount,
        sub_total: subTotal,
        length: 10,
        breadth: 15,
        height: 20,
        weight: 2.5,
      };
      console.log("Shiprocket Order Data:", shipRocketOrder);
      let createOrderShipRocket = await shipRocket.createOrder(shipRocketOrder);
      if (createOrderShipRocket) {
        await Order.updateOne(
          { _id: order._id },
          { shipRocket_order_Id: createOrderShipRocket?.order_id }
        );
        console.log("Shiprocket order created:", createOrderShipRocket);
      }

      // Create Zoho order
      let Product_Details = products.map((item) => ({
        product: {
          id: item.item.zohoProductId,
        },
        quantity: item.quantity,
        product_description: item.item.description,
        "Unit Price": item.item.price - (parseFloat(item.item.discount) || 0),
        list_price: item.item.price - (parseFloat(item.item.discount) || 0),
        line_tax: [
          {
            percentage: item.item.gst || 0,
            name: "Sales Tax",
          },
        ],
      }));

      let zohoOrder = {
        data: [
          {
            Contact_Name: {
              id: user?.zohoUserId,
            },
            Discount: totalDiscount,
            Shipping_State: address?.state,
            Billing_Country: "India",
            Status: "Created",
            Billing_Street: address?.city,
            Billing_City: address?.city,
            Billing_State: address?.state,
            Adjustment: deliveryChargeCalc,
            Product_Details,
            Subject: `Order ${order._id}`,
            Shipping_City: address?.city,
            Shipping_Country: "India",
          },
        ],
      };
      console.log("Zoho Order Data:", zohoOrder);
      let record = await zohoService.createRecord({
        module: "Sales_Orders",
        reqData: zohoOrder,
      });
      if (record) {
        await Order.updateOne(
          { _id: order._id },
          { zoho_order_Id: record?.data?.[0]?.details?.id }
        );
        console.log("Zoho order created:", record);
      }

      // Send email
      if (address?.email) {
        console.log("Sending email to:", address?.email);
        await sendEmailTemplate(
          address?.email,
          "Order Placed Successfully",
          htmls
        );
      }

      // Update coupon status
      if (couponId) {
        let couponMexist = await CouponsMappingModel.findOne({
          userId: user._id,
          coupon: couponId,
          status: 1,
          type: 2,
        });
        if (couponMexist) {
          couponMexist.status = 2;
          await couponMexist.save();
          console.log("Coupon status updated:", couponMexist);
        }
      }

      // Send WhatsApp notifications
      const user1 = await User.findOne({ _id: user._id });
      console.log("Sending WhatsApp notification to user:", user1?.fullname);
      await WhatsappTextTemplate({
        attr: null,
        name: user1?.fullname,
        phone: user1?.mobile?.toString(),
        campName: "Thank_you_message_after_buy_medicines",
      });
      await WhatsappTextTemplate({
        attr: null,
        name: "Pharmacist",
        phone: "7007517763",
        campName: "utility_pharmacy_notification_new",
      });
    } else {
      // Create payment record for non-COD orders
      const paymentData = {
        orderId: order._id,
        userId: user._id,
        totalAmount,
        paymentStatus: "pending",
        paymentMethod: "",
      };
      const payment = new Payment(paymentData);
      await payment.save();
      console.log("Payment record created:", payment);
    }

    // Update user order count
    const userToUpdate = await User.findById(user._id);
    userToUpdate.orders = (userToUpdate.orders || 0) + 1;
    await userToUpdate.save();
    console.log("User order count updated:", userToUpdate.orders);

    return res
      .status(200)
      .json(new ApiResponse(200, order._id, "Order created successfully"));
  } catch (error) {
    console.error("Order creation error:", error);
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, error.message || "Failed to create order")
      );
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
          "Payment link generated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Failed to generate payment link", error.message);
  }
});

const deleteAllPayments = async () => {
  try {
    // const result = await Payment.deleteMany({});
    console.log(`${result.deletedCount} payments deleted successfully.`);
  } catch (error) {
    console.error("Error deleting payments:", error);
  }
};

const updatePaymentOrder = asyncHandler(async (req, res) => {
  try {
    let config = await Config.find({});

    if (config?.length > 0) {
      config = config[0];
    }

    const { deliveryCharge = 200.0, deliveryAmt = 2000 } = config;

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
      { paymentStatus: "success" }
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
      totalD =
        (parseFloat(orderC?.percent || 0) * parseFloat(order.amount)) / 100;
    let order_items = [],
      Product_Details = [];
    let total = 0;
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
      total += item?.item?.price - item?.item?.discount;
      Product_Details.push({
        product: {
          id: item?.item?.zohoProductId,
        },
        quantity: item?.quantity,
        // Discount: item?.item?.discount,
        product_description: item?.item?.description,
        "Unit Price": item?.item?.price - item?.item?.discount,
        list_price: item?.item?.price - item?.item?.discount,
        line_tax: [
          {
            percentage: item?.item?.gst || 0,
            name: "Sales Tax",
          },
        ],
      });
    });
    totalD = (parseFloat(orderC?.percent || 0) * parseFloat(total)) / 100;
    const deliveryChargeCalc =
      total - totalD > deliveryAmt ? 0 : deliveryCharge * 1.0;
    console.log("Amount calculation:", {
      baseAmount: total,
      deliveryCharge: deliveryChargeCalc,
      discount: totalD,
    });
    await Order.updateOne(
      { _id: order._id },
      {
        deliveryCharges: deliveryChargeCalc,
        totalDiscount: totalD,
        totalAmount: total - totalD + deliveryChargeCalc,
      }
    );
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
      payment_method: "Prepaid",
      shipping_charges: deliveryChargeCalc,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: totalD,
      sub_total: total,
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
        { shipRocket_order_Id: createOrderShipRocket?.order_id }
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
          Adjustment: deliveryChargeCalc,
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
        { zoho_order_Id: record?.data?.[0]?.details?.id }
      );
    }
    if (add?.email) {
      let email = await sendEmailTemplate(
        add?.email,
        "Order Plaeced Successfully",
        htmls
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
        new ApiResponse(200, { paymentStatus: "success" }, "payment updated")
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
            (parseFloat(orderC?.percent || 0) * parseFloat(order.amount)) / 100;
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
          deliveryCharges: order?.deliveryCharges,
          totalDiscount: order?.totalDiscount,
          totalAmount: order?.totalAmount,
        };
        let squence = await Invoices.countDocuments();
        input["invoiceNo"] = squence + 1;
        let invoice = await Invoices.create(input);
        console.log("sdjkfo", order?._id, invoice?._id);
        let xx = await Order.updateOne(
          { _id: order?._id },
          { invoiceId: invoice?._id }
        );
        console.log("sdjkfo", order?._id, invoice?._id?.toString(), xx);

        if (add?.email) {
          let email = await sendEmailTemplate(
            add?.email,
            "Order Delivered Successfully",
            emailHtml
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
          emailHtml
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

const updateOrder = asyncHandler(async (req, res) => {
  try {
    const { userId, hairTestId, paymentMode, planType, paymentStatus, amount } =
      req.body;

    console.log("[DEBUG] Update Order Request:", {
      userId,
      hairTestId,
      paymentMode,
      planType,
      paymentStatus,
      amount,
    });

    // Validate required fields
    if (
      !userId ||
      !hairTestId ||
      !paymentMode ||
      !planType ||
      !paymentStatus ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: userId, hairTestId, paymentMode, planType, paymentStatus, amount",
      });
    }

    // Find appointment using hairTestId
    const appointment = await Appointment.findOne({ hairTestId });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found for the given hairTestId",
      });
    }

    console.log("[DEBUG] Found appointment:", {
      appointmentId: appointment._id,
      orderId: appointment.orderId,
    });

    // Find plan using planType
    const plan = await Plan.findOne({
      name: { $regex: new RegExp(planType, "i") },
    });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Plan not found for planType: ${planType}`,
      });
    }

    console.log("[DEBUG] Found plan:", {
      planId: plan._id,
      planName: plan.name,
      planPrice: plan.price,
    });

    // Find order using appointment's orderId
    let order = null;
    if (appointment.orderId) {
      order = await Order.findOne({
        _id: appointment.orderId,
        orderType: "Appointment",
      });
    }

    if (!order) {
      // Create new order if it doesn't exist
      order = new Order({
        userId,
        planId: plan._id,
        amount: amount,
        status: paymentStatus,
        orderType: "Appointment",
        mode: paymentMode,
      });
      console.log("[DEBUG] Creating new order");
    } else {
      // Update existing order
      order.status = paymentStatus;
      order.amount = amount;
      order.mode = paymentMode;
      order.planId = plan._id;
      console.log("[DEBUG] Updating existing order");
    }

    await order.save();
    console.log("[DEBUG] Order saved:", {
      orderId: order._id,
      status: order.status,
      amount: order.amount,
      mode: order.mode,
      planId: order.planId,
    });

    // Update appointment with orderId and planId
    appointment.orderId = order._id;
    appointment.planId = plan._id;
    appointment.amount = amount;
    appointment.status = "booked";

    // Set Method based on plan
    if (plan.name === "Local Plan") {
      appointment.Method = "Audio Call";
    } else if (plan.name === "Premium Plan") {
      appointment.Method = "Video Call";
    } else {
      appointment.Method = "Other";
    }

    await appointment.save();
    console.log("[DEBUG] Appointment updated:", {
      appointmentId: appointment._id,
      orderId: appointment.orderId,
      planId: appointment.planId,
      amount: appointment.amount,
      paymentStatus: appointment.paymentStatus,
      Method: appointment.Method,
    });

    // Update progress in HairTest
    if (hairTestId) {
      const hairTest = await HairTest.findById(hairTestId);
      if (hairTest) {
        // Set progress to 100 when order is completed
        hairTest.status = "completed";
        await hairTest.save();
        console.log("[DEBUG] HairTest progress updated:", {
          hairTestId: hairTest._id,
          progress: hairTest.progress,
          status: hairTest.status,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order and appointment updated successfully",
      data: {
        order: {
          id: order._id,
          status: order.status,
          amount: order.amount,
          mode: order.mode,
          planId: order.planId,
        },
        appointment: {
          id: appointment._id,
          orderId: appointment.orderId,
          planId: appointment.planId,
          amount: appointment.amount,
          paymentStatus: appointment.paymentStatus,
          Method: appointment.Method,
        },
        hairTest: hairTestId
          ? {
              id: hairTestId,
              status: "completed",
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[ERROR] Update Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = {
  placeOrder,
  generatePaymentLink,
  deleteAllPayments,
  updatePaymentOrder,
  changeOrderStatus,
  shipOrder,

  updateOrder,
};
