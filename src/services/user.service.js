const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const Order = require("../models/order.model.js");
const Payment = require("../models/payment.model.js");
const Razorpay = require("razorpay");
const Plan = require("../models/plan.model");
const Review = require("../models/Review.model.js");
const Appointment = require("../models/Appointment.model.js");

const CommonHelper = require("../utils/commonHelper.js");
const { sendEmail } = require("../utils/nodemailer.util.js");
const sendOTP = require("../utils/fast2sms.utils.js");
const ApiResponse = require("../utils/ApiResponse.js");
const Product = require("../models/products.models.js");
const HairTest = require("../models/hairTest.model.js");
const { WhatsappTextTemplate } = require("../utils/Whatsapp.js");
const CouponsModel = require("../models/Coupons.model.js");
const CouponsMappingModel = require("../models/CouponsMapping.model.js");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");
const zohoService = require("./zoho.service.js");

const instance = new Razorpay({
  key_id: "rzp_test_8ZrSJwOa8vWxQu",
  key_secret: "IppjQRgEVWjB5cnPvoP1jMB8",
});

class UserService {
  registerService = async (data) => {
    // const existedUser = await User.findOne({ email: data.email });
    // if (existedUser) {
    //     throw new ApiError(409, "This email is already in use.");
    // }
    const user = await User.findOne({ mobile: data.mobile, isVerified: true });

    if (!user) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "User is not verified,first verify mobile number ",
          ),
        );
    }
    const passwordHash = await CommonHelper.hashPassword(data.password);
    user.fullname = data.fullname;
    user.email = data.email;
    user.password = passwordHash;
    user.status = true;
    user.lastLogin = new Date();
    await user.save();

    const accessToken = await CommonHelper.generateAccessToken(user._id);
    console.log(accessToken);
    const refreshToken = await CommonHelper.generateRefreshToken(user._id);
    // await sendEmail(data.email, 'Welcome to HairsnCares.com!',
    //     `You are Successfully logged In.`)

    let productData = {
      data: [
        {
          Last_Name: user?.fullname?.split(" ")?.[1] || user?.fullname,
          First_Name: user?.fullname,
          Email: user?.email,
          Phone: user?.mobile,
          // "Company": element?.email
        },
      ],
    };
    try {
      let record = await zohoService.createRecord({
        module: "Contacts",
        reqData: productData,
      });
      let u = await User.updateOne(
        { _id: user?._id },
        { zohoUserId: record?.data?.[0]?.details?.id?.toString() },
      );
      console.log("hjjjjj", u, record?.data?.[0]?.details?.id);
    } catch (error) {
      console.log("knmsnjdi", error);
    }
    await sendEmail(
      data.email,
      "Welcome to HairsnCares.com!",
      `Hi ${data?.fullname},\n\nWelcome to HairsnCares.com! Your account is now ready.\n\nTo log in, please use the OTP sent to your registered mobile number or email.\n\nBest Regards,\nThe HairsnCares Team
`,
    );
    await WhatsappTextTemplate({
      attr: null,
      name: user?.fullname,
      phone: user?.mobile?.toString(),
      campName: "take_hair_test1",
      media: {
        url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725767282/hair-assessment/yxuwxkxqko0uwyr2m7rw.jpg",
        filename: "file",
      },
    });

    return { accessToken, refreshToken, role: user?.role, user };
  };
  loginService = async (data) => {
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw new ApiError(401, "User does not exist");
    }
    const isPasswordValid = await CommonHelper.isPasswordCorrect(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      // return res.status(400).json({ "message": "Invalid credential" })
      throw new ApiError(400, "Invalid user credential");
    }
    const role = user.role;
    const accessToken = await CommonHelper.generateAccessToken(user._id);
    console.log(accessToken);
    const refreshToken = await CommonHelper.generateRefreshToken(user._id);
    // await sendEmail(data.email, 'Welcome to HairsnCares.com!',
    //     `You are Successfully logged In.`)
    return { accessToken, refreshToken, role, user };
  };

  forgetPassword = async (data) => {
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new ApiError(400, "user not found");
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpCreatedAt = new Date();
    await user.save();
    await sendEmail(
      data.email,
      "OTP for password recovery",
      `put this otp on required field to reset password
          ${otp}`,
    );
  };

  updatePassword = async (data) => {
    const user = await User.findOne({ email: data.email });
    const validOtp = CommonHelper.isValidOTP(user.otpCreatedAt);
    if (!validOtp) {
      throw new ApiError(400, "OTP expired");
    }
    if (user.otp !== data?.otp) {
      throw new ApiError(400, "Invalid Otp");
      // throw new ApiError(400, "Invalid OTP");
    }
    const hashedPassword = await CommonHelper.hashPassword(data.newPassword);
    user.password = hashedPassword;
    user.otp = "";
    await user.save();
  };
  changePassword = async (req, data) => {
    const { user } = req;

    if (!user || !user._id) {
      throw new ApiError(404, "User not found or user ID is missing");
    }
    const userToUpdate = await User.findById(user._id);
    if (!userToUpdate) {
      throw new ApiError(404, "User not found");
    }
    const isPasswordCorrect = await CommonHelper.isPasswordCorrect(
      data.oldPassword,
      userToUpdate.password,
    );
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid old password");
    }
    const hashpass = await CommonHelper.hashPassword(data.newPassword);
    userToUpdate.password = hashpass;
    await userToUpdate.save({ validateBeforeSave: false });
  };
  bookAppointment = async (req, data) => {
    const { user } = req;
    // console.log("userrrrr", user)
    if (!user || !user._id) {
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }
    const loggedInUser = await User.findById(user._id);

    // const { appointmentDate, timeSlot, planId } = req.body;

    const selectedPlan = await Plan.findById(data.planId);
    let discount = 0;
    if (data?.couponId) {
      let coupon = await CouponsModel.findOne({ _id: data?.couponId });
      discount = coupon?.percent;
    }
    // console.log("body", req.body)
    // console.log("selectedplan", selectedPlan)
    if (!selectedPlan) {
      const err = {
        status: 404,
        message: "Selected plan not found",
      };
      return err;
    }

    const order = new Order({
      userId: user._id,

      planId: data.planId,
      amount:
        parseFloat(selectedPlan.price) -
        (parseFloat(selectedPlan.price) * discount) / 100,
      status: "pending",
      orderType: "Appointment",
    });
    await order.save();
    console.log("order", order);

    const appointment = await Appointment.findOne({ hairTestId: data?.testId });
    (appointment.orderId = order._id),
      (appointment.appointmentDate =
        selectedPlan.features === "appointment" ? data.appointmentDate : ""),
      (appointment.timeSlot =
        selectedPlan.features === "appointment" ? data.timeSlot : "noon"),
      (appointment.planId = data.planId),
      (appointment.amount =
        parseFloat(selectedPlan.price) -
        (parseFloat(selectedPlan.price) * discount) / 100),
      (appointment.coupon = data?.couponId || null);

    // new Appointment({
    //     userId: user._id,
    //     orderId: order._id,
    //     appointmentDate: selectedPlan.features === 'appointment' ? data.appointmentDate : "",
    //     timeSlot: selectedPlan.features === 'appointment' ? data.timeSlot : 'noon',
    //     status: 'pending',
    //     planId: data.planId,
    //     amount: parseFloat(selectedPlan.price) - (parseFloat(selectedPlan.price)*discount/100),
    //     paymentStatus: "pending",
    //     hairTestId : data?.testId,
    //     coupon : data?.couponId || null
    // });

    console.log("app", appointment);

    await appointment.save();

    const paymentData = {
      orderId: order._id,
      userId: user._id,
      totalAmount:
        parseFloat(selectedPlan.price) -
        (parseFloat(selectedPlan.price) * discount) / 100,
      paymentStatus: "pending",
      paymentMethod: "",
    };
    const payment = new Payment(paymentData);
    const response = await payment.save();
    console.log("res", response);
    return response;
    // console.log("response", response)
  };

  updatePayment = async (req, data) => {
    const { user } = req;
    // console.log("userrrrr", user)
    if (!user || !user._id) {
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }
    const loggedInUser = await User.findById(user._id);

    // const { appointmentDate, timeSlot, planId } = req.body;

    const selectedPlan = await Plan.findById(data.planId);
    // console.log("body", req.body)
    // console.log("selectedplan", selectedPlan)
    if (!selectedPlan) {
      const err = {
        status: 404,
        message: "Selected plan not found",
      };
      return err;
    }

    // const paymentData = {
    //     orderId: data.id,
    //     paymentStatus: 'success',
    // };
    // const payment = new Payment(paymentData);
    await Payment.findOneAndUpdate(
      { orderId: data.id },
      { paymentStatus: "success" },
    );
    const response = await Appointment.findOneAndUpdate(
      { orderId: data.id },
      { paymentStatus: "success", status: "booked" },
      { new: true },
    );

    const hairTestUpdate = await HairTest.findOneAndUpdate(
      { _id: response?.hairTestId },
      { status: "completed" },
      { new: true },
    );
    await Order.findOneAndUpdate(
      { _id: data.id },
      { status: "paid" },
      { new: true },
    );

    if (response?.coupon) {
      let couponMexist = await CouponsMappingModel.findOne({
        userId: user._id,
        coupon: response?.coupon,
        status: 1,
        type: 1,
      });
      if (couponMexist) {
        couponMexist.status = 2;
        await couponMexist.save();
      }
    }

    let orderC = await CouponsModel.findOne({ _id: response?.coupon });
    let totalD = 0;
    if (response?.coupon)
      totalD =
        (parseFloat(orderC?.percent || 0) * parseFloat(selectedPlan?.amount)) /
        100;

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
          // "Shipping_State":  add?.state,
          // "Tax": 127.67,
          // "Billing_Country": "India",
          // "Carrier": "USPS",
          Status: "Delivered",
          // "Sales_Commission": 127.67,
          // "Due_Date": "2018-01-25",
          // "Billing_Street": add?.city,
          // "Adjustment": 127.67,
          // "Terms_and_Conditions": "Design your own layouts that align your business processes precisely. Assign them to profiles appropriately.",
          // "Billing_Code": "Billing_Code",
          // "Product_Details": Product_Details,
          Subject: `Hair Test`,
          // "Excise_Duty": 127.67,
          // "Shipping_City": add?.city,
          Shipping_Country: "India",
          // "Shipping_Code": "Shipping_Code",
          // "Billing_City": add?.city,
          // "Purchase_Order": "Purchase_Order",
          // "Billing_State": add?.state,
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
        { _id: data.id },
        { zoho_order_Id: record?.data?.[0]?.details?.id },
      );
    }
    console.log("mko", hairTestUpdate);
    try {
      await sendEmail(
        user?.email,
        "Your Hair Test and Payment Confirmation",
        `Dear ${user?.fullname},We are pleased to inform you that your hair test has been successfully completed. 
Additionally, we have received your payment for the consultation. 
You can expect a confirmation and consultation call shortly.
After a thorough study and evaluation, Doctor will generate your hair analysis report. 
You can see that report in your MY REPORT section.
Stay tuned for your customized hair care plan!\n\nThank you for choosing Hairsncares.com for your hair health needs.
\n\nBest regards,\nHairsncares.com
`,
      );

      // Send to admin 
      await sendEmail(
        "info@vplanthairclinics.com",
        "New Appointment for Hairsncares - Contact Us",
        `New Appointment Request\n\n
            Name : ${user?.fullname || ""},\n Phone : ${user?.mobile || ""},\n Email : ${user?.email || ""},\n Message: ${data?.message || ""},\n Preferred method : ${data?.method} `,
      );
      await sendEmail(
        "info@vplanthairclinics.com",
        "New Appointment for Hairsncares - Contact Us",
        `New Appointment Request\n\n
            Name : ${user?.fullname || ""},\n Phone : ${user?.mobile || ""},\n Email : ${user?.email || ""},\n Message: ${data?.message || ""},\n Preferred method : ${data?.method} `,
      );


      await WhatsappTextTemplate({
        attr: [user?.fullname || "user"],
        name: user?.fullname,
        phone: "9004405160",
        campName: "Utility_Thankyou_Message_after_completing_hair_test",
        // media: {
        //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725767356/hair-assessment/xplb1jpopazurg1xcpml.jpg",
        //   filename: "file",
        // },
      });

      await WhatsappTextTemplate({
        attr: [user?.fullname || "user"],
        name: user?.fullname,
        phone: user?.mobile?.toString(),
        campName: "Utility_Thankyou_Message_after_completing_hair_test",
        // media: {
        //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725767356/hair-assessment/xplb1jpopazurg1xcpml.jpg",
        //   filename: "file",
        // },
      });
    } catch (error) {
      console.log("jijsdij", error);
    }

    return response;
  };
  addReview = async (req, data) => {
    const { user } = req;
    console.log(".......", user);
    // console.log(data)
    let exist = false;
    if (user?.role != "admin")
      exist = await Review.findOne({
        userId: user._id,
        productId: data?.productId,
      });
    if (exist) return false;
    const review = new Review({
      userId: user._id,
      rating: data.rating,
      comment: data.comment,
      name: data?.name,
      productId: new mongoose.Types.ObjectId(data?.productId),
    });
    await review.save();

    let all = await Review.find({ productId: data?.productId });
    if (all?.length > 0) {
      let x = 0;
      all?.map((e) => {
        x = x + parseFloat(e?.rating || 0);
      });
      let tot = (parseFloat(x) / parseFloat(all?.length))?.toFixed(1);
      await Product.updateOne({ _id: data?.productId }, { review: tot });
    }
    return true;
  };

  getReview = async (req, data) => {
    const { id } = data;
    // console.log(data)
    let reviews = await Review.find({
      productId: new mongoose.Types.ObjectId(id),
    });
    return reviews;
  };
}
module.exports = new UserService();
