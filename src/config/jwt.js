import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createToken = (data) => {
  return jwt.sign({ data }, "KEYMAHOA", { expiresIn: "9y" });
};
const checkToken = (token) => {
  // value of decoded => : userId, iat, exp...
  return jwt.verify(token, "KEYMAHOA", (err, decoded) => {
    if (err) {
      return {
        statusCode: 401, // unauthorized
        message: "invalid token",
      };
    }
    return {
      statusCode: 200,
      data: decoded,
    };
  });
};

const verifyToken = async (req, res, next) => {
  let { token } = req.headers;
  if (!token) {
    res.status(401).send("Invalid token");
    return;
  }
  let isValidToken = checkToken(token);
  if (isValidToken.statusCode == 401) {
    res.status(401).send(isValidToken.message);
    return;
  }
console.log(isValidToken.data)
 // check user có trong db hay không

//   let { id } = isValidToken.data;
//   let data = await prisma.users.findUnique({
//     where: {
//       id:Number(id),
//     },
//   });
//   if (!data) {
//     res.status(401).send("invalid token");
//     return;
//   }

  next(); //bypass
};
export { createToken, verifyToken,checkToken };
