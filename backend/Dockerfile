FROM node:18

WORKDIR /backend

COPY package*.json ./
# copy the entire prisma directory including migrations
COPY prisma ./prisma/

# use ci insted of install
RUN npm ci --verbose

# uncomment this part if we want HTTPS function
# COPY certificate.crt /etc/ssl/
# COPY private.key /etc/ssl/

# copy source code
COPY . .

# generate the prisma client
RUN npx prisma generate

# Start the server using the production build
CMD npx prisma migrate deploy &&  npm run start:dev

# # In case of migration errors, start server like this to not exit
# CMD ["tail", "-f", "/dev/null"]