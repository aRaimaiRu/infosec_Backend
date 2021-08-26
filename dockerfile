FROM node:alpine
WORKDIR /app
COPY . .

RUN ls
RUN npm install --production


EXPOSE 5000

CMD ["node", "."]