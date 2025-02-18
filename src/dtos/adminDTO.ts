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
export class CreateReportDTO{
    reportData!:IReport
}
export class ReportStatusDTO{
    reportId!:string
    newStatus!:Reason
}