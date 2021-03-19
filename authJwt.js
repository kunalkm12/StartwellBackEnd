const jwt = require("jsonwebtoken");
const config = require("./config/key.config.js");


verifyToken = (req, res, next) => {
  let token = req.headers["token"];
 console.log("token " + token);
  if (!token) {
    return res.send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const authJwt = {
  verifyToken: verifyToken
};
module.exports = authJwt;
