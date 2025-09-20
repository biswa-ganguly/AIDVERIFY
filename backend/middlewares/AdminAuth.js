import jwt from "jsonwebtoken";

const AdminProtectRoute = (req,res,next) =>
{
    const jwtsecret=process.env.ADMIN_JWT_SECRET;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or invalid.' });
    }

    if(!pass)
    {
        res.status(500).json({ message: "ADMIN_PASSWORD is not defined or loaded."});
    }

    if(!jwtsecret)
    {
        res.status(500).json({ message: "ADMIN_JWT_SECRET is not defined or loaded."});
    }

    try {
        // Extract the token (removing the 'Bearer' prefix)
        const token = authHeader.split(' ')[1];

        // Verify the token using the secret key
        const decoded = jwt.verify(token, jwtsecret);

        // Attach the decoded user payload to the request object for use in the route handler
        req.user = decoded;
        
        // Pass control to the next middleware or the final route handler
        next();
    } catch (error) {
        // Handle invalid or expired tokens
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}

export default AdminProtectRoute;