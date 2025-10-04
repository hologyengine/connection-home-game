# Connection Home

## Poki

To build the game for poki, set the environment variable VITE_POKI to true. 

```
npm run build:poki
```

This will produce a file called dist.zip which you upload to Poki.

### Manually 
In a unix-like terminal (Mac, GitBash)

```
VITE_POKI=true npx vite build --base=./ 
```

Using powershell

```
$env:VITE_POKI="true"; npx vite build --base=./ 
```

Poki specific code can then safely be added within if conditions. If not building for Poki, this code will be excluded from the build automatically.

```ts
if (__POKI__) {
  // This will only run if VITE_POKI=true
}
```