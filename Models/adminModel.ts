import mongoose, { Schema, Model } from "mongoose";

export interface IAdmin {
  username: string;
  password: string;
  // image?: string; // Add this line
}

interface IAminModel extends Model<IAdmin> {
  signup: (
    username: string,
    password: string
    // file:Express.Multer.File
  ) => Promise<IAdmin | any>;
  login: (username: string, password: string) => Promise<IAdmin | any>;
}
const Admin = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    // image: { // Add this line
    //   type: String,
    //   required: false,
    // },
  },
  { timestamps: true }
);

//create admin
Admin.statics.signup = async function (
  username: string,
  password: string
  // file: Express.Multer.File
): Promise<IAdmin | any> {
  //check input fields
  if (!username || !password) {
    throw Error("All fields are required");
  }

  // const fileurl=file.path
  //check if admin already exists
  const exists = await this.findOne({ username });
  if (exists) {
    throw Error("username already in use");
  }

  const newAdmin = await this.create({
    username,
    password,
    // image:fileurl
  });
  return newAdmin;
};

//login setup function
Admin.statics.login = async function (
  username: string,
  password: string
): Promise<IAdmin | any> {
  if (!username || !password) {
    throw Error("All fields are required");
  }
  const admin = await this.findOne({ username });

  if (!username) {
    throw Error("Incorrect username");
  }

  return admin;
};
export default mongoose.model<IAdmin, IAminModel>("Admin", Admin);
