# FCTC Mobile App - Local Setup Guide

This guide explains how to run the **campus-to-career** mobile app on an Android Emulator using VS Code and Android Studio.

## 1. Prerequisites
* **Node.js & pnpm:** Ensure Node.js is installed. Install pnpm globally:
    ```powershell
    npm install -g pnpm
    ```
* **Android Studio:** Download and install. Ensure "Android Virtual Device" is selected during setup.

## 2. Windows Environment Configuration (One-Time Setup)
To allow VS Code to talk to the Android tools:
1.  Search Windows for **"Edit the system environment variables"**.
2.  Click **Environment Variables**.
3.  Under **User Variables**, click **New**:
    * **Variable Name:** `ANDROID_HOME`
    * **Variable Value:** `%LOCALAPPDATA%\Android\Sdk`
4.  Find the **Path** variable in the same list, click **Edit** > **New**, and add:
    * `%LOCALAPPDATA%\Android\Sdk\platform-tools`
    * `%LOCALAPPDATA%\Android\Sdk\emulator`
5.  **Restart VS Code.**

## 3. Launching the Emulator
1.  Open **Android Studio**.
2.  Click **More Actions** > **Virtual Device Manager**.
3.  Click the **Play (Triangle)** button next to your virtual phone to launch it.

## 4. Running the App
Open your VS Code terminal and run:

1.  **Navigate to the App Folder:**
    ```powershell
    cd artifacts/campus-to-career
    ```
2.  **Install Dependencies:**
    ```powershell
    pnpm install --ignore-scripts
    ```
3.  **Start Expo:**
    ```powershell
    npx expo start
    ```
4.  **Open on Android:**
    Once the QR code appears in your terminal, press **`a`** on your keyboard.

## 5. Quick Fixes
* **Blank Screen?** Stop the terminal (Ctrl+C) and run `npx expo start -c` to clear the cache.
* **Not Opening?** Ensure the emulator is fully booted to the home screen before pressing 'a'.
