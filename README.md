# Predictive Safety Dashboard

## Problem Statement
Road accidents and vehicle-related emergencies often escalate due to delayed hazard detection and a lack of real-time communication between the vehicle, its owner, and emergency authorities. Current monitoring solutions lack "predictive intervention"—the ability to proactively detect an impending hazard and immediately alert relevant parties before a situation worsens.

## Project Description
The **Predictive Safety Dashboard** is a real-time Road Hazard and Safety Monitoring System built to demonstrate "Predictive Intervention." It features a live Edge AI dashboard that visualizes vehicle telemetry (such as speed and location) and performs real-time geofencing (centered around Kerala). The dashboard uses SVG overlays to simulate AI-driven hazard detection and automatically triggers email alerts to vehicle owners and authorities via a Node.js backend when an unsafe condition is identified.

---

## Google AI Usage
### Tools / Models Used
- **Google Gemini** (Generative AI for rapid prototyping and architecture design)
- Simulated Google Edge TPU processing (For visual hazard detection logic)

### How Google AI Was Used
Google AI was an instrumental part of developing this prototype. We used Google's models to help design the "Predictive Intervention" geofencing algorithms, structure our vehicle telemetry data flow, and generate the foundational code for our automated alert system. The conceptualization of how an Edge AI model would process live video feeds and trigger instant safety notifications relies heavily on patterns designed with Google AI.

---

## Proof of Google AI Usage
Attach screenshots in a `/proof` folder:

![AI Proof](./proof/screenshot1.png)
 <img width="1280" height="767" alt="image" src="https://github.com/user-attachments/assets/87487b8f-3a6f-465d-bc00-5ac9d7c91052" />
 <img width="1277" height="667" alt="image" src="https://github.com/user-attachments/assets/6a972f82-3afa-4197-a86f-97bff6c10db8" />
https://drive.google.com/drive/folders/1DvKvrbKEjC9fNmWK_aEeQQYNydjQZtrK?usp=drive_link
---

## Screenshots 
Add project screenshots:

<img width="1280" height="672" alt="image" src="https://github.com/user-attachments/assets/dfde5585-97cd-40d1-9acb-760edaa5797e" />
<img width="1259" height="668" alt="image" src="https://github.com/user-attachments/assets/d917edd0-b03a-4f3f-b30e-ced0693aebcd" />
https://drive.google.com/drive/folders/1DvKvrbKEjC9fNmWK_aEeQQYNydjQZtrK?usp=drive_link


![Alert Triggered](./assets/screenshot2.png)
*(Note: Please upload your dashboard screenshots to an `assets` folder)*

---

## Demo Video
Upload your demo video to Google Drive and paste the shareable link here(max 3 minutes).
https://drive.google.com/drive/folders/1DvKvrbKEjC9fNmWK_aEeQQYNydjQZtrK?usp=drive_link


---

## Installation Steps

```bash
# Clone the repository
git clone <your-repo-link>

# Go to project folder
cd presentation-ui

# Install dependencies
npm install

# Run the project (This will start the Node server on port 3000)
npm start
```
