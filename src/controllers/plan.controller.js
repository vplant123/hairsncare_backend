const Plan = require("../models/plan.model");

const addPlan = async (req, res) => {
    try {
        const { name, price, features } = req.body;


        const existingPlan = await Plan.findOne({ name });
        if (existingPlan) {
            return res.status(400).json({ message: "Plan with this name already exists" });
        }


        const plan = new Plan({
            name,
            price,
            features,
        });


        await plan.save();

        return res.status(201).json({ message: "Plan added successfully", plan });
    } catch (error) {
        console.error("Error adding plan:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    addPlan
};
