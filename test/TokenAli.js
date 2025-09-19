const { expect } = require("chai");

describe("TokenAli", () => {
  let tokenSupply = "200";
  let aliceCoin;
  let owner;
  let addr1;
  let addr2;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const AliceCoin = await ethers.getContractFactory("TokenAli");
    aliceCoin = await AliceCoin.deploy(tokenSupply);
  });

  describe("Deployment", () => {
    it("Should assign total supply of tokens to the owner/deployer", async () => {
      const ownerBalance = await aliceCoin.balanceOf(owner.address);
      expect(await aliceCoin.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct name and symbol", async () => {
      expect(await aliceCoin.name()).to.equal("AliceCoin");
      expect(await aliceCoin.symbol()).to.equal("ALICE");
    });
  });

  describe("Transactions", () => {
    it("Should transfer tokens between accounts", async () => {
      await aliceCoin.transfer(addr1.address, 50);
      const addr1Balance = await aliceCoin.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async () => {
      await expect(aliceCoin.connect(addr1).transfer(addr2.address, 51)).to.be
        .reverted;
    });
  });
});