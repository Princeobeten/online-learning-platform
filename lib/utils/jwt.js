import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Extract token from authorization header
export const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};

// Middleware to check if user is authenticated
export const isAuthenticated = (handler) => {
  return async (req, res) => {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    return handler(req, res);
  };
};

// Middleware to check if user has required role
export const hasRole = (roles) => {
  return (handler) => {
    return async (req, res) => {
      const token = extractToken(req);
      
      if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }
      
      const userRole = decoded.role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }
      
      req.user = decoded;
      return handler(req, res);
    };
  };
};
