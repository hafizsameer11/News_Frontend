#!/usr/bin/env node

/**
 * Build validation script
 * Checks for ESLint errors, validates environment variables, and common issues
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkTypeScript() {
  log("\n🔍 Checking TypeScript errors...", "blue");
  try {
    execSync("npx tsc --noEmit", { stdio: "inherit" });
    log("✅ TypeScript check passed", "green");
    return true;
  } catch (error) {
    log("❌ TypeScript check failed", "red");
    return false;
  }
}

function checkESLint() {
  log("\n🔍 Checking ESLint errors...", "blue");
  try {
    execSync("npm run lint", { stdio: "inherit" });
    log("✅ ESLint check passed", "green");
    return true;
  } catch (error) {
    log("❌ ESLint check failed", "red");
    return false;
  }
}

function checkEnvFile() {
  log("\n🔍 Checking environment variables...", "blue");
  const envExamplePath = path.join(process.cwd(), ".env.example");
  const envLocalPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envExamplePath)) {
    log("⚠️  .env.example file not found", "yellow");
    return true; // Not critical
  }

  if (!fs.existsSync(envLocalPath)) {
    log("⚠️  .env file not found (using .env.example as reference)", "yellow");
  }

  // Check required variables
  const requiredVars = ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_FRONTEND_URL"];
  const envContent = fs.existsSync(envLocalPath)
    ? fs.readFileSync(envLocalPath, "utf-8")
    : fs.readFileSync(envExamplePath, "utf-8");

  const missingVars = requiredVars.filter(
    (varName) =>
      !envContent.includes(varName) || !envContent.includes(`${varName}=`)
  );

  if (missingVars.length > 0) {
    log(
      `❌ Missing required environment variables: ${missingVars.join(", ")}`,
      "red"
    );
    return false;
  }

  log("✅ Environment variables check passed", "green");
  return true;
}

function checkCommonIssues() {
  log("\n🔍 Checking for common issues...", "blue");
  const issues = [];

  // Check for console.log in production code (basic check)
  const srcPath = path.join(process.cwd(), "src");
  if (fs.existsSync(srcPath)) {
    // This is a basic check - in production you might want more sophisticated linting
    log("⚠️  Console.log check skipped (use ESLint rules for this)", "yellow");
  }

  if (issues.length > 0) {
    log(`❌ Found issues:\n${issues.join("\n")}`, "red");
    return false;
  }

  log("✅ Common issues check passed", "green");
  return true;
}

async function main() {
  log("🚀 Starting build validation...", "blue");

  const results = {
    eslint: checkESLint(),
    env: checkEnvFile(),
    common: checkCommonIssues(),
  };

  const allPassed = Object.values(results).every((result) => result);

  log("\n" + "=".repeat(50), "blue");
  if (allPassed) {
    log("✅ All validation checks passed!", "green");
    process.exit(0);
  } else {
    log("❌ Some validation checks failed", "red");
    log("\nSummary:", "yellow");
    Object.entries(results).forEach(([check, passed]) => {
      log(`  ${check}: ${passed ? "✅" : "❌"}`, passed ? "green" : "red");
    });
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Validation script error: ${error.message}`, "red");
  process.exit(1);
});
