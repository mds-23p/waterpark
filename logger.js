// Player logging functionality
const logger = {
  // Log file path
  logFile: 'player_logs.txt',

  // Log a new player
  logNewPlayer: async function() {
    try {
      // Get player's IP address
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const ipAddress = data.ip;

      // Get current timestamp
      const timestamp = new Date().toISOString();

      // Create log entry
      const logEntry = `New player - IP: ${ipAddress}, Timestamp: ${timestamp}\n`;

      // Send log entry to server
      await fetch('/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logEntry: logEntry
        })
      });

      console.log('Player logged successfully');
    } catch (error) {
      console.error('Error logging player:', error);
    }
  }
};

// Export the logger
export default logger; 