const { expect } = require("chai");

describe("Dual Token Integration", () => {
  let timCoin, aliceCoin, dex;
  let owner, addr1, addr2;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy both tokens
    const TimCoin = await ethers.getContractFactory("Token");
    timCoin = await TimCoin.deploy("100");
    
    const AliceCoin = await ethers.getContractFactory("TokenAli");
    aliceCoin = await AliceCoin.deploy("200");
    
    // Deploy DEX (currently only supports TimCoin)
    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(timCoin.address, 100);
  });

  describe("DEX Integration", () => {
    it("Should deploy DEX associated with TimCoin", async () => {
      expect(await dex.associatedToken()).to.equal(timCoin.address);
    });

    it("DEX should work with TimCoin but not AliceCoin", async () => {
      expect(await dex.associatedToken()).to.equal(timCoin.address);
      expect(await dex.associatedToken()).to.not.equal(aliceCoin.address);
      
      await timCoin.approve(dex.address, 30);
      await dex.sell();
      expect(await dex.getTokenBalance()).to.be.gt(0);
      
      const dexTokenBalance = await aliceCoin.balanceOf(dex.address);
      expect(dexTokenBalance).to.equal(0);
    });
  });
});