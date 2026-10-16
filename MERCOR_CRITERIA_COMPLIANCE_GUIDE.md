# Mercor AutoQC & Reviewer 35-Point Compliance Checklist

This document maps every single grading item from your Mercor Studio checklist to your project setup and recording execution.

---

## 📁 Section A: Files & Deliverables (Criteria 1–6b)

| Item | Mercor Criterion | How It Is Satisfied in This Project |
| :---: | :--- | :--- |
| **1** | All four task files uploaded: screen recording MP4, `deliverables.zip`, Task Recorder zip, `Metadata.rtf` | `deliverables.zip` and `Metadata.rtf` are generated and ready in your project root `D:\mercur\oding\demo_ecom\`. |
| **2** | `recording.zip` contents complete; screenshots present | Handled automatically by the TaskRecorder desktop app upon stopping. |
| **3** | `video.mp4` opens | Verify the output video file opens in VLC / QuickTime before submitting. |
| **4** | Video length within 15 to 45 minutes | Our recording script is tuned for **25 to 30 minutes** (ideal sweet spot). |
| **5** | **Deliverables named correctly:**<br>`input 1...`, `artifact 1...`, `final output 1...` | Stored inside `deliverables.zip` and `deliverables/` folder:<br>• `input 1 - synthetic_products.json`<br>• `artifact 1 - cart_api_validation.postman_collection.json`<br>• `artifact 2 - cart_validation_suite.http`<br>• `final output 1 - cart_quantity_rejection_findings_report.md` |
| **6a** | `Metadata.rtf` matches task (apps, OTA, workflow) | Formatted RTF document [`Metadata.rtf`](file:///d:/mercur/oding/demo_ecom/Metadata.rtf) created with exact workflow and criteria. |
| **6b** | `Metadata.rtf` apps and OTA match Studio | Lists **Visual Studio Code** and **Docker Desktop**; OTA: **Software Engineering / QA & API Testing**. |

---

## 🖥️ Section B: Recording Setup (Mac / Environment Checks 7–15)

> [!IMPORTANT]
> Complete these settings on your Mac **before** hitting Record!

| Item | Mercor Criterion | What to Do Before Recording |
| :---: | :--- | :--- |
| **7** | Seconds displayed on menu bar clock | On Mac: **System Settings &rarr; Control Center &rarr; Clock Options** &rarr; toggle **"Display the time with seconds"** on. |
| **8** | Dock is visible at start and end of recording, Dock stays visible (not covered) | Ensure **"Automatically hide and show the Dock"** is **OFF**. Never stretch windows over the Dock. |
| **9** | **Dock is NOT at the bottom** | On Mac: **System Settings &rarr; Desktop & Dock &rarr; Position on screen** &rarr; select **Left** or **Right**. |
| **10** | Accessibility Inspector icon visible in Dock with a dot underneath | Launch **Accessibility Inspector** (via Xcode &rarr; Developer Tools &rarr; Accessibility Inspector) so its icon has an active dot in the Dock. |
| **11** | Accessibility Inspector window is NOT visible during recording | Keep the Accessibility Inspector window minimized or hidden behind your active windows (do not close/quit it). |
| **12** | TaskRecorder window shows accurate task description | Set task title in TaskRecorder to: *"Check whether a cart API rejects invalid quantities"*. |
| **13** | Task description document shown at start of recording | Show `README.md` or task description on screen for the first 15–20 seconds. |
| **14** | Task description NOT narrated for > 30 seconds at start | State the goal concisely (e.g. *"Our objective today is to verify whether the cart API rejects invalid quantities before a storefront release"* in under 25 seconds), then immediately begin workflow. |
| **15** | At least 1 UI element changed from default Mac setup | Satisfied by: Dock on Left/Right + Seconds displayed on menu bar clock. |

---

## 🎙️ Section C: During Recording & Narration (Criteria 16–26)

| Item | Mercor Criterion | Golden Rule to Follow |
| :---: | :--- | :--- |
| **16** | Filling out `Metadata.rtf` is NOT shown in recording | `Metadata.rtf` is already created. **Never open or edit it on camera.** |
| **17** | No unused window covers > 25% of another for > 6s | Keep VS Code and Docker Desktop either cleanly side-by-side or use clean full-window Alt-Tab switches. |
| **18** | Mouse idle never longer than 45s | While speaking, gently use the mouse cursor to guide the viewer’s eye (point to JSON fields, HTTP response codes, etc.). |
| **19** | Typing is at most 20% of video length (coding exception: ~30%) | Our workflow requires almost **zero live typing**! You simply click **"Send Request"** in `tests/cart-validation.http` and run pre-written terminal commands (`npm run test:newman`, `npm test`). |
| **20** | Zero use of restricted apps | Close Slack, Telegram, Discord, personal browser tabs, personal email before recording. Only use VS Code and Docker Desktop. |
| **21** | Narration cadence followable at normal speed | Speak clearly, calmly, and at a steady professional pace. |
| **22** | No periods of silence > 45 seconds | Talk continuously as you work through each test case. (See `RECORDING_WALKTHROUGH.md` for spoken cues). |
| **23** | No major background noise affecting audio | Use a headset / quiet room with noise suppression enabled. |
| **24** | **Narration says WHAT, WHERE, and WHY for every action** | Use this formula on every step:<br>• **WHERE:** *"Here in Visual Studio Code in `tests/cart-validation.http`..."*<br>• **WHAT:** *"...I am clicking Send Request on Case 1 with quantity -1..."*<br>• **WHY:** *"...to verify whether the cart endpoint rejects negative quantities with HTTP 400 Bad Request."* |
| **25** | Eyes open / writer attentive throughout | Stay engaged with the camera/screen. |
| **26** | Recording shows writer doing what task description says | Every action directly validates the cart endpoint against invalid quantities. |

---

## 🔍 Section D: Reviewer-Only Checklist (Criteria 27–35)

| Item | Mercor Criterion | How to Pass |
| :---: | :--- | :--- |
| **27** | TaskRecorder window not shown outside start/stop flow | Minimize TaskRecorder immediately after clicking Record; only bring it back to click Stop. |
| **28** | **Mouse clicks have a 1+ second pause after each click** | **VERY IMPORTANT:** Do not rapid-click or double-click! Click "Send Request" &rarr; pause for 1 second &rarr; highlight response &rarr; pause 1 second &rarr; proceed. |
| **29** | No AI interaction in recording | No ChatGPT, Claude, Copilot, or chat assistants visible on screen during the recording. |
| **30** | PII is not visible or audible anywhere | No personal names, personal phone numbers, or private emails visible on screen. |
| **31** | Studio / Airtable / Mercor / project info NOT shown | **Never** bring up your browser with Mercor Studio, Airtable, or guidelines during the recording! |
| **32** | No paywalled or copyrighted content | All synthetic data and open-source packages. |
| **33** | No profanity in narration or on screen | Keep everything strictly professional. |
| **34** | English language only | All code, documentation, and narration in English. |
| **35** | Confirmation statement | Confirm: *"Yes, I confirm that I checked that my recording meets all of the above criteria."* |
