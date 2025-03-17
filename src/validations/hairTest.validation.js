const Joi = require("joi");

const createTest = {
    body: Joi.object({
        // userId: Joi.string().required(),
        personal: Joi.object({
            name: Joi.string().required().default(""),
            email: Joi.string().email().required().default(""),
            mobile: Joi.number().required().default(""),
            ageRange: Joi.string().valid('15-25', '25-40', '40+').required().default(""),
            gender: Joi.string().valid('male', 'female').required().default("")
        }),
        nutritional: Joi.object({
            mealsPerDay: Joi.string().valid('1', '2', '3', '4', 'fasting').required().default(""),

            eatFruitAndSalad: Joi.string().valid('yes', 'no').required().default(""),
            consumeFastFood: Joi.string().valid('yes', 'no').required().default(""),
            eatingPattern: Joi.string().valid('veg', 'non-veg', 'eggetarian', 'vegan').required().default(""),
            followingDietPlan: Joi.string().valid('yes', 'no').required().default(""),
            // dietPlanDetails: Joi.string().valid('not sure', 'liquid diet', 'keto/low carb/paleo', 'vegan', 'raw food', 'high carb', 'any other').when('followingDietPlan', {
            //     is: 'yes',
            //     then: Joi.required(),
            //     otherwise: Joi.optional()
            // }),
            hydrated: Joi.string().valid('yes', 'no').required().default(""),
            foodAllergyConcern: Joi.string().valid('yes', 'no').required().default(""),
            frequentInfections: Joi.string().valid('yes', 'no').required().default(""),
            consumeSupplement: Joi.array().items(Joi.string().valid('whey protein', 'creatine', 'steroids', 'other', 'none')).required().default(""),
            vitaminDifficiency: Joi.string().valid('yes', 'no', 'not sure').required().default(""),
            // vitaminDeficiencyDetails: Joi.string().when('vitaminDifficiency', {
            //     is: 'yes',
            //     then: Joi.required(),
            //     otherwise: Joi.optional()
            // })
        }),
        lifeStyle: Joi.object({
            followRoutinePhysical: Joi.array().items(Joi.string().valid('none', 'walking & jogging', 'strnuous Exercise', 'sports Activity', 'others')).required().default(""),
            describeSleep: Joi.string().valid('normal', 'peaceful', 'disturbed', 'not able to describe').required().default(""),
            consumeAlcoholSmoking: Joi.string().valid('yes', 'no', 'occasionally').required().default(""),
            spendTimeFriend: Joi.string().valid('yes', 'no', 'occasionally').required().default(""),
            constipation: Joi.string().valid('yes', 'no', 'sometimes').required().default(""),
            hairCarePractice: Joi.array().items(Joi.string().valid('regular shampooing & conditioning', 'heat styling / tight hairstyle', 'chemical treatments /keratin', 'trimming /drying', 'none of these')).required().default("")
        }),
        stress: Joi.object({
            physicalExercise: Joi.string().valid('not at all', 'sometimes', 'all the time').required().default(""),
            soundSleep: Joi.string().valid('not at all', 'sometimes', 'all the time').required().default(""),
            healthyEating: Joi.string().valid('not at all', 'sometimes', 'all the time').required().default(""),
            yogaMeditation: Joi.string().valid('not at all', 'sometimes', 'all the time').required().default(""),
            positiveThinking: Joi.string().valid('not at all', 'sometimes', 'all the time').required().default(""),
            socialMedicalSupport: Joi.string().valid('not at all', 'sometimes', 'all the time').required().default(""),
            feelingAnxiousDepressed: Joi.string().valid('not at all', 'sometimes', 'all the time').required().default("")
        }),
        hairAndScalpAssessment: Joi.object({
            courseHairLoss: Joi.string().valid("Acute", "chronic intermittent", "chronic persistent").required(),
            hairLossRate: Joi.string().valid("fast progressive", "slow progressive hair loss").required(),
            HowLongExperiencingHairLoss: Joi.string().valid("0-3 month", "upto 6 months", "more than 6 month").required(),
            sheddingOfHair: Joi.string().valid("upto 40 hair", "40 to 100 hair", "more than 100 hair").required(),
            hairQuality: Joi.string().valid("normal", "dry hair", "brittle hair", "greasy hair/oily", "dull hair", "frizzy hair", "tangles easily & from knots", "split ends").required(),
            currentHairStatus: Joi.string().valid("hair loss without thinning", "hair loss with thinning", "bald patches", "patchy hairloss", "scarring baldness", "not sure").required(),
            pastHealthCondition: Joi.string().valid("normal", "typhoid", "malaria/dengue", "viral fever", "covid", "Accident/surgery", "other").required(),
            havePCOD: Joi.string().valid("not sure", "yes").required(),
            signOfThryoid: Joi.string().valid("not sure", "yes", "no").required(),
            lowHaemoglobin: Joi.string().valid("not sure", "yes", "no").required(),
            experiencedSignificantHairLoss: Joi.string().valid("yes", "no").required(),
            anyCoexistingIllnessesOrMedicalCondition: Joi.array().items(Joi.string().valid("none", "blood pressure", "diabetes", "heart/liver disease", "other")).required(),
            TakingAnyMedication: Joi.array().items(Joi.string().valid("none", "blood pressure", "diabetes", "thyroid", "vitamins/Supplement/Steroids", "Antipsychotic", "Anticonvulsant", "Antihormonal", "blood thinners", "not sure")).required(),
            specificScalpCondition: Joi.string().valid("normal", "seborrhic dermatitis", "contact dermatitis", "psoriasis").required(),
            haveDandruff: Joi.string().valid("yes", "no").required(),
            haveGreyhair: Joi.string().valid("yes", "no").required(),
            hairComplaintsFamily: Joi.string().valid("father side of the family", "mother side of the family", "both", "none").required(),
            increaseHairLossAfterMedication: Joi.string().valid("yes", "no").required(),
            visitedDermatologistIn6Month: Joi.string().valid("yes", "no").required(),
            weightGainOrLoss: Joi.string().valid("yes", "no").required(),
            currentStateHair: Joi.string().valid("straight", "wavy", "curly").required(),
            boilsOnscalp: Joi.string().valid("none", "wart on scalp", "haemangioma on the scalp", "boil on scalp", "seborrheic keratosis on scalp", "other").required(),
            currentStateTexture: Joi.string().valid("normal", "oily", "dry", "dry & flaky", "redness").required(),
            DensityHair: Joi.string().valid("normal", "decreased hair density").required(),
            experiencingGradualFading: Joi.string().valid("yes", "no").required(),
            describeEyebrowsEyelashes: Joi.string().valid("normal", "abnormal").required(),
            hairGoals: Joi.string().valid("stop hair fall", "hair thickness", "cure baldness", "hair maintenance", "stop dandruff", "reduce greying", "soft,shine hair").required(),
            scalpImage: Joi.string()
        })
    })
};


module.exports = {
    createTest
}