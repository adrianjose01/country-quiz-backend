import { model, Model, Schema } from "mongoose";
import IUser from "../interfaces/IUser";

type UserModel = Model<IUser>;
const UserSchema = new Schema<IUser, UserModel>({
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  previousScore: {
    type: Number,
  },
  bestScore: {
    type: Number,
  },
});

export const User: UserModel = model<IUser, UserModel>("User", UserSchema);
