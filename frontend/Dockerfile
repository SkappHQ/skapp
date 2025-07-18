FROM node:20-alpine3.19 as builder

WORKDIR /app
COPY .. .
RUN npm install --force
RUN apk add --no-cache bash
RUN bash set-deploy-time.sh
RUN npm run build
EXPOSE 3000
CMD [ "npm", "run", "start" ]