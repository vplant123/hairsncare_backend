const User = require("../models/user.model");

const Product = require("../models/products.models");

const asyncHandler = require("../utils/asyncHandler");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const AdminService = require("../services/admin.service");
const Category = require("../models/category.model");
const Payment = require("../models/payment.model");
const { paginate } = require("../utils/pagination.utils");
const Appointment = require("../models/Appointment.model");
const orderModel = require("../models/order.model");
const Doctors = require("../models/doctor.model");
const HairTest = require("../models/hairTest.model");
const CouponsModel = require("../models/Coupons.model");
const { WhatsappTextTemplate } = require("../utils/Whatsapp");
const CouponsMappingModel = require("../models/CouponsMapping.model");
const Prescription = require("../models/prescription.model");
const ReviewModel = require("../models/Review.model");
const adminService = require("../services/admin.service");
const contactUsModel = require("../models/contactUs.model");
const Invoices = require("../models/invoice.model");
const { default: axios } = require("axios");
const tokenModel = require("../models/token.model");
const zohoService = require("../services/zoho.service");
const blogModel = require("../models/blog.model.js");
const NewsModel = require("../models/News.model");
const { default: mongoose } = require("mongoose");
const Config = require("../models/config.model.js");
const BlogPageModel = require("../models/BlogPage.model.js");
const xml2js = require("xml2js");

const addAdmin = asyncHandler(async (req, res) => {
  try {
    const adminregister = await AdminService.addAdmin(req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully", adminregister));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const createDoctor = asyncHandler(async (req, res) => {
  try {
    const resultDoctor = await AdminService.createDoctor(req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Doctor created succesffully and send credential"),
      );
  } catch (error) {
    throw new ApiError(400, "Something error ", error.message);
  }
});
// const getallPatient = asyncHandler(async (req, res) => {
//     try {
//         const patients = await AdminService.getAllPatient()
//         return res.status(200).json(new ApiResponse(200, "Alll patient are ", patients))
//     } catch (error) {
//         throw new ApiError(400, "something wrong", error.message)
//     }
// })
const getallPatient = asyncHandler(async (req, res) => {
  try {
    const { filterOption } = req.query;
    const data = {
      filterOption: filterOption,
    };

    const result = await AdminService.getAllPatient(data);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Patents get successfully"));
  } catch (error) {
    throw new ApiError(400, "Something error", error.message);
  }
});

const getAdmin = asyncHandler(async (req, res) => {
  try {
    let query = { $or: [{ role: "admin" }, { role: "subadmin" }] };
    const results = await User.find(query);

    return res
      .status(200)
      .json(new ApiResponse(200, results, "Patents get successfully"));
  } catch (error) {
    throw new ApiError(400, "Something error", error.message);
  }
});
const getallDoctor = asyncHandler(async (req, res) => {
  try {
    const { page, limit, sortField, sortOrder } = req.query;

    const result = await AdminService.getAllDoctors(
      parseInt(page, 10),
      parseInt(limit, 10),
      sortField,
      sortOrder,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, result, "doctors get successfully"));
    return await Doctors.find({ isActive: true });
  } catch (error) {
    throw new ApiError(400, "Something error", error.message);
  }
});

const getallDoctorData = asyncHandler(async (req, res) => {
  try {
    let { isSpec } = req.query;
    let where = { isActive: true };
    if (isSpec) {
      if (isSpec == "0") where["isSpec"] = false;
      if (isSpec == "1") where["isSpec"] = true;
    }
    const result = await Doctors.find(where);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "doctors get successfully"));
  } catch (error) {
    throw new ApiError(400, "Something error", error.message);
  }
});

const editDoctor = asyncHandler(async (req, res) => {
  try {
    let id = req.body?.id;
    console.log("kjojoer", req.body);
    const result = await Doctors.findOne({ _id: id });
    if (req.body?.isDelete) {
      await Doctors.deleteOne({ _id: id });
      const user = await User.deleteOne({ _id: result.userId });
      return res
        .status(200)
        .json(new ApiResponse(200, result, "doctors delete successfully"));
    }
    if (req.body?.name) result.name = req.body?.name;

    if (req.body?.email) {
      result.email = req.body?.email;
    }
    if (req.body?.phone) result.phone = req.body?.phone;
    if (req.body?.specialist) result.specialist = req.body?.specialist;
    if (req.body?.address) result.address = req.body?.address;
    if (req.body?.image) result.image = req.body?.image;
    if (req.body?.degree) result.degree = req.body?.degree;
    if (req.body?.experience) result.experience = req.body?.experience;
    if (req.body?.language) result.language = req.body?.language;
    if (req.body?.expertise) result.expertise = req.body?.expertise;
    if (req.body?.description) result.description = req.body?.description;
    if (req.body?.qualification) result.qualification = req.body?.qualification;
    if (req.body?.awards) result.awards = req.body?.awards;
    if (req.body?.isSpec == false || req.body?.isSpec) {
      console.log("sjeojfoer", result.isSpec, req.body?.isSpec);
      result.isSpec = req.body?.isSpec;
    }

    await result.save();
    return res
      .status(200)
      .json(new ApiResponse(200, result, "doctors edit successfully"));
  } catch (error) {
    throw new ApiError(400, "Something error", error.message);
  }
});

const getDoctor = asyncHandler(async (req, res) => {
  try {
    let id = req.params?.id;
    const result = await Doctors.findOne({ _id: id });
    console.log("koekr", result);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "doctors edit successfully"));
  } catch (error) {
    throw new ApiError(400, "Something error", error.message);
  }
});

const addZohoProductIdIfNotExist = async () => {
  try {
    const products = await Product.find();

    for (const productCreate of products) {
      if (productCreate.zohoProductId) {
        continue;
      };



      let productData = {
        data: [
          {
            //   "Product_Category": "Software",
            //   "Qty_in_Demand": 1237.89,
            Description: productCreate?.description,
            //   "Commission_Rate": 1237.67,
            Product_Name: productCreate?.name,
            //   "Quantity_In_Stock": 12792,
            //   "Sales_Start_Date": "2018-01-25",
            Tax: ["Sales Tax"],
            //   "Support_Start_Date": "2018-01-25",
            Product_Active: true,
            //   "Usage_Unit": "Caton",
            Product_Code: productCreate?._id,
            //   "Qty_Ordered": 1237.89,
            //   "Manufacturer": "LexPon Inc.",
            //   "Qty_in_Stock": 1237.89,
            //   "Support_Expiry_Date": "2018-01-25",
            //   "Sales_End_Date": "2018-01-25",
            Unit_Price:
              parseFloat(productCreate?.price) -
              parseFloat(productCreate?.discount || 0),
            Taxable: true,
            //   "Reorder_Level": 1237.89
          },
        ],
      };

      const zohoProductId = await zohoService.getProductByName(productCreate?.name)

      if (zohoProductId) {
        await Product.updateOne(
          { _id: productCreate?._id },
          { zohoProductId: zohoProductId },
        )
        continue;
      };

      let record = await zohoService.createRecord({
        module: "Products",
        reqData: productData,
      });
      let u = await Product.updateOne(
        { _id: productCreate?._id },
        { zohoProductId: record?.data?.[0]?.details?.id?.toString() },
      );

    }

  } catch (error) {
    console.log(error)

  }
}

const getProduct = asyncHandler(async (req, res) => {

  try {
    let { lessPrice, morePrice, review, type, search, filter, display } =
      req.query;
    let products,
      where = {};
    if (lessPrice) where["price"] = { $gte: lessPrice };
    if (morePrice) where["price"] = { $lte: morePrice };
    if (lessPrice && morePrice)
      where["price"] = { $gte: lessPrice, $lte: morePrice };
    if (review) where["review"] = { $gte: review };
    if (search) {
      where["name"] = new RegExp(search, "i");
      filter = search;
    }
    if (display) where["productDisplay"] = true;

    // await addZohoProductIdIfNotExist();

    let sort = false;
    if (type != "0") {
      if (type == 1) {
        where["review"] = { $gte: 3 };
      }
      if (type == 2) {
        let sort = true;
      }
      if (type == 3) {
        where["kit.1"] = { $exists: true };
      }
    }
    if (sort) {
      products = await Product.find(where).lean();
    } else if (filter) {
      let tempProducts = [];
      if (search) {
        tempProducts = await Product.find(where).sort({ createdAt: -1 }).lean();
      }
      products = await Product.find({
        filter: {
          $elemMatch: {
            $regex: new RegExp(filter, "i"), // Case-insensitive search for "node"
          },
        },
      })
        .sort({ createdAt: -1 })
        .lean();
      products = [...products, ...tempProducts];
      let t = [];
      for (let index = 0; index < products.length; index++) {
        const element = products[index];
        let idx = t?.findIndex((e) => e?.name == element?.name);
        console.log("lllll", idx, element?._id);
        if (idx == -1) {
          t.push(element);
        }
      }
      products = t;
    } else {
      products = await Product.find(where).sort({ createdAt: -1 }).lean();
    }


    let result = [];
    for (let index = 0; index < products.length; index++) {
      const element = products[index];
      let reviews = await ReviewModel.countDocuments({
        productId: element?._id?.toString(),
      });
      // console.log("skeokf",reviews)
      result.push({ ...element, reviews });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "All products are ", result));
  } catch (error) {
    throw new ApiError(400, "something wrong", error.message);
  }
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.find({ _id: req.params.id });
    return res
      .status(200)
      .json(new ApiResponse(200, "All products are ", product));
  } catch (error) {
    throw new ApiError(400, "something wrong", error.messag);
  }
});
const getPendingAppointments = asyncHandler(async (req, res) => {
  const pendingAppointments = await Appointment.find({
    status: { $in: ["pending"] },
  })
    .populate("userId", "fullname")
    .populate("hairTestId")
    .select(
      "fullname _id appointmentDate timeSlot createdAt status orderId paymentStatus, amount",
    )
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        pendingAppointments,
        "pending Appointment fetch succesfully",
      ),
    );
});

// const assignDoctorToAppointment = asyncHandler(async (req, res) => {
//     req.body.doctorId = req.doctorId
//     const { appointmentId } = req.body;
//     // const { userId } = req.body;

//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) {
//         throw new ApiError(400, error?.message, "Appointment not found");
//     }

//     const user = await User.findById(appointment.user);
//     if (!user) {
//         throw new ApiError(400, "User not found", "User associated with the appointment not found");
//     }

//     // Update appointment with assigned doctor
//     appointment.doctor = req.doctorId;
//     await appointment.save();

//     // Return user details along with success response
//     return res.status(200).json(new ApiResponse({
//         status: 200, user: {
//             id: user._id,
//             name: user.name,
//             email: user.email,

//         },

//         message: "Appointment assigned successfully"

//     }));

// });

const deleteUser = asyncHandler(async (req, res) => {
  try {
    await AdminService.deleteuser(req);
    res.status(200).json(new ApiResponse(200, "User deleted successfully"));
  } catch (error) {
    throw new ApiError(
      400,
      "something error while deleting this user",
      error.message,
    );
  }
});

// const getFilteredUsers = asyncHandler(async (req, res) => {
//     let { page = 1, limit = 10, searchQuery, serialNumber } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     // Build query conditions based on search and filter criteria
//     const query = {};
//     if (searchQuery) {
//         query.name = { $regex: `^${searchQuery}`, $options: 'i' }; // Case-insensitive regex search by name
//     } else if (serialNumber) {
//         query.serialNumber = serialNumber;
//     }

//     const totalUsers = await User.countDocuments(query);

//     // Paginate the results
//     const users = await User.find(query)
//         .limit(limit)
//         .skip((page - 1) * limit)
//         .sort({ name: 1 }); // Sort by name alphabetically

//     const totalPages = Math.ceil(totalUsers / limit);

//     res.status(200).json(new ApiResponse({
//         success: true,
//         message: "Users fetched successfully",
//         data: {
//             users,
//             page,
//             totalPages,
//             totalUsers
//         }
//     }))

// });
const getTotalpatient = asyncHandler(async (req, res) => {
  try {
    const patientCount = await User.countDocuments({ role: "patient" });
    return res
      .status(200)
      .json(new ApiResponse(200, `Total count of patient:${patientCount}`));
  } catch (error) {
    throw new ApiError(400, "something went wrong", error.message);
  }
});

const addProductToCategory = asyncHandler(async (req, res) => {
  const {
    productName,
    productPrice,
    description,
    kit,
    src,
    longDes,
    stock,
    userReview,
    discount,
    shortDes,
    highlights,
    benefits,
    ingredient,
    faq,
    benefitsMain,
    ingredientMain,
    productDisplay,
    category,
    subCategory,
    gst,
    expiryDate,
    batchNo,
    mfgName,
    filter,
    width,
    height,
    weight,
    metaTitle,
    metaDesc,
    metaSlug,
    metaCanonical,
  } = req.body;

  try {
    let isProductExist = await Product.findOne({ name: productName });

    if (isProductExist) {
      throw new ApiError(404, "product already exist");
    }
    let newProduct = {
      name: productName,
      price: productPrice,
      description: description,
      kit: kit || [],
      src: src || [],
      longDes: longDes || "",
      stock: stock || "",
      userReview: userReview || [],
      discount: discount || "",
      shortDes,
      benefits,
      ingredient,
      highlights,
      benefitsMain,
      ingredientMain,
      faq, //userReview : []
      productDisplay,
      category,
      subCategory,
      gst,
      expiryDate,
      batchNo,
      mfgName,
      filter,
      width,
      height,
      weight,
      metaTitle,
      metaDesc,
      metaSlug,
      metaCanonical,
    };
    let productCreate = await Product.create(newProduct);

    let productData = {
      data: [
        {
          //   "Product_Category": "Software",
          //   "Qty_in_Demand": 1237.89,
          Description: productCreate?.description,
          //   "Commission_Rate": 1237.67,
          Product_Name: productCreate?.name,
          //   "Quantity_In_Stock": 12792,
          //   "Sales_Start_Date": "2018-01-25",
          Tax: ["Sales Tax"],
          //   "Support_Start_Date": "2018-01-25",
          Product_Active: true,
          //   "Usage_Unit": "Caton",
          Product_Code: productCreate?._id,
          //   "Qty_Ordered": 1237.89,
          //   "Manufacturer": "LexPon Inc.",
          //   "Qty_in_Stock": 1237.89,
          //   "Support_Expiry_Date": "2018-01-25",
          //   "Sales_End_Date": "2018-01-25",
          Unit_Price:
            parseFloat(productCreate?.price) -
            parseFloat(productCreate?.discount || 0),
          Taxable: true,
          //   "Reorder_Level": 1237.89
        },
      ],
    };
    try {
      let record = await zohoService.createRecord({
        module: "Products",
        reqData: productData,
      });
      let u = await Product.updateOne(
        { _id: element?._id },
        { zohoProductId: record?.data?.[0]?.details?.id?.toString() },
      );
      console.log("hjjjjj", u, record?.data?.[0]?.details?.id);
    } catch (error) {
      console.log("knmsnjdi", error);
    }
    res.status(201).json({ message: "Product added successfully." });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(400).json({ message: "Something went wrong" });
  }
});
const deleteProductFromCategory = asyncHandler(async (req, res) => {
  const { categoryName, productName } = req.body;

  try {
    let category = await Category.findOne({ name: categoryName });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    const productIndex = category.products.findIndex(
      (product) => product.name === productName,
    );

    if (productIndex === -1) {
      throw new ApiError(404, "Product not found in the category");
    }

    category.products.splice(productIndex, 1);

    await category.save();

    res.status(200).json(new ApiResponse(200, "Product deleted successfully."));
  } catch (error) {
    throw new ApiError(400, "Something wrong", error.message);
  }
});

const updateProductDetails = asyncHandler(async (req, res) => {
  const {
    id,
    newName,
    newPrice,
    newDescription,
    kit,
    src,
    longDes,
    stock,
    userReview,
    discount,
    ingredient,
    benefits,
    highlights,
    benefitsMain,
    ingredientMain,
    productDisplay,
    filter,
    batchNo,
    mfgName,
    weight,
    height,
    width,
    metaTitle,
    metaDesc,
    metaSlug,
    metaCanonical,
  } = req.body;

  try {
    let product = await Product.findOne({ _id: id });
    if (!product) {
      throw new ApiError(404, "product not found");
    }
    if (newPrice !== undefined) {
      product.price = newPrice;
    }
    if (newDescription !== undefined) {
      product.description = newDescription;
    }
    if (newName !== undefined) {
      product.name = newName;
    }
    if (kit != undefined) {
      product.kit = kit;
    }
    if (src != undefined) {
      product.src = src;
    }
    if (longDes != undefined) {
      product.longDes = longDes;
    }
    if (stock != undefined) {
      product.stock = stock;
    }
    if (userReview != undefined) {
      product.userReview = userReview;
    }
    if (discount != undefined) {
      product.discount = discount;
    }

    if (ingredient) {
      product.ingredient = ingredient;
    }
    if (benefits) {
      product.benefits = benefits;
    }
    if (highlights) {
      product.highlights = highlights;
    }
    if (benefitsMain) {
      product.benefitsMain = benefitsMain;
    }
    if (ingredientMain) {
      product.ingredientMain = ingredientMain;
    }
    // if(productDisplay){
    product.productDisplay = productDisplay || false;
    // }
    if (filter) {
      product.filter = filter;
    }
    if (batchNo) {
      product.batchNo = batchNo;
    }
    if (mfgName) {
      product.mfgName = mfgName;
    }
    if (weight) {
      product.weight = weight;
    }
    if (height) {
      product.height = height;
    }
    if (width) {
      product.width = width;
    }
    if (metaSlug) product.metaSlug = metaSlug;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDesc) product.metaDesc = metaDesc;
    if (metaCanonical) product.metaCanonical = metaCanonical;

    await product.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, product, "Product details updated successfully."),
      );
  } catch (error) {
    console.error("Error updating product details:", error);
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const deleteproduct = asyncHandler(async (req, res) => {
  const { id } = req.body;

  try {
    let product = await Product.findOne({ _id: id });

    if (!product) {
      throw new ApiError(404, "product not found");
    }
    await Product.findOneAndDelete({ _id: id });

    res.status(200).json(new ApiResponse(200, "Product deleted successfully."));
  } catch (error) {
    throw new ApiError(400, "Something wrong", error.message);
  }
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;

  try {
    const categories = await Category.find({
      name: { $in: categoryName },
    }).populate("products");

    const productsByCategory = categories.map((category) => {
      return {
        category: category.name,
        products: category.products,
      };
    });

    res.status(200).json({ productsByCategory });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(400).json({ message: "Something went wrong" });
  }
});
const updateAdminProfile = asyncHandler(async (req, res) => {
  try {
    await AdminService.updateAdmin(req);

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile updated successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});
const searchUsers = asyncHandler(async (req, res, next) => {
  try {
    const { searchQuery, page = 1, limit = 10 } = req.query;

    const result = await AdminService.searchUsers(
      searchQuery,
      parseInt(page, 10),
      parseInt(limit, 10),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "result get successfully"));
  } catch (error) {
    next(error); // move next(error) to the catch block
    throw new ApiError(400, "something wrong", error.message);
  }
});
const searchdoctor = asyncHandler(async (req, res, next) => {
  try {
    const { searchQuery, page = 1, limit = 10 } = req.query;

    const result = await AdminService.searchDoctor(
      searchQuery,
      parseInt(page, 10),
      parseInt(limit, 10),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "result get successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, "something wrong", error.message);
  }
});
const blockUnblock = asyncHandler(async (req, res) => {
  try {
    const data = req.query;

    await AdminService.blockAndunblock(data);
    return res
      .status(200)
      .json(new ApiResponse(200, "status changed succesffully"));
  } catch (error) {
    throw new ApiError(400, "Something wrong", error.message);
  }
});

const transactionData = asyncHandler(async (req, res) => {
  try {
    const { sortOption, page = 1, limit = 10 } = req.query;
    let sortCriteria = {};

    if (sortOption === "ascending") {
      sortCriteria = { createdAt: 1 };
    } else if (sortOption === "descending") {
      sortCriteria = { createdAt: -1 };
    }

    const paymentsQuery = Payment.find()
      .populate("userId", "fullname")
      .select("fullname createdAt paymentStatus paymentMethod orderId")
      .collation({ locale: "en", strength: 2 });

    if (sortOption) {
      paymentsQuery.sort(sortCriteria);
    }

    const payments = await paymentsQuery.skip((page - 1) * limit).limit(limit);
    console.log("Fetched Payments:", payments);

    const formattedPayments = formatTransactionData(payments);
    const totalCount = await Payment.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      data: formattedPayments,
      pagination: {
        totalRecords: totalCount,
        totalPages,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };

    res
      .status(200)
      .json(
        new ApiResponse(200, response, "Transaction data fetched successfully"),
      );
  } catch (error) {
    console.error("Error fetching transaction data:", error);
    throw new ApiError(400, "Failed to fetch transaction data", error.message);
  }
});

const formatTransactionData = (payments) => {
  return payments.map((payment) => ({
    paymentMethod: payment.paymentMethod,
    fullname: payment.userId ? payment.userId.fullname : "N/A",
    paymentStatus: payment.paymentStatus,
    orderId: payment.orderId,
    paymentId: payment._id,
    createdAt: new Date(payment.createdAt).toISOString(),
  }));
};

const softDeleteTransaction = asyncHandler(async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log("Received paymentId:", paymentId);
    // const paymentId = req.params.paymentId;
    // console.log(">..........", paymentId)

    const payment = await Payment.findById({ _id: "660ff8f2cf66422144b3e87a" });
    // console.log("..................", payment)

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    payment.status = false;
    await payment.save();

    res
      .status(200)
      .json(new ApiResponse(200, {}, " Transaction  deleted successfully"));
  } catch (error) {
    console.error("Error soft deleting payment:", error);
    throw new ApiError(400, "Failed to soft delete payment", error.message);
  }
});

//     try {
//         const { sortOption, page = 1, limit = 10 } = req.query;

//         let sortCriteria = {};

//         if (sortOption === 'alphabetically') {
//             sortCriteria = { 'fullname': 1 };
//         } else if (sortOption === 'date') {
//             sortCriteria = { 'createdAt': -1 };
//         }

//         const payments = await Payment.aggregate([
//             {
//                 $lookup: {
//                     from: 'users',
//                     localField: 'userId',
//                     foreignField: '_id',
//                     as: 'user'
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$user',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $addFields: {
//                     fullname: '$user.fullname'
//                 }
//             },
//             {
//                 $sort: sortCriteria
//             },
//             {
//                 $skip: (parseInt(page, 10) - 1) * parseInt(limit, 10)
//             },
//             {
//                 $limit: parseInt(limit, 10)
//             },
//             {
//                 $project: {
//                     'user': 0
//                 }
//             }
//         ]);

//         const formattedPayments = formatTransactionData(payments);
//         const totalCount = await Payment.countDocuments();

//         const totalPages = Math.ceil(totalCount / parseInt(limit, 10));

//         const response = {
//             data: formattedPayments,
//             pagination: {
//                 totalRecords: totalCount,
//                 totalPages,
//                 currentPage: parseInt(page, 10),
//                 nextPage: parseInt(page, 10) < totalPages ? parseInt(page, 10) + 1 : null,
//                 prevPage: parseInt(page, 10) > 1 ? parseInt(page, 10) - 1 : null,
//             },
//         };

//         res.status(200).json(new ApiResponse(200, response, "Transaction data fetched successfully"));

//     } catch (error) {
//         console.error("Error fetching transaction data:", error);
//         throw new ApiError(400, "Failed to fetch transaction data", error.message);
//     }
// });

// const transactionData = asyncHandler(async (req, res) => {
//     try {
//         // Extract query parameters
//         const { sortOption, page = 1, limit = 10 } = req.query;

//         // Define sort options
//         let sortCriteria = {};
//         if (sortOption === 'alphabetically') {
//             sortCriteria = { 'fullname': 1 }; // Sort by fullname in ascending order
//         } else if (sortOption === 'date') {
//             sortCriteria = { 'createdAt': -1 }; // Sort by createdAt in descending order
//         }

//         // Define query for pagination
//         const query = {};

//         // Fetch transactions with pagination and sorting
//         const { data, totalPages, currentPage, totalItems, itemsPerPage } = await paginate(
//             Payment,
//             query,
//             parseInt(page, 10),
//             parseInt(limit, 10),
//             sortCriteria
//         );

//         // Format transactions
//         const formattedPayments = formatTransactionData(data);

//         // Prepare response
//         const response = {
//             data: formattedPayments,
//             pagination: {
//                 totalRecords: totalItems,
//                 totalPages,
//                 currentPage,
//                 nextPage: currentPage < totalPages ? currentPage + 1 : null,
//                 prevPage: currentPage > 1 ? currentPage - 1 : null,
//             },
//         };

//         // Send response
//         res.status(200).json(new ApiResponse(200, response, "Transaction data fetched successfully"));

//     } catch (error) {
//         console.error("Error fetching transaction data:", error);
//         throw new ApiError(400, "Failed to fetch transaction data", error.message);
//     }
// });

const getBookedAppointment = asyncHandler(async (req, res) => {
  try {
    const data = await Appointment.find({
      status: { $in: ["booked", "assigned", "completed"] },
    })
      .populate("userId", "fullname")
      .populate("hairTestId")
      .populate("doctorId", "fullname")
      .select(
        "fullname _id appointmentDate timeSlot createdAt status orderId paymentStatus, amount",
      )
      .sort({ createdAt: -1 })
      .lean();

    let result = [];
    for (let index = 0; index < data.length; index++) {
      const element = { ...data[index] };

      let prescription = await Prescription.findOne({
        appointmentId: element._id?.toString(),
      });
      element.prescription = prescription;
      result.push({ ...element, prescription: prescription });
      console.log("sjorjo", element);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Booked Appointment get succesffully"),
      );
  } catch (error) {
    throw new ApiError(400, "Unable to get Appointment", error.message);
  }
});

const assignDoctorToAppointment = asyncHandler(async (req, res) => {
  try {
    const { appointmentId, doctorId } = req.body;

    // Fetch the appointment, doctor, user, and hair test details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }

    const user = await User.findById(appointment.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const hairTest = await HairTest.findById(appointment.hairTestId);
    if (!hairTest) {
      throw new ApiError(404, "Hair Test not found");
    }

    console.log("Appoinmenmt", appointment);
    // Prepare WhatsApp notification payload
    const whatsappPayload = {
      attr: null,
      name: doctor.fullname,
      phone: doctor.mobile?.toString(),
      campName: "doctor_message_Utility",
      // media: {
      //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725596233/hair-assessment/bhwlkkh2ul9dig5hnelp.png",
      //   filename: "file",
      // },
    };

    // Send WhatsApp notification
    const notificationStatus = await WhatsappTextTemplate(whatsappPayload);

    // Check notification status
    if (!notificationStatus || !notificationStatus.success) {
      throw new ApiError(400, "WhatsApp notification not confirmed");
    }

    // Update the appointment after successful notification
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { doctorId: doctorId, status: "assigned" },
      { new: true },
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedAppointment,
          "Appointment assigned successfully",
        ),
      );
  } catch (error) {
    console.error("Error assigning appointment:", error.message);
    throw new ApiError(400, error.message, error.message);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  try {
    const data = await orderModel
      .find({
        deliveryStatus: {
          $in: ["processing", "shipped", "delivered", "canceled"],
        },
      })
      .populate("userId", "fullname")
      .populate("addressId", "fullAdress")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Orders get succesffully"));
  } catch (error) {
    throw new ApiError(400, "Failed to assign appointment", error.message);
  }
});

const getCoupons = asyncHandler(async (req, res) => {
  try {
    console.log("smriw");
    const data = await CouponsModel.find({ isActive: 1 }).sort({
      createdAt: -1,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "coupons get succesffully"));
  } catch (error) {
    console.log("lmekrmo", error);
    throw new ApiError(400, "Failed to assign appointment", error.message);
  }
});

const editCoupon = asyncHandler(async (req, res) => {
  try {
    let { code, id, validity, percent, type } = req.body;
    if (!id) {
      if (!code || !validity || !percent) {
        return res.status(400).json(new ApiResponse(400, "Details required"));
      }
      let input = { code, validity, percent, type };
      let add = await CouponsModel.create(input);
      return res
        .status(200)
        .json(new ApiResponse(200, add, "coupon add successfully"));
    } else {
      let coupon = await CouponsModel.findOne({ _id: id });
      if (code) coupon.code = code;
      if (validity) coupon.validity = validity;
      if (percent) coupon.percent = percent;
      if (type) coupon.type = type;

      await coupon.save();
      return res
        .status(200)
        .json(new ApiResponse(200, coupon, "coupon edit successfully"));
    }
  } catch (error) {
    throw new ApiError(400, "Failed to assign appointment", error.message);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    let coupon = await CouponsModel.findOne({ _id: id });
    coupon.isActive = 0;
    await coupon.save();
    return res
      .status(200)
      .json(new ApiResponse(200, coupon, "coupon delete succesffully"));
  } catch (error) {
    throw new ApiError(400, "Failed to assign appointment", error.message);
  }
});

const sendWhatsapp = asyncHandler(async (req, res) => {
  try {
    let { userId } = req.query;
    const user = await User.findOne({ _id: userId });
    await WhatsappTextTemplate({
      attr: null,
      name: user?.fullname,
      phone: user?.mobile?.toString(),
      campName: "new_complete_hair_test_utility",
      // media: {
      //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725767315/hair-assessment/f2pevsnjbttikmo05tbs.jpg",
      //   filename: "file",
      // },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "whatsapp send successfully"));
  } catch (error) {
    throw new ApiError(400, "Failed to assign appointment", error.message);
  }
});

const getCouponsUser = asyncHandler(async (req, res) => {
  try {
    const { user } = req;

    if (!user || !user._id) {
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }
    console.log("smriw");
    const data = await CouponsMappingModel.find({ userId: user._id })
      .populate("coupon")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "coupons get succesffully"));
  } catch (error) {
    console.log("lmekrmo", error);
    throw new ApiError(400, "Failed to assign appointment", error.message);
  }
});

const getReviewAll = asyncHandler(async (req, res) => {
  try {
    let reviews = await ReviewModel.find()
      ?.populate("productId", "name")
      ?.sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, reviews, "review fetch successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const deleteReview = asyncHandler(async (req, res) => {
  try {
    let review = await ReviewModel.findOne({ _id: req.params.id });
    let p = await ReviewModel.deleteOne({ _id: req.params.id });
    console.log("rreeeee", review?.productId);

    let all = await ReviewModel.find({ productId: review?.productId });
    let tot = 0;
    console.log("rreeeee", all);

    if (all?.length > 0) {
      let x = 0;
      all?.map((e) => {
        x = x + parseFloat(e?.rating || 0);
      });
      tot = (parseFloat(x) / parseFloat(all?.length))?.toFixed(1);
      await Product.updateOne({ _id: review?.productId }, { review: tot });
    }
    return res
      .status(200)
      .json(new ApiResponse(200, tot, "review delete successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const AllUserData = asyncHandler(async (req, res) => {
  try {
    let data = await adminService.patientData();
    if (!data) {
      return res
        .status(400)
        .json(new ApiResponse(400, data, "error in data fecth successfully"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, data, "data fecth successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const contactDetails = asyncHandler(async (req, res) => {
  try {
    let data = await contactUsModel.find({});
    return res
      .status(200)
      .json(new ApiResponse(200, data, "data fecth successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const addInvoice = asyncHandler(async (req, res) => {
  try {
    let data = req.body;
    let squence = await Invoices.countDocuments();
    data["invoiceNo"] = squence + 1;
    let invoice = await Invoices.create(data);

    return res
      .status(200)
      .json(new ApiResponse(200, invoice, "invoice create successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const getInvoices = asyncHandler(async (req, res) => {
  try {
    let invoices = await Invoices.find({ isActive: true })
      .populate("doctor")
      .populate("items.item")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, invoices, "invoice fetch successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const getInvoiceById = asyncHandler(async (req, res) => {
  try {
    let invoice = await Invoices.findOne({ _id: req.body?._id })
      .populate("doctor")
      .populate("items.item");
    return res
      .status(200)
      .json(new ApiResponse(200, invoice, "invoice fetch successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const syncProduct = asyncHandler(async (req, res) => {
  try {
    let allProducts = await User.find({ role: "patient" });
    for (let index = 0; index < allProducts?.length; index++) {
      const element = allProducts[index];

      let productData = {
        data: [
          {
            Last_Name: element?.fullname?.split(" ")?.[1] || "singh",
            First_Name: element?.fullname,
            Email: element?.email,
            Phone: element?.mobile,
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
          { _id: element?._id },
          { zohoUserId: record?.data?.[0]?.details?.id?.toString() },
        );
        console.log("hjjjjj", u, record?.data?.[0]?.details?.id);
      } catch (error) {
        console.log("knmsnjdi", error);
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "", "invoice fetch successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const addBlog = asyncHandler(async (req, res) => {
  try {
    let data = req.body;
    let p;
    if (data?.isDelete) {
      await blogModel.deleteOne({ _id: data?.id });
    } else if (data?.id) {
      p = await blogModel.updateOne({ _id: data?.id }, data);
      // if(data?.category){
      //     let blogCategory = await Config.findOne({ _id: new mongoose.Types.ObjectId("6714362ab526d76306f3c9e3") });
      //     let Arr = blogCategory?.blogCategories;
      //     let f = Arr?.findIndex((e) => e == data?.category);
      //     if(f == -1) Arr.push(data?.category);
      //     await Config.updateOne({ _id: new mongoose.Types.ObjectId("6714362ab526d76306f3c9e3") },{blogCategories : Arr});
      // }
    } else {
      let exist = await blogModel.findOne({ slug: data?.slug });
      if (exist)
        return res
          .status(400)
          .json(new ApiResponse(200, exist, "blog slug already exist"));
      // let blogCategory = await Config.findOne({ _id: new mongoose.Types.ObjectId("6714362ab526d76306f3c9e3") });
      // let Arr = blogCategory?.blogCategories;
      // let f = Arr?.findIndex((e) => e == data?.category);
      // if(f == -1) Arr.push(data?.category);
      // await Config.updateOne({ _id: new mongoose.Types.ObjectId("6714362ab526d76306f3c9e3") },{blogCategories : Arr});
      p = await blogModel.create(data);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, p, "blog create successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const allBlog = asyncHandler(async (req, res) => {
  try {
    let { filter, id, site, offset = 0, limit = 5, search } = req.body;
    let blogs,
      where = {};
    if (filter) {
      where["category"] = new RegExp(filter, "i"); // Case-insensitive search for "node"
    }
    if (search) where["title"] = new RegExp(search, "i");
    if (site) where["isActive"] = 1;
    blogs = await blogModel
      .find(where)
      .sort({ createdAt: -1 })
      .skip(offset * limit)
      .limit(limit)
      .lean();
    let result = blogs;
    let c = await blogModel.countDocuments(where);
    if (id) {
      result = blogs?.filter((e) => e?.slug != id);
      c = c - 1;
    }
    return res.status(200).json(new ApiResponse(200, result, c));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const getBlog = asyncHandler(async (req, res) => {
  try {
    let data = req.body;
    let p = await blogModel.findOne({ slug: data?.id });
    return res
      .status(200)
      .json(new ApiResponse(200, p, "blog create successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const addNews = asyncHandler(async (req, res) => {
  try {
    let data = req.body;
    if (data?.id) {
      p = await NewsModel.updateOne({ _id: data?.id }, data);
    } else p = await NewsModel.create(data);
    return res
      .status(200)
      .json(new ApiResponse(200, p, "blog create successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const getNews = asyncHandler(async (req, res) => {
  try {
    let p = await NewsModel.findOne({
      _id: new mongoose.Types.ObjectId("671fea19b8f8339b3523399d"),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, p, "blog create successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const addBlogCategory = asyncHandler(async (req, res) => {
  try {
    let data = req.body;
    let p = null;
    if (data?.isDelete) {
      await BlogPageModel.deleteOne({ _id: data?.id });
    } else if (data?.id) {
      p = await BlogPageModel.updateOne({ _id: data?.id }, data);
    } else p = await BlogPageModel.create(data);
    return res
      .status(200)
      .json(new ApiResponse(200, p, "blog create successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const allBlogCategory = asyncHandler(async (req, res) => {
  try {
    let p = await BlogPageModel.find({}).sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, p, "blog create successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const getNewsFeed = asyncHandler(async (req, res) => {
  try {
    let p = await NewsModel.findOne({
      _id: new mongoose.Types.ObjectId("671fea19b8f8339b3523399d"),
    });
    const url = p?.desc;
    const response = await axios(url);
    const xmlString = await response?.data;
    console.log("mskdfo", xmlString);
    // Create a parser instance
    const parser = new xml2js.Parser();
    // Parse the XML string
    parser.parseString(xmlString, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res
          .status(400)
          .json(new ApiResponse(400, 0, "Error parsing XML:"));
      }
      // Access data from the parsed XML
      const channel = result.rss.channel[0];
      const title = channel.title[0];
      const description = channel.description[0];

      const items = channel.item.map((item) => {
        const itemTitle = item.title[0];
        const itemDescription = item.description[0];
        return { title: itemTitle, description: itemDescription };
      });

      // Display the converted text
      console.log(`Feed Title: ${title}`);
      console.log(`Feed Description: ${description}`);
      console.log("Items:", items);
      return res
        .status(200)
        .json(new ApiResponse(200, items, "blog create successfully"));
    });

    // res.send(data);
  } catch (error) {
    throw new ApiError(400, "something error", error?.message);
  }
});

module.exports = {
  createDoctor,
  getallPatient,
  deleteUser,
  getTotalpatient,
  addProductToCategory,
  getProductsByCategory,
  addAdmin,
  updateAdminProfile,
  searchUsers,
  getallDoctor,
  searchdoctor,
  getProduct,
  blockUnblock,
  deleteProductFromCategory,
  updateProductDetails,
  transactionData,
  softDeleteTransaction,
  getBookedAppointment,
  assignDoctorToAppointment,
  deleteproduct,
  getProductById,
  getPendingAppointments,
  getOrders,
  getallDoctorData,
  editDoctor,
  getDoctor,
  deleteCoupon,
  editCoupon,
  getCoupons,
  sendWhatsapp,
  getReviewAll,
  deleteReview,
  AllUserData,
  contactDetails,
  getAdmin,
  addInvoice,
  getInvoices,
  getInvoiceById,
  syncProduct,
  addBlog,
  allBlog,
  getBlog,
  getNews,
  addNews,
  addBlogCategory,
  allBlogCategory,
  getNewsFeed,
};
