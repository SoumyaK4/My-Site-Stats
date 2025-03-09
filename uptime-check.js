const fs = require('fs');
const https = require('https');
const http = require('http');

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
  }
];

function getISTTime() {
  return new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
}

function checkSite(site) {
  return new Promise((resolve) => {
    const start = Date.now();
    const lib = site.url.startsWith('https') ? https : http;
    const request = lib.get(site.url, (res) => {
      const responseTime = Date.now() - start;
      let status;
      if (res.statusCode === 200) {
        status = responseTime < 150 ? "up" : "slow";
      } else {
        status = "down";
      }
      resolve({
        status,
        responseTime: responseTime + "ms"
      });
      res.resume();
    });
    request.on('error', () => {
      const responseTime = Date.now() - start;
      resolve({
        status: "down",
        responseTime: responseTime + "ms"
      });
    });
    request.setTimeout(10000, () => {
      request.abort();
      const responseTime = Date.now() - start;
      resolve({
        status: "down",
        responseTime: responseTime + "ms"
      });
    });
  });
}

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

let dataMap = {};
data.forEach(site => {
  dataMap[site.url] = site;
});

async function processSites() {
  for (const site of sites) {
    const result = await checkSite(site);
    const currentTime = getISTTime();
    if (dataMap[site.url]) {
      if (result.status === "down") {
        dataMap[site.url].lastDown = currentTime;
      }
      dataMap[site.url].status = result.status;
      dataMap[site.url].responseTime = result.responseTime;
      dataMap[site.url].lastChecked = currentTime;
    } else {
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

async function updateDataFile() {
  await processSites();
  const updatedData = Object.values(dataMap);
  fs.writeFileSync(dataFile, JSON.stringify(updatedData, null, 2));
}

updateDataFile()
  .then(() => console.log("Uptime data updated."))
  .catch(err => console.error("Error updating uptime data:", err));
