import bcrypt from 'bcryptjs'
export const hashPassword=async(password:string):Promise<string>=>{
    try {
        console.log('in hasshhedpassword')
        const salt=await bcrypt.genSalt(10)
        const hashed=  await bcrypt.hash(password,salt)
    
        console.log("GENERATED HASHED PASSWORD",hashed)
        return hashed
    } catch (error) {
        console.error('Error in hashPassword:', error);
        throw error
    }
    
}

export const comparePassword=async(enteredPassword:string,storedHash:string):Promise<boolean>=>{
    try {
        const isMatch=await bcrypt.compare(enteredPassword,storedHash)
        return isMatch
    } catch (error) {
        console.error('error occured in comparepassword')
        return false
    }
    
    
}