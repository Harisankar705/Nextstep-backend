"use strict";
// import { response } from "express";
// import { UserRepository } from "../repositories/userRepository";
// import { ILoginResponse, IUser } from "../types/authTypes";
// import { generateToken } from "./jwtUtils";
// import axios from "axios";
// async function getUserDetails(accessToken: string) {
//     try {
//         const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`
//                 }
//         })
//         console.log("RESPONSE GETUSERDETAILS",response)
//         return response.data
//     }
//         catch (error) {
//         console.log("ERROR ", error)
//     }
// }
// // async function verifyGoogleToken(accessToken: string) {
// //     try {
// //         console.log("IN VERIFY GOOGLE TOEKN", accessToken)
// //         const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`)
// //         console.log("RESPONSE", response.data)
// //         return response.data
// //     } catch (error) {
// //         console.log("ERROR", error)
// //     }
// // }
// export const googleAuth = async (accessToken: string, role: 'user' | 'employer' | 'admin'): Promise<ILoginResponse> => {
//     const userRepository = new UserRepository()
//     console.log("IN GOOGLE AUTH", accessToken)
//     const googleUserData = await getUserDetails(accessToken)
//     if (!googleUserData) {
//         throw new Error("Invalid google token")
//     }
//     const { email, given_name, family_name, picture, sub } = googleUserData
//     console.log("GOOGLE USERDATA",googleUserData)
//     if (!email || !given_name || !family_name || !picture || !sub) {
//         throw new Error('Incomplete details')
//     }
//     let user = await userRepository.findByEmail(googleUserData.email)
//     if (!user) {
//     }
//     user = await userRepository.createUser({
//         username: email.split("@")[0],
//         email: email as string,
//         password: "",
//         role,
//         profilePicture: picture || "",
//         profile: {
//             firstName: given_name,
//             secondName: family_name,
//         },
//         isBlocked: false,
//         connections: [],
//         premium: false
//     } as Partial<IUser>)
//     const token = generateToken({ userId: user._id.toString(), role: user.role })
//     return { token, user }
// }
