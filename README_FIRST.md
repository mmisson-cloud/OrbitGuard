# ORBITGUARD PRE-COOL — iPhone demo app

## What you have

- **index.html** — mobile-first mission-control website, with touch-friendly screens.
- **app.js** — working lunar radiator thermal simulation, comparisons, spoken summary, CSV export, phone camera image color sampling, and local prototype measurements.
- **manifest.webmanifest**, **sw.js**, **assets/** — installable web app (PWA) shell and home-screen icons, including offline caching after initial HTTPS visit.
- **poster.html** — attractive printable project poster (open in browser, Print > Save as PDF).
- **OrbitGuard_Prototype_Lab_Original.html** — preserved reference copy of the original tabletop experiment page.

## How to see it on your Windows laptop

Double-click **index.html**. Core simulation, local photo color sampling, and interface function without a server. Voice support depends on browser. PWA offline installation and reliable camera support require HTTPS hosting.

## How to install on iPhone (free, without the App Store)

1. On your Windows laptop, sign in to **github.com**, create a new **public** repository called `orbitguard-mobile` (or another available name).
2. Upload the **contents of this folder** to the repository root. Do not upload the ZIP as a single file. Include `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `poster.html`, and the `assets` folder.
3. In your repository, choose **Settings > Pages > Build and deployment > Deploy from a branch**. Set branch **main** and folder **/(root)**, then save. GitHub will display the public Pages URL once deployment finishes.
4. On iPhone, open the Pages URL using **Safari** (not an in-app browser). Test the Mission, Camera Lab, and Prototype sections.
5. Tap Safari's **Share** button > **Add to Home Screen**, then **Add**. If offered, enable **Open as Web App**. An OrbitGuard icon will appear on your iPhone home screen.
6. Launch the icon and test it. After the first successful visit, the app files can work offline; uploaded photos and saved notes stay on your device. External links need an internet connection.

> A PWA is a real installable home-screen web app, not a native `.ipa` App Store application. App Store distribution requires a separate native wrapper, developer credentials, and review. GitHub Pages repositories published publicly expose the website source code; don't upload secrets or proprietary files.

## Demo script: ~75 seconds

1. Open OrbitGuard from your iPhone home screen. "Dust from a lunar landing can harm exposed radiators, but keeping a protective cover closed also limits heat release."
2. Tap **Play mission** and point to the radiator-cover animation.
3. Choose **Standard lunar landing** and show both calculated controller traces.
4. Change the heat load to **30 W** to demonstrate a case where the thermal design is insufficient. "Our app shows failure conditions, not only success."
5. Tap **Scanner**, take a picture of your cardboard lunar robot, tap a painted region, and show the sampled color. Explain that component identification is manual in this version.
6. Tap **Prototype**, enter your measured servo closing time and physical thermometer readings.
7. Tap **Speak results** to hear the report read aloud.

## Accuracy and limitations

The new app follows the **lunar radiator-cover Pre-Cool project**, not an unrelated CubeSat safe-mode concept. A single-node radiative heat balance simulates a lunar robot at illustrative parameters (heat capacity 1800 J/K, area 0.06 m², emissivity 0.8 open/0.18 covered, deep-space equivalent radiation temperature 3 K). Integration step is 10 s. A reactive baseline controls cover state using a 34–36°C hysteresis, while Pre-Cool forces a pre-warning open interval. Both employ a thermal override. Open-cover minutes during simulated dust are a **proxy** for exposure, not a measurement of deposited dust. The app should not be represented as flight qualified, NASA approved, or connected to actual spacecraft.

This version does **not** implement camera AI component recognition, real sensor streaming, autonomous AI agent, actual dust plume detection, or real hardware motion. These can be subsequent releases. In the current build, color sampling and local note storage work, and the thermal forecasts are genuine calculations rather than hardcoded demonstrations.

## Project research source

NASA NTRS report 20260007321: https://ntrs.nasa.gov/citations/20260007321

## Next release priorities

1. Connect ESP32/servo and DS18B20 readings to the app over a documented secure connection.
2. Integrate a tested image recognition endpoint for components, with clear confidence/limitations.
3. Compare predictions with experimental measurements and perform repeatability tests.
4. Add a short video recording and high-resolution photographs for Devpost.
