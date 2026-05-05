// Mobile app configuration
// Change API_BASE_URL to your machine's local IP for physical device testing
// e.g., 'http://192.168.1.100:5000'
// For emulator on same machine, use 'http://10.0.2.2:5000' (Android) or 'http://localhost:5000' (iOS)

const Config = {
  // UPDATE THIS to your machine's IP: Use 'ipconfig' command to find IPv4 Address
  // For testing on same machine use: 'http://localhost:5000'
  // For physical device testing: replace with your actual IP (e.g., 'http://192.168.1.100:5000')
  API_BASE_URL: 'https://app-ud6c.onrender.com',
  // Timeouts
  REQUEST_TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 60000,
};

export default Config;
