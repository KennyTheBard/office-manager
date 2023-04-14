FROM node:alpine

# determine environment
ENV NODE_ENV=dev

# set workdir
WORKDIR /usr/app

# install dependencies
COPY package*.json ./
RUN npm ci

# compile typescript
COPY src/ ./src/
COPY tsconfig.json .
RUN npm run compile

# final configs
EXPOSE 4000
CMD [ "sh", "-c", "npm run start:${NODE_ENV}" ]