FROM node:18
LABEL authors="Fatih EGE"
WORKDIR /app
COPY package*.json ./
RUN npm config set legacy-peer-deps true
RUN npm install
COPY . .
COPY .next ./.next
EXPOSE 3000
CMD [ "npm", "run", "start" ]