const NgoManager=artifacts.require("./NgoManager.sol");

module.exports = function(deployer) {

  deployer.deploy(NgoManager);
};