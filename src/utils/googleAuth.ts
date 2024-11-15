import { UserRepository } from "../repositories/userRepository";
import { ILoginResponse, IUser } from "../types/authTypes";
import { generateToken } from "./jwtUtils";
import axios from "axios";
async function verifyGoogleToken(tokenId: string) {
    try {
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${tokenId}`)
        return response.data
    } catch (error) {
        throw new Error('invalid google token')

    }
}
export const googleAuth = async (tokenId: string, role: 'candidate' | 'employer' | 'admin'): Promise<ILoginResponse> => {
    const userRepository = new UserRepository()
    const googleUserData = await verifyGoogleToken(tokenId)
    if (!googleUserData) {
        throw new Error("Invalid google token")
    }
    let user = await userRepository.findByEmail(googleUserData.email)
    if (!user) {
        user = await userRepository.createUser({
            username: googleUserData.username,
            email: googleUserData.email,
            password: "",
            profile: {
                firstName: googleUserData.given_name,
                secondName: googleUserData.family_name,
                profilePicture: googleUserData.picture
            },
        } as IUser)
    }
    const token = generateToken({ userId: user._id.toString(), role: user.role })
    return { token, user }
}
