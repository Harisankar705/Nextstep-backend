import { AuthMiddleware } from './../middleware/authenticateToken';
import { AdminController } from './../controllers/adminController';
import express from "express";
import { TYPES } from "../types/types";
import { container } from '../utils/inversifyContainer';
import { SubscriptionController } from '../controllers/subscriptionController';
const adminRoutes = express.Router();
const adminController = container.get<AdminController>(TYPES.AdminController);
const subscriptionController=container.get<SubscriptionController>(TYPES.SubscriptionController)
const authMiddleware=container.get<AuthMiddleware>(TYPES.AuthMiddleware)
adminRoutes.use(authMiddleware.verifyToken.bind(authMiddleware))
adminRoutes.route('/userdetails/:role').get( adminController.getUsers.bind(adminController));
adminRoutes.route('/togglestatus/:id').patch(adminController.toggleUser.bind(adminController));
adminRoutes.route('/individualdetails/:id').get(adminController.individualDetails.bind(adminController));
adminRoutes.route("/verifyemployer/:id").patch(adminController.verificationStatus.bind(adminController));
adminRoutes.route('/adminlogout',).post(adminController.adminLogout.bind(adminController));
adminRoutes.route('/add-subscription').post(subscriptionController.createSubscription.bind(subscriptionController))
adminRoutes.route('/subscriptions').get(subscriptionController.getSubscriptions.bind(subscriptionController))
adminRoutes.route('/subscriptions/:id').get(subscriptionController.getSubscriptions.bind(subscriptionController))
adminRoutes.route('/edit-subscription/:id').patch(subscriptionController.editSubscription.bind(subscriptionController))
export default adminRoutes;
