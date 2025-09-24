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

  describe("Token Management", () => {
    it("Should allow owner to add new token", async () => {
      await dex.addToken(aliceCoin.address, 150);
      expect(await dex.tokenPrices(aliceCoin.address)).to.equal(150);
      expect(await dex.supportedTokens(1)).to.equal(aliceCoin.address);
    });

    it("Should reject invalid token address", async () => {
      await expect(dex.addToken(ethers.constants.AddressZero, 100))
        .to.be.revertedWith("invalid token address");
    });

    it("Should reject zero price", async () => {
      await expect(dex.addToken(aliceCoin.address, 0))
        .to.be.revertedWith("price must be greater than zero");
    });

    it("Should reject duplicate token", async () => {
      const TestToken = await ethers.getContractFactory("TokenAli");
      const testToken = await TestToken.deploy("100");
      await dex.addToken(testToken.address, 150);
  
      await expect(dex.addToken(aliceCoin.address, 200))
        .to.be.revertedWith("token already exists");
    });

    it("Should reject non-owner", async () => {
      await expect(dex.connect(addr1).addToken(aliceCoin.address, 150))
        .to.be.revertedWith("you are not the owner");
    });
  });
});