export type ContractorTier = "bronze" | "silver" | "gold";

export interface VerificationData {
  hasInsurance: boolean;
  insuranceExpiry?: Date;
  hasLicense: boolean;
  licenseNumber?: string;
  licenseExpiry?: Date;
  backgroundCheck: boolean;
  bondAmount?: number;
  completedJobs: number;
}

export interface VerificationResult {
  tier: ContractorTier;
  verified: boolean;
  score: number;
  requirements: {
    met: string[];
    missing: string[];
  };
  benefits: string[];
}

const TIER_REQUIREMENTS = {
  bronze: {
    minJobs: 0,
    requiresInsurance: false,
    requiresLicense: false,
    requiresBackground: false,
    minBond: 0,
  },
  silver: {
    minJobs: 10,
    requiresInsurance: true,
    requiresLicense: true,
    requiresBackground: false,
    minBond: 0,
  },
  gold: {
    minJobs: 50,
    requiresInsurance: true,
    requiresLicense: true,
    requiresBackground: true,
    minBond: 25000,
  },
};

const TIER_BENEFITS = {
  bronze: [
    "Basic platform access",
    "Standard job matching",
    "80% payout rate",
  ],
  silver: [
    "Priority job matching",
    "Verified badge display",
    "85% payout rate",
    "Featured in search results",
  ],
  gold: [
    "Premium job matching",
    "Gold verified badge",
    "90% payout rate",
    "Featured listings",
    "Priority customer support",
    "Emergency storm response priority",
  ],
};

export function verifyContractor(data: VerificationData): VerificationResult {
  const met: string[] = [];
  const missing: string[] = [];
  let score = 0;

  if (data.hasInsurance && data.insuranceExpiry && new Date(data.insuranceExpiry) > new Date()) {
    met.push("Valid insurance");
    score += 25;
  } else {
    missing.push("Valid insurance required");
  }

  if (data.hasLicense && data.licenseNumber && data.licenseExpiry && new Date(data.licenseExpiry) > new Date()) {
    met.push("Valid contractor license");
    score += 25;
  } else {
    missing.push("Valid contractor license required");
  }

  if (data.backgroundCheck) {
    met.push("Background check passed");
    score += 20;
  } else {
    missing.push("Background check required");
  }

  if (data.bondAmount && data.bondAmount >= 25000) {
    met.push(`Bonded for $${data.bondAmount.toLocaleString()}`);
    score += 15;
  } else {
    missing.push("$25,000 bond required for Gold tier");
  }

  if (data.completedJobs >= 50) {
    met.push(`${data.completedJobs} completed jobs`);
    score += 15;
  } else if (data.completedJobs >= 10) {
    met.push(`${data.completedJobs} completed jobs`);
    score += 10;
  } else {
    missing.push(`Need ${10 - data.completedJobs} more jobs for Silver tier`);
    score += 5;
  }

  let tier: ContractorTier = "bronze";

  if (
    data.completedJobs >= 50 &&
    data.hasInsurance &&
    data.hasLicense &&
    data.backgroundCheck &&
    (data.bondAmount || 0) >= 25000
  ) {
    tier = "gold";
  } else if (
    data.completedJobs >= 10 &&
    data.hasInsurance &&
    data.hasLicense
  ) {
    tier = "silver";
  }

  return {
    tier,
    verified: tier !== "bronze" || (data.hasInsurance && data.hasLicense),
    score,
    requirements: { met, missing },
    benefits: TIER_BENEFITS[tier],
  };
}

export function getPayoutRate(tier: ContractorTier): number {
  const rates = {
    bronze: 0.80,
    silver: 0.85,
    gold: 0.90,
  };
  return rates[tier];
}

export function getTierRequirements(tier: ContractorTier) {
  return TIER_REQUIREMENTS[tier];
}

export function getAllTierBenefits() {
  return TIER_BENEFITS;
}
