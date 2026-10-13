import { Response, Request } from "express"

type Options = { httpOnly: boolean;
        secure: boolean;
        sameSite?: boolean | "strict" | "lax" | "none" ;
        maxAge: number; };

export const cookies = {
    getOptions: (): Options => ({
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,

    }),
    set: (res: Response, name: string, value: unknown, options = {}) => {
        res.cookie(name, value,, {  ...cookies.getOptions(), ...options });
    },
    
    clear: (res: Response, name: string, options = {}) => {
        res.clearCookie(name, { ...cookies.getOptions(), ...options });
    },
    get: (req: Request, name: string) => {
        return req.cookies[name];
    }
}