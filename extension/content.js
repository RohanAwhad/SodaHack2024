async function checkIllegalActivity(domainName) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'checkIllegalActivity', domain_name: domainName }, (response) => {
      console.log(response)
      if (response) {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(response.error);
        }
      } else {
       reject('undefined response');
      }
    });
  });
}



window.addEventListener('load', () => {
  console.log('content.js loaded');
  console.log('Page fully loaded2!');
  console.log('Checking all domains...');

  // wait for the page to finish loading
  setTimeout(() => {
    fetchData();
  }, 4000);

  async function fetchData() {
    const domainElements = document.getElementsByClassName('spin-domain-span overflow-wrap text-break lh-reset spin-domain-span-dynamic-font-scaling');
    console.log('len', domainElements.length);

    for (let i = 0; i < domainElements.length; i++) {
      const domain_name = domainElements[i].innerText.trim();

      // get illegal activity and deatils
      try{
        const { illegal_activity, details } = await checkIllegalActivity(domain_name);
        let status, status_color
        if (illegal_activity) {
          status = 'Haunted';
          status_color = '#f46565'
        } else {
          status = 'Safe';
          status_color = '#63c14a'
        }

        const availabilityText = document.createElement('span');
        availabilityText.style.borderRadius = '50px';
        availabilityText.style.padding = '6px 9px';
        availabilityText.style.marginLeft = '5px';
        availabilityText.style.fontSize = '18px';
        availabilityText.style.color = 'white';
        availabilityText.style.cursor = 'pointer';
        availabilityText.style.cursor = 'pointer';
        console.log(status);
        availabilityText.textContent = status;
        availabilityText.style.background = status_color;

        availabilityText.addEventListener('click', (event) => {
          event.stopPropagation();
          data = {
            "domain_name": domain_name,
            "status": status,
            "details": details
          }
        console.log(data);
          createPopup(data);
        });
        domainElements[i].appendChild(availabilityText);
      } catch (error) {
        console.log(error)
      }
    }
  }

  
});

// Function to create the popup
function createPopup(content) {
  console.log(content);
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';

  const popupBox = document.createElement('div');
  popupBox.style.backgroundColor = 'white';
  popupBox.style.padding = '20px';
  popupBox.style.borderRadius = '8px';
  popupBox.style.width = '500px';
  popupBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

  const oneLinerHeading = document.createElement('h3');
  oneLinerHeading.style.marginBottom = '10px';
  oneLinerHeading.style.fontSize = '24px';
  oneLinerHeading.style.fontWeight = 'bold';
  oneLinerHeading.style.lineHeight = '1';

  if (content['status'] === 'Haunted') {
    oneLinerHeading.style.color = '#f46565';
    oneLinerHeading.textContent = "Beware! This domain is spookier than a graveyard at midnight!";
  } else {
    oneLinerHeading.style.color = '#63c14a';
    oneLinerHeading.textContent = "This domain is as safe as a pumpkin in a patch—no ghosts here!";
    
  }

  const headingContent = document.createElement('p');
  headingContent.style.marginBottom = '10px';
  headingContent.style.fontSize = '18px';
  headingContent.style.fontWeight = 'bold';
  headingContent.textContent = content['domain_name'];

  const paragraph = document.createElement('p');
  paragraph.style.marginBottom = '10px';
  paragraph.textContent = content['details'];

  const a_href = document.createElement('a');
  a_href.href = "https://www.google.com/search?q=" + content['domain_name'];
  a_href.target = '_blank';
  a_href.textContent = 'Read more';
  a_href.style.textDecoration = 'none';
  a_href.style.cursor = 'pointer';

  popupBox.appendChild(oneLinerHeading);
  popupBox.appendChild(headingContent);
  popupBox.appendChild(paragraph);
  popupBox.appendChild(a_href);

  overlay.addEventListener('click', function(event) {
    if (event.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  overlay.appendChild(popupBox);
  document.body.appendChild(overlay);
}

async function checkDomainAvailability(domain) {
  return true;
}



