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

const LoginModel = require("../models/loginHistory.model.js");
const FollowUpModel = require("../models/followUpAppointments.model.js");

const addAdmin = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const adminResult = await AdminService.addAdmin(req.body);
    return res
      .status(201)
      .json(new ApiResponse(201, adminResult, "Admin added successfully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add admin", error.message);
  }
});

const createDoctor = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const resultDoctor = await AdminService.createDoctor(req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Doctor created succesffully and send credential")
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
      sortOrder
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

const deleteDoctor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Doctors.findByIdAndDelete(id);

    if (!result) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Doctor deleted successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const addZohoProductIdIfNotExist = async () => {
  try {
    const products = await Product.find();

    for (const productCreate of products) {
      if (productCreate.zohoProductId) {
        continue;
      }

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

      const zohoProductId = await zohoService.getProductByName(
        productCreate?.name
      );

      if (zohoProductId) {
        await Product.updateOne(
          { _id: productCreate?._id },
          { zohoProductId: zohoProductId }
        );
        continue;
      }

      let record = await zohoService.createRecord({
        module: "Products",
        reqData: productData,
      });
      let u = await Product.updateOne(
        { _id: productCreate?._id },
        { zohoProductId: record?.data?.[0]?.details?.id?.toString() }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

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
      "fullname _id appointmentDate timeSlot createdAt status orderId paymentStatus, amount"
    )
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        pendingAppointments,
        "pending Appointment fetch succesfully"
      )
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
      error.message
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
    name,
    price,
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
    let isProductExist = await Product.findOne({ name: name });

    if (isProductExist) {
      throw new ApiError(404, "product already exist");
    }
    let newProduct = {
      name,
      price,
      description,
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
            parseFloat(productCreate?.price || 0) -
            parseFloat(productCreate?.price || 0) *
              (parseFloat(productCreate?.discount || 0) / 100),
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
        { zohoProductId: record?.data?.[0]?.details?.id?.toString() }
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
      (product) => product.name === productName
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
    _id,
    newName,
    newPrice,
    gst,
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
    slug,
  } = req.body;

  try {
    console.log(req.body);
    let product = await Product.findById(_id);
    console.log("product", product);
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
    if (slug) product.metaSlug = slug;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDesc) product.metaDesc = metaDesc;
    if (metaCanonical) product.metaCanonical = metaCanonical;
    if (gst) product.gst = gst;

    await product.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, product, "Product details updated successfully.")
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
    const adminData = req.body;

    if (!adminData._id) {
      throw new ApiError(400, "Admin ID is required");
    }

    const updatedAdmin = await AdminService.updateAdminProfile(adminData);

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedAdmin, "Admin profile updated successfully")
      );
  } catch (error) {
    throw new ApiError(error.statusCode || 400, error.message);
  }
});
const searchUsers = asyncHandler(async (req, res, next) => {
  try {
    const { searchQuery, page = 1, limit = 10 } = req.query;

    const result = await AdminService.searchUsers(
      searchQuery,
      parseInt(page, 10),
      parseInt(limit, 10)
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
      parseInt(limit, 10)
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
        new ApiResponse(200, response, "Transaction data fetched successfully")
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
        "fullname _id appointmentDate timeSlot createdAt status orderId paymentStatus, amount"
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
        new ApiResponse(200, result, "Booked Appointment get succesffully")
      );
  } catch (error) {
    throw new ApiError(400, "Unable to get Appointment", error.message);
  }
});

// const assignDoctorToAppointment = asyncHandler(async (req, res) => {
//   try {
//     const { appointmentId, doctorId } = req.body;

//     // Fetch the appointment, doctor, user, and hair test details
//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) {
//       throw new ApiError(404, "Appointment not found");
//     }

//     const doctor = await User.findById(doctorId);
//     if (!doctor) {
//       throw new ApiError(404, "Doctor not found");
//     }

//     const user = await User.findById(appointment.userId);
//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }

//     const hairTest = await HairTest.findById(appointment.hairTestId);
//     if (!hairTest) {
//       throw new ApiError(404, "Hair Test not found");
//     }

//     console.log("Appoinmenmt", appointment);
//     // Prepare WhatsApp notification payload
//     const whatsappPayload = {
//       attr: null,
//       name: doctor.fullname,
//       phone: doctor.mobile?.toString(),
//       campName: "doctor_message_Utility",
//       // media: {
//       //   url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725596233/hair-assessment/bhwlkkh2ul9dig5hnelp.png",
//       //   filename: "file",
//       // },
//     };

//     // Send WhatsApp notification
//     const notificationStatus = await WhatsappTextTemplate(whatsappPayload);

//     // Check notification status
//     if (!notificationStatus || !notificationStatus.success) {
//       throw new ApiError(400, "WhatsApp notification not confirmed");
//     }

//     // Update the appointment after successful notification
//     const updatedAppointment = await Appointment.findByIdAndUpdate(
//       appointmentId,
//       { doctorId: doctorId, status: "assigned" },
//       { new: true }
//     );

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           updatedAppointment,
//           "Appointment assigned successfully"
//         )
//       );
//   } catch (error) {
//     console.error("Error assigning appointment:", error.message);
//     throw new ApiError(400, error.message, error.message);
//   }
// });

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
    const data = await CouponsModel.find(
      req.user.role === "admin" ? {} : { isActive: true }
    ).sort({
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
    const { code, _id, validity, percent, type, isActive } = req.body;

    console.log("Request body:", req.body);

    // Create new coupon if _id is not provided
    if (!_id) {
      console.log("Creating a new coupon...");

      if (!code || !validity || percent === undefined || type === undefined) {
        console.log("Missing required fields for new coupon:", {
          code,
          validity,
          percent,
          type,
        });
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              "All fields (code, validity, percent, type) are required for creating a new coupon."
            )
          );
      }

      const newCoupon = await CouponsModel.create({
        code,
        validity,
        percent,
        type,
        isActive: isActive ?? true,
      });

      console.log("New coupon created:", newCoupon);

      return res
        .status(200)
        .json(new ApiResponse(200, newCoupon, "Coupon added successfully."));
    }

    // Update existing coupon if _id is provided
    console.log("Editing existing coupon with _id:", _id);

    const updateData = {
      ...(code && { code }),
      ...(validity && { validity }),
      ...(percent !== undefined && { percent }),
      ...(type !== undefined && { type }),
      ...(isActive !== undefined && { isActive }),
    };

    console.log("Update data:", updateData);

    const updatedCoupon = await CouponsModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!updatedCoupon) {
      console.log("Coupon not found for _id:", _id);
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Coupon not found."));
    }

    console.log("Coupon updated successfully:", updatedCoupon);

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCoupon, "Coupon updated successfully.")
      );
  } catch (error) {
    console.error("Edit Coupon Error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Server error while editing coupon."));
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const deletedCoupon = await CouponsModel.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Coupon not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedCoupon, "Coupon deleted successfully"));
  } catch (error) {
    throw new ApiError(400, "Failed to delete coupon", error.message);
  }
});

const sendWhatsapp = asyncHandler(async (req, res) => {
  try {
    let { userId } = req.query;
    const user = await User.findOne({ _id: userId });

    await WhatsappTextTemplate({
      attr: null,
      name: user?.fulln, // Make sure this is correct; maybe user?.fullName?
      phone: user?.mobile?.toString(),
      campName: "new_complete_hair_test_utility",
      // media: {...}
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { sentToName: user?.fulln || "User" },
          "Whatsapp sent successfully"
        )
      );
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
    // First find the review to get its current status
    let review = await ReviewModel.findOne({ _id: req.params.id });

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    // Toggle the isDeleted status
    review = await ReviewModel.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: !review.isDeleted },
      { new: true }
    );

    // Get all non-deleted reviews for the product
    let all = await ReviewModel.find({
      productId: review.productId,
      isDeleted: false,
    });

    let tot = 0;

    if (all?.length > 0) {
      let x = 0;
      all?.map((e) => {
        x = x + parseFloat(e?.rating || 0);
      });
      tot = (parseFloat(x) / parseFloat(all?.length))?.toFixed(1);
      await Product.updateOne({ _id: review.productId }, { review: tot });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { review, averageRating: tot },
          `Review ${review.isDeleted ? "disabled" : "enabled"} successfully`
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "Something went wrong while updating review status"
    );
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

    console.log();

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
          { zohoUserId: record?.data?.[0]?.details?.id?.toString() }
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

// fonix
const createFollowUp = asyncHandler(async (req, res) => {
  try {
    const {
      hairTestId,

      appointmentDate,
      timeSlot,

      planId,
      appointmentType,
      notes,
      prescription,
    } = req.body;

    if (
      !userId ||
      !doctorId ||
      !hairTestId ||
      !firstAppointmentId ||
      !appointmentDate ||
      !timeSlot
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const DoctorUserID = await Doctors.findById(doctorId);

    // Step 1: Create a new Appointment
    const newAppointment = await AppointmentModel.create({
      userId,
      doctorId: DoctorUserID.userId,
      hairTestId,
      appointmentDate,
      timeSlot,
      duration: duration || 2,
      planId,
      amount,
      appointmentType: appointmentType || "hair_test_with_prescription",
      status: "pending",
      notes,
      prescription,
    });

    // Step 2: Find or create FollowUp document
    let followUpDoc = await FollowUpModel.findOne({
      userId,
      doctorId,
      hairTestId,
      firstAppointmentId,
    });

    if (!followUpDoc) {
      // Create new follow-up document if not exists
      followUpDoc = new FollowUpModel({
        userId,
        doctorId,
        hairTestId,
        firstAppointmentId,
        followUpAppointments: [newAppointment._id],
      });
    } else {
      // Push new appointment ID
      followUpDoc.followUpAppointments.push(newAppointment._id);
    }

    await followUpDoc.save();

    return res.status(201).json({
      message: "Follow-up created successfully",
      data: followUpDoc,
    });
  } catch (error) {
    console.error("Error creating follow-up:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

const getMonthlyHairTestData = asyncHandler(async (req, res) => {
  try {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const getMonthlyDataCounts = async (startDate, endDate) => {
      const hairTestAppointmentCount = await Appointment.countDocuments({
        hairTestId: { $ne: null },
        status: "completed",
        paymentStatus: "paid",
        createdAt: { $gte: startDate, $lt: endDate },
      });

      const productOrderCount = await orderModel.countDocuments({
        status: "paid",
        createdAt: { $gte: startDate, $lt: endDate },
        orderType: "product Buy",
      });

      return {
        totalHairTestCompletedOrders: hairTestAppointmentCount,
        totalProductOnlyOrders: productOrderCount,
      };
    };

    const currentMonthSummary = await getMonthlyDataCounts(
      currentMonthStart,
      currentMonthEnd
    );
    const previousMonthSummary = await getMonthlyDataCounts(
      previousMonthStart,
      previousMonthEnd
    );

    // ✅ Today's hair tests
    const todaysHairTests = await Appointment.countDocuments({
      hairTestId: { $ne: null },
      status: "completed",
      paymentStatus: "paid",
      createdAt: { $gte: todayStart, $lt: todayEnd },
    });

    // ✅ Today's total sales
    const todaysOrders = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lt: todayEnd },
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
        },
      },
    ]);

    const totalSalesToday =
      todaysOrders.length > 0 ? todaysOrders[0].totalSales : 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          currentMonth: {
            month: currentMonthStart.getMonth() + 1,
            year: currentMonthStart.getFullYear(),
            ...currentMonthSummary,
          },
          previousMonth: {
            month: previousMonthStart.getMonth() + 1,
            year: previousMonthStart.getFullYear(),
            ...previousMonthSummary,
          },
          today: {
            totalHairTests: todaysHairTests,
            totalSales: totalSalesToday,
          },
        },
        "HairTest monthly + daily report (summary only) fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error?.message);
  }
});

const getpatientData = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid or missing userId");
    }

    const orders = await orderModel
      .find({ userId })
      .select("status createdAt totalAmount name products mode")
      .populate("products.item", "name price")
      .lean();

    const trimmedOrders = orders.map((order) => ({
      ...order,
      products: order.products.map((p) => ({
        quantity: p.quantity,
        item: {
          name: p.item?.name,
          price: p.item?.price,
        },
      })),
    }));

    const appointments = await Appointment.find({ userId })
      .select(
        "doctorId appointmentDate timeSlot status duration appointmentType paymentStatus"
      )
      .populate({
        path: "doctorId",
        select: "fullname email mobile speciality",
      })
      .lean();

    // Fetch prescriptions for userId without populate
    const prescriptions = await Prescription.find({ userId }).lean();

    // Get all unique appointment IDs from prescriptions
    const appointmentIds = [
      ...new Set(prescriptions.map((p) => p.appointmentId).filter(Boolean)),
    ];

    // Fetch all relevant appointments in one query
    const prescriptionAppointments = await Appointment.find({
      _id: { $in: appointmentIds },
    }).lean();

    // Fetch all doctor information for these appointments
    const doctorIds = [
      ...new Set(
        prescriptionAppointments.map((a) => a.doctorId).filter(Boolean)
      ),
    ];
    const doctors = await User.find({
      _id: { $in: doctorIds },
    })
      .select("fullname email mobile speciality")
      .lean();

    // Create lookup maps for faster access
    const appointmentMap = prescriptionAppointments.reduce((acc, apt) => {
      acc[apt._id.toString()] = apt;
      return acc;
    }, {});

    const doctorMap = doctors.reduce((acc, doc) => {
      acc[doc._id.toString()] = doc;
      return acc;
    }, {});

    const enrichedPrescriptions = prescriptions.map((prescription) => {
      // Get the related appointment
      const relatedAppointment =
        appointmentMap[prescription.appointmentId?.toString()];
      // Get the doctor info if available
      const doctorInfo = relatedAppointment?.doctorId
        ? doctorMap[relatedAppointment.doctorId.toString()]
        : null;

      // Create a new object without the specified keys
      const {
        dianosis,
        hairScalp,
        overall,
        nutrition,
        ...filteredPrescription
      } = prescription;

      return {
        ...filteredPrescription,
        doctor: doctorInfo?.fullname || "N/A",
        appointmentDetails: {
          _id: relatedAppointment?._id || prescription.appointmentId,
          appointmentDate: relatedAppointment?.appointmentDate || "",
          timeSlot: relatedAppointment?.timeSlot || "noon",
          status: relatedAppointment?.status || "completed",
          doctorId: doctorInfo || null,
        },
      };
    });

    const loginHistory = await LoginModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const hairTests = await HairTest.find({ userId }).lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orders: trimmedOrders,
          prescriptions: enrichedPrescriptions,
          appointments,
          loginHistory,
          hairTests,
        },
        "Patient data fetched successfully"
      )
    );
  } catch (error) {
    console.error("getpatientData error:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const assignDoctorForPrescription = asyncHandler(async (req, res) => {
  try {
    const { orderId, doctorId, items } = req.body;

    if (!orderId || !doctorId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Missing or invalid data" });
    }

    // Step 1: Find the order
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = order.userId;

    // Step 2: Check if appointment already exists for this orderId
    const existingAppointment = await Appointment.findOne({ orderId });

    if (existingAppointment) {
      return res.status(200).json({
        success: true,
        message: "Appointment already exists for this order",
        data: existingAppointment,
      });
    }

    // Step 3: Create Appointment
    const appointment = new Appointment({
      userId: userId,
      doctorId: doctorId,
      orderId: orderId,
      appointmentDate: new Date(),
      timeSlot: "noon",
      status: "assigned",
      appointmentType: "prescription_only",
      prescriptionItems: items,
    });

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Doctor assigned and appointment created successfully",
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
});

const createFollowupAppointment = asyncHandler(async (req, res) => {
  try {
    const { followupOf, appointmentDate, timeSlot, doctorId, status } =
      req.body;

    if (!followupOf || !appointmentDate || !timeSlot) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const DoctorUserID = await Doctors.findById(doctorId);

    // Find the original appointment
    const originalAppointment = await Appointment.findOne({
      hairTestId: followupOf,
    });
    if (!originalAppointment) {
      return res
        .status(404)
        .json({ message: "Original appointment not found" });
    }

    // Check if there is any follow-up appointment for this followupOf that is not completed yet
    const existingPendingFollowup = await Appointment.findOne({
      followupOf,
      status: { $ne: "completed" }, // any status other than completed
    });

    if (existingPendingFollowup) {
      return res.status(400).json({
        message:
          "Cannot create new follow-up appointment until the previous one is completed",
      });
    }

    // Count total follow-ups so far
    const totalFollowups = await Appointment.countDocuments({ followupOf });

    // Create new follow-up appointment
    const followup = await Appointment.create({
      userId: originalAppointment.userId,
      followupOf,
      appointmentDate,
      timeSlot,
      doctorId: DoctorUserID?.userId || originalAppointment.doctorId, // fallback to original if not provided
      followupVisitNumber: totalFollowups + 1,
      status: status || "pending", // default status if not provided
      nextAction: "none",
    });

    return res.status(201).json({ success: true, data: followup });
  } catch (error) {
    console.error("Error creating follow-up appointment:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

const getFollowUps = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const { followupOf } = req.body;

    if (!followupOf) {
      return res.status(400).json({ message: "followupOf field is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(followupOf)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const followups = await Appointment.find({ followupOf })
      .populate({ path: "doctorId", select: "name" })
      .populate({ path: "userId", select: "fullname email" });
    console.log(followups);

    return res.status(200).json({ success: true, data: followups });
  } catch (error) {
    console.error("Error fetching follow-up appointments:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

const assignDoctorToAppointment = asyncHandler(async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { hairTestId, appointmentDate, timeSlot } = req.body;
    var doctorId = req.body.doctorId;

    // console.log("Parsed hairTestId:", hairTestId);
    // console.log("Parsed appointmentDate:", appointmentDate);
    // console.log("Parsed timeSlot:", timeSlot);
    // console.log("Parsed doctorId:", doctorId);

    if (!hairTestId || hairTestId === "") {
      console.error("hairTestId is missing or empty");
      throw new ApiError(400, "hairTestId is required and cannot be empty");
    }

    if (!doctorId || doctorId === "") {
      console.error("doctorId is missing or empty");
      throw new ApiError(400, "doctorId is required and cannot be empty");
    }

    // Fetch the appointment using hairTestId
    const appointment = await Appointment.findOne({ hairTestId });
    console.log("Appointment fetched:", appointment);
    if (!appointment) {
      console.error("Appointment not found for hairTestId:", hairTestId);
      throw new ApiError(404, "Appointment not found");
    }

    // Fetch doctor by ID
    const doctor = await Doctors.findById(doctorId);
    console.log("Doctor fetched:", doctor);
    if (!doctor) {
      console.error("Doctor not found for doctorId:", doctorId);
      throw new ApiError(404, "Doctor not found");
    }

    // Fetch user data for the doctor
    const doctorData = await User.findOne({ _id: doctor.userId });
    console.log("Doctor user data fetched:", doctorData);
    if (!doctorData) {
      console.error("User data not found for doctor userId:", doctor.userId);
      throw new ApiError(404, "User not found");
    }

    // Fetch user linked to appointment
    const user = await User.findOne({ _id: appointment.userId });
    console.log("User linked to appointment fetched:", user);
    if (!user) {
      console.error(
        "User not found for appointment userId:",
        appointment.userId
      );
      throw new ApiError(404, "User not found");
    }

    // Fetch hair test linked to appointment
    const hairTest = await HairTest.findOne({ _id: appointment.hairTestId });
    console.log("HairTest fetched:", hairTest);
    if (!hairTest) {
      console.error("HairTest not found for id:", appointment.hairTestId);
      throw new ApiError(404, "Hair Test not found");
    }

    console.log("Preparing WhatsApp notification payload");
    const whatsappPayload = {
      attr: null,
      name: doctorData.fullname,
      phone: doctorData.mobile?.toString(),
      campName: "doctor_message_Utility",
    };

    console.log("Sending WhatsApp notification with payload:", whatsappPayload);
    const notificationStatus = await WhatsappTextTemplate(whatsappPayload);
    console.log("WhatsApp notification status:", notificationStatus);

    if (!notificationStatus || !notificationStatus.success) {
      console.error("WhatsApp notification failed or not confirmed");
      throw new ApiError(400, "WhatsApp notification not confirmed");
    }

    // Update the appointment with assigned doctor and status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointment._id,
      {
        doctorId: doctorData._id,
        status: "assigned",
        appointmentDate,
        timeSlot,
      },
      { new: true }
    );

    console.log("Updated appointment:", updatedAppointment);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedAppointment,
          "Appointment assigned successfully"
        )
      );
  } catch (error) {
    console.error("Error assigning appointment:", error);
    throw new ApiError(400, error.message, error.message);
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid or missing orderId" });
    }

    const order = await orderModel
      .findOne({
        _id: orderId,
        deliveryStatus: {
          $in: ["processing", "shipped", "delivered", "canceled"],
        },
      })
      .populate("userId", "fullname")
      .populate("addressId", "fullAddress") // check spelling
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Simplify products to only include name of item
    const simplifiedProducts = order.products.map((p) => ({
      name: p.item?.name || "N/A",
    }));

    // Replace products in order with simplified version
    const simplifiedOrder = {
      ...order,
      products: simplifiedProducts,
    };

    // Fetch related appointments
    const orderAppointments = await Appointment.find({
      orderId,
      isDeleted: false,
      appointmentType: "prescription_only",
      status: { $in: ["assigned", "completed", "pending"] },
    })
      .populate("userId", "fullname")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          order: simplifiedOrder,
          appointments: orderAppointments,
        },
        "Order and appointments fetched successfully"
      )
    );
  } catch (error) {
    console.error("getOrderById error:", error);
    return res.status(500).json({
      message: "Failed to fetch order and appointments",
      error: error.message,
    });
  }
});

const deleteAdmin = asyncHandler(async (req, res) => {
  try {
    const { adminId } = req.body;

    // Check if trying to delete self
    if (req.user._id.toString() === adminId) {
      throw new ApiError(403, "Cannot delete your own admin account");
    }

    const result = await AdminService.deleteAdmin(adminId);

    return res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) {
    // Log the error for debugging (you can use your logging system)
    console.error("Admin deletion error:", error);

    // Handle different types of errors
    if (error instanceof ApiError) {
      throw error;
    } else if (error.name === "CastError" || error.name === "ValidationError") {
      throw new ApiError(400, "Invalid data provided");
    } else {
      throw new ApiError(500, "Failed to process admin deletion request");
    }
  }
});

const getMyProfile = asyncHandler(async (req, res) => {
  try {
    const admin = req.user;

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, admin, "Profile fetched successfully"));
  } catch (error) {
    console.error("getMyProfile error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch profile", error: error.message });
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
  //Fonix
  deleteDoctor,
  getMonthlyHairTestData,
  createFollowUp,
  getpatientData,
  assignDoctorForPrescription,
  createFollowupAppointment,
  getFollowUps,
  getOrderById,
  deleteAdmin,
  getMyProfile,
};
