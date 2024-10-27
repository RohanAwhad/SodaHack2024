// content.js
console.log("content.js loaded");

// Function to fetch the availability status of a domain
async function checkDomainAvailability(domain) {
  return True
}

// Main function to find all domains and check their availability
async function checkAllDomains() {
  console.log("Checking all domains...");
  const domainElements = document.getElementsByClassName('spin-domain-span overflow-wrap text-break lh-reset spin-domain-span-dynamic-font-scaling');
  console.log(domainElements);
  for (let element of domainElements) {
      const domain = element.innerText.trim();
      const isAvailable = await checkDomainAvailability(domain);

      console.log(`Domain: ${domain}, Available: ${isAvailable}`);

      if (isAvailable) {
          const availabilityText = document.createElement("span");
          availabilityText.style.color = "green";
          availabilityText.textContent = " Available";
          element.appendChild(availabilityText);
      }
  }
}

// Execute the domain check when this script is triggered
checkAllDomains();
