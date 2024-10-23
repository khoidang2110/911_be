import { PrismaClient } from "@prisma/client";
import { checkToken, createToken } from "../config/jwt.js";
import bcrypt from "bcrypt";
import sendMail from '../config/sendmail.js';
//import sendMail from '../config/sendmail.js'

const prisma = new PrismaClient();

// dang ky
// cap nhat

const login = async (req, res) => {
  try {
    let { user_name, password } = req.body;

    // check email
    let data = await prisma.users.findFirst({
      where: {
       user_name,
      },
    });

    if (data) {
      // check pass đúng -> tạo token
      // so sánh pass nhập và pass ở db
      let checkPassword = bcrypt.compareSync(password, data.password);
      if (checkPassword) {
        // có => tạo token
        // tạo token -> jsonwebtoken jwt
        // mã hoá password->bcrypt
        let payload = {
          user_id: data.user_id,
          user_name: data.user_name,
       user_role:data.user_role
      
       
         
        };
       // let token = createToken(payload);
        res.status(200).send(payload);
       // res.status(200).send("welcome!");
      } else {
        res.status(400).send("password incorrect!");
      }
    } else {
      res.status(404).send("login fail");
    }

    // => báo lỗi
  } catch (error) {
    res.send(`Backend error: ${error}`);
  }

  // res.send({email,password})
};

const signUp = async (req, res) => {
  try {
    let {user_id,  user_name, phone_number,email,password,user_role } = req.body;

    const data = await prisma.users.findFirst({
      where: {
        user_name,
      },
    });

    if (data) {
      res.status(400).send("User exists!!!");
    } else {
      // mã hoá pass
      let encodePassword = bcrypt.hashSync(password, 10);
      let newUser = {
       user_id:Number(user_id),
     user_name,
     phone_number,
     email,
        password: encodePassword,
        user_role
      
      };
      await prisma.users.create({
        data: newUser,
      });
      res.status(201).send("user is created!");
      // await sendMail({
      //   email,
      //   subject:'ebw test',
      //   html: `
      //   <h1>Có khách mua hàng </h1>
      //   `
      // })
    }
  } catch (error) {
    res.status(500).send(`Backend error: ${error}`);
  }
};
const updateUser = async (req, res) => {
  try {
    let { user_name, phone_number, email, password, user_role } = req.body;
    let encodePassword = bcrypt.hashSync(password, 10);

    // Find user by user_name
    let userInfo = await prisma.users.findFirst({
      where: {
        user_name: user_name, // Assuming the correct field name is `name`
      },
    });
    console.log('userInfo', userInfo);

    if (!userInfo) {
      res.status(404).send("User does not exist");
    } else {
      // Update user details
      await prisma.users.update({
        where: {
         user_id: Number(userInfo.user_id), // Use id to identify the user
        },
        data: {
          user_name: user_name ? user_name : userInfo.name,
          phone_number: phone_number ? phone_number : userInfo.phone_number,
          email: email ? email : userInfo.email,
          password: password ? encodePassword : userInfo.password,
          role: user_role ? user_role : userInfo.role,
        },
      });

      res.status(200).send({
        message: "User updated",
      });
    }
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).send("Update failed: " + error.message);
  }
};

const getUser = async (req, res) => {
    let { user_id } = req.params;
    // let { token } = req.headers;
    // let isValidToken = checkToken(token);
    // console.log(isValidToken)
    try {
      let data = await prisma.users.findMany({
        where: {
          user_id: Number(user_id),
        },
      });
  
      if (data.length === 0) {
        res.send("user id does not exits");
      } else {
    // show info data
    res.send(data);

        // if (data.user_id == isValidToken.data.data.user_id) {
        //   // neu id tìm giống id token thì show info token (info token ko có avatar)
        //   res.send(isValidToken.data);
        // } else {
      
        // }
      }
    } catch (error) {
      res.send(`BE error ${error}`);
    }
  };

  // khach hang gui mail lien he
  const contactUs = async (req,res)=>{
try {
  let { email, title, content } = req.body;

  if (email){
    // gửi mail shop
    await sendMail({
      // gui mail phan hoi 
     email: 'easybadwork@gmail.com',
      //email: 'khoidang2110@gmail.com',
     subject:`Bạn có mail của khách hàng`,
     html: `<h1>Email: ${email} </h1>
     <h1> Tiêu đề: ${title}</h1>
     <h1>Nội dung: ${content} </h1> `
   })
   // gửi mail khách hàng

   res.send(`${title}`);
 }

} catch (error) {
  res.send(`BE error ${error}`);
}
  }

export { signUp, login, updateUser ,getUser,contactUs};
