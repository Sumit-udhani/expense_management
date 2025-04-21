const jwt = require('jsonwebtoken')
module.exports = (req,res,next) =>{
    const token = req.get('Authorization').split(' ')[1]
    let decodeToken;
    try {
        decodeToken = jwt.verify(token,'somesecretsuperKey')
    } catch (error) {
        console.log(error)
    }
    if (!decodeToken) {
        throw new Error('Unauthenticated')
    }
    req.userId = decodeToken.userId;
    req.userRole = decoded.role;
    next()
}