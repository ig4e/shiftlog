# Shift Tracker Application

## Overview

The **Shift Tracker** is a Progressive Web Application (PWA) designed for personal use to track work shifts. It allows users to start and end shifts, view and edit shift details, and maintain a synchronized log of shifts both locally and in MongoDB. The app can be used offline, with data synchronized when an internet connection is available.

## Features

- **Start/End Shift Button:** A single button to start or end shifts. The button state changes depending on whether a shift is active.
- **Editable Shift Logs:** Each day's shift details are displayed on a card with the option to edit the data (start time, end time, total hours).
- **PWA Support:** The app can be installed as a PWA, enabling offline functionality with local storage.
- **Shortcut Functionality:** Quickly save the current time as the start or end of a shift with dedicated shortcuts.
- **MongoDB Synchronization:** All shift data is synchronized with a MongoDB database when the app is online.

## Installation

### Prerequisites

- Bun
- MongoDB

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/shift-tracker.git
   cd shift-tracker
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```plaintext
   MONGO_URI=your_mongodb_connection_string
   ```

4. **Start the application:**

   ```bash
   npm start
   ```

   The application should now be running at `http://localhost:3000`.

## Usage

- **Starting a Shift:**
  - Open the app and press the "Start Shift" button.
- **Ending a Shift:**
  - Press the "End Shift" button to save the shift duration.
- **Editing Shift Data:**
  - Navigate to the day's card and click "Edit" to modify shift details.

## Development

### Running in Development Mode

To run the app in development mode, use:

```bash
bun run dev
```

This will start the app with live reloading enabled, making it easier to test changes.

### Building for Production

To build the app for production, run:

```bash
bun run build
```

The production-ready files will be located in the `dist` directory.

## Contributing

Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

You can adjust this template to better fit your project's specifics. If there are additional details about the project that need to be included, let me know, and I can customize it further.
