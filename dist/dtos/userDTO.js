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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJobDTO = exports.UpdateJobDTO = exports.ApplyJobDTO = exports.PaymentStripeDTO = exports.ScheduleInterviewDTO = exports.ChangeApplicationStatusDTO = exports.FetchJobsDTO = exports.CommentPostDTO = exports.LikeSavePostDTO = exports.GetMutualConnectionDTO = exports.RespondToRequestDTO = exports.FollowBackDTO = exports.FollowUserDTO = exports.SendMessageDTO = exports.GetURLDTO = exports.GetChatDTO = exports.SearchDTO = exports.EmailOrPhoneDTO = exports.VerifyOTPDTO = exports.SendOTPDTO = exports.SignupDTO = void 0;
const class_validator_1 = require("class-validator");
const authTypes_1 = require("../types/authTypes");
const class_transformer_1 = require("class-transformer");
class SignupDTO {
}
exports.SignupDTO = SignupDTO;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SignupDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupDTO.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupDTO.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SignupDTO.prototype, "isVerified", void 0);
class SendOTPDTO {
}
exports.SendOTPDTO = SendOTPDTO;
class VerifyOTPDTO {
}
exports.VerifyOTPDTO = VerifyOTPDTO;
class EmailOrPhoneDTO {
}
exports.EmailOrPhoneDTO = EmailOrPhoneDTO;
class SearchDTO {
}
exports.SearchDTO = SearchDTO;
class GetChatDTO {
}
exports.GetChatDTO = GetChatDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetChatDTO.prototype, "id", void 0);
class GetURLDTO {
}
exports.GetURLDTO = GetURLDTO;
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: "Invalid URL format" }),
    (0, class_validator_1.IsNotEmpty)({ message: "URL is required" }),
    __metadata("design:type", String)
], GetURLDTO.prototype, "url", void 0);
class SendMessageDTO {
}
exports.SendMessageDTO = SendMessageDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDTO.prototype, "receiverId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDTO.prototype, "sender", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDTO.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDTO.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SendMessageDTO.prototype, "file", void 0);
class FollowUserDTO {
}
exports.FollowUserDTO = FollowUserDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FollowUserDTO.prototype, "followingId", void 0);
class FollowBackDTO {
}
exports.FollowBackDTO = FollowBackDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FollowBackDTO.prototype, "connectionId", void 0);
class RespondToRequestDTO {
}
exports.RespondToRequestDTO = RespondToRequestDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RespondToRequestDTO.prototype, "connectionId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(authTypes_1.ConnectionStatus),
    __metadata("design:type", String)
], RespondToRequestDTO.prototype, "status", void 0);
class GetMutualConnectionDTO {
}
exports.GetMutualConnectionDTO = GetMutualConnectionDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMutualConnectionDTO.prototype, "targetUserId", void 0);
class LikeSavePostDTO {
}
exports.LikeSavePostDTO = LikeSavePostDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LikeSavePostDTO.prototype, "postId", void 0);
class CommentPostDTO {
}
exports.CommentPostDTO = CommentPostDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommentPostDTO.prototype, "postId", void 0);
class Filters {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Filters.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }) // Ensures each item in the array is a string
    ,
    __metadata("design:type", Array)
], Filters.prototype, "jobTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], Filters.prototype, "experienceLevels", void 0);
class FetchJobsDTO {
}
exports.FetchJobsDTO = FetchJobsDTO;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Filters) // Helps class-validator understand it's an object
    ,
    __metadata("design:type", Filters)
], FetchJobsDTO.prototype, "filters", void 0);
class ChangeApplicationStatusDTO {
}
exports.ChangeApplicationStatusDTO = ChangeApplicationStatusDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeApplicationStatusDTO.prototype, "status", void 0);
class ScheduleInterviewDTO {
}
exports.ScheduleInterviewDTO = ScheduleInterviewDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleInterviewDTO.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleInterviewDTO.prototype, "jobId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleInterviewDTO.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleInterviewDTO.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleInterviewDTO.prototype, "interviewer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleInterviewDTO.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleInterviewDTO.prototype, "meetingLink", void 0);
class PaymentStripeDTO {
}
exports.PaymentStripeDTO = PaymentStripeDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], PaymentStripeDTO.prototype, "amount", void 0);
class ApplyJobDTO {
}
exports.ApplyJobDTO = ApplyJobDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyJobDTO.prototype, "jobId", void 0);
class SalaryRangeDTO {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalaryRangeDTO.prototype, "min", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalaryRangeDTO.prototype, "max", void 0);
class FormDataDTO {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FormDataDTO.prototype, "jobTitle", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FormDataDTO.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], FormDataDTO.prototype, "employmentTypes", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SalaryRangeDTO),
    __metadata("design:type", SalaryRangeDTO)
], FormDataDTO.prototype, "salaryRange", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], FormDataDTO.prototype, "categories", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], FormDataDTO.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FormDataDTO.prototype, "responsibilities", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FormDataDTO.prototype, "whoYouAre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FormDataDTO.prototype, "niceToHave", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Date)
], FormDataDTO.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], FormDataDTO.prototype, "employerId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], FormDataDTO.prototype, "benefits", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FormDataDTO.prototype, "isActive", void 0);
class UpdateJobDTO {
}
exports.UpdateJobDTO = UpdateJobDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FormDataDTO),
    __metadata("design:type", FormDataDTO)
], UpdateJobDTO.prototype, "formData", void 0);
class CreateJobDTO {
}
exports.CreateJobDTO = CreateJobDTO;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FormDataDTO),
    __metadata("design:type", FormDataDTO)
], CreateJobDTO.prototype, "formData", void 0);
