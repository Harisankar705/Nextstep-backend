import { ArrayNotEmpty, IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import { IReport, Reason } from "../types/authTypes";

export class VerifyUserDTO
{
    id!:string;
    status!:"APPROVED"|"DENIED";
    
}
export class LoginDTO
{
    email!:string;
    role!:string;
    password!:string
    
}
export class ToggleUserDTO {
    id!: string;
    role!: string;

    
}

export class IndividualDetailsDTO {
    id!: string;
    role!: string;

   
}
export class CreateReportDTO {
    @IsString()
    postId!: string;

    @IsString()
    reason!: string;

    @IsOptional()
    @IsString()
    description?: string; 

    @IsString()
    role!:string
}
export class CreateSubscriptionDTO
{
    @IsString()
    name!:string
    @IsNumber()
    price!:number
    @IsString()
    validity!:number
    @IsArray()
    @IsString({each:true})
    @ArrayNotEmpty()
    features!:string[]
    @IsBoolean()
    isPopular!:boolean
    @IsString()
    targetRole!:string
    @IsString()
    status!:string
    
}

export class ReportStatusDTO{
    reportId!:string
    newStatus!:Reason
}