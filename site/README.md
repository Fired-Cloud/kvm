# Fired Cloud: landing page mockup

> **This is a design mockup.** It is a static preview of a landing page for Fired Cloud,
> a KVM VPS hosting brand, made to check the visual design. Prices, data centers, server
> data and the control panel are placeholders. Nothing on the page orders, bills or
> controls real servers, and the page has no analytics or trackers.

The page is in Russian and contains:

- hero with call to action
- pricing tiers (vCPU, RAM, NVMe, traffic, monthly price in ₽) with a monthly/yearly toggle
- features: KVM virtualization, NVMe, DDoS protection, snapshots, IPv4/IPv6, 99.9% SLA
- data center locations
- a control panel preview (server list, CPU/RAM/NVMe gauges, traffic chart, power buttons);
  clicking it only changes what is shown on the page
- FAQ and footer

## Files

| File         | Purpose                                               |
| ------------ | ----------------------------------------------------- |
| `index.html` | Page markup                                           |
| `styles.css` | All styles (dark "fire" theme, responsive down to phone width) |
| `main.js`    | Hero sparks animation, pricing toggle, panel preview  |

Plain HTML, CSS and JavaScript. There is no build step and no dependencies.
Fonts (Unbounded, Onest, JetBrains Mono) load from Google Fonts.

## Preview locally

Open `site/index.html` in a browser, or serve the folder:

```sh
cd site
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy on Vercel

1. In Vercel, choose **Add New → Project** and import the `Fired-Cloud/kvm` repository.
2. Set **Root Directory** to `site`.
3. Leave **Framework Preset** as **Other**; leave the build command and output directory empty.
4. Click **Deploy**.

No `vercel.json` or other configuration is needed: Vercel serves the folder as static files.
Every push to the branch gets its own preview URL.
