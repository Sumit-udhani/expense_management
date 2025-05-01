module.exports =  function authorizeRole   (roles = []) {
    if (typeof roles === 'string') roles = [roles];
    return (req,res,next)=>{
        const userRole  = req.userRole;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access Denied: Insufficient role' });
          }
          next()
    }
}