const NODE_ENV = process.env.NODE_ENV || 'development';

const cookieOptions = {
    httpOnly: true,                    
    secure: NODE_ENV === 'production', 
    sameSite: 'strict',                
    maxAge: 24 * 60 * 60 * 1000
};

export default cookieOptions