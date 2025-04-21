module.exports = (req,res,next) =>{
 if (!req.userRole!== 'Admin') {
   return res.status(403).json({message: 'Access deneid Admin only'})
 }
 next()
}