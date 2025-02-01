import { NextFunction, Request, Response } from "express";
import AuthService from "../services/authService";
import otpService from "../services/otpService";
import UserModel from "../models/User";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwtUtils";
import { CandidateData, IUser } from "../types/authTypes";
import { handleFileUpload } from "../utils/formidable";
import { validateRole } from "../utils/roleValidate";
import { STATUS_CODES } from "../utils/statusCode";
import { IAuthController } from "../types/controllerinterface";

class AuthController implements IAuthController {
  private authService: AuthService;
  private otpServiceInstance: otpService;

  constructor() {
    this.authService = new AuthService();
    this.otpServiceInstance = new otpService();
  }

  private setRefreshToken(res: Response, refreshToken: string) {
    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userData } = req.body;
      if (!userData) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Userdata is required for signup" });
        return;
      }
      const roleValidation = validateRole(userData.role);
      if (!roleValidation.valid) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
        return;
      }
      const user = await this.authService.register(userData);
      res.status(STATUS_CODES.CREATED).json(user);
    } catch (error) {
      next(error);
    }
  };

  public candidateDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const uploadResponse = await handleFileUpload(req);
      const userId = req.user?.userId;
      if (!userId) {
         res.status(STATUS_CODES.CREATED).json({ message: "Authentication required" });
        return
        }
      const { profilePicture, resumeFile } = uploadResponse.fileNames;
      const userData: { userId?: string; data?: string } = uploadResponse.fields || {};
      if (!userData.data) {
         res.status(STATUS_CODES.BAD_REQUEST).json({ message: "No data provided for update" });
         return
      }
      let parsedData: CandidateData;
      try {
        parsedData = JSON.parse(userData.data) as CandidateData;
      } catch (error) {
        return next(error);
      }
      const user = await UserModel.findById(userId);
      if (!user) {
         res.status(STATUS_CODES.NOT_FOUND).json({ message: "User not found" });
         return
      }
      const userResume = user.resume || [];
      const newResume = uploadResponse.fileNames?.resumeFile || [];
      const mergedResume = Array.isArray(userResume) ? userResume : [userResume];
      const newResumeArray = Array.isArray(newResume) ? newResume : [newResume];
      const mergedResumes = [...new Set([...mergedResume, ...newResumeArray])].filter(Boolean);
      const updatePayload: Partial<IUser> = {
        profilePicture,
        resume: mergedResumes,
        experience: parsedData.experience,
        languages: parsedData.languages,
        location: parsedData.location,
        aboutMe: parsedData.aboutMe,
        education: parsedData.education,
        dateOfBirth: parsedData.dateofbirth,
        gender: parsedData.gender,
        skills: parsedData.skills,
      };
      const updatedUser = await this.authService.updateUser(userId, updatePayload);
       res.status(STATUS_CODES.OK).json({
        message: "User updated successfully!",
        updatedUser,
        profilePicture,
      });
      return
    } catch (error) {
      return next(error);
    }
  };

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { query } = req.body;
    try {
      const result = await this.authService.searchService(query as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('in createpost')
      const uploadResponse = await handleFileUpload(req);
      const { text, background, role, postImage } = uploadResponse.fields || {};
      if (!text?.[0] || !role?.[0]) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          message: "Missing required fields",
          received: { text: text?.[0], role: role?.[0] },
        });
        return;
      }
      const roleValidation = validateRole(role[0]);
      if (!roleValidation.valid) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Role not valid" });
        return;
      }
      const userId = req.user?.userId;
      const postData = {
        text: text[0],
        background: background?.[0] || "",
        image: uploadResponse.fileNames?.postImage,
        files: uploadResponse.fileNames || {},
      };
      const response = await this.authService.createPostService(userId, postData, role[0]);
      res.status(STATUS_CODES.CREATED).json(response);
    } catch (error) {
      console.log(error)
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Data not present!" });
        return;
      }
      const roleValidation = validateRole(role);
      if (!roleValidation.valid) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
        return;
      }
      const { accessToken, refreshToken, user } = await this.authService.login(email, password, role);
      if (user.status === "Inactive") {
        res.status(STATUS_CODES.FORBIDDEN).json({ message: "Your account is currently blocked" });
        return;
      }
      const tokenPrefix = role.toLowerCase();
      res.cookie(`${tokenPrefix}AccessToken`, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 40 * 60 * 1000,
      });
      res.cookie(`${tokenPrefix}RefreshToken`, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(STATUS_CODES.CREATED).json({ user });
    } catch (error) {
      next(error);
    }
  };

  public sendOTPcontroller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, role } = req.body;
      const roleValidation = validateRole(role);
      if (!roleValidation.valid) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
        return;
      }
      if (!email || !role) {
        res.status(STATUS_CODES.BAD_REQUEST).send({ message: "Email and role required!" });
        return;
      }
      await this.otpServiceInstance.sendOTP(email, role);
      res.status(STATUS_CODES.CREATED).send({ message: "OTP sent" });
    } catch (error) {
      next(error);
    }
  };

  public resendOTPcontroller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, role } = req.body;
      if (!email || !role) {
        res.status(STATUS_CODES.BAD_REQUEST).send({ message: "Email or role required!" });
        return;
      }
      const roleValidation = validateRole(role);
      if (!roleValidation.valid) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
        return;
      }
      await this.otpServiceInstance.resendOTP(email, role);
      res.status(STATUS_CODES.OK).send({ message: "OTP resent" });
    } catch (error) {
      next(error);
    }
  };

  public verifyOTPController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, role, otp } = req.body;
      if (!email || !role || !otp) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "OTP, Email, Role are required" });
        return;
      }
      const roleValidation = validateRole(role);
      if (!roleValidation.valid) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
        return;
      }
      const isVerified = await this.otpServiceInstance.verifyOtp(email, otp, role);
      if (isVerified) {
        res.status(STATUS_CODES.OK).json({ message: "OTP verification successful!" });
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Failed to verify OTP" });
      }
    } catch (error) {
      next(error);
    }
  };

  public emailOrPhoneNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, phoneNumber } = req.body;
    try {
      const userByEmail = await UserModel.findOne({ email });
      if (userByEmail) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ isTaken: true, message: "Email already exists" });
        return;
      }
      const userByPhoneNumber = await UserModel.findOne({ phoneNumber });
      if (userByPhoneNumber) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ isTaken: true, message: "Phone number already exists" });
        return;
      }
      res.json({ isTaken: false });
    } catch (error) {
      next(error);
    }
  };

  public refreshTokenController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokenPrefix = req.body.role.toLowerCase();
      const refreshToken = req.cookies[`${tokenPrefix}RefreshToken`];
      if (!refreshToken) {
        res.status(STATUS_CODES.UNAUTHORIZED).send({ message: "Refresh token is missing" });
        return;
      }
      const decoded = verifyToken(refreshToken, "refresh");
      if (!decoded) {
        res.status(STATUS_CODES.FORBIDDEN).send({ message: "Failed to decode" });
        return;
      }
      const { userId, role } = decoded;
      const newAccessToken = generateToken({ userId, role });
      const newRefreshToken = generateRefreshToken({ userId, role });
      this.setRefreshToken(res, newRefreshToken);
      res.status(STATUS_CODES.OK).json({ accessToken: newAccessToken });
    } catch (error) {
      next(error);
    }
  };

  public getUserPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedUserId = req.user?.userId;
      const targetUserId = req.query.userId;
      if (!authenticatedUserId) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Authorization required" });
        return;
      }
      const userIdToFetch = targetUserId ? targetUserId : authenticatedUserId;
      const posts = await this.authService.getUsersPosts(userIdToFetch);
      const postsWithLikeStatus = posts.map(post => {
        const likedByUser = post.likes.some((like: any) => {
          const likeUserId = like.userId ? like.userId.toString() : like.toString();
          const authUserId = authenticatedUserId ? authenticatedUserId.toString() : String(authenticatedUserId);
          return likeUserId === authUserId;
        });
        return { ...post, likedByUser };
      });
      res.status(STATUS_CODES.OK).json(postsWithLikeStatus);
    } catch (error) {
      next(error);
    }
  };
}
export const authController = new AuthController();

