import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { PRICING_SEED } from "../src/lib/constants";

const prisma = new PrismaClient();

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function assertStrongProductionPassword(password: string) {
  if (password.length < 12) {
    throw new Error("NEURORECRUT_ADMIN_PASSWORD doit contenir au moins 12 caractères.");
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("NEURORECRUT_ADMIN_PASSWORD doit contenir une minuscule, une majuscule et un chiffre.");
  }
}

async function main() {
  const dryRun = hasFlag("--dry-run");
  const adminEmail = process.env.NEURORECRUT_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.NEURORECRUT_ADMIN_PASSWORD ?? "";

  console.log(`${dryRun ? "[dry-run] " : ""}Seed production NeuroRecrut`);
  console.log(`Plans tarifaires à synchroniser: ${PRICING_SEED.map((plan) => plan.code).join(", ")}`);

  if (dryRun) {
    if (adminEmail) {
      assertStrongProductionPassword(adminPassword);
      console.log(`Admin production à préparer: ${adminEmail}`);
    } else {
      console.log("Admin production ignoré: NEURORECRUT_ADMIN_EMAIL non défini.");
    }
    return;
  }

  for (const plan of PRICING_SEED) {
    await prisma.pricingPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan
    });
  }

  if (adminEmail) {
    assertStrongProductionPassword(adminPassword);
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash,
        role: Role.ADMIN,
        name: "Admin NeuroRecrut"
      },
      create: {
        email: adminEmail,
        name: "Admin NeuroRecrut",
        passwordHash,
        role: Role.ADMIN
      }
    });
    console.log(`Admin production synchronisé: ${adminEmail}`);
  } else {
    console.log("Admin production ignoré: NEURORECRUT_ADMIN_EMAIL non défini.");
  }

  console.log("Seed production terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
