const DonorManager=artifacts.require("./DonorManager.sol");

module.exports = function(deployer) {

  deployer.deploy(DonorManager);
};