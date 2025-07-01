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

const FollowUpModel = require("../models/followUpAppointments.model.js");
const LoginHistory = require("../models/loginHistory.model.js");
const cartModel = require("../models/Cart.model.js");
const paymentModel = require("../models/payment.model.js");
const addressModel = require("../models/userAddresses.model.js");

const addAdmin = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    // Call the service to add or update the admin user
    const adminResult = await AdminService.addAdmin(req.body);
    // Send successful response
    return res
      .status(201)
      .json(new ApiResponse(201, adminResult, "Admin added successfully"));
  } catch (error) {
    // If an error occurs, throw a custom ApiError
    return res
      .status(400)
      .json(new ApiError(400, "Unable to add admin", error.message));
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

const getallPatient = asyncHandler(async (req, res) => {
  try {
    console.log("[DEBUG] Getting all patients with query:", req.query);
    const { filterOption } = req.query;
    const data = {
      filterOption: filterOption,
    };

    console.log("[DEBUG] Calling AdminService.getAllPatient with data:", data);
    const result = await AdminService.getAllPatient(data);
    console.log("[DEBUG] Got result from AdminService.getAllPatient:", {
      patientCount: result?.length || 0,
      firstPatient: result?.[0]
        ? {
            id: result[0]._id,
            name: result[0].fullname,
            email: result[0].email,
          }
        : null,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Patients get successfully"));
  } catch (error) {
    console.error("[ERROR] getallPatient error:", error);
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

    if (req.body?.degree) result.degree = req.body?.degree;
    if (req.body?.experience) result.experience = req.body?.experience;
    if (req.body?.language) result.language = req.body?.language;
    if (req.body?.expertise) result.expertise = req.body?.expertise;
    if (req.body?.description) result.description = req.body?.description;
    if (req.body?.qualification) result.qualification = req.body?.qualification;
    if (req.body?.isSpec == false || req.body?.isSpec) {
      console.log("sjeojfoer", result.isSpec, req.body?.isSpec);
      result.isSpec = req.body?.isSpec;
    }
    if (req.body?.showOnDashboard)
      result.showOnDashboard = req.body?.showOnDashboard;

    result.awards = req.body?.awards;
    result.image = req.body?.image;
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
    console.log("Deleting doctor with ID:", id);

    // Find the doctor by ID first
    const doctor = await Doctors.findById(id);
    if (!doctor) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor not found"));
    }

    console.log("Found doctor:", {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      userId: doctor.userId,
    });

    // Delete the user associated with this doctor
    let deletedUser;
    if (doctor.userId) {
      // Try to delete by userId first
      deletedUser = await User.findByIdAndDelete(doctor.userId);
      console.log(
        "Deleted user by userId:",
        deletedUser ? "success" : "not found"
      );
    }

    // If user not found by userId, try by email
    if (!deletedUser && doctor.email) {
      deletedUser = await User.findOneAndDelete({ email: doctor.email });
      console.log(
        "Deleted user by email:",
        deletedUser ? "success" : "not found"
      );
    }

    // Delete the doctor record
    const result = await Doctors.findByIdAndDelete(id);
    if (!result) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor not found"));
    }

    console.log("Doctor deleted successfully");

    // Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Doctor deleted successfully"));
  } catch (error) {
    console.error("Error deleting doctor:", error);
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
    hsn,
  } = req.body;

  // Validation
  if (!name || !price || !description) {
    throw new ApiError(400, "Name, price, and description are required");
  }
  if (price < 0) {
    throw new ApiError(400, "Price must be non-negative");
  }
  if (discount && (discount < 0 || discount > 100)) {
    throw new ApiError(400, "Discount must be between 0 and 100");
  }
  if (stock && stock < 0) {
    throw new ApiError(400, "Stock must be non-negative");
  }
  if (gst && gst < 0) {
    throw new ApiError(400, "GST must be non-negative");
  }
  if (weight && weight < 0) {
    throw new ApiError(400, "Weight must be non-negative");
  }
  if (height && height < 0) {
    throw new ApiError(400, "Height must be non-negative");
  }
  if (width && width < 0) {
    throw new ApiError(400, "Width must be non-negative");
  }

  try {
    let isProductExist = await Product.findOne({ name: name });

    if (isProductExist) {
      throw new ApiError(409, "Product already exists"); // Changed to 409
    }

    let newProduct = {
      name,
      price,
      description,
      kit: kit || [],
      src: src || [],
      longDes: longDes || "",
      stock: stock || 0, // Default to 0 for consistency
      userReview: userReview || [],
      discount: discount || 0, // Default to 0
      shortDes,
      benefits,
      ingredient,
      highlights,
      benefitsMain,
      ingredientMain,
      faq,
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
      hsn,
    };
    let productCreate = await Product.create(newProduct);

    let productData = {
      data: [
        {
          Description: productCreate?.description,
          Product_Name: productCreate?.name,
          Product_Code: productCreate?._id,
          Unit_Price:
            parseFloat(productCreate?.price || 0) -
            parseFloat(productCreate?.price || 0) *
              (parseFloat(productCreate?.discount || 0) / 100),
          Tax: ["Sales Tax"],
          Product_Active: true,
          Taxable: true,
        },
      ],
    };

    try {
      let record = await zohoService.createRecord({
        module: "Products",
        reqData: productData,
      });
      let u = await Product.updateOne(
        { _id: productCreate?._id }, // Fixed from element?._id
        { zohoProductId: record?.data?.[0]?.details?.id?.toString() }
      );
      if (!u.modifiedCount) {
        throw new Error("Failed to update product with Zoho ID");
      }
      console.log("Zoho sync successful", u, record?.data?.[0]?.details?.id);
    } catch (error) {
      console.error("Zoho sync error:", error);
      // Revert MongoDB creation on Zoho failure
      await Product.deleteOne({ _id: productCreate?._id });
      throw new ApiError(
        500,
        "Failed to sync product with Zoho: " + error.message
      );
    }

    res.status(201).json({ message: "Product added successfully." });
  } catch (error) {
    console.error("Error adding product:", error);
    throw new ApiError(
      error.statusCode || 400,
      error.message || "Something went wrong"
    );
  }
});

const updateProductDetails = asyncHandler(async (req, res) => {
  const {
    _id,
    newName,
    newPrice,
    newDescription,
    category,
    subCategory,
    gst,
    expiryDate,
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
    hsn,
    faq,
  } = req.body;

  // Validation
  if (!_id) {
    throw new ApiError(400, "Product ID is required");
  }
  if (!newName || !newPrice || !newDescription) {
    throw new ApiError(400, "Name, price, and description are required");
  }
  if (newPrice && (isNaN(newPrice) || Number(newPrice) < 0)) {
    throw new ApiError(400, "Price must be a non-negative number");
  }
  if (stock && (isNaN(stock) || Number(stock) < 0)) {
    throw new ApiError(400, "Stock must be a non-negative number");
  }
  if (
    discount &&
    (isNaN(discount) || Number(discount) < 0 || Number(discount) > 100)
  ) {
    throw new ApiError(400, "Discount must be a number between 0 and 100");
  }
  if (gst && (isNaN(gst) || Number(gst) < 0)) {
    throw new ApiError(400, "GST must be a non-negative number");
  }
  if (weight && (isNaN(weight) || Number(weight) < 0)) {
    throw new ApiError(400, "Weight must be a non-negative number");
  }
  if (height && (isNaN(height) || Number(height) < 0)) {
    throw new ApiError(400, "Height must be a non-negative number");
  }
  if (width && (isNaN(width) || Number(width) < 0)) {
    throw new ApiError(400, "Width must be a non-negative number");
  }
  if (expiryDate) {
    const selectedDate = new Date(expiryDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    if (selectedDate < tomorrow) {
      throw new ApiError(400, "Expiry date must be at least tomorrow");
    }
  }

  try {
    let product = await Product.findById(_id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Update fields with type conversion
    if (newName !== undefined) product.name = newName;
    if (newPrice !== undefined) product.price = Number(newPrice);
    if (newDescription !== undefined) product.description = newDescription;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (gst !== undefined) product.gst = Number(gst);
    if (expiryDate !== undefined) product.expiryDate = new Date(expiryDate);
    if (kit !== undefined) product.kit = kit;
    if (src !== undefined) product.src = src;
    if (longDes !== undefined) product.longDes = longDes;
    if (stock !== undefined) product.stock = Number(stock);
    if (userReview !== undefined) product.userReview = userReview;
    if (discount !== undefined) product.discount = Number(discount);
    if (ingredient !== undefined) product.ingredient = ingredient;
    if (benefits !== undefined) product.benefits = benefits;
    if (highlights !== undefined) product.highlights = highlights;
    if (benefitsMain !== undefined) product.benefitsMain = benefitsMain;
    if (ingredientMain !== undefined) product.ingredientMain = ingredientMain;
    if (productDisplay !== undefined)
      product.productDisplay = Boolean(productDisplay);
    if (filter !== undefined) product.filter = filter;
    if (batchNo !== undefined) product.batchNo = batchNo;
    if (mfgName !== undefined) product.mfgName = mfgName;
    if (weight !== undefined) product.weight = Number(weight);
    if (height !== undefined) product.height = Number(height);
    if (width !== undefined) product.width = Number(width);
    if (metaTitle !== undefined) product.metaTitle = metaTitle;
    if (metaDesc !== undefined) product.metaDesc = metaDesc;
    if (metaSlug !== undefined) product.metaSlug = metaSlug;
    if (metaCanonical !== undefined) product.metaCanonical = metaCanonical;
    if (hsn !== undefined) product.hsn = hsn;
    if (faq !== undefined) product.faq = faq;
    await product.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, product, "Product details updated successfully.")
      );
  } catch (error) {
    console.error("Error updating product details:", error);
    throw new ApiError(400, error.message || "Something went wrong");
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

const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        deliveryStatus: {
          $in: ["processing", "shipped", "delivered", "canceled", "pending"],
        },
        orderType: "product Buy",
      })
      .populate({
        path: "userId",
        select: "fullname",
        options: { strictPopulate: false },
      })
      .populate({
        path: "addressId",
        select: "fullAddress",
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            [],
            "No orders found with the specified delivery statuses"
          )
        );
    }

    const ordersWithPrescriptions = [];

    for (const order of orders) {
      try {
        let appointments = [];
        try {
          appointments =
            (await Appointment.find({
              orderId: order._id,
            }).lean()) || [];
        } catch (appointmentError) {
          console.error(
            `Error fetching appointments for order ${order._id}:`,
            appointmentError
          );
          appointments = [];
        }

        const prescriptionDetails = [];

        for (const appointment of appointments) {
          try {
            const prescriptionData = {
              appointment: appointment,
            };

            if (appointment?._id) {
              const prescription = await Prescription.findOne({
                appointmentId: appointment._id.toString(),
              }).lean();

              if (prescription) {
                prescriptionData.prescription = prescription;
              }
            }

            prescriptionDetails.push(prescriptionData);
          } catch (prescriptionError) {
            console.error(
              `Error fetching prescription for appointment ${appointment?._id}:`,
              prescriptionError
            );
            prescriptionDetails.push({
              appointment: appointment,
              error: "Failed to fetch prescription",
            });
          }
        }

        ordersWithPrescriptions.push({
          ...order,
          prescriptionDetails:
            prescriptionDetails.length > 0
              ? prescriptionDetails
              : [
                  {
                    appointment: {
                      _id: "No appointments present",
                      status: "not available",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  },
                ],
        });
      } catch (orderError) {
        console.error(`Error processing order ${order._id}:`, orderError);
        ordersWithPrescriptions.push({
          ...order,
          prescriptionDetails: [
            {
              error: "Failed to process order details",
            },
          ],
        });
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          ordersWithPrescriptions,
          "Orders fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new ApiError(500, "Failed to fetch orders", error.message);
  }
});

const getCoupons = asyncHandler(async (req, res) => {
  try {
    const data = await CouponsModel.find(
      req.user.role === "admin" || "subadmin" ? {} : { isActive: true }
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
      name: user?.fullname, // Make sure this is correct; maybe user?.fullName?
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
    const data = req.body;
    console.log("Invoice Data:", data);

    let order = null;
    if (data.orderNumber) {
      const Order = require("../models/order.model");
      const userAddresses = require("../models/userAddresses.model");
      const CouponsModel = require("../models/Coupons.model");

      order = await Order.findOne({ orderNumber: data.orderNumber });

      if (order) {
        // Get address if missing
        if (!data.address || data.address === "") {
          if (order.addressId) {
            const addressDoc = await userAddresses.findById(order.addressId);
            if (addressDoc) {
              data.address = `${addressDoc.fullAdress} , ${addressDoc.city} , ${addressDoc.state} , ${addressDoc.pin}`;
            }
          }
        }

        // Get coupon discount from order if not provided in request
        if (!data.couponDiscount && order.coupon) {
          const coupon = await CouponsModel.findById(order.coupon);
          if (coupon && coupon.percent) {
            data.couponDiscount = coupon.percent;
          }
        }

        // Set userId from order
        if (order.userId) {
          data.userId = order.userId;
        }
      }
    }

    // Allowed fields at invoice level (updated for new model)
    const allowedInvoiceFields = [
      "name",
      "mobile",
      "email",
      "address",
      "date",
      "userId",
      "doctor",
      "paid",
      "paidAmt",
      "dues",
      "isActive",
      "orderId",
      "orderNumber",
      "orderDate",
      "couponDiscount",
      "paymentMode",
      "deliveryCharges",
      "notes",
      "adminNotes",
      "source",
      "currency",
      "exchangeRate",
    ];

    // Allowed fields at item level (updated for new model)
    const allowedItemFields = [
      "item",
      "quantity",
      "rate",
      "gst",
      "discount",
      "discountPercent",
      "batchNo",
      "stock",
      "expiryDate",
      "hsn",
      "mfgName",
      "sku",
      "productName",
      "weight",
      "dimensions",
    ];

    // Prepare invoice data by filtering allowed fields
    let invoiceData = allowedInvoiceFields.reduce((acc, key) => {
      if (data[key] !== undefined) acc[key] = data[key];
      return acc;
    }, {});

    let total = 0;
    let totalDiscount = 0;
    let totalGST = 0;
    let subtotal = 0;

    // Process each item
    invoiceData.items = (Array.isArray(data.items) ? data.items : []).map(
      (item) => {
        let cleanItem = allowedItemFields.reduce((acc, key) => {
          if (item[key] !== undefined) acc[key] = item[key];
          return acc;
        }, {});

        const rate = parseFloat(item.rate) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const discountPercent = parseFloat(item.discount) || 0;
        const gstPercent = parseFloat(item.gst) || 0;

        // Calculate item totals
        const discountAmount = (rate * discountPercent) / 100;
        const rateAfterDiscount = rate - discountAmount;
        const gstAmount = (rateAfterDiscount * gstPercent) / 100;
        const itemTotal = (rateAfterDiscount + gstAmount) * quantity;

        // Save item calculations
        cleanItem.total = itemTotal;
        cleanItem.discountAmount = discountAmount * quantity;
        cleanItem.gstAmount = gstAmount * quantity;

        // Accumulate totals
        subtotal += rate * quantity;
        total += itemTotal;
        totalDiscount += discountAmount * quantity;
        totalGST += gstAmount * quantity;

        return cleanItem;
      }
    );

    // Calculate delivery charge
    let deliveryCharge = total < 2000 ? 200 : 0;

    // Apply coupon discount

    // Set financial calculations
    invoiceData.subtotal = subtotal;
    invoiceData.total = total;
    invoiceData.totalGST = totalGST;
    invoiceData.totalDiscount = totalDiscount;
    invoiceData.deliveryCharges = deliveryCharge;
    let couponDiscountAmount = 0;
    if (data.couponDiscount) {
      couponDiscountAmount = (subtotal * data.couponDiscount) / 100;
    }
    invoiceData.couponDiscount = data.couponDiscountAmount || 0;
    invoiceData.totalAmount = total + deliveryCharge - couponDiscountAmount;
    invoiceData.paidAmt = invoiceData.totalAmount;

    // Set payment information
    invoiceData.paymentStatus = data.paymentStatus || "pending";
    if (data.paid) {
      invoiceData.paymentStatus = "paid";
      invoiceData.paymentDate = new Date();
    }
    invoiceData.transactionId = data.transactionId;

    // Set order status
    invoiceData.orderStatus = data.orderStatus || "pending";

    // Set shipping information
    if (data.shippingAddress) {
      invoiceData.shippingAddress = data.shippingAddress;
    } else if (data.address) {
      // Parse address string into shipping address object
      const addressParts = data.address.split(",").map((part) => part.trim());
      invoiceData.shippingAddress = {
        street: addressParts[0] || "",
        city: addressParts[1] || "",
        state: addressParts[2] || "",
        pincode: addressParts[3] || "",
        country: "India",
      };
    }

    // Set tax details
    // invoiceData.taxDetails = {
    //   cgst: totalGST / 2, // Assuming 50% CGST, 50% SGST
    //   sgst: totalGST / 2,
    //   igst: 0,
    //   totalTax: totalGST,
    // };

    // Set business information
    // invoiceData.gstNumber = data.gstNumber || "";
    // invoiceData.panNumber = data.panNumber || "";
    // invoiceData.shippingMethod = data.shippingMethod || "Standard Delivery";
    // invoiceData.trackingNumber = data.trackingNumber || "";

    // Set status history
    invoiceData.statusHistory = [
      {
        status: invoiceData.orderStatus,
        timestamp: new Date(),
        note: "Invoice created",
      },
    ];

    // Set default values for new fields
    invoiceData.source = data.source || "admin";
    invoiceData.currency = data.currency || "INR";
    invoiceData.exchangeRate = data.exchangeRate || 1;
    invoiceData.isDeleted = false;

    // Generate invoice number
    const sequence = await Invoices.countDocuments();
    invoiceData.invoiceNo = sequence + 1;

    // Save invoice to the database
    const invoice = await Invoices.create(invoiceData);

    return res
      .status(200)
      .json(new ApiResponse(200, invoice, "Invoice created successfully"));
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new ApiError(400, "Something went wrong", error.message);
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
    console.log("[DEBUG] Getting patient data for userId:", userId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid or missing userId");
    }

    const orders = await orderModel
      .find({ userId })
      .select("status createdAt totalAmount name products mode orderType")
      .populate("products.item", "name price")
      .lean();
    console.log("[DEBUG] Found orders:", orders.length);

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
    console.log("[DEBUG] Found appointments:", appointments.length);

    // Fetch prescriptions for userId without populate
    const prescriptions = await Prescription.find({ userId }).lean();
    console.log("[DEBUG] Found prescriptions:", prescriptions.length);

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

    // Fix: Use LoginHistory model instead of LoginModel
    console.log("[DEBUG] Querying login history with userId:", userId);
    const loginHistory = await LoginHistory.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    console.log(
      "[DEBUG] All login history entries:",
      loginHistory.map((entry) => ({
        entryId: entry._id,
        userId: entry.userId,
        status: entry.status,
        loginTime: entry.loginTime,
      }))
    );

    // Filter login history for the specific user
    const userLoginHistory = loginHistory.filter(
      (entry) => entry.userId && entry.userId == userId
    );
    console.log(
      "[DEBUG] Filtered login history for user:",
      userLoginHistory.length
    );

    const hairTests = await HairTest.find({ userId }).lean();
    console.log("[DEBUG] Found hair tests:", hairTests.length);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orders: trimmedOrders,
          prescriptions: enrichedPrescriptions,
          appointments,
          loginHistory: userLoginHistory,
          hairTests,
        },
        "Patient data fetched successfully"
      )
    );
  } catch (error) {
    console.error("[ERROR] getpatientData error:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const assignDoctorForPrescription = asyncHandler(async (req, res) => {
  try {
    const { orderId, doctorId, items } = req.body;
    console.log("[DEBUG] Assigning doctor:", {
      orderId,
      doctorId,
      itemsCount: items?.length,
    });

    if (!orderId || !doctorId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Missing or invalid data" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = order.userId;

    // Check if appointment already exists for this orderId
    const existingAppointment = await Appointment.findOne({ orderId });
    if (existingAppointment) {
      console.log(
        "[DEBUG] Appointment already exists:",
        existingAppointment._id
      );
      return res.status(200).json({
        success: true,
        message: "Appointment already exists for this order",
        data: existingAppointment,
      });
    }

    // Find and verify doctor
    const doctor = await Doctors.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Create Appointment with correct IDs
    const appointment = new Appointment({
      userId: userId, // Patient's user ID
      doctorId: doctor.userId, // Assuming doctor.userId stores the doctor's user ID
      orderId,
      appointmentDate: new Date(),
      timeSlot: "noon",
      status: "assigned",
      appointmentType: "prescription_only",
      prescriptionItems: items,
    });

    await appointment.save();
    console.log("[DEBUG] Created appointment:", appointment._id);

    return res.status(200).json({
      success: true,
      message: "Doctor assigned and appointment created successfully",
      data: appointment,
    });
  } catch (err) {
    console.error("[ERROR] Failed to assign doctor:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
});

const createFollowupAppointment = asyncHandler(async (req, res) => {
  const { followupOf, appointmentDate, timeSlot, doctorId, status } = req.body;

  // Validate inputs
  console.log(req.body);
  if (!followupOf || !mongoose.isValidObjectId(followupOf)) {
    return res.status(400).json({ message: "Valid followupOf is required" });
  }
  if (!appointmentDate || isNaN(new Date(appointmentDate))) {
    return res
      .status(400)
      .json({ message: "Valid appointmentDate is required" });
  }

  if (doctorId && !mongoose.isValidObjectId(doctorId)) {
    return res.status(400).json({ message: "Valid doctorId is required" });
  }

  // Find the original appointment
  const originalAppointment = await Appointment.findOne({
    hairTestId: followupOf,
  }).populate("userId doctorId");
  if (!originalAppointment) {
    return res.status(404).json({ message: "Original appointment not found" });
  }

  // Check for existing pending follow-up appointments
  const existingPendingFollowup = await Appointment.findOne({
    followupOf,
    status: { $ne: "completed" },
  });
  if (existingPendingFollowup) {
    return res.status(400).json({
      message:
        "Cannot create new follow-up until the previous one is completed",
    });
  }

  // Fetch doctor data if doctorId is provided, else use original appointment's doctor
  let doctor;
  if (doctorId) {
    doctor = await Doctors.findById(doctorId).populate(
      "userId",
      "fullname mobile"
    );
    if (!doctor || !doctor.userId) {
      return res
        .status(404)
        .json({ message: "Doctor or associated user not found" });
    }
  } else {
    doctor = await Doctors.findById(originalAppointment.doctorId).populate(
      "userId",
      "fullname mobile"
    );
    if (!doctor || !doctor.userId) {
      return res
        .status(404)
        .json({ message: "Doctor or associated user not found" });
    }
  }

  // Check doctor availability
  const conflictingAppointment = await Appointment.findOne({
    doctorId: doctor._id,
    appointmentDate,
    timeSlot,
    status: "assigned",
  });
  if (conflictingAppointment) {
    return res.status(409).json({
      message: "Doctor is already assigned to another appointment at this time",
    });
  }

  // Count total follow-ups
  const totalFollowups = await Appointment.countDocuments({ followupOf });

  // Create new follow-up appointment
  const followup = await Appointment.create({
    userId: originalAppointment.userId,
    followupOf,
    appointmentDate: new Date(appointmentDate),
    timeSlot,
    doctorId: doctor.userId,
    followupVisitNumber: totalFollowups + 1,
    status: status || "assigned",
    nextAction: "none",
  });

  // Send WhatsApp notification
  const whatsappPayload = {
    attr: null,
    name: doctor.userId.fullname,
    phone: doctor.userId.mobile?.toString(),
    campName: "doctor_message_Utility",
  };

  const notificationStatus = await WhatsappTextTemplate(whatsappPayload);
  if (!notificationStatus?.success) {
    console.error("WhatsApp notification failed:", notificationStatus);
  }

  return res.status(201).json({
    success: true,
    data: followup,
    message: "Follow-up appointment created successfully",
  });
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
      throw new ApiError(400, "Invalid or missing orderId");
    }

    const order = await orderModel
      .findOne({
        _id: orderId,
        deliveryStatus: {
          $in: ["processing", "shipped", "delivered", "canceled"],
        },
      })
      .populate("userId", "fullname")
      .populate("addressId")
      .populate("products.item")
      .lean();

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Fetch related appointments with doctor information
    const orderAppointments = await Appointment.find({
      orderId,
      isDeleted: false,
      appointmentType: "prescription_only",
      status: { $in: ["assigned", "completed", "pending"] },
    })
      .populate("userId", "fullname")
      .populate("doctorId", "fullname")
      .sort({ createdAt: -1 })
      .lean();

    // Get prescriptions for completed appointments
    const appointmentsWithPrescriptions = await Promise.all(
      orderAppointments.map(async (appointment) => {
        if (appointment.status === "completed") {
          const prescription = await Prescription.findOne({
            appointmentId: appointment._id,
          }).lean();

          return {
            ...appointment,
            prescription: prescription || null,
          };
        }
        return appointment;
      })
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          order,
          appointments: appointmentsWithPrescriptions,
        },
        "Order and appointments fetched successfully"
      )
    );
  } catch (error) {
    console.error("getOrderById error:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to fetch order and appointments"
    );
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

const deleteContactquery = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Contact query ID is required" });
    }

    const contactQuery = await contactUsModel.findById(id);
    if (!contactQuery) {
      return res.status(404).json({ message: "Contact query not found" });
    }

    await contactUsModel.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Contact query deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact query:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

const sendReport = asyncHandler(async (req, res) => {
  try {
    const { hairTestId } = req.query;

    if (!hairTestId) {
      return res
        .status(400)
        .json({ success: false, message: "hairTestId is required" });
    }
    console.log(hairTestId);
    const appointment = await Appointment.findOne({ hairTestId });

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    appointment.isReportSent = true;
    await appointment.save();
    console.log(appointment);
    return res.status(200).json({
      success: true,
      message: "Report sent successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error sending report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

const sendPrescription = asyncHandler(async (req, res) => {
  try {
    const { appointmentId } = req.query;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "appointmentId is required" });
    }
    console.log(appointmentId);
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    appointment.isReportSent = true;
    await appointment.save();
    console.log(appointment);
    return res.status(200).json({
      success: true,
      message: "prescription sent successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error sending report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

const sendOrderPrescription = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId is required" });
    }

    const appointment = await Appointment.findOne({
      orderId: orderId,
      appointmentType: "prescription_only",
    });
    console.log(appointment);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found for the given orderId",
      });
    }

    appointment.isReportSent = true;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Order prescription sent successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error sending order prescription:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

const updateFollowupdate = asyncHandler(async (req, res) => {
  try {
    const { appointmentId } = req.query;
    const { followUpDate } = req.body;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "appointmentId is required" });
    }
    console.log(appointmentId);
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    appointment.followUpDate = followUpDate;
    await appointment.save();
    console.log(appointment);
    return res.status(200).json({
      success: true,
      message: "followUpDate updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error sending report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

const deleteQuery = asyncHandler(async (req, res) => {
  try {
    // Find all patients
    const users = await User.find({ role: "patient" });

    // Collect patient user IDs for deletion
    const userIds = users.map((user) => user._id);

    // Delete only patient data from the User collection
    await User.deleteMany({ _id: { $in: userIds } });

    // Empty all other collections (delete all records)
    await Promise.all([
      LoginHistory.deleteMany({}),
      Appointment.deleteMany({}),
      Prescription.deleteMany({}),
      orderModel.deleteMany({}),
      HairTest.deleteMany({}),
      CouponsMappingModel.deleteMany({}),
      cartModel.deleteMany({}),
      paymentModel.deleteMany({}),
      addressModel.deleteMany({}),
      Invoices.deleteMany({}),
    ]);

    return res.status(200).json({
      success: true,
      message:
        "Patient data deleted and all other collections emptied successfully.",
    });
  } catch (error) {
    console.error("Error deleting query:", error);
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const deleteHairTests = asyncHandler(async (req, res) => {
  try {
    //elete only those HairTest records that do NOT have the 'createdAt' field
    const result = await HairTest.deleteMany({
      createdAt: { $exists: false },
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} HairTest records deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting HairTest records:", error);
    throw new ApiError(400, "Something went wrong", error.message);
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
  deleteContactquery,

  sendReport,
  sendPrescription,
  sendOrderPrescription,
  updateFollowupdate,
  deleteQuery,
  deleteHairTests,
};
