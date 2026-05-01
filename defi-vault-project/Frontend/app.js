const MYTOKEN_ADDRESS = "0xaCd434aAf24Db0eE01e43a502628a27C56B8ad47";
const VAULT_ADDRESS = "0x70fd920f32629e58879CF66dAc0D6d3346334Cb3";

const tokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const vaultAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function deposit(uint256 amount)",
  "function withdraw(uint256 shares)",
  "function _balanceOfmembershipToken(address account) view returns (uint256)"
];

let provider;
let signer;
let account;
let tokenContract;
let vaultContract;

const connectBtn = document.getElementById("connectBtn");
const approveBtn = document.getElementById("approveBtn");
const depositBtn = document.getElementById("depositBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

const accountText = document.getElementById("account");
const tokenBalanceText = document.getElementById("tokenBalance");
const vaultBalanceText = document.getElementById("vaultBalance");
const membershipStatusText = document.getElementById("membershipStatus");
const statusText = document.getElementById("status");

function setStatus(message) {
  statusText.textContent = message;
}

async function connectWallet() {
  if (!window.ethereum) {
    setStatus("MetaMask is not installed.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  signer = provider.getSigner();
  account = await signer.getAddress();

  tokenContract = new ethers.Contract(MYTOKEN_ADDRESS, tokenAbi, signer);
  vaultContract = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);

  accountText.textContent = account;
  setStatus("Wallet connected.");

  await updateBalances();
}

async function updateBalances() {
  if (!account) return;

  const tokenBalance = await tokenContract.balanceOf(account);
  const vaultBalance = await vaultContract.balanceOf(account);
  const membershipBalance = await vaultContract._balanceOfmembershipToken(account);

  tokenBalanceText.textContent = ethers.utils.formatUnits(tokenBalance, 18);
  vaultBalanceText.textContent = ethers.utils.formatUnits(vaultBalance, 18);
  membershipStatusText.textContent = membershipBalance.toString() === "1" ? "Yes" : "No";
}

async function approveVault() {
  const amount = document.getElementById("approveAmount").value;

  if (!amount || Number(amount) <= 0) {
    setStatus("Please enter a valid approve amount.");
    return;
  }

  try {
    const parsedAmount = ethers.utils.parseUnits(amount, 18);
    setStatus("Approving...");
    const tx = await tokenContract.approve(VAULT_ADDRESS, parsedAmount);
    await tx.wait();

    setStatus("Approve successful.");
    await updateBalances();
  } catch (error) {
    console.error(error);
    setStatus("Approve failed.");
  }
}

async function deposit() {
  const amount = document.getElementById("depositAmount").value;

  if (!amount || Number(amount) <= 0) {
    setStatus("Please enter a valid deposit amount.");
    return;
  }

  try {
    const parsedAmount = ethers.utils.parseUnits(amount, 18);
    setStatus("Depositing...");
    const tx = await vaultContract.deposit(parsedAmount);
    await tx.wait();

    setStatus("Deposit successful.");
    await updateBalances();
  } catch (error) {
    console.error(error);
    setStatus("Deposit failed. Did you approve first?");
  }
}

async function withdraw() {
  const amount = document.getElementById("withdrawAmount").value;

  if (!amount || Number(amount) <= 0) {
    setStatus("Please enter a valid withdraw amount.");
    return;
  }

  try {
    const parsedAmount = ethers.utils.parseUnits(amount, 18);
    setStatus("Withdrawing...");
    const tx = await vaultContract.withdraw(parsedAmount);
    await tx.wait();

    setStatus("Withdraw successful.");
    await updateBalances();
  } catch (error) {
    console.error(error);
    setStatus("Withdraw failed.");
  }
}

connectBtn.onclick = connectWallet;
approveBtn.onclick = approveVault;
depositBtn.onclick = deposit;
withdrawBtn.onclick = withdraw;

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => {
    window.location.reload();
  });
}