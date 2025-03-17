const mongoose = require("mongoose");

const connectDB = async () => {

    try {
        const connectionInstance = await mongoose.connect("mongodb+srv://hairsncares:Kz3o8JfxuxxQFHj7@hairsncares.d3wpd.mongodb.net/HairsNCare",
        );
        console.log(`\n MongoDB connected !! DB HOST :${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error", error)
        process.exit(1)

    }

}
module.exports = connectDB