# Android App Build Guide

## Prerequisites

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install with Android SDK

2. **Install Java JDK 17**
   ```bash
   sudo apt install openjdk-17-jdk
   ```

## Build Steps

### 1. Build Web Assets
```bash
npm run build
```

### 2. Add Android Platform
```bash
npx cap add android
```

### 3. Sync Web Assets to Android
```bash
npx cap sync
```

### 4. Open in Android Studio
```bash
npx cap open android
```

### 5. Build APK in Android Studio
1. Wait for Gradle sync to complete
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### 6. Install on Device
```bash
# Via USB (enable USB debugging on phone)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or copy APK to phone and install manually
```

## Testing

1. **Emulator**: Use Android Studio's AVD Manager
2. **Physical Device**: Enable Developer Options + USB Debugging

## Notes

- First build takes 5-10 minutes (downloads dependencies)
- APK size: ~50-70MB (debug build)
- For production: Use **Build** → **Generate Signed Bundle/APK**
