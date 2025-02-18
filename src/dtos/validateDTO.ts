import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export const validateDTO = async <T extends object>(dtoClass: new () => T, body: any): Promise<T> => {
    const dtoInstance = plainToInstance(dtoClass, body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
        throw new Error(JSON.stringify(errors.map(err => err.constraints)));
    }

    return dtoInstance;
};
