# ll4sch.com

Custom site to replace the Google Site. Pages:

- `/` home
- `/java-minecraft-server` Paper / vanilla Java (`mc.ll4sch.com`)
- `/bettermc-java-minecraft-server` BetterMC (`216.228.185.138:25564`)
- `/servermonitor` live box status + BlueMap embed

## Local

```bash
npm install
npm run dev
```

## Vercel

1. Import this repo in Vercel
2. Framework preset: Next.js
3. Add domain `ll4sch.com` + `www.ll4sch.com`
4. In the DNS host, point `A`/`CNAME` for `@` and `www` at Vercel (leave `map.ll4sch.com` and `mc.ll4sch.com` alone — those already hit the game box)

Optional env:

```
NEXT_PUBLIC_STATUS_API=https://monitor.ll4sch.com/api/status
NEXT_PUBLIC_MAP_URL=https://map.ll4sch.com/
```

If `monitor.ll4sch.com` is not up yet, `/servermonitor` still shows join info and embeds BlueMap from `map.ll4sch.com`.
