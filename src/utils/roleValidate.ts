export const validateRole = (role: string) => {
    if (!['user', 'employer', 'admin'].includes(role)) {
        return { valid: false, message: "Role is invalid!" }
    }
    return { valid: true }
}