document.addEventListener("DOMContentLoaded", function() {
  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector("#uptime-table tbody");
      tbody.innerHTML = "";
      data.forEach(site => {
        const tr = document.createElement("tr");

        // Site name with link
        const siteNameTd = document.createElement("td");
        const link = document.createElement("a");
        link.href = site.url;
        link.textContent = site.name;
        link.target = "_blank";
        siteNameTd.appendChild(link);
        tr.appendChild(siteNameTd);

        // Status with emoji and color
        const statusTd = document.createElement("td");
        let statusText, statusClass;
        if (site.status === "up") {
          statusText = "👍 Up";
          statusClass = "status-up";
        } else if (site.status === "slow") {
          statusText = "⚠️ Slow";
          statusClass = "status-slow";
        } else if (site.status === "down") {
          statusText = "👎 Down";
          statusClass = "status-down";
        }
        statusTd.textContent = statusText;
        statusTd.classList.add(statusClass);
        tr.appendChild(statusTd);

        // Response time
        const responseTimeTd = document.createElement("td");
        responseTimeTd.textContent = site.responseTime;
        tr.appendChild(responseTimeTd);

        // Last checked datetime (IST)
        const lastCheckedTd = document.createElement("td");
        lastCheckedTd.textContent = site.lastChecked;
        tr.appendChild(lastCheckedTd);

        // Last downtime datetime (IST)
        const lastDownTd = document.createElement("td");
        lastDownTd.textContent = site.lastDown || "N/A";
        tr.appendChild(lastDownTd);

        tbody.appendChild(tr);
      });
    })
    .catch(error => console.error("Error fetching data.json:", error));
});
