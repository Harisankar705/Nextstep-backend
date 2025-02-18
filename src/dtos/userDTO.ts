import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, isNotEmpty, IsNumber, IsObject, IsOptional, isString, IsString, IsUrl, ValidateNested } from "class-validator";
import { ApplicationStatus, ConnectionStatus } from "../types/authTypes";
import { Type } from "class-transformer";
import { Types } from "mongoose";

export class SignupDTO
{
   @IsEmail()
   email!:string
   @IsString()
   password!:string
   @IsString()
   role!:string
   @IsBoolean()
   @IsOptional()
   isVerified?:boolean
}
export class SendOTPDTO
{
    email!:string;
    role!:'user'|'employer';

}
export class VerifyOTPDTO
{
    email!:string
    status!:"VERIFIED"|"DENIED";
    role!:'user'|'employer'
    otp!:string
}
export interface RefreshTokenDTO
{
    role:"user"|"employer"|"admin"
}
export interface CandidateDetailsDTO
{
    userId?:string;
    data?:string;
    profilePicture?:string;
    resumeFile?:string;
}
export interface UpdateUserDTO
{
    profilePicture?:string;
    resume?:string;
    experience?:string
    languages?:string
    location?:string
    aboutMe?:string,
    education?:string,
    gender?:string,
    skills?:string[]

}
export interface CreatePostDTO
{
    text:string;
    role:string;
    files?:string[]
    background?:string,
    image?:string
}
export interface GetUserPostDTO
{
    userId?:string
}
export class EmailOrPhoneDTO
{
    email!:string;
    phoneNumber!:string
}
export class SearchDTO
{
    query!:string
}
export class GetChatDTO
{
    @IsString()
    id!:string;
}
export class GetURLDTO
{
    @IsUrl({},{message:"Invalid URL format"})
    @IsNotEmpty({ message: "URL is required" })
    url!:string;
}
export class SendMessageDTO{
    @IsString()
    receiverId!:string
    @IsString()
    sender!:string
    @IsString()
    content!:string
    @IsString()
    status!:'sent'|'delivered'|'read'
    @ValidateNested()
    @IsOptional()
    file?:{data:string,name:string,type:string}|null
    

}
export class FollowUserDTO{
    @IsString()
    followingId!:string
}
export class FollowBackDTO{
    @IsString()
    connectionId!:string
}
export class RespondToRequestDTO
{
    @IsString()
    connectionId!:string
    @IsEnum(ConnectionStatus)
    status!:ConnectionStatus
}
export class GetMutualConnectionDTO{
    @IsString()
    targetUserId!:string
}
export class LikeSavePostDTO
{
    @IsString()
    postId!:string
}
export class CommentPostDTO
{
    @IsString()
    postId!:string
    comment!:string
}


class Filters {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true }) // Ensures each item in the array is a string
    jobTypes?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    experienceLevels?: string[];
}

export class FetchJobsDTO {
    @ValidateNested()
    @Type(() => Filters) // Helps class-validator understand it's an object
    filters!: Filters;
}

export class ChangeApplicationStatusDTO
{
    @IsString()
    status!:ApplicationStatus
    userId!:string
}
export class ScheduleInterviewDTO
{
    @IsString()
    userId!:string
    @IsString()
    jobId!:string
    @IsString()
    date!:string
    @IsString()
    time!:string
    @IsString()
    interviewer!:string
    @IsString()
    platform!:string
    @IsString()
    meetingLink!:string
}
export class PaymentStripeDTO
{
    @IsString()
    amount!:number
}
export class ApplyJobDTO
{
    @IsString()
    jobId!:string
}

class SalaryRangeDTO {
    @IsNumber()
    min!: number;

    @IsNumber()
    max!: number;
}

class FormDataDTO {
    @IsString()
    jobTitle!: string;

    @IsString()
    description!: string;

    @IsArray()
    employmentTypes!: string[];

    @ValidateNested()
    @Type(() => SalaryRangeDTO)
    salaryRange!: SalaryRangeDTO;

    @IsArray()
    categories!: string[];

    @IsArray()
    skills!: string[];

    @IsString()
    responsibilities!: string;

    @IsString()
    whoYouAre!: string;

    @IsString()
    niceToHave!: string;
    @IsString()
    createdAt!: Date;
    @IsString()
    employerId !: string|Types.ObjectId|undefined

    @IsArray()
    benefits!: string[];

    @IsBoolean()
    isActive!: boolean;
}

export class UpdateJobDTO {
    @IsOptional()
    @ValidateNested()
    @Type(() => FormDataDTO)
    formData!: FormDataDTO;
}
export class CreateJobDTO {
   @IsObject()
   @ValidateNested()
   @Type(()=>FormDataDTO)
   formData!:FormDataDTO
}


