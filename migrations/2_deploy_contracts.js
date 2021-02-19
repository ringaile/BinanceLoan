var Loan = artifacts.require("./Loan.sol");

module.exports = function(deployer) {
  deployer.deploy(Loan)
};
