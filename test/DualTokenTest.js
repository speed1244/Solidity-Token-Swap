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

  describe("Token Deployments", () => {
    it("Should deploy TimCoin with correct supply", async () => {
      expect(await timCoin.totalSupply()).to.equal("100");
      expect(await timCoin.name()).to.equal("TimCoin");
      expect(await timCoin.symbol()).to.equal("TIM");
    });

    it("Should deploy AliceCoin with correct supply", async () => {
      expect(await aliceCoin.totalSupply()).to.equal("200");
      expect(await aliceCoin.name()).to.equal("AliceCoin");
      expect(await aliceCoin.symbol()).to.equal("ALICE");
    });

    it("Should deploy DEX associated with TimCoin", async () => {
      expect(await dex.associatedToken()).to.equal(timCoin.address);
      expect(await dex.getPrice(1)).to.equal(100);
    });
  });

  describe("Token Interactions", () => {
    it("Both tokens should be transferrable", async () => {
      // Transfer TimCoin
      await timCoin.transfer(addr1.address, 10);
      expect(await timCoin.balanceOf(addr1.address)).to.equal(10);

      // Transfer AliceCoin  
      await aliceCoin.transfer(addr1.address, 20);
      expect(await aliceCoin.balanceOf(addr1.address)).to.equal(20);
    });

    it("Both tokens should support approve mechanism", async () => {
      // Test TimCoin approve
      await timCoin.connect(addr1).approve(addr2.address, 5);
      expect(await timCoin.allowance(addr1.address, addr2.address)).to.equal(5);

      // Test AliceCoin approve
      await aliceCoin.connect(addr1).approve(addr2.address, 10);
      expect(await aliceCoin.allowance(addr1.address, addr2.address)).to.equal(10);
    });
  });

  describe("DEX Current Limitations", () => {
    it("DEX should only work with TimCoin currently", async () => {
      // Setup: Owner sells TimCoin to DEX
      await timCoin.approve(dex.address, 50);
      await dex.sell();

      // User can buy TimCoin from DEX
      await expect(
        dex.connect(addr1).buy(10, { value: 1000 })
      ).to.changeTokenBalances(timCoin, [dex.address, addr1.address], [-10, 10]);
    });

    it("DEX should not directly handle AliceCoin yet", async () => {
      // This is expected behavior for now - DEX only handles its associated token
      expect(await dex.associatedToken()).to.not.equal(aliceCoin.address);
    });
  });

  describe("Preparation for Multi-Token Support", () => {
    it("Should have both tokens available for future swap functionality", async () => {
      // Verify both tokens exist and are accessible
      const timCoinBalance = await timCoin.balanceOf(owner.address);
      const aliceCoinBalance = await aliceCoin.balanceOf(owner.address);
      
      expect(timCoinBalance).to.be.gt(0);
      expect(aliceCoinBalance).to.be.gt(0);
    });

    it("Should prepare token distribution for swap testing", async () => {
      // Distribute tokens to test addresses for future swap tests
      await timCoin.transfer(addr2.address, 15);
      await aliceCoin.transfer(addr2.address, 25);

      expect(await timCoin.balanceOf(addr2.address)).to.equal(15);
      expect(await aliceCoin.balanceOf(addr2.address)).to.equal(25);
    });
  });
});