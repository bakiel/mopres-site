import { VercelCore } from "@vercel/sdk/core.js";
import { deploymentsGetDeploymentEvents } from "@vercel/sdk/funcs/deploymentsGetDeploymentEvents.js";
import { deploymentsGetDeployment } from "@vercel/sdk/funcs/deploymentsGetDeployment.js";

// Replace with your actual bearer token and deployment details
const bearerToken = "JQfsZN2rxITf99EUBgiFANF2";
const deploymentIdOrUrl = "https://mopres-site-j4tpqo2ok-bakielisrael-gmailcoms-projects.vercel.app"; // Using full URL
const slug = "bakielisrael-gmailcoms-projects"; // Or your teamId if you have it

const vercel = new VercelCore({
  bearerToken: bearerToken,
});

async function getDeploymentDetails() {
  console.log(`Fetching details for deployment: ${deploymentIdOrUrl} with slug: ${slug}`);
  try {
    const res = await deploymentsGetDeployment(vercel, { // Assuming deploymentsGetDeployment is available
      idOrUrl: deploymentIdOrUrl,
      slug: slug, // or teamId: "your_team_id"
      // withGitRepoInfo: "true", // Optional: to get git repo info
    });

    if (!res.ok) {
      console.error("Error fetching deployment details:", res.error);
      if (res.error && res.error.message) {
        console.error("Error message:", res.error.message);
      }
      if (res.error && res.error.code) {
        console.error("Error code:", res.error.code);
      }
      if (res.error && res.error.body) {
        console.error("Error body:", JSON.stringify(res.error.body, null, 2));
      }
      return null;
    }
    const { value: deploymentDetails } = res;
    console.log("Deployment Details:", JSON.stringify(deploymentDetails, null, 2));
    return deploymentDetails;

  } catch (error) {
    console.error("An unexpected error occurred while fetching deployment details:", error);
    return null;
  }
}


async function getLogs() {
  const details = await getDeploymentDetails();
  if (!details) {
    console.log("Could not retrieve deployment details. Aborting log fetch.");
    return;
  }
  // If details are fetched, proceed to get logs (or decide based on details)
  console.log(`Fetching logs for deployment: ${deploymentIdOrUrl} with slug: ${slug}`);
  try {
    const res = await deploymentsGetDeploymentEvents(vercel, {
      idOrUrl: deploymentIdOrUrl,
      slug: slug, // or teamId: "your_team_id"
    });

    if (!res.ok) {
      console.error("Error fetching deployment events:", res.error);
      if (res.error && res.error.message) {
        console.error("Error message:", res.error.message);
      }
      if (res.error && res.error.code) {
        console.error("Error code:", res.error.code);
      }
      if (res.error && res.error.body) {
        console.error("Error body:", JSON.stringify(res.error.body, null, 2));
      }
      return;
    }

    const { value: result } = res;

    if (result && result.length > 0) {
      console.log("Deployment Events:");
      result.forEach(event => {
        console.log(JSON.stringify(event, null, 2));
      });
    } else {
      console.log("No deployment events found.");
    }

  } catch (error) {
    console.error("An unexpected error occurred while fetching logs:", error);
  }
}

getLogs();