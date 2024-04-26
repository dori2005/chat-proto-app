import errorLoggerMiddleware from "@middlewares/loggerMiddleware";
import { userService } from "@services/index";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
interface IError extends Error {
  statusCode: number;
}

const saveUserKey = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { pk, objectId } = req.body;
    const saveKey = await userService.saveUserKey(pk, objectId);
    res.status(201).json(saveKey);
  } catch (error: any) {
    errorLoggerMiddleware(error as IError, req, res);
    res.status(error.statusCode).json(error.message);
  }
});

const getUserKey = asyncHandler(async (req: Request, res: Response) => {
  try {
    const pk = req.query.pk as string;
    const objectId = req.query.objectId as string;
    const user = await userService.getUserKey(pk, objectId);
    res.status(201).json(user);
  } catch (error: any) {
    errorLoggerMiddleware(error as IError, req, res);
    res.status(error.statusCode).json(error.message);
  }
});

const signUpUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { nickname, email, password, pic } = req.body;
    const user = await userService.signUpUser(nickname, email, password, pic);
    res.status(201).json(user);
  } catch (error: any) {
    errorLoggerMiddleware(error as IError, req, res);
    res.status(error.statusCode).json(error.message);
  }
});

const signInUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userService.signInUser(email, password);
    res.status(200).json(user);
  } catch (error: any) {
    errorLoggerMiddleware(error as IError, req, res);
    res.status(error.statusCode).json(error.message);
  }
});

const getUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const keyword = req.query.search;
    const userId = req.user?._id;
    const users = await userService.getUsers(keyword, userId);
    res.status(200).json(users);
  } catch (error: any) {
    errorLoggerMiddleware(error as IError, req, res);
    res.status(error.statusCode).json(error.message);
  }
});
export default {
  saveUserKey,
  getUserKey,
  signUpUser,
  signInUser,
  getUsers,
};
