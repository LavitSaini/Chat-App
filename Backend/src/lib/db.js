import {connect} from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGO_URI);
    console.log("Database Connected: ", conn.connection.host);
  } catch (error) {
    console.log("Database Connection Error: ", error);
  }
};
