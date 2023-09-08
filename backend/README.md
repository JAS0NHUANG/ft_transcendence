## NestJS

#### Backend framework base on Node.js and Express.

Learn how to install, create new project, run service, test, use cli tool...etc. on [NestJS - DOCS](https://docs.nestjs.com)  
[@nestjs/common](http://nestjs-doc.exceptionfound.com/index.html)

- The module.ts file is the entry point of each module. The controller.ts does the routing and some config. The service.ts "provide" the services(functionalities).
- 42 oAuth 2 authantication with(or without) passport.js package. 1. First request will give the code. 2. with the code received in query string, send seconde request to aquire the API token. 3. Use the API token to retrive the user profile.
- use nestjs/config to get the .env contents

## Prisma

#### ORM for Node.js & TypeScript

This is a good tuto video:[WDS - Learn Prisma In 60 Minutes](https://www.youtube.com/watch?v=RebA5J-rlwg)  
And of course: [NestJS - DOCS - Prisma](https://docs.nestjs.com/recipes/prisma)

? do we always need to do the migration manualy on local server before dockerizing the project ?

Need to handle prisma error corectly with [PrismaClientExceptionFilter](https://nestjs-prisma.dev/docs/exception-filter/)

## Postgresql

Database.

## Redis

1. install `cache-manager @types/cache-manager`
2. add CacheModule from '@nestjs/common' into imports array
3. inject the CACHE_MANAGER into the service we want to use.
   `constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache)`
4. install `cache-manager-redis-store @types/
5. Put the settings inside `CacheModule.register({})`.

```
isGlobal: true,
store: redisStore,
host: 'redis',
port: 6379,
```

6. Add redis service into docker-compose

some possible issues:

- cache store type not assignable:
  (https://github.com/dabroek/node-cache-manager-redis-store/issues/53)
  solution:
  https://github.com/dabroek/node-cache-manager-redis-store/issues/53#issuecomment-1473700342

- use "url" in store options.

## Swagger

#### API documentation tool

Learn how to integrate swagger into NestJS here: [NestJS - DOCS - OpenAPI](https://docs.nestjs.com/openapi/introduction)

## Websocket

Using "socket.io" library.  
[NestJS - DOCS - Gateways](https://docs.nestjs.com/websockets/gateways)  
`npx nest g gateway`

## SSL certificate(optional)

Aquire an SSL certificate from [ZeroSSL](https://zerossl.com). Follow the instruction on the site.  
Copy the .crt and .key files into docker containers.  
Use 'fs' package to read the file and add httpsOptions into main.ts.

## Testing

1. add dependencies into "imports", and "providers" in the ".spec.ts" file.
