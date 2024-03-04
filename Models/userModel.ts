import mongoose, { ObjectId, Schema, Types, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  addresses: Types.Array<ObjectId>;
  orders: Types.Array<ObjectId>;
}
interface IUserModel extends Model<IUser> {
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<IUser | any>;
  login: (email: string, password: string) => Promise<IUser | any>;
}

const User = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);

//Signup setup function
User.statics.signup = async function (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<IUser | any> {
  //check input fields
  if (!firstName || !lastName || !email || !password) {
    throw Error("All fields are required");
  }
  //check email and pass validators
  if (!validator.isEmail(email)) {
    throw Error("Invalid email format");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }
  //check if user already exists
  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("username already exist, login instead");
  }
  //hash the password before creating user
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const newUser = await this.create({
    firstName,
    lastName,
    email,
    password: hash,
  });
  return newUser;
};

//login setup function
User.statics.login = async function (
  email: string,
  password: string
): Promise<IUser | any> {
  if (!email || !password) {
    throw Error("All fields are required");
  }
  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }
  return user;
};
export default mongoose.model<IUser, IUserModel>("User", User);
