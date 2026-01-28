import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const passwordHash = await hash("password123", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
      username: "coffee_lover",
      displayName: "コーヒー好き",
      bio: "毎日コーヒーを飲んでます。特にエチオピアの浅煎りが好きです。",
    },
  });

  console.log(`Created user: ${demoUser.email}`);

  // Create demo beans
  const beans = [
    {
      name: "エチオピア イルガチェフェ G1",
      roastLevel: "light",
      origin: "エチオピア",
      variety: "在来種",
      process: "ウォッシュド",
      memo: "フローラルでフルーティーな香り。レモンやベルガモットのような柑橘系の酸味。",
      tasteX: 60,
      roastY: 20,
    },
    {
      name: "グアテマラ アンティグア",
      roastLevel: "medium",
      origin: "グアテマラ",
      variety: "ブルボン",
      process: "ウォッシュド",
      memo: "チョコレートのような甘さとナッツのような風味。バランスの良い酸味。",
      tasteX: 20,
      roastY: 50,
    },
    {
      name: "ブラジル サントス",
      roastLevel: "dark",
      origin: "ブラジル",
      variety: "ムンドノーボ",
      process: "ナチュラル",
      memo: "ナッツやカカオの風味。しっかりとしたボディ。",
      tasteX: -40,
      roastY: 75,
    },
  ];

  for (const bean of beans) {
    await prisma.bean.create({
      data: {
        userId: demoUser.id,
        ...bean,
      },
    });
  }

  console.log(`Created ${beans.length} beans`);

  // Create demo logs
  const now = new Date();
  const logs = [
    {
      dateTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      title: "エチオピア シングルオリジン",
      locationType: "cafe",
      placeName: "Blue Bottle Coffee",
      drinkType: "ドリップ",
      roastLevel: "light",
      origin: "エチオピア",
      variety: "ゲイシャ",
      process: "ウォッシュド",
      rating: 5,
      memo: "最高に美味しかった！フルーティーで花のような香りが素晴らしい。",
      visibility: "public",
      tasteX: 70,
      roastY: 25,
    },
    {
      dateTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      title: "モーニングラテ",
      locationType: "cafe",
      placeName: "Starbucks",
      drinkType: "ラテ",
      roastLevel: "medium",
      rating: 3,
      memo: "いつもの安定した味。",
      visibility: "private",
      tasteX: -10,
      roastY: 55,
    },
    {
      dateTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      title: "自家焙煎ブラジル",
      locationType: "home",
      placeName: "自宅",
      drinkType: "フレンチプレス",
      roastLevel: "dark",
      origin: "ブラジル",
      rating: 4,
      memo: "自分で焙煎したブラジル豆。深煎りでしっかりとした苦味が良い。",
      visibility: "public",
      tasteX: -50,
      roastY: 80,
    },
    {
      dateTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      title: "ケニア AA",
      locationType: "cafe",
      placeName: "猿田彦珈琲",
      drinkType: "ドリップ",
      roastLevel: "light",
      origin: "ケニア",
      variety: "SL28",
      process: "ウォッシュド",
      rating: 5,
      memo: "ブラックカラントのような酸味。複雑で素晴らしい風味。",
      visibility: "public",
      tasteX: 80,
      roastY: 30,
    },
    {
      dateTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      title: "コロンビア スプレモ",
      locationType: "cafe",
      placeName: "丸山珈琲",
      drinkType: "ドリップ",
      roastLevel: "medium",
      origin: "コロンビア",
      rating: 4,
      memo: "キャラメルのような甘さ。バランスが良い。",
      visibility: "public",
      tasteX: 30,
      roastY: 45,
    },
  ];

  for (const log of logs) {
    await prisma.coffeeLog.create({
      data: {
        userId: demoUser.id,
        ...log,
      },
    });
  }

  console.log(`Created ${logs.length} logs`);

  // Create another user for social features demo
  const anotherUser = await prisma.user.upsert({
    where: { email: "another@example.com" },
    update: {},
    create: {
      email: "another@example.com",
      passwordHash,
      username: "barista_pro",
      displayName: "プロバリスタ",
      bio: "カフェでバリスタをしています。ラテアートが得意です。",
    },
  });

  // Create a log for the second user
  await prisma.coffeeLog.create({
    data: {
      userId: anotherUser.id,
      dateTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      title: "自家製エスプレッソ",
      locationType: "home",
      placeName: "自宅",
      drinkType: "エスプレッソ",
      roastLevel: "medium",
      rating: 5,
      memo: "新しいマシンで淹れた最初の一杯。クレマが綺麗に出た！",
      visibility: "public",
      tasteX: -20,
      roastY: 60,
    },
  });

  // Demo user follows another user
  await prisma.follow.create({
    data: {
      followerId: demoUser.id,
      followingId: anotherUser.id,
    },
  });

  console.log("Created second user and follow relationship");
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
