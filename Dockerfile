FROM node:14
RUN mkdir -p /app
COPY . /app
WORKDIR /app
RUN npm install
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' > /etc/timezone
EXPOSE 3008
CMD ["npm","run","start"]
