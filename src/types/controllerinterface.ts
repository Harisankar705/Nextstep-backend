import { Request, Response, NextFunction } from 'express';

export interface IAdminController {
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  individualDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
  toggleUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  verificationStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  adminLogout(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IAuthController {
  signup(req: Request, res: Response, next: NextFunction): Promise<void>;
  candidateDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
  search(req: Request, res: Response, next: NextFunction): Promise<void>;
  createPost(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  sendOTPcontroller(req: Request, res: Response, next: NextFunction): Promise<void>;
  resendOTPcontroller(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOTPController(req: Request, res: Response, next: NextFunction): Promise<void>;
  emailOrPhoneNumber(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshTokenController(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserPost(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export interface IChatController {
    getChat(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    getURL(req: Request, res: Response, next: NextFunction): Promise<void>;
  }
  export interface IConnectionController {
    followUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    followBack(req: Request, res: Response, next: NextFunction): Promise<void>;
    respondToRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
    getConnections(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMutualConnections(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkFollowStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    pendingRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
  }
export interface IEmployerController {
    employerDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    isEmployerVerified(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IInteractionController {
    likePost(req: Request, res: Response, next: NextFunction): Promise<void>;
    commentPost(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPost(req: Request, res: Response, next: NextFunction): Promise<void>;
    // sharePost(req: Request, res: Response, next: NextFunction): Promise<void>;
    savePost(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSavedPost(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkSavedStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getComments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPostInteractions(req: Request, res: Response, next: NextFunction): Promise<void>;
  }
 export interface IJobController {
    fetchJobs(req: Request, res: Response, next: NextFunction): Promise<void>;
    createJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getJobById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    applyJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    paymentStripe(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    scheduleInterview(req: Request, res: Response, next: NextFunction): Promise<void>;
    changeApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getApplicantsForJob(req: Request, res: Response): Promise<void>;
    changePremiumStatus(req: Request, res: Response): Promise<void>;
    applicantStatus(req: Request, res: Response): Promise<void>;
}
export interface INotificationController {
    getNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
}