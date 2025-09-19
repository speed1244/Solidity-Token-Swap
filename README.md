This project is a decentralized exchange protocol built with Solidity. It currently implements an ERC-20 token contract and a DEX contract with a fixed-price trading mechanism. Using the Hardhat framework, the project includes comprehensive automated testing and a Web3-enabled frontend for user interaction.

## Development Plan

1. Multi-Token Exchange Foundation
   The goal is to lay the groundwork for a scalable multi-token exchange.

2. Implement the Core AMM Mechanism

## Getting Started

To test and deploy the smart contract follow the steps below.

1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone the repository
3. `cd Solidity-Token-Swap`
4. `npm install`
5. To test the contract run `npx hardhat test`
6. To deploy the contract to your `localhost` network do the following:
   - `npx hardhat node`
   - `npx hardhat run --network localhost ./script/deploy.js`

## Using the Frontend

1. Install the [Liveserver Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VSCode.
2. Open [index.html](http://127.0.0.1:5500/frontend/)
3. Click the button that says "Go Live" in the bottom right hand corner of your VSCode.
4. Import any accounts you need into MetaMask and change your MetaMask network to "Hardhat".
5. Interact with the contract!
