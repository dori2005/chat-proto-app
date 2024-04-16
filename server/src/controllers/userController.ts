import generateToken from "@configs/generateToken";
import errorLoggerMiddleware from "@middlewares/loggerMiddleware";
import User from "@src/models/userModel";
import userService from "@src/services/userService";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
const signUpUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { nickname, email, password, pic } = req.body;
    const user = await userService.signUpUser(nickname, email, password, pic);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    errorLoggerMiddleware(error as any, req, res);
  }
});

const signInUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      nickname: user.nickname,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const keyword = req.query.search
    ? {
        $or: [
          { nickname: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const user = await User.find(keyword).find({ _id: { $ne: req.user?._id } });
  res.json(user);
});
export default {
  signUpUser,
  signInUser,
  getUsers,
};
