import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-do-not-use-in-prod';

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};

// Start line of edit (re-written for correctness)
export const signToken = (payload: any, expiresIn: string | number = '7d') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const getTokenFromRequest = (req: NextRequest) => {
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    return null;
};

export const getDecodedTokenFromRequest = (req: NextRequest) => {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    return verifyToken(token);
};
