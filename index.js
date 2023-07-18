const util = require("util");
const { exec } = require("child_process");
const path = require("path");

const runCommand = util.promisify(exec);

// Function to run npm install and npm build in a directory
const runNpmInstall = async (directory) => {
  console.log(`Start npm install for ${directory}`);

  try {
    const { stdout, stderr } = await runCommand("npm install", {
      cwd: directory,
    });
  } catch (err) {
    console.error(`Error in ${directory}: ${err.message}`);
  }
};

const runNpmBuild = async (directory) => {
  console.log(`Start npm run build for ${directory}`);

  try {
    const { stdout, stderr } = await runCommand("npm run build", {
      cwd: directory,
    });
  } catch (err) {
    console.error(`Error in ${directory}: ${err.message}`);
  }
};

// Function to run npm run start in a directory
const runNpmStart = async (directory) => {
  console.log(`Start npm run start for ${directory}`);

  try {
    const { stdout, stderr } = await runCommand("npm run start &", {
      cwd: directory,
    });
  } catch (err) {
    console.error(`Error in ${directory}: ${err.message}`);
  }
};

// Function to run npm commands in child directories
const runNpmCommands = async () => {
  // Specify the paths to the child directories
  const front = path.join(__dirname, "client");
  const back = path.join(__dirname, "server");

  // Run front
  runNpmInstall(front).then(async () => {
    await runNpmBuild(front);
    console.log("\x1b[34mServer Front started with default port 3000\x1b[0m");
    await runNpmStart(front);
  });

  // Run back
  runNpmInstall(back).then(async () => {
    console.log("\x1b[34mServer Back started with default port 3030\x1b[0m");
    await runNpmStart(back);
  });
};

// Call the function to run npm commands in child directories
runNpmCommands().catch((err) => {
  console.error(`An error occurred: ${err.message}`);
});
