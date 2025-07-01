const Order = require("../models/order.model");

const generateOrderNumber = async () => {
  try {
    // Get current date in YYYYMMDD format
    const today = new Date();
    const dateString =
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      today.getDate().toString().padStart(2, "0");

    // Store code (you can make this configurable)
    const storeCode = "PH01";

    // Get the latest order for today to determine the next serial number
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const latestOrder = await Order.findOne(
      {
        orderNumber: {
          $regex: new RegExp(`^ORD${dateString}${storeCode}-\\d+$`),
        },
      },
      {},
      { sort: { createdAt: -1 } }
    );

    let nextSerialNumber = 1;

    if (latestOrder && latestOrder.orderNumber) {
      // Extract the serial number from the latest order number
      const match = latestOrder.orderNumber.match(
        new RegExp(`^ORD${dateString}${storeCode}-(\\d+)$`)
      );
      if (match) {
        nextSerialNumber = parseInt(match[1]) + 1;
      }
    }

    // Format the serial number with leading zeros to ensure 6 digits
    const formattedSerialNumber = nextSerialNumber.toString().padStart(6, "0");
    const orderNumber = `ORD${dateString}${storeCode}-${formattedSerialNumber}`;

    return orderNumber;
  } catch (error) {
    console.error("Error generating order number:", error);
    // Fallback: generate based on timestamp if database query fails
    const today = new Date();
    const dateString =
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      today.getDate().toString().padStart(2, "0");
    const storeCode = "PH01";
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const fallbackNumber = timestamp.toString().slice(-3) + randomSuffix;
    return `ORD${dateString}${storeCode}-${fallbackNumber}`;
  }
};

module.exports = {
  generateOrderNumber,
};
