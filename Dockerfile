FROM node:18-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY . .

RUN chown -R app:app /app

USER app

RUN npm install
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
