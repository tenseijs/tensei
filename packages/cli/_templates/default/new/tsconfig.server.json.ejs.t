---
to: <%= h.changeCase.param(name) %>/tsconfig.server.json
---
{
    "compilerOptions": {
        "target": "ES2017",
        "module": "commonjs",
        "declaration": true,
        "outDir": "./build/server",
        "strict": true,
        "baseUrl": "./server",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "types": ["@types/jest"]
    },
    "exclude": ["__tests__", "build", "client"]
}
