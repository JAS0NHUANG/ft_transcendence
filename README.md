# ft_transcendence

Develop a full-stack Single Page Application with several features such as an online multi-player game, as a chat or a social page

## Tech Stack

### [Backend](backend)

NestJS(server), Prisma(ORM), Postgresql(DB), Redis(Cache DB), Sagger(API Doc)

### [Frontend](frontend)

React(Framework/Library), Vite(Tooling)

### DevOps

Docker-compose, Github(CI/CD)?

## Environment Variables

This project need a .env file to work. Here is an example: [.envexample](.envexample). All variables in the example file are necessary.

## SSL

Need genuine .key and .crt files in the backend directory to make https working. Or you might want to disable the "httpsOptions" and remove the file reading part in [main.ts](backend/src/main.ts).  
(Is set disabled for now.)

# How to run the project

1. Clone this repo.  
   via ssh: `git@github.com:JAS0NHUANG/ft_transcendenc.git`  
   via https: `https://github.com/JAS0NHUANG/ft_transcendenc.git`

2. Create the .env file in the project root directory from .envexample and set all the variables inside.

3. `make`

# Setup pre-commit auto-linting and auto-formating

https://dev.to/ruppysuppy/automatically-format-your-code-on-git-commit-using-husky-eslint-prettier-in-9-minutes-45eg

### 1. install package needed

`npm install --save-dev eslint prettier  @typescript-eslint/eslint-plugin eslint-plugin-prettier eslint-config-prettier lint-staged husky`
No need to run `npx eslint --init` since the .eslintrc.js was created automaticly by nestjs and react-vite

### 2. configure lint-staged

add following config into package.json:

```
{
  "lint-staged": {
    "backend/**/*.{ts,tsx}": [
      "eslint ./backend --fix",
      "prettier --write ./backend"
    ],
    "frontend/**/*.{ts,tsx}": [
      "eslint ./frontend --fix",
      "prettier --write ./frontend"
    ]
  }
}
```

### 3. configure husky

add following config into package.json:

```
  "scripts": {
    "configure-husky": "npx husky install && npx husky add .husky/pre-commit \"npx --no-install lint-staged\""
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
```

### 4. run config-husky

`npm run config-husky`
