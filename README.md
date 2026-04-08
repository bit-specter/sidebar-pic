# Sidebar Pic: Mood Booster 🚀

**Sidebar Pic** is a VS Code extension that allows you to display an inspirational photo (mood booster) directly in your Explorer sidebar. Perfect for developers who need a little extra motivation during long debugging sessions or tight project deadlines.

---

## ✨ Features

* **Custom Explorer View**: Adds a dedicated section within your VS Code Explorer.
* **Highly Customizable**: Change the dropdown title and the image URL anytime via Settings.
* **Command Palette Ready**: Quickly change title/URL or pick a local image from `Ctrl + Shift + P`.
* **Local Image Support**: Use images from your own computer.
* **Lightweight**: Optimized to ensure it doesn't impact your coding performance.
* **Real-time Updates**: Changes in Settings are applied immediately without needing to restart VS Code.

---

## 🛠️ Installation

1. Open VS Code.
2. Go to the **Extensions** view (`Ctrl+Shift+X`).
3. Search for **"Sidebar Pic: Mood Booster"**.
4. Click **Install**.

---

## ⚙️ Extension Settings

This extension contributes the following settings, which can be accessed via `File > Preferences > Settings` (or `Ctrl + ,`) by searching for `sidebarPic`:

* `sidebarPic.title`: Change the title that appears in the sidebar header (Default: `MY INSPIRATION`).
* `sidebarPic.imageUrl`: Enter the URL of the image (Unsplash, Pinterest, or any direct image link) you want to display.
* `sidebarPic.localImagePath`: Local image path chosen via Command Palette. If set, this is used instead of `sidebarPic.imageUrl`.

### Commands (`Ctrl + Shift + P`)

* `Sidebar Pic: Set Title`
* `Sidebar Pic: Set Image URL`
* `Sidebar Pic: Select Local Image`
* `Sidebar Pic: Clear Local Image`

---

## 📖 How to Use

1. Open the **Explorer** sidebar (`Ctrl + Shift + E`).
2. Scroll to the bottom of the sidebar (below Outline/Timeline).
3. You will find a section with your configured title (default: **PHOTO**).
4. Click the arrow to expand and view your inspirational photo!

> **Pro Tip:** You can drag-and-drop this section header to the very top of the Explorer so your photo is the first thing you see.

---

## 📝 Release Notes

### 0.0.2

* Added Command Palette support:
  * `Sidebar Pic: Set Title`
  * `Sidebar Pic: Set Image URL`
  * `Sidebar Pic: Select Local Image`
  * `Sidebar Pic: Clear Local Image`
* Added local image support (`sidebarPic.localImagePath`) with file picker workflow.
* Added clickable Settings actions for browsing and clearing local image path.
* Improved live update behavior when settings change.

### 0.0.1

* Initial release of Sidebar Pic.
* Added a Webview View in Explorer sidebar.
* Added configurable title and remote image URL.

---

## 🤝 Contributing

Developed with ❤️ by **MEIS Developer**. If you have feature suggestions or find any bugs, please feel free to open an issue on our GitHub repository.

### Happy Coding! 💻🔥
