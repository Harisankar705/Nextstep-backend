"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const userRepository_1 = require("../repositories/userRepository");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const otpStore = {};
let otpService = class otpService {
    constructor(userRepository, transporter) {
        this.userRepository = userRepository;
        this.transporter = transporter;
    }
    generateOtp() {
        return crypto_1.default.randomInt(100000, 999999).toString();
    }
    async sendOTP(email, role) {
        const otp = this.generateOtp();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        otpStore[email] = { otp, expiry: otpExpiry };
        console.log(otpStore[email]);
        const mailOption = {
            from: "nextstep@gmail.com",
            to: email,
            subject: "Your otp for nextstep is",
            text: `Your OTP code is ${otp} It will expire in 5 minutes`
        };
        await this.transporter.sendMail(mailOption);
    }
    async resendOTP(email, role) {
        const otpData = otpStore[email];
        if (otpData && otpData.expiry > new Date()) {
            console.log('sending otp');
        }
        else {
            const otp = this.generateOtp();
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            otpStore[email] = { otp, expiry: otpExpiry };
            await this.sendOTP(email, role);
        }
    }
    async verifyOtp(email, otp, role) {
        const otpData = otpStore[email];
        if (!otpData) {
            throw new Error("OTP not found!");
        }
        const { otp: storedOtp, expiry } = otpData;
        console.log('stored otp', { storedOtp, expiry });
        const isValidOtp = storedOtp === otp && expiry > new Date();
        if (isValidOtp) {
            otpStore[email] = { otp: "", expiry: new Date(0) };
        }
        return isValidOtp;
    }
    async saveUserWithPassword(email, password, role) {
        if (role === 'user') {
            const user = await this.userRepository.findByEmail(email, role);
            if (!user)
                throw new Error('user not found');
            await this.userRepository.updateUser(email, { password });
        }
        else {
            // const employer=await this.employerRepository.findByEmail(email)
            // if(!employer)throw new Error('employer not found')
        }
    }
};
otpService = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.UserRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.Transporter)),
    __metadata("design:paramtypes", [userRepository_1.UserRepository, Object])
], otpService);
exports.default = otpService;
