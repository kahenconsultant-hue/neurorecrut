import { prisma } from "../src/lib/prisma";
import { formatPublicCode, nextPublicCode, parsePublicCodeNumber, type PublicCodeKey } from "../src/lib/public-codes";

type BackfillConfig = {
  key: PublicCodeKey;
  model: "company" | "candidate" | "jobPosition" | "evaluation" | "analysisReport";
};

const configs: BackfillConfig[] = [
  { key: "company", model: "company" },
  { key: "candidate", model: "candidate" },
  { key: "job", model: "jobPosition" },
  { key: "evaluation", model: "evaluation" },
  { key: "report", model: "analysisReport" }
];

async function maxExistingCode(config: BackfillConfig) {
  const delegate = prisma[config.model] as any;
  const records = await delegate.findMany({
    where: { code: { not: null } },
    select: { code: true }
  });
  return (records as Array<{ code: string | null }>).reduce((max, record) => {
    return Math.max(max, parsePublicCodeNumber(config.key, record.code));
  }, 0);
}

async function syncCounter(config: BackfillConfig) {
  const maxCode = await maxExistingCode(config);
  const counter = await prisma.publicIdCounter.findUnique({ where: { key: config.key } });
  if (!counter || counter.value < maxCode) {
    await prisma.publicIdCounter.upsert({
      where: { key: config.key },
      create: { key: config.key, value: maxCode },
      update: { value: maxCode }
    });
  }
}

async function backfill(config: BackfillConfig) {
  await syncCounter(config);
  const delegate = prisma[config.model] as any;
  const records = await delegate.findMany({
    where: { code: null },
    select: { id: true },
    orderBy: { createdAt: "asc" }
  });

  for (const record of records as Array<{ id: string }>) {
    await prisma.$transaction(async (tx) => {
      const txDelegate = tx[config.model] as any;
      const code = await nextPublicCode(tx, config.key);
      await txDelegate.update({
        where: { id: record.id },
        data: { code }
      });
      console.log(`${config.model}: ${record.id} -> ${code}`);
    });
  }

  const finalCounter = await prisma.publicIdCounter.findUnique({ where: { key: config.key } });
  console.log(`${config.key}: ${records.length} backfilled, counter=${formatPublicCode(config.key, finalCounter?.value ?? 0)}`);
}

async function main() {
  for (const config of configs) {
    await backfill(config);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
