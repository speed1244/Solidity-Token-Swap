const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;

const tokenAbi = [
      "constructor(uint256 initialSupply)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
      "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];
const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let tokenContract = null;

const dexAbi = [
      "constructor(address _token, uint256 _price)",
      "function associatedToken() view returns (address)",
      "function buy(uint256 numTokens) payable",
      "function getPrice(uint256 numTokens) view returns (uint256)",
      "function getTokenBalance() view returns (uint256)",
      "function sell()",
      "function withdrawFunds()",
      "function withdrawTokens()"
];
const dexAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let dexContract = null;

async function getAccess() {
  if (tokenContract) return;
  try {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
    dexContract = new ethers.Contract(dexAddress, dexAbi, signer);

    const chainId = (await provider.getNetwork()).chainId;
    // Hardhat's default chain ID is 31337
    const hardhatChainId = 31337;

    if (chainId !== hardhatChainId) {
      console.log("Please switch your MetaMask to the Hardhat Localhost network (Chain ID: 31337).", true);
      
      // Attempt to switch the network programmatically
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${hardhatChainId.toString(16)}` }],
        });
        // After switching, the page might reload, which is expected
      } catch (switchError) {
        // This error code means the network has not been added to MetaMask
        if (switchError.code === 4902) {
          console.log("Hardhat Localhost network not found. Please add it to your MetaMask.", true);
        } else {
          console.log("Could not switch network. Please do it manually in MetaMask.", true);
        }
      }
      return;
    }
  } catch (error) {
    console.error("Failed to get access to wallet:", error);
    console.log("Failed to connect wallet. Please ensure MetaMask is installed and unlocked.", true);
  }
}

async function getPrice() {
  await getAccess();
  const price = await dexContract.getPrice(1);
  document.getElementById("tokenPrice").innerHTML = price;
  return price;
}

async function getTokenBalance() {
  await getAccess();
  try {
    const balance = await tokenContract.balanceOf(await signer.getAddress());
    document.getElementById("tokensBalance").innerHTML = balance;
    console.log("Token balance updated successfully.", false);
  } catch (error) {
    console.error("Error fetching token balance:", error);
  }
}


async function getAvailableTokens() {
  try {
    const tokens = await dexContract.getTokenBalance();
    document.getElementById("tokensAvailable").innerHTML = tokens.toString();
  } catch (error) {
    console.error(`Error getting available tokens: ${error.message}`, 'bg-red-200 text-red-800');
  }
}

async function grantAccess() {
  await getAccess();
  const value = document.getElementById("tokenGrant").value;
  await tokenContract
    .approve(dexAddress, value)
    .then(() => alert("success"))
    .catch((error) => alert(error));
}

async function transferTokensToDEX() {
  await getAccess();
  await dexContract
    .sell()
    .then(() => alert("Success"))
    .catch((error) => alert(error));
}

async function buy() {
  await getAccess();
  const tokenAmount = document.getElementById("tokensToBuy").value;
  const value = (await getPrice()) * tokenAmount;
  await dexContract
    .buy(tokenAmount, { value: value })
    .then(() => alert("Success"))
    .catch((error) => alert(error));
}
