# Prisma's query engine needs OpenSSL on Alpine, and some native
# addons need libc6-compat — both are common requirements, not
# optional extras.
FROM node:22-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy manifests + the Prisma schema first so `npm ci`'s postinstall
# (`prisma generate`) has the schema it needs.
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.mjs ./

# Full install (not --omit=dev): the Prisma CLI is a devDependency but
# is needed at container *runtime* by docker-entrypoint.sh for
# `migrate deploy` and `db seed`.
RUN npm ci

COPY . .
RUN chmod +x docker-entrypoint.sh

EXPOSE 5001

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
