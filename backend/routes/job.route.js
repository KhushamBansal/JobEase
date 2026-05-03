import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobAnalytics, getAdminJobs, getAllJobs, getJobById, getRecommendedJobs, postJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/recommended").get(isAuthenticated, getRecommendedJobs);
router.route("/analytics/admin").get(isAuthenticated, getAdminJobAnalytics);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

export default router;

