#B1: build môi trường nodejs trong docker

#FROM node:lts-alpine as build-stage


FROM node:20
#B2: tạo folder BE

WORKDIR /app

#B3: copy file packe.json và package-lock.json

COPY package*.json ./

#B3.1: copy folder prisma vào folder prisma trong image
COPY prisma ./prisma/

#B3.2: copy source code vào trong img
COPY . .

#B4: run npm install
RUN npm install

#B5: expose port cho bên ngoài connect tới 
EXPOSE 8082

#B6: start server trong image

CMD ["npm","run","start"]