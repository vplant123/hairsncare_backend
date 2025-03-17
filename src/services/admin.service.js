const User = require('../models/user.model.js');
const ApiError = require('../utils/ApiError.js');
// const User = require("../models/user.model.js")
const { sendEmail } = require("../utils/nodemailer.util.js")
const CommonHelper = require("../utils/commonHelper.js")
const { paginate } = require("../utils/pagination.utils.js");
const Doctors = require('../models/doctor.model.js');
const orderModel = require('../models/order.model.js');
const Cart = require('../models/Cart.model.js');
const HairTest = require('../models/hairTest.model.js');
const AppointmentModel = require('../models/Appointment.model.js');

// const CommonHelper = require("../utils/commonHelper.js")   
// const { sendEmail } = require("../utils/nodemailer.util.js")

class AdminService { 
    createDoctor = async (data) => {  
        // const fullname = data.fullname;

        const generatePassword = (fullname) => {
            return fullname.replace(/\s/g, '') + "@2024";
        }
        const password = generatePassword(data.name);
        // console.log("...................", password)
        const hashPassword = await CommonHelper.hashPassword(password)

        console.log("hhhhhhhhhhhhhhhhhhhhhhhh", hashPassword)

        const createUser = {
            fullname : data?.name,
            email : data?.email,
            mobile : data?.phone,
            profileImage : data?.image,
            speciality : data?.specialist,
            description : data?.description,
            location : data?.address,
            password: hashPassword,
            role: "doctor"
        }
        console.log("ccccccccccccc", createUser)
        const doctor = await User.create(createUser);
        const doctorCreate = await Doctors.create({...data,userId : doctor?._id});


        console.log("---", doctor)
        await sendEmail(data.email, 'Login Credentials for Doctor Dashboard',
            `Your login credentials for the Doctor Dashboard are:\nEmail:
          ${data.email}\nPassword: ${password}`)

    }
    // getAllPatient = async (page = 1, limit = 3) => {
    //     return await paginate(User, { role: 'patient' }, page, limit);
    // }
    // getAllPatient = async (page = 1, limit = 10, filterOption) => {

    getAllPatient = async (data) => {
        let sort = {};
        console.log('Filter Option:', data.filterOption);

        if (data.filterOption === 'alphabetically') {
            sort.fullname = 1;
            console.log("sorted hai")
        } else if (data.filterOption === 'mostRecent') {
            sort.createdAt = -1;
        }
        console.log("sort", sort);

        const results = await User.find({ role: 'patient' });
        // const fullnames = results.data.map(item => item.fullname);
        // const dataa = fullnames.sort()
        // console.log("Sorted Results:", dataa);
        return results
    }

    getAllDoctors = async (page = 1, limit = 10, sortField, sortOrder) => {
        let sort = {};
        

        if (sortField && sortOrder) {
            sort[sortField] = sortOrder === 'asc' ? 1 : -1;
        }


        return await paginate(User, { role: 'doctor' }, page, limit, sort);
    }


   
    deleteuser = async (req) => {
        const { userId } = req.query;
        return await User.findByIdAndUpdate(userId, { isDeleted: true });
    }
    patientDeleteAppointment = async (req) => {
        const { orderId } = req.query;
        return await User.findByIdAndUpdate(orderId, { isDeleted: true });
    }
    addAdmin = async (data) => {
        const existedUser = await User.findOne({ email: data.email });
        if (existedUser) {
            throw new ApiError(409, "This email is already in use.");
        }
        const passwordHash = await CommonHelper.hashPassword(data.password);
        const user = await User.create({
            fullname: data.fullname,
            email: data.email,
            password: passwordHash,
            mobile: data.mobile,
            // profileImage: data.profileImage,
            // coverImage: data.coverImage,
            role: data.role,
            permission : data.permission

        });

        return user



    }
    updateAdmin = async (req) => {
        const { user } = req
        console.log("user", user)
        const data = req.body

        const adminUser = await User.updateOne({mobile : data?.mobile} ,data);
        console.log(",,,,,,,,,,,,,,,,,", adminUser)

        if (!adminUser) {
            throw new ApiError(404, "User not found");
        }

        return adminUser;

    }

    searchUsers = async (searchQuery, page = 1, limit = 10) => {
        let query = { role: 'patient' };

        if (searchQuery) {
            query.$or = [
                { 'fullname': { $regex: `${searchQuery}`, $options: 'i' } },
                { 'email': { $regex: `${searchQuery}`, $options: 'i' } }
            ];
        }

        const paginatedResults = await paginate(User, query, page, limit, { fullname: 1 });

        return paginatedResults;
    };
    searchDoctor = async (searchQuery, page = 1, limit = 10) => {
        let query = { role: 'doctor' };

        if (searchQuery) {
            query.$or = [
                { 'fullname': { $regex: `${searchQuery}`, $options: 'i' } },
                { 'email': { $regex: `${searchQuery}`, $options: 'i' } }
            ];
        }

        const paginatedResults = await paginate(User, query, page, limit, { fullname: 1 });

        return paginatedResults;
    };
    blockAndunblock = async (data) => {

        const user = await User.findById(data.userId)

        if (!user) {
            throw new ApiError('User not found');
        }
        user.status = !user.status;
        await user.save();
        return user
    };


    patientData = async () => {
        try {
          const patients = await User.find({role : "patient"}).sort({ createdAt: -1 }).lean();
          let response = []
          for (let index = 0; index < patients.length; index++) {
            const element = patients[index];

            let order = await orderModel.countDocuments({userId : element?._id,deliveryStatus : {$in : ["processing", "shipped","delivered"]},status : {$in : ["pending","paid"]}});
            let OrderAmtPaid =0 ;
            let orderData = await orderModel.find({userId : element?._id,status : "paid"})?.lean()
            orderData?.map((item) => {
                OrderAmtPaid += item?.amount
            });
            let cart = await Cart.findOne({userId : element?._id?.toString()});
            let hairTestPending = await AppointmentModel.countDocuments({paymentStatus: 'pending',userId : element?._id});
            let hairTestAmt = 0;
            let hairtestData = await AppointmentModel.find({paymentStatus: 'success',userId : element?._id}).select('amount')?.lean()
            hairtestData?.map((item) => {
                hairTestAmt += item?.amount
            });
            response.push({
                ...element,
                order,OrderAmtPaid,cart,hairTestAmt,hairTestPending,hairtestData
            })

          }
          return response;

        } catch (error) {
        console.log("yuuuu",error)
          return false;
        }
    };











}
module.exports = new AdminService()
