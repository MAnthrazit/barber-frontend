FROM node
WORKDIR /app
COPY package.json /app
RUN npm install -g @angular/cli && npm install
COPY . /app
CMD ["npm", "start"]

