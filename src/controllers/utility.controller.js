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
const homeModel = require("../models/home.model");
const expertiseModel = require("../models/expertise.model");
const aboutUsModel = require("../models/aboutUs.model");
const specialistsModel = require("../models/specialists.model");
const CustomerVideosModel = require("../models/CustomerVideos.model");
const planModel = require("../models/plan.model");
const contactScreenModel = require("../models/contactScreen.model");
const Config = require("../models/config.model");
const { default: mongoose } = require("mongoose");
const HairMen = require("../models/hairMen.model");
const HairWomen = require("../models/hairWomen.model");
const HairTransplant = require("../models/hairTransaplant.model");
const OnlineTest = require("../models/onlineTest.model");
const Dermatologist = require("../models/dermatologist.model");
const OtherProcedures = require("../models/OtherProcedures.model");

const getContent = asyncHandler(async (req, res) => {
  try {
    const homeData = await homeModel.find({});
    const expertiseData = await expertiseModel.find({});
    const aboutUsData = await aboutUsModel.find({});
    const specialistData = await specialistsModel.find({});
    const customerVideos = await CustomerVideosModel.find({});
    const plan = await planModel.find({});
    const contactus = await contactScreenModel.find({});
    const config = await Config.find({});

    const hairWomen = await HairWomen.find({});
    const hairMen = await HairMen.find({});
    const hairTransplant = await HairTransplant.find({});
    const onlineTest = await OnlineTest.find({});
    const dermatologist = await Dermatologist.find({});
    const otherProcedures = await OtherProcedures.find({});

    return res
      .status(200)
      .json(new ApiResponse(200, {home : homeData[0],
        expertise : expertiseData[0],
        specialist : specialistData[0],
        aboutUs : aboutUsData[0],
        customerVideos : customerVideos[0],
        plan:plan,contactus:contactus[0],
        config:config[0],
        hairWomen:hairWomen[0],
        hairMen:hairMen[0],
        hairTransplant:hairTransplant[0],
        onlineTest:onlineTest[0],
        dermatologist:dermatologist[0],
        otherProcedures:otherProcedures[0]      
      },"succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editHome = asyncHandler(async (req, res) => {
  try {

    let where = await homeModel.findOne({_id : new mongoose.Types.ObjectId('66be630af160573daaf0b0e4')});
    
    if(req.body?.section1) where["section1"] = req.body?.section1;
    if(req.body?.section2) where["section2"] = req.body?.section2;
    if(req.body?.section3) where["section3"] = req.body?.section3;
    if(req.body?.section4) where["section4"] = req.body?.section4;
    if(req.body?.section5) where["section5"] = req.body?.section5;
    if(req.body?.section6) where["section6"] = req.body?.section6;
    if(req.body?.section7) where["section7"] = req.body?.section7;
    if(req.body?.section8) where["section8"] = req.body?.section8;
    if(req.body?.section9) where["section9"] = req.body?.section9;
    if(req.body?.section10) where["section10"] = req.body?.section10;
    if(req.body?.section11) where["section11"] = req.body?.section11;
    if(req.body?.section12) where["section12"] = req.body?.section12;


    await where.save();

    // let data = {
    //   section1: {
    //     //home banner
    //     socialImg: [
    //       "https://res.cloudinary.com/drkpwvnun/image/upload/v1723709405/hair-assessment/xqwmcbbesgustacxsjov.png",
    //       "https://res.cloudinary.com/drkpwvnun/image/upload/v1723709472/hair-assessment/frtjkbsogangjmf7jayb.png",
    //     ],
    //     data: [
    //       {
    //         image:
    //           "https://res.cloudinary.com/drkpwvnun/image/upload/v1723709597/hair-assessment/ufdlrx1uisbqrrd5zfzu.png",
    //         title: "Witness a Remarkable",
    //         description: "Hair Growth In Just Few Months",
    //       },
    //       {
    //         image:
    //           "https://res.cloudinary.com/drkpwvnun/image/upload/v1723709631/hair-assessment/nneznmdheb7gktiiuk4j.png",
    //         title:
    //           "Unveil the power of Modern Medicine with AI-driven hair diagnostic tool to unlock effective Hair Growth secrets",
    //         description: "Witness remarkable outcomes in just few months!",
    //       },
    //     ],
    //   },
    //   section2: 
    //     //review number
    //     {
    //       num1: 50,
    //       num2: 5000,
    //       num3: 1000,
    //       num4: 100,
    //     },
    //   section3: [
    //     //review images
    //     {
    //       name: "Kanav Rishi",
    //       rating: "4",
    //       desc: "I am absolutely thrilled with the results I can't thank you enough for creating such fantastic products...",
    //       time: new Date(),
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723709902/hair-assessment/gzku6fyplwtyxlc5xfks.png",
    //     },
    //     {
    //       name: "Kanav Rishi",
    //       rating: "4",
    //       desc: "I am absolutely thrilled with the results I can't thank you enough for creating such fantastic products...",
    //       time: new Date(),
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723709902/hair-assessment/gzku6fyplwtyxlc5xfks.png",
    //     },
    //     {
    //       name: "Kanav Rishi",
    //       rating: "4",
    //       desc: "I am absolutely thrilled with the results I can't thank you enough for creating such fantastic products...",
    //       time: new Date(),
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723709902/hair-assessment/gzku6fyplwtyxlc5xfks.png",
    //     },
    //   ],

    //   section4: {
    //     //trust data
    //     title: "Why trust Hairs N Cares",
    //     desc: "Trust Hairsncares professionals for hair loss management because of their expertise, personalized care, and a proven track record of delivering effective solutions, ensuring your hair's health and your confidence.",
    //     data: [
    //       {
    //         icon: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723710058/hair-assessment/giyqmwlyepyztg4rqgks.png",
    //         text: "Expert Dermats",
    //       },
    //       {
    //         icon: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723710119/hair-assessment/bc6b8yedisdfgq6ovcan.png",
    //         text: "Total Care Approach",
    //       },
    //       {
    //         icon: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723710169/hair-assessment/sqhr3f4ujtqkczemf5r1.png",
    //         text: "Reliability",
    //       },
    //       {
    //         icon: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723710210/hair-assessment/pgbmm8htjxytzpid5nyi.png",
    //         text: "E-monitoring and Support",
    //       },
    //       {
    //         icon: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723710241/hair-assessment/wppa1ov81usx4zdsa9ct.png",
    //         text: "Proven Therapies",
    //       },
    //     ],
    //   },

    //   section5: [
    //     //publish data
    //     {
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723713848/hair-assessment/ndn8ajhznhxqrg6aane9.png",
    //     },
    //     {
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723713898/hair-assessment/b0zcydnafnmz19pfnety.jpg",
    //     },
    //     {
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723713922/hair-assessment/uftsyenjiovejq4l189z.png",
    //     },
    //     {
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723713944/hair-assessment/haamknhkn7dsxfwngemj.png",
    //     },
    //   ],

    //   section6: {
    //     //core principal data
    //     mainDes: "Core Principles for hair care",
    //     data: [
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714036/hair-assessment/zwuwczh7fwqtoo476ocu.png",
    //         title: "",
    //         desc: "Unlock the secrets to combat hair loss/thinning with dermatologist-recommended treatments, backed by proven efficacy and professional endorsement.",
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714087/hair-assessment/e1lwoxrygv12ta7jehvl.png",
    //         title: "",
    //         desc: "Healthy habits are a reflection of strong and vibrant hair.",
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714134/hair-assessment/sbarjwhjy2ehthbanh3x.png",
    //         title: "",
    //         desc: "The secret to healthy, lustrous hair.",
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714192/hair-assessment/taazmdmh0zmrmqd7jgez.png",
    //         title: "",
    //         desc: "Experience radiant hair growth with our stress management techniques.",
    //       },
    //     ],
    //   },

    //   section7: {
    //     //hair analysis data
    //     title: "Hair & Scalp Analysis",
    //     img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714298/hair-assessment/unfxghzdna6mltqyljlr.png",
    //     desc: "Experience a new era of AI-driven hair analysis tool, in synergy with skilled dermatologists, delivering personalized solutions for your hair.",
    //   },

    //   section8: {
    //     //hair blueprint data
    //     mainTitle: "Hair Rx blueprint",
    //     img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714363/hair-assessment/mqhkjdygmisb5uymudgt.png",
    //     title1: "Hair Health Analysis",
    //     title2: "HairsNCare Recommendation Plan",
    //     data: [
    //       {
    //         title: "Diagnosis details",
    //         desc: "",
    //       },
    //     ],
    //     subImg : "https://res.cloudinary.com/drkpwvnun/image/upload/v1723753166/hair-assessment/qnmcuz3eal6x0nithvgu.png",
    //   },

    //   section9: [
    //     //shipping data
    //     {
    //       name: "FREE SHIPPING",
    //       desc: "All orders above 2999",
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714549/hair-assessment/aopagnaf9nakngqcotgb.png",
    //     },
    //     {
    //       name: "15 DAYS RETURN",
    //       desc: "Money back Guarantee",
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714649/hair-assessment/daqo2ile796qrucyr5h1.png",
    //     },
    //     {
    //       name: "SECURE CHECKOUT",
    //       desc: "Protected by paypal",
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714672/hair-assessment/ba2x6t5kgibfqodigbuh.png",
    //     },
    //     {
    //       name: "GIFT COUPON",
    //       desc: "Assured gift",
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714694/hair-assessment/ekm9nmqahra8brwsfj0y.png",
    //     },
    //   ],

    //   section10: {
    //     title: "Before & After",
    //     data: [
    //       //before after data
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714876/hair-assessment/otozicyfs0wjy3vklqwf.png",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714909/hair-assessment/o4azwq0q2wyptweoomyf.png",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714932/hair-assessment/jm5bxbhngxr71wzti0ir.png",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714956/hair-assessment/ajealkrw31euiisr9aog.png",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723714978/hair-assessment/jfpyjh3oua40xgoi30ym.png",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715009/hair-assessment/w0rm7b93qrpmvnyeyczn.png",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715041/hair-assessment/ebrhnp1hzi3kcxwxhp3u.jpg",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715069/hair-assessment/nwkjcezzidi8u0qvs1gj.jpg",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715097/hair-assessment/ajwhdd2r37leisx2blul.jpg",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715120/hair-assessment/jb9x6uixpbzes1ygxv0m.jpg",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715208/hair-assessment/tlwsr19gor3ztgcogug3.jpg",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715227/hair-assessment/dugppxkmgzusxwvkzvro.jpg",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715272/hair-assessment/ns6t6mksmf6fob4svmn1.jpg",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715299/hair-assessment/wlufxrlig7heg3wzvma3.jpg",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715321/hair-assessment/ndofm5mewsdwvgp1mbza.jpg",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715355/hair-assessment/fw2jgo7u83veswtg20gy.jpg",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715387/hair-assessment/zzurjfept8hpqvhazl69.jpg",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715469/hair-assessment/aeq5pcubcocgdavejqbf.jpg",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715484/hair-assessment/gcikb6u2q48xmaofm39u.jpg",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715498/hair-assessment/aay5oupioyzqfeolefxp.jpg",
    //       },
    //       {
    //         img1: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715512/hair-assessment/dmuqsdl1uvpijty4cllr.jpg",
    //         img2: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715524/hair-assessment/qw9eeo3g16l8tchtevqv.jpg",
    //       },
    //     ],
    //   },

    //   section11: [
    //     //video data
    //     {
    //       url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715894/hair-assessment/skhlcdrml6yxysrkys16.jpg",
    //       youtube:
    //         "https://www.youtube.com/embed/i3JI37i0w1U?si=JUs7JMUIn8N3FoCv&amp;controls=0",
    //     },
    //     {
    //       url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715923/hair-assessment/h4kfqvja043ywjcv5r0w.jpg",
    //       youtube:
    //         "https://www.youtube.com/embed/Bo-2FVfaQEk?si=XdrMnN3-SA-FO2T6&amp;controls=0",
    //     },
    //     {
    //       url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715949/hair-assessment/fsdluopbw7tdxvwowcim.jpg",
    //       youtube:
    //         "https://www.youtube.com/embed/Ii5u6eqMs1A?si=Tfa24tE_-_FwCvWa&amp;controls=0",
    //     },
    //     {
    //       url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715968/hair-assessment/jlktrk2blrgb6hs3znxs.jpg",
    //       youtube:
    //         "https://www.youtube.com/embed/Qz2djE-XT48?si=xNPg9wSf10sLnN13&amp;controls=0",
    //     },
    //     {
    //       url: "./slide4.jpg",
    //       youtube:
    //         "https://res.cloudinary.com/drkpwvnun/image/upload/v1723715988/hair-assessment/mvqomqvl1pngwohoaiac.jpg",
    //     },
    //   ],
    // };

    // const homeData = await homeModel.create(data);
    // await where.save()
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully", where));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});


const editExpertise = asyncHandler(async (req, res) => {
  try {
    let where1 = await expertiseModel.findOne({ _id: new mongoose.Types.ObjectId('66c184519eb150caf2b0cc7e')});

    if (req.body?.section1) where1["section1"] = req.body?.section1;
    if (req.body?.section2) where1["section2"] = req.body?.section2;
    if (req.body?.section3) where1["section3"] = req.body?.section3;
    if (req.body?.section4) where1["section4"] = req.body?.section4;
    if (req.body?.section5) where1["section5"] = req.body?.section5;
    if (req.body?.section6) where1["section6"] = req.body?.section6;
    if (req.body?.section7) where1["section7"] = req.body?.section7;

    await where1.save();

    // let data = {
    //   section1: {
    //     //expertise banner
    //     image:
    //       "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910160/hair-assessment/qik6fvjtrjigmkajexfa.png",
    //     title: "OUR EXPERTISE",
    //     description: "HAVE EXPERT ADVICE FROM OUR PROFESSIONAL TEAM",
    //   },
    //   section2:
    //     //des number
    //     {
    //       num1: "While medications have their place in treating hair loss, they may not always provide satisfactory results, especially for individuals with advanced hair loss or those seeking a permanent solution.",
    //       num2: "We have a comprehensive range of services for individuals seeking to address hair loss and restore hair growth, utilizing advanced techniques and technologies tailored to meet each client's needs.",
    //     },

    //   section3: {
    //     //Hair Transplant data
    //     title: "Hair Transplant",
    //     data: [
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910412/hair-assessment/uzf6a4dz69ay0gndopoq.png",
    //         title: "MHI",
    //         desc: "Modified Hair Implantation (MHI) is a patented hair transplant treatment exclusively developed through extensive research and development. MHI represents a ground-breaking innovation in the field of hair regrowth. It is a combination of - Advance Hair Transplant, - Enriched Platelet Rich Plasma (EPRP) Therapy - Along With addition of Patented Specific Growth Factors"
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910466/hair-assessment/evlo0oweyb6ka3oon0sd.png",
    //         title: "MHI+",
    //         desc: "Introducing enhanced MHI hair transplant technique, now elevated with our exclusive V-thread technology, a groundbreaking innovation pioneered by us and introduced for the first time in India. Exclusively offered at our Vplant centers"
    //       },
    //     ],
    //   },

    //   section4: {
    //     //Hair Loss Procedures data
    //     title: "Hair Loss Procedures",
    //     data: [
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910733/hair-assessment/duvxj3p9dvsxrl6dslry.png",
    //         title: "v- Grow",
    //         desc: "Introducing our latest, tailor-made solution meticulously crafted by the Vplant team to address severe hair fall and thinning hair concerns. V GROW HAIR REVIVE TREATMENT is specifically formulated to not only combat hair loss but also promote post-hair transplant growth. This holistic approach Combining growth factors, platelet-rich plasma, and low-level laser therapy for enhanced absorption and scalp circulation. This holistic approach enhances ingredient absorption and boosts scalp blood circulation for optimal results"
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910759/hair-assessment/iva3mceusvwvw3gkshs4.png",
    //         title: "Biotin Prp",
    //         desc: "Biotin PRP, short for Biotin Platelet-Rich Plasma, is a specialized hair restoration treatment that combines the benefits of biotin supplementation with platelet-rich plasma therapy"
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910791/hair-assessment/c5i8xl3l8njrwcwogvmp.png",
    //         title: "GFC",
    //         desc: "GFC treatment is a Growth Factor Concentrate therapy that stimulates hair follicles for natural hair regrowth."
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910819/hair-assessment/ib1cclakfcbjf4s3qs8u.png",
    //         title: "Stem Cell",
    //         desc: "Stem cell therapy for hair loss involves using stem cells, which have the ability to regenerate and repair tissues, to promote hair growth."
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910851/hair-assessment/tbd6uccainiahkpqjh3w.png",
    //         title: "QR678",
    //         desc: "QR678 is a patented hair growth formulation developed to address various types of hair loss. This treatment involves the injection of a proprietary blend of growth factors, peptides, vitamins, and other nutrients directly into the scalp."
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910879/hair-assessment/danmrxohvxvlpkhnqxu3.png",
    //         title: "LASERGROW",
    //         desc: "LASERGROW is a non-invasive treatment for hair loss and thinning hair. It involves the use of low-level laser devices or light-emitting diodes (LEDs) to deliver specific wavelengths of light to the scalp."
    //       },
    //     ],
    //   },

    //   section5: {
    //     //Hair Transplant data
    //     title: "Other Procedures:",
    //     data: [
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723910993/hair-assessment/mhoxgvaxoafwkzuflxtm.png",
    //         title: "VCOVER (Scalp Micropigmentation)",
    //         desc: "Scalp micro pigmentation offers a transformative grooming solution for both men and women, without the need for surgery or invasive procedures. Using natural pigments applied at the scalp's cuticular level, it precisely replicates the appearance of real follicles, tailored to match your unique hair loss pattern and desired aesthetic"
    //       },
    //       {
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723911023/hair-assessment/v1ys9gbejucwe5b5mu3k.png",
    //         title: "VFIX",
    //         desc: "VFIX offers personalized hair replacement solutions for men, ensuring a completely natural look. Say goodbye to hair loss or alopecia with confidence, thanks to our tailored approach."
    //       },
    //     ],
    //   },

    //   section6: {
    //     //main: data
    //     img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723911056/hair-assessment/z94a6exst1ldzmhrcxiq.png",
    //   },

    //   section7: [
    //     //footer desc data
    //     {
    //       title: "Education & Confidence Boosting",
    //       desc: "Hair counsellors educate on hair care, restore confidence, provide emotional support and guide suitable product selection to address self-esteem impacted by hair concerns.",
    //     },
    //     {
    //       title: "Assessment",
    //       desc: "They assess the client's hair type, texture, condition, and overall health to determine the underlying causes of any issues. This assessment helps in tailoring appropriate recommendations",
    //     },
    //     {
    //       title: "Recommendations & Product Knowledge",
    //       desc: "Hair counsellors offer personalized advice, including product suggestions, treatments, and styling methods aligned with clients' preferences, leveraging up-to-date knowledge of hair care advancements.",
    //     },
    //     {
    //       title: "Hair Health & Styling Guidance",
    //       desc: "Hair counsellors offer styling guidance for desired looks and provide insights into hair loss causes and solutions, coordinating with the medical professionals for better hair care needs.",
    //     },
    //     {
    //       title: "Follow-Up",
    //       desc: "Depending on the situation, hair counsellors might have follow-up sessions with clients to track progress, make adjustments to recommendations, and provide ongoing support. Role of a hair counsellor involves a combination of hair expertise, communication skills, and empathy to help clients achieve healthier, more attractive hair and boost their overall self-image.",
    //     },
    //   ],
    // };

    // const homeData = await expertiseModel.create(data);
    // await where.save()
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editAboutUs1 = asyncHandler(async (req, res) => {
  try {
    let {id} = req.body;
    let where1 = await aboutUsModel.findOne({ _id: new mongoose.Types.ObjectId('66c18ecedd9b98696ebc3957') });
    if (req.body?.section1) where1["section1"] = req.body?.section1;
    if (req.body?.section2) where1["section2"] = req.body?.section2;
    if (req.body?.section3) where1["section3"] = req.body?.section3;
    if (req.body?.section4) where1["section4"] = req.body?.section4;
    if (req.body?.section5) where1["section5"] = req.body?.section5;
    if (req.body?.section6) where1["section6"] = req.body?.section6;


    await where1.save();

    // let data = {
    //   section1: {
    //     //expertise banner
    //     image: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723923458/hair-assessment/alswzwlddafpwuoqtz5j.png",
    //     title: "ABOUT US",
    //     description: "HAVE EXPERT ADVICE FROM OUR PROFESSIONAL TEAM",
    //   },
    //   section2:
    //     //des number
    //     {
    //       img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723923552/hair-assessment/eqlz4t4qgtbgchhycep0.jpg",
    //       title: "Welcome to HairsNCares",
    //       shortDesc: "At Hairsncares, we believe that healthy, lustrous, beautiful hair is a reflection of overall well-being.",
    //       longDesc: "We understand the emotional impact that hair loss and thinning can have on individuals. Our mission is to provide latest, effective, affordable solutions and support to help our clients regain their confidence as well as to restore their hair's vitality.We understand the emotional impact that hair loss and thinning can have on individuals. Our mission is to provide latest, effective, affordable solutions and support to help our clients regain their confidence as well as to restore their hair's vitality",
    //     },
  
    //   section3: {
    //     //Hair Transplant data
    //     title: "Our Journey",
    //     img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723923603/hair-assessment/tzpgbjvezgulclrvtgyb.png",
    //     data: [
    //       {
    //         title: "Personal Passion and Experience:",
    //         desc: "Hairsncares was inspired by the founder, Dr. Amit Agarkar's personal journey and his deep commitment to holistic hair care. As an esteemed Trichologist and Hair Transplant Surgeon in India, he sought effective and reliable solutions for his patients' hair care needs.",
    //       },
    //       {
    //         title: "Development of Advanced Solutions:",
    //         desc: "Dr. Agarkar's journey led to the creation of advanced and holistic hair care solutions with a strong track record of success. These solutions form the core of Hairsncares' offerings.",
    //       },
    //       {
    //         title: "Addressing the Gap:",
    //         desc: "Dr. Agarkar identified a significant gap in the availability of comprehensive resources and personalized guidance for individuals dealing with hair loss. He aimed to bridge this gap by establishing a platform that not only offers precise hair analysis but also tailors treatment plans to suit each individual's specific requirements.",
    //       },
    //       {
    //         title: "Creating a Team for Change:",
    //         desc: "With a shared vision to transform the approach to hair care, Dr. Amit Agarkar assembled a team of dedicated professionals, including renowned specialists in hair health. Together, they founded Hairsncares as a comprehensive resource and destination for individuals seeking expert guidance and proven solutions to combat hair loss and thinning.",
    //       },
    //     ],
    //   },
  
    //   section4: {
    //     img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723923759/hair-assessment/smxb7kpxarsyba9bnvgr.png",
    //     title: "Our Comprehensive Approach",
    //     desc: "At Hairsncares, we understand that every individual's hair health journey is unique. That's why we offer a seamless and convenient online hair test. With just a few simple steps, you can take the hair test on our website, providing us with valuable insights of your hair and scalp condition. Once you've completed the hair test, our advanced algorithm analyzes the data and generates a comprehensive report detailing your hair health status. This report forms the foundation of your personalized holistic treatment plan including medicine, diet, stress & lifestyle care designed to tackle hair loss or thinning effectively. To ensure the highest level of care and expertise, Hairsncares boasts a panel of esteemed doctors who specialize in hair health. These professionals have extensive experience in the hair care field and are at the forefront of the latest advancements in hair care. You have the option to opt for a virtual consultation with one of our hair expert doctors, allowing you to discuss your hair concerns in-depth and receive holistic personalized recommendations.",
    //   },
  
    //   section5: {
    //     //Hair Transplant data
    //     title: "Core Principles for Hair Loss/ Hair Thinning",
    //     data: [
    //       {
    //         title: "Modern Medicine",
    //         desc: "Unlock the secrets to combat hair loss/thinning with dermatologist-recommended treatments, backed by proven efficacy and professional endorsement.",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723923851/hair-assessment/wqtos5p2nzusczcnfjhb.png",
    //       },
    //       {
    //         title: "Balanced Diet",
    //         desc: "The secret to healthy, lustrous hair",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723923904/hair-assessment/bbw5lag1hhwr39k6tkuj.png",
    //       },
    //       {
    //         title: "Healthy Lifestyle",
    //         desc: "Healthy habits is a reflection of a strong and vibrant hair.",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723923959/hair-assessment/r6hkloffklq8bzf0zmsc.png",
    //       },
    //       {
    //         title: "Stress Management",
    //         desc: "Experience a radiant hair growth with our stress management techniques.",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723924012/hair-assessment/ilvf60ygd5czqeu3acfo.png",
    //       },
    //     ],
    //   },
  
    //   section6: {
    //     //Hair Transplant data
    //     title: "Our Commitment",
    //     desc: "At Hairsncares, we are committed to providing an empowering and supportive environment for our clients. Through our user-friendly website, individuals can easily take a hair test online, receive personalized analysis, and access expert treatment recommendations for their hair care journey. We offer the option of virtual consultations with our esteemed doctors, ensuring personalized attention and guidance throughout the process.\nWe are inspired by the success stories of our clients who have regained their confidence and transformed their lives through our comprehensive hair care programs. Hairsncares is dedicated to being the trusted companion on your path to healthier, fuller hair.\nWelcome to Hairsncares, where your hair health is our top priority. Together, let's unlock the secrets to radiant, thriving hair and embrace a life filled with confidence and vitality.",
  
    //     data: [
    //       {
    //         title: "Our Vision",
    //         desc: "To reach out to people across the world aspiring to have enhanced hair regrowth with better results and make it possible for them with our customized holistic treatment plans checking",
    //         icon: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723924145/hair-assessment/y28rrqf4o9iur0z7lizz.png",
    //       },
    //       {
    //         title: "Our Goal",
    //         desc: "To provide advance, affordable, result oriented hair care solutions and to cater clients worldwide checking",
    //         icon: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723924145/hair-assessment/y28rrqf4o9iur0z7lizz.png",
    //       },
    //     ],
    //   },
    // }
    // const homeData = await aboutUsModel.create(data);
    // await where.save()
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});


const editSpecialist = asyncHandler(async (req, res) => {
  try {
    let where1 = await specialistsModel.findOne({ _id: new mongoose.Types.ObjectId('66c184e278a36a3bc0370df5') });

    if (req.body?.section1) where1["section1"] = req.body?.section1;
    if (req.body?.section2) where1["section2"] = req.body?.section2;
    if (req.body?.section3) where1["section3"] = req.body?.section3;
    if (req.body?.section4) where1["section4"] = req.body?.section4;
    if (req.body?.section5) where1["section5"] = req.body?.section5;

    await where1.save();

    // let data =   {
    //   section1: {
    //     //expertise banner
    //     image: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723929438/hair-assessment/muzwngfxkiowp5ev82ii.png",
    //     title: "OUR SPECIALISTS",
    //   },
    //   section2:
    //     //des number
    //     [
    //       {
    //         title: "Experienced Team",
    //         desc: "Our experienced dermatologists specialize in hair care, offering tailored solutions for your hair needs. Trust us for the healthy, beautiful hair you deserve.",
    //       },
    //       {
    //         title: "Award Winning Approach:",
    //         desc: "Discover our award-winning holistic approach to hair loss management",
    //       },
    //       {
    //         title: "Hair Care Counselling:",
    //         desc: "Our experienced dermatologists specialize in hair care, offering tailored solutions for your hair needs. Trust us for the healthy, beautiful hair you deserve.",
    //       },
    //       {
    //         title: "Experienced Team",
    //         desc: "Our experienced dermatologists specialize in hair care, offering tailored solutions for your hair needs. Trust us for the healthy, beautiful hair you deserve.",
    //       },
    //     ],
  
    //   section3: {
    //     //Hair Transplant data
    //     name: "Dr Amit Agarkar",
    //     img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723958470/hair-assessment/idjyabv33ybecfhxx662.jpg",
    //     degree: "MBBS, MD FCPS, DDV Hair",
    //     specialist: "Transplant Surgeon, Trichologist Medical Director",
    //     experience: "15 Years",
    //     experitise: [
    //       "Trichology","Hair Transplant Surgeon","Dermato Surgery","Skin & Cosmetology"
    //     ],
    //     qualification: "MBBS from Government Medical College and Hospital, Nagpur in 2005 MD from Grant Medical College & J.J. hospital, Mumbai in 2010. FCPS & DDV from Grand Medical college & J.J. Hospital, Mumbai in 2010",
    //     association: "Dr. Amit Agarkar is a part of AHRS (association of hair restoration surgeons) & other such reputed hair restoration associations in India.",
    //     awards : ["https://res.cloudinary.com/drkpwvnun/image/upload/v1723957089/hair-assessment/umkrw2kk7ual46ynsoxx.png"]
    //   },
  
    //   section4: {
    //     title: "Our Team of Doctors",
    //     desc: "Introducing Our Esteemed Team of Doctors: Our team embodies a commitment to excellence, utilizing the latest advancements and a patient-centred approach to achieve your desired hair goals.",
    //   },
  
    //   section5: {
    //     //Hair Transplant data
    //     title: "HairsNcares Counsellors",
    //     desc: "Our team of skilled hair care counselors is here to provide personalized advice and solutions for all your hair needs. With a deep understanding of various hair types and concerns",
  
    //     data: [
    //       {
    //         desc: "Education & Confidence Boosting",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723957393/hair-assessment/hdo4enzlffn1sgr0zpgq.png",
    //       },
    //       {
    //         desc: "Resut Assessment",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723957358/hair-assessment/jhkaa7de44jkfrmv1bsg.png",
    //       },          {
    //         desc: "Recommedation & Product Knowledge",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723957336/hair-assessment/icvd6fi3y5yvglh7f6pv.png",
    //       },          {
    //         desc: "Hair Health and Style Guiding",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723957309/hair-assessment/nvdocpijjaqvvkxbqr4h.png",
    //       },          {
    //         desc: "Regular Follow-Up",
    //         img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1723957286/hair-assessment/cdjfwb2bk9pxoguw7ac7.png",
    //       },
    //     ],
    //   },
  
    // }
    // const homeData = await specialistsModel.create(data);
    // await where.save()
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editCustomerVideos = asyncHandler(async (req, res) => {
  try {

    if (req.body?.section1) {
      let where1 = await CustomerVideosModel.findOne({ _id:  new mongoose.Types.ObjectId('66c3c6bda058b2552a04ee0f') });
      where1["section1"] = req.body?.section1;
      await where1.save();
    }
    if (req.body?.plan == "1"){
      let {appPrice1,appPrice2,appPrice3,appPrice4} = req.body;
      if(appPrice1){
        let plan = await planModel.findOne({ name: "Local Plan" });
        plan.price = appPrice1;
        await plan.save()
      }
      if(appPrice2){
        let plan = await planModel.findOne({ name: "Premium Plan" });
        plan.price = appPrice2;
        await plan.save()
      }
      if(appPrice3){
        let plan = await Config.updateOne({ _id: new mongoose.Types.ObjectId("6714362ab526d76306f3c9e3") },{deliveryCharge: appPrice3});
        plan.deliveryCharge = appPrice3;
        console.log("sjorjf",plan,appPrice3)
        // await plan.save()
      }
      if(appPrice4){
        let plan = await Config.updateOne({ _id: new mongoose.Types.ObjectId("6714362ab526d76306f3c9e3") },{deliveryAmt: appPrice4});
        plan.deliveryAmt = appPrice4;
        console.log("sjorjf",plan,appPrice4)

        // await plan.save()
      }
    }



    // let data =   {
    //   section1: [{
    //     //expertise banner
    //     url : "https://res.cloudinary.com/drkpwvnun/image/upload/v1723877422/hair-assessment/lcevsc2trdmtoa95vegx.jpg",
    //     name : "Kamini Goutham",
    //     title: "Through pioneering research by skin care experts from India and Australia, Fair and Handsome, 'the Radiance Cream for Men' has developed a breakthrough",
    //     videoUrl: "https://www.youtube.com/embed/i3JI37i0w1U?si=JUs7JMUIn8N3FoCv&amp;controls=0",
    //   },
    //   {
    //     //expertise banner
    //     url : "https://res.cloudinary.com/drkpwvnun/image/upload/v1723877422/hair-assessment/lcevsc2trdmtoa95vegx.jpg",
    //     name : "Kamini Goutham",
    //     title: "Through pioneering research by skin care experts from India and Australia, Fair and Handsome, 'the Radiance Cream for Men' has developed a breakthrough",
    //     videoUrl: "https://www.youtube.com/embed/i3JI37i0w1U?si=JUs7JMUIn8N3FoCv&amp;controls=0",
    //   },
    //   {
    //     //expertise banner
    //     name : "Kamini Goutham",
    //     url : "https://res.cloudinary.com/drkpwvnun/image/upload/v1723877422/hair-assessment/lcevsc2trdmtoa95vegx.jpg",
    //     title: "Through pioneering research by skin care experts from India and Australia, Fair and Handsome, 'the Radiance Cream for Men' has developed a breakthrough",
    //     videoUrl: "https://www.youtube.com/embed/i3JI37i0w1U?si=JUs7JMUIn8N3FoCv&amp;controls=0",
    //   },
    //   {
    //     //expertise banner
    //     name : "Kamini Goutham",
    //     url : "https://res.cloudinary.com/drkpwvnun/image/upload/v1723877422/hair-assessment/lcevsc2trdmtoa95vegx.jpg",
    //     title: "Through pioneering research by skin care experts from India and Australia, Fair and Handsome, 'the Radiance Cream for Men' has developed a breakthrough",
    //     videoUrl: "https://www.youtube.com/embed/i3JI37i0w1U?si=JUs7JMUIn8N3FoCv&amp;controls=0",
    //   },
    //   {
    //     //expertise banner
    //     name : "Kamini Goutham",
    //     url : "https://res.cloudinary.com/drkpwvnun/image/upload/v1723877422/hair-assessment/lcevsc2trdmtoa95vegx.jpg",
    //     title: "Through pioneering research by skin care experts from India and Australia, Fair and Handsome, 'the Radiance Cream for Men' has developed a breakthrough",
    //     videoUrl: "https://www.youtube.com/embed/i3JI37i0w1U?si=JUs7JMUIn8N3FoCv&amp;controls=0",
    //   },
    // ]  
    // }
    // const homeData = await CustomerVideosModel.create(data);
    // await where.save()
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editContactUs = asyncHandler(async (req, res) => {
  try {
    let where1 = await contactScreenModel.findOne({ _id: new mongoose.Types.ObjectId("66e738acfb823b2b236f89aa") });

    if (req.body?.section1) where1["section1"] = req.body?.section1;
    if (req.body?.section2) where1["section2"] = req.body?.section2;
    if (req.body?.section3) where1["section3"] = req.body?.section3;


    await where1.save();

    // let data = {
    //   section1: {
    //     image: "https://res.cloudinary.com/drkpwvnun/image/upload/v1726429016/hair-assessment/wg6z5bglb3lvswqsejbu.png",
    //     title: "CONTACT US",
    //     description:"HAVE QUESTIONS OR FEEDBACK? WE ARE HERE TO HELP"
    //   },
    //   section2:
    //     {
    //       name: "HairsNCares",
    //       address: "101, Kane Plaza, Off Link Rd, near Carters Blue, Mindspace, Malad West, Mumbai, Maharashtra 400064 India",
    //       phone: "+91 9136028327",
    //       email: "hairsncares@gmail.com",
    //       time1: "Mon - Fri: 9AM - 7PM",
    //       time2: "Sat - Sun: 11AM - 4PM"
    //     },
  
    //   section3: {
    //     title: "How it works",
    //     img: "https://res.cloudinary.com/drkpwvnun/image/upload/v1726429127/hair-assessment/iyev0fqlfwvdbfbpxgp7.jpg",
    //     data: [
    //       {
    //         desc: "Complete online Hair test",
    //       },
    //       {
    //         desc: "Take a virtual consultation with Dermatologist",
    //       },
    //       {
    //         desc: "Get your detailed hair analysis report",
    //       },
    //       {
    //         desc: "Get a customised hair growth solution with lifestyle advice at your doorstep",
    //       },
    //     ],
    //   },
    // }

    // await contactScreenModel.create(data)
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});



const editHairWomen = asyncHandler(async (req, res) => {
  try {
    let where1 = await HairWomen.updateOne(
      { _id: new mongoose.Types.ObjectId("6759aab9bcf259ff7713bb3d") },req.body);

    // if (req.body?.section1) where1["section1"] = req.body?.section1;
    // if (req.body?.section2) where1["section2"] = req.body?.section2;
    // if (req.body?.section3) where1["section3"] = req.body?.section3;


    // await where1.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editHairMen = asyncHandler(async (req, res) => {
  try {
    let where1 = await HairMen.updateOne(
      { _id: new mongoose.Types.ObjectId("6759aa61256d05e84900ae41") },req.body);
    // await where1.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editHairTransplant = asyncHandler(async (req, res) => {
  try {
    let where1 = await HairTransplant.updateOne(
      { _id: new mongoose.Types.ObjectId("6759aace2fab323f747389ce") },req.body);
    // await where1.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editOnlineTest= asyncHandler(async (req, res) => {
  try {
    let where1 = await OnlineTest.updateOne(
      { _id: new mongoose.Types.ObjectId("6759aaf4d4c1c38daf400f12") },req.body);
    // await where1.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editDermatologist= asyncHandler(async (req, res) => {
  try {
    let where1 = await Dermatologist.updateOne(
      { _id: new mongoose.Types.ObjectId("6759ab098235221422062643") },req.body);
    // await where1.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});

const editOtherProcedures= asyncHandler(async (req, res) => {
  try {
    let where1 = await OtherProcedures.updateOne(
      { _id: new mongoose.Types.ObjectId("6759ab19eec202d7e2f01750") },req.body);
    // await where1.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Admin added succesffully"));
  } catch (error) {
    throw new ApiError(400, "Unable to add Admin", error.message);
  }
});








module.exports = {
    getContent,
  editHome,
  editExpertise,
  editAboutUs1,
  editSpecialist,
  editCustomerVideos,
  editContactUs,
  editHairWomen,
  editHairMen,
  editOnlineTest,
  editHairTransplant,
  editDermatologist,
  editOtherProcedures
};

