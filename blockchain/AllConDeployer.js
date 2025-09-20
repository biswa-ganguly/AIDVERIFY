const fs = require("fs");
const path = require("path");

const NgoManager = artifacts.require("NgoManager");
const CampaignManager = artifacts.require("CampaignManager");

module.exports = async function (deployer) {
  await deployer.deploy(NgoManager);
  const ngoManager = await NgoManager.deployed();

  await deployer.deploy(CampaignManager);
  const campaignManager = await CampaignManager.deployed();

  const ngoAddress = ngoManager.address;
  const campaignAddress = campaignManager.address;

  console.log("✅ NgoManager deployed at:", ngoAddress);
  console.log("✅ CampaignManager deployed at:", campaignAddress);

  // Write addresses into a JS file so they can be imported
  const content = `
    export const contractAddress = {
      ngoAddress: "${ngoAddress}",
      campaignAddress: "${campaignAddress}"
    };
  `;

  fs.writeFileSync(
    path.join(__dirname, "../contractAddresses.js"),
    content
  );
};
