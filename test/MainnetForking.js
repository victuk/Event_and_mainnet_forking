import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x97b3818902fBf430e1f7dC265F9F18aBCdb15442";
    const USDC = "0x6033F7f88332B8db6ad452B7C6D5bB643990aE3f";
    const USDT = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const TOKEN_HOLDER = "";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountOut = ethers.parseUnits("20", 18);
    const amountInMax = ethers.parseUnits("1000", 6);

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", USDT);
    
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    await USDC_Contract.approve(ROUTER, amountOut);

    const usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBal = await DAI_Contract.balanceOf(impersonatedSigner.address);
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    console.log("usdc balance before swap", Number(usdcBal));
    console.log("USDT balance before swap", Number(daiBal));

    await ROUTER.swapTokensForExactTokens(
        amountOut,
        amountInMax,
        [USDC, USDT],
        impersonatedSigner.address,
        deadline
    );

    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");

    console.log("usdc balance after swap", Number(usdcBalAfter));
    console.log("USDT balance after swap", Number(daiBalAfter));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});