// const mongoose = require("mongoose")
// const User = require("./user.model");
// const { required, optional } = require("joi");
// const Schema = mongoose.Schema

// // const hairTestSchema = new Schema({
// //     personal: {
// //         name: {
// //             type: String,
// //             required: true,
// //             default: ""
// //         },
// //         email: {
// //             type: String,
// //             required: true,
// //             default: ""
// //         },
// //         mobile: {
// //             type: Number,
// //             required: true,
// //             default: ""
// //         },
// //         ageRange: {
// //             type: String,
// //             enum: ['15-25', '25-40', '40+'],
// //             required: true,
// //             default: ""
// //         },
// //         gender: {
// //             type: String,
// //             enum: ['male', 'female'],
// //             required: true,
// //             default: ""
// //         },

// //     },
// //     nutritional: {
// //         mealsPerDay: {
// //             type: String,
// //             enum: ['1', '2', '3', '4', 'fasting'],
// //             required: true,
// //             default: ""
// //         },
// //         intermittentFasting: {
// //             type: String,
// //             enum: ['yes', 'no'],
// //             required: function () {

// //                 return this.mealsPerDay === 'fasting';
// //             },
// //             default: "",
// //         },
// //         eatFruitAndSalad: {
// //             type: String,
// //             enum: ['yes', 'no'],
// //             required: true,
// //             default: ""
// //         },
// //         consumeFastFood: {
// //             type: String,
// //             enum: ['yes', 'no'],
// //             required: true,
// //             default: ""
// //         },
// //         eatingPattern: {
// //             type: String,
// //             enum: ['veg', 'non-veg', 'eggetarian', 'vegan'],
// //             required: true,
// //             default: ""
// //         },
// //         followingDietPlan: {
// //             type: String,
// //             enum: ['yes', 'no'],
// //             required: true,
// //             default: ""
// //         },
// //         dietPlanDetails: {
// //             type: String,
// //             enum: ['not sure', 'liquid diet', 'keto/low carb/paleo', 'vegan', 'raw food', 'high carb', 'any other'],
// //             default: "",
// //             required: function () {
// //                 return this.followingDietPlan === 'yes';
// //             }
// //         },
// //         hydrated: {
// //             type: String,
// //             enum: ['yes', 'no'],
// //             required: true,
// //             default: ""
// //         },
// //         foodAllergyConcern: {
// //             type: String,
// //             enum: ['yes', 'no'],
// //             required: true,
// //             default: ""
// //         },
// //         frequentInfections: {
// //             type: String,
// //             enum: ['yes', 'no'],
// //             required: true,
// //             default: ""
// //         },
// //         consumeSupplement: {
// //             type: [String],
// //             enum: ['whey protein', 'creatine', 'steroids', 'other', 'none'],
// //             required: true,
// //             default: []
// //         },
// //         vitaminDifficiency: {
// //             type: String,
// //             enum: ['yes', 'no', 'not sure'],
// //             required: true,
// //             default: ""
// //         },
// //         vitaminDeficiencyDetails: {
// //             type: String,

// //             required: function () {
// //                 return this.vitaminDifficiency === 'yes'
// //             },
// //             default: ""
// //         }

// //     },
// //     lifeStyle: {
// //         followPhysicalRoutine: {
// //             type: [String],
// //             enum: ['none', 'walking & jogging', 'strnuous Exercise', 'sports Activity', 'others'],
// //             required: true,
// //             default: ""

// //         },
// //         specifyPhysicalRoutine: {
// //             type: String,
// //             default: "",
// //             required: function () {
// //                 return this.followPhysicalRoutine === "others"
// //             }
// //         },
// //         describeSleep: {
// //             type: String,
// //             enum: ['normal', 'peaceful', 'disturbed', 'not able to describe'],
// //             required: true,
// //             default: ""
// //         },
// //         consumeAlcoholSmoking: {
// //             type: String,
// //             enum: ['yes', 'no', 'occasionally'],
// //             required: true,
// //             default: ""
// //         },
// //         spendTimeFriendAndFamily: {
// //             type: String,
// //             enum: ['yes', 'no', 'occasionally'],
// //             required: true,
// //             default: ""
// //         },
// //         constipation: {
// //             type: String,
// //             enum: ['yes', 'no', 'sometimes'],
// //             required: true,
// //             default: ""

// //         },
// //         hairCarePractice: {
// //             type: [String],
// //             enum: ['regular shampooing & conditioning', 'heat styling / tight hairstyle', 'chemical treatments /keratin', 'trimming /drying', 'none of these'],
// //             required: true,
// //             default: ""
// //         }


// //     },
// //     stress: {
// //         physicalExercise: {
// //             type: String,
// //             enum: ['not at all', 'sometimes', 'all the time'],
// //             required: true,
// //             default: ""
// //         },
// //         soundSleep: {
// //             type: String,
// //             enum: ['not at all', 'sometimes', 'all the time'],
// //             required: true,
// //             default: ""
// //         },
// //         healthyEating: {
// //             type: String,
// //             enum: ['not at all', 'sometimes', 'all the time'],
// //             required: true,
// //             default: ""
// //         },
// //         yogaMeditation: {
// //             type: String,
// //             enum: ['not at all', 'sometimes', 'all the time'],
// //             required: true,
// //             default: ""
// //         },
// //         positiveThinking: {
// //             type: String,
// //             enum: ['not at all', 'sometimes', 'all the time'],
// //             required: true,
// //             default: ""
// //         },
// //         socialMedicalSupport: {
// //             type: String,
// //             enum: ['not at all', 'sometimes', 'all the time'],
// //             required: true,
// //             default: ""
// //         },
// //         feelingAnxiousDepressed: {
// //             type: String,
// //             enum: ['not at all', 'sometimes', 'all the time'],
// //             required: true,
// //             default: ""
// //         },


// //     },
// //     hairAndScalpAssessment: {
// //         courseHairLoss: {
// //             type: String,
// //             enum: ["Acute", "chronic intermittent", "chronic persistent"],
// //             required: true,
// //             default: ""
// //         },
// //         hairLossRate: {
// //             type: String,
// //             enum: ["fast progressive", "slow progressive hair loss"],
// //             required: true,
// //             default: ""
// //         },
// //         HowLongExperiencingHairLoss: {
// //             type: String,
// //             enum: ["0-3 month", "upto 6 months", "more than 6 month"],
// //             required: true,
// //             default: ""

// //         },
// //         sheddingOfHair: {
// //             type: String,
// //             enum: ["upto 40 hair", "40 to 100 hair", "more than 100 hair"],
// //             required: true,
// //             default: ""
// //         },
// //         hairQuality: {
// //             type: [String],
// //             enum: ["normal", "dry hair", "brittle hair", "greasy hair/oily", "dull hair", "frizzy hair", "tangles easily & from knots", "split ends"],
// //             required: true,
// //             default: []
// //         },
// //         currentHairStatus: {
// //             type: String,
// //             enum: ["hair loss without thinning", "hair loss with thinning", "bald patches", "patchy hairloss", "scarring baldness", "not sure"],
// //             required: true,
// //             default: ""
// //         },

// //         pastHealthCondition: {
// //             type: [String],
// //             enum: ["normal", "typhoid", "malaria/dengue", "viral fever", "covid", "Accident/surgery", "other"],
// //             required: true,
// //             default: []
// //         },
// //         pastHealthConditionDetail: {
// //             type: String,
// //             default: "",
// //             required: function () {
// //                 return this.pastHealthCondition === "other"
// //             }
// //         },
// //         areaOfThinning: {
// //             type: String,
// //             enum: ["Mild thinning", "Moderate thinning", "Diffuso thinning"],
// //             require: function () {
// //                 return this.currentHairStatus === "hair loss with thinning"
// //             },
// //             default: ""
// //         },
// //         markGradeOfBaldness: {
// //             type: String,
// //             default: "",
// //             enum: ["1A", "1B", "1C", "1D", "2A", "2B", "3", "FRONTAL", "ADVANCE"],
// //             required: function () {
// //                 return this.currentHairStatus === "bald patches"
// //             }
// //         },
// //         hairLossPattern: {
// //             type: String,
// //             default: "",
// //             enum: ["a", "b", "c", "d", "e", "f", "Not sure upload photo"],
// //             required: function () {
// //                 return this.currentHairStatus === "patchy hairloss"
// //             },

// //         },
// //         decreasedHairlossOneyebrows: {
// //             type: String,
// //             default: "",
// //             enum: ["yes", "no"],
// //             required: function () {
// //                 return this.currentHairStatus === "patchy hairloss"
// //             },

// //         },
// //         mostSimilarMatchesWithYours: {
// //             type: String,
// //             default: "",
// //             enum: ["a", "b", "c", "d", "e", "f", "Not sure upload photo"],
// //             required: function () {
// //                 return this.currentHairStatus === "scarring baldness"
// //             }
// //         },





// //         havePCOD: {
// //             type: String,
// //             enum: ["not sure", "yes"],
// //             required: true,
// //             default: ""
// //         },
// //         menstrualCycle: {
// //             enum: ["yes", "no"],
// //             default: "",
// //             type: String,
// //             required: function () {
// //                 return this.havePCOD === "not sure"
// //             }
// //         },
// //         excessiveHairLoss: {
// //             enum: ["yes", "no"],
// //             default: "",
// //             type: String,
// //             required: function () {
// //                 return this.havePCOD === "not sure"
// //             }
// //         },
// //         struggleWithPregnancy: {
// //             enum: ["yes", "no"],
// //             default: "",
// //             type: String,
// //             required: function () {
// //                 return this.havePCOD === "not sure"
// //             }
// //         },
// //         haveAcne: {
// //             enum: ["yes", "no"],
// //             default: "",
// //             type: String,
// //             required: function () {
// //                 return this.havePCOD === "not sure"
// //             }
// //         },
// //         darkPatches: {
// //             enum: ["yes", "no"],
// //             default: "",
// //             type: String,
// //             required: function () {
// //                 return this.havePCOD === "not sure"
// //             }
// //         },
// //         signOfDepression: {
// //             enum: ["yes", "no"],
// //             default: "",
// //             type: String,
// //             required: function () {
// //                 return this.havePCOD === "not sure"
// //             }
// //         },


// //         signOfThryoid: {
// //             type: String,
// //             enum: ["not sure", "yes", "no"],
// //             required: true,
// //             default: ""
// //         },
// //         tickMarkHyperThyroidism1: {
// //             type: [String],
// //             enum: ["Nervousness", "Irritability", "Muscle Weakness", "Weight Loss", "Trouble Sleeping", "Enlarged Thyroid Gland", "Vision Problem", "Heat Sensitivity"],
// //             default: [],
// //             required: function () {
// //                 return this.signOfThryoid === "not sure"
// //             }
// //         },
// //         tickMarkHyperThyroidism2: {
// //             type: [String],
// //             enum: ["Weight Gain", "Fatigue", "Increase Sensitivity to Cold", "Constipation", "Hoarsense", "Muscle Weakness", "Depression", "Enlarged Thyroid Gland"],

// //             default: [],
// //             required: function () {
// //                 return this.signOfThryoid === "not sure"
// //             }
// //         },
// //         takingAnyMedication: {
// //             type: String,
// //             default: "",
// //             enum: ["yes", "no"],
// //             required: function () {
// //                 return this.signOfThryoid
// //             }
// //         },


// //         lowHaemoglobin: {
// //             type: String,
// //             enum: ["not sure", "yes", "no"],
// //             required: true,
// //             default: ""
// //         },
// //         ironDeficiency: {
// //             type: [String],
// //             default: [],
// //             enum: ["Fatigue", "Headache", "Yellowish skin", "Irregular Heartbeats", "Chest Pain", "Cold Hands", "Leg Cramps", "Disturbed Sleep"],
// //             required: function () {
// //                 return this.lowHaemoglobin === "not sure"
// //             }
// //         },


// //         experiencedSignificantHairLoss: {
// //             type: String,
// //             required: true,
// //             enum: ["yes", "no"],
// //             default: ""
// //         },
// //         anyMedicationCurrentlyBasis: {
// //             type: [String],
// //             default: [],
// //             enum: ["No", "Blood Pressure", "Diabetes", "Thyroid", "Vitamins", "Anti-psychotic", "Anti-convulsant", "Anti hormonal", "Blood Thinners", "Not Sure"],
// //             required: true,
// //         },

// //         medicationDetails: {
// //             type: String,
// //             default: "",
// //             required: function () {

// //                 return this.anyMedicationCurrentlyBasis.some(option => option !== "No");
// //             },
// //         },


// //         anyCoexistingIllnessesOrMedicalCondition: {
// //             type: [String],
// //             required: optional,
// //             enum: ["no", "blood pressure", "diabetes", "heart/liver disease", "other"],
// //             required: true,
// //             default: []
// //         },
// //         // TakingAnyMedication: {
// //         //     type: [String],
// //         //     required: true,
// //         //     enum: ["none", "blood pressure", "diabetes", "thyroid", "vitamins/Supplement/Steroids", "Antipsychotic", "Anticonvulsant", "Antihormonal", "blood thinners", "not sure"],
// //         //     required: true,
// //         //     default: ""
// //         // },
// //         specificScalpCondition: {
// //             type: String,
// //             required: true,
// //             enum: ["Normal", "Seborrhic Dermatitis", "Contact Dermatitis", "Psoriasis"],
// //             default: ""
// //         },
// //         haveDandruff: {
// //             type: String,
// //             enum: ["yes", "no"],
// //             required: true,
// //             default: ""
// //         },
// //         currentStatusDandruff: {
// //             type: "String",
// //             default: "",
// //             enum: ["Mild and Seasonal", "Moderate & Continuous", "Severe and thick"],
// //             required: optional,
// //         },
// //         haveGreyhair: {
// //             type: String,
// //             enum: ["yes", "no"],
// //             required: true,
// //             default: ""
// //         },
// //         hairComplaintsFamily: {
// //             type: String,
// //             required: true,
// //             enum: ["father side of the family", "mother side of the family", "both", "none"],
// //             default: ""
// //         },
// //         increaseHairLossAfterMedication: {
// //             type: String,
// //             enum: ["yes", "no"],
// //             required: true,
// //             default: ""
// //         },
// //         visitedDermatologistIn6Month: {
// //             type: String,
// //             enum: ["yes", "no"],
// //             required: true,
// //             default: ""
// //         },
// //         weightGainOrLoss: {
// //             type: String,
// //             required: true,
// //             enum: ["yes", "no"],
// //             default: ""
// //         },
// //         currentStateHair: {
// //             type: String,
// //             enum: ["straight", "wavy", "curly"],
// //             required: true,
// //             default: ""
// //         },
// //         boilsOnscalp: {
// //             type: String,
// //             required: true,
// //             enum: ["none", "wart on scalp", "haemangioma on the scalp", "boil on scalp", "seborrheic keratosis on scalp", "other"],
// //             default: ""

// //         },
// //         boilsOnscalpDetail: {
// //             type: String,
// //             default: "",
// //             required: function () {
// //                 return this.boilsOnscalp === "other"
// //             }
// //         },
// //         currentStateTexture: {
// //             type: String,
// //             enum: ["normal", "oily", "dry", "dry & flaky", "redness"],
// //             required: true,
// //             default: ""

// //         },
// //         DensityHair: {
// //             type: String,
// //             enum: ["normal", "decreased hair density"],
// //             required: true,
// //             default: ""
// //         },
// //         experiencingGradualFading: {
// //             type: String,
// //             required: true,
// //             enum: ["yes", "no"],
// //             default: ""
// //         },
// //         describeEyebrowsEyelashes: {
// //             type: String,
// //             required: true,
// //             default: "",
// //             enum: ["normal", "abnormal"]
// //         },
// //         around20and60: {
// //             type: String,
// //             default: "",
// //             enum: ["Skip Test", "Take Test"],
// //             required: optional

// //         },
// //         around20and60Detail: {
// //             type: String,
// //             default: "",
// //             enum: ["Positive", "Negative"],
// //             required: function () {
// //                 return this.around20and60 === "Take Test"
// //             }

// //         },
// //         combhairFor60: {
// //             type: String,
// //             enum: ["skip Test", "Take Test"],
// //             default: "",
// //             required: optional
// //         },
// //         observe: {
// //             type: String,
// //             default: "",
// //             enum: ["Upto 30", "Upto 30-60", "Above 60"],
// //             required: function () {
// //                 return this.combhairFor60 === "Take Test"
// //             }
// //         },
// //         hairBreakage: {
// //             type: String,
// //             default: "",
// //             enum: ["Yes", "No"],
// //             required: function () {
// //                 return this.combhairFor60 === "Take Test"
// //             }
// //         },


// //         hairGoals: {
// //             type: [String],
// //             enum: ["stop hair fall", "hair thickness", "cure baldness", "hair maintenance", "stop dandruff", "reduce greying", "soft,shine hair"],
// //             required: true,
// //             default: []

// //         },
// //         scalpImage: {
// //             type: String,
// //             required: optional,
// //             default: ""

// //         }

// //     },
// //     userId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: 'User',
// //         required: true
// //     }
// // })

// const HairTest = mongoose.model("HairTest", hairTestSchema)
// module.exports = HairTest  

// const mongoose = require("mongoose");

// const hairTestSchema = new mongoose.Schema({ anyField: 'Mixed' });

// const HairTest = mongoose.model("HairTest", hairTestSchema);

// module.exports = HairTest;

// const mongoose = require("mongoose");


// const HairTest = mongoose.model("HairTest", {});

// module.exports = HairTest;
const mongoose = require("mongoose");

const hairTestSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'pending'
    }
}, { strict: false });

const HairTest = mongoose.model("HairTest", hairTestSchema);

module.exports = HairTest;