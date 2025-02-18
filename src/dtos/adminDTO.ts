import { IsOptional, IsString } from "class-validator";
import { IReport, Reason } from "../types/authTypes";

export class VerifyUserDTO
{
    id!:string;
    status!:"VERIFIED"|"DENIED";
    
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

export class ReportStatusDTO{
    reportId!:string
    newStatus!:Reason
}