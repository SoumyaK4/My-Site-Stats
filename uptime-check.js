const fs = require('fs');
const https = require('https');
const http = require('http');

// List your sites here (update with your sites)
const sites = [
  {
    name: "SoumyaK4",
    url: "https://soumyak4.in/"
  },
  {
    name: "Weiqi Roadmap",
    url: "https://weiqi.soumyak4.in/"
  },
  {
    name: "BadukTube",
    url: "https://baduklectures.soumyak4.in/"
  },
  {
    name: "IGD",
    url: "https://badukdb.soumyak4.in/"
  },
  {
    name: "Timeline",
    url: "https://soumyak4.in/Timeline/"
  },
  // Add more sites as needed
];

// Function to get the current date/time in IST
function getISTTime() {
  return new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
}

// Function to check a site and measure response time
function checkSite(site) {
  return new Promise((resolve) => {
    const start = Date.now();
    const lib = site.url.startsWith('https') ? https : http;
    const request = lib.get(site.url, (res) => {
      const responseTime = Date.now() - start;
      let status;
      if (res.statusCode === 200) {
        if (responseTime < 500) {
          status = "up";
        } else if (responseTime <= 5000) {  // response time between 500 and 5000 ms is "slow"
          status = "slow";
        } else {
          status = "down";
        }
      } else {
        status = "down";
      }
      resolve({
        status,
        responseTime: responseTime + "ms"
      });
      res.resume(); // consume the response data to free memory
    });
    request.on('error', () => {
      const responseTime = Date.now() - start;
      resolve({
        status: "down",
        responseTime: responseTime + "ms"
      });
    });
    request.setTimeout(10000, () => { // 10-second timeout
      request.abort();
      const responseTime = Date.now() - start;
      resolve({
        status: "down",
        responseTime: responseTime + "ms"
      });
    });
  });
}

// Read existing uptime data (if available)
const dataFile = 'data.json';
let data = [];
if (fs.existsSync(dataFile)) {
  try {
    data = JSON.parse(fs.readFileSync(dataFile));
  } catch (err) {
    console.error("Error reading data.json, starting fresh:", err);
    data = [];
  }
}

// Convert data array to a map for easier update keyed by URL
let dataMap = {};
data.forEach(site => {
  dataMap[site.url] = site;
});

// Process each site sequentially
async function processSites() {
  for (const site of sites) {
    const result = await checkSite(site);
    const currentTime = getISTTime();
    if (dataMap[site.url]) {
      // If the site is down now, update the lastDown field
      if (result.status === "down") {
        dataMap[site.url].lastDown = currentTime;
      }
      dataMap[site.url].status = result.status;
      dataMap[site.url].responseTime = result.responseTime;
      dataMap[site.url].lastChecked = currentTime;
    } else {
      // Create a new record
      dataMap[site.url] = {
        name: site.name,
        url: site.url,
        status: result.status,
        responseTime: result.responseTime,
        lastChecked: currentTime,
        lastDown: result.status === "down" ? currentTime : null
      };
    }
  }
}

// Update data.json with the new uptime data
async function updateDataFile() {
  await processSites();
  const updatedData = Object.values(dataMap);
  fs.writeFileSync(dataFile, JSON.stringify(updatedData, null, 2));
}

updateDataFile()
  .then(() => console.log("Uptime data updated."))
  .catch(err => console.error("Error updating uptime data:", err));
