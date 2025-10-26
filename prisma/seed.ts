import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const emojis = [
    { symbol: "👍", name: "thumbs_up" },
    { symbol: "👎", name: "thumbs_down" },
    { symbol: "❤️", name: "heart" },
    { symbol: "😂", name: "joy" },
    { symbol: "😊", name: "smile" },
    { symbol: "😍", name: "heart_eyes" },
    { symbol: "😎", name: "sunglasses" },
    { symbol: "😢", name: "cry" },
    { symbol: "😡", name: "angry" },
    { symbol: "🤔", name: "thinking" },
    { symbol: "🎉", name: "party" },
    { symbol: "🔥", name: "fire" },
    { symbol: "✨", name: "sparkles" },
    { symbol: "💯", name: "hundred" },
    { symbol: "💪", name: "muscle" },
    { symbol: "🙏", name: "pray" },
    { symbol: "👏", name: "clap" },
    { symbol: "✅", name: "check" },
    { symbol: "❌", name: "x" },
    { symbol: "⭐", name: "star" },
    { symbol: "💡", name: "bulb" },
    { symbol: "🚀", name: "rocket" },
    { symbol: "🎯", name: "target" },
    { symbol: "🏆", name: "trophy" },
    { symbol: "🎊", name: "confetti" },
    { symbol: "🎈", name: "balloon" },
    { symbol: "🎁", name: "gift" },
    { symbol: "🎂", name: "cake" },
    { symbol: "☕", name: "coffee" },
    { symbol: "🍕", name: "pizza" },
    { symbol: "🍔", name: "burger" },
    { symbol: "🍺", name: "beer" },
    { symbol: "🍷", name: "wine" },
    { symbol: "🌟", name: "glowing_star" },
    { symbol: "💖", name: "sparkling_heart" },
    { symbol: "💙", name: "blue_heart" },
    { symbol: "💚", name: "green_heart" },
    { symbol: "💛", name: "yellow_heart" },
    { symbol: "🧡", name: "orange_heart" },
    { symbol: "💜", name: "purple_heart" },
    { symbol: "🖤", name: "black_heart" },
    { symbol: "🤍", name: "white_heart" },
    { symbol: "🤎", name: "brown_heart" },
    { symbol: "💔", name: "broken_heart" },
    { symbol: "❤️‍🔥", name: "heart_on_fire" },
    { symbol: "😀", name: "grinning" },
    { symbol: "😃", name: "smiley" },
    { symbol: "😄", name: "grin" },
    { symbol: "😁", name: "beaming" },
    { symbol: "😆", name: "laughing" },
    { symbol: "😅", name: "sweat_smile" },
    { symbol: "🤣", name: "rofl" },
    { symbol: "😇", name: "innocent" },
    { symbol: "🙂", name: "slightly_smiling" },
    { symbol: "🙃", name: "upside_down" },
    { symbol: "😉", name: "wink" },
    { symbol: "😌", name: "relieved" },
    { symbol: "😋", name: "yum" },
    { symbol: "😜", name: "stuck_out_tongue_winking_eye" },
    { symbol: "🤪", name: "zany_face" },
    { symbol: "😏", name: "smirk" },
    { symbol: "😒", name: "unamused" },
    { symbol: "😔", name: "pensive" },
    { symbol: "😞", name: "disappointed" },
    { symbol: "😟", name: "worried" },
    { symbol: "😤", name: "triumph" },
    { symbol: "😭", name: "sob" },
    { symbol: "😱", name: "scream" },
    { symbol: "😳", name: "flushed" },
    { symbol: "🥺", name: "pleading" },
    { symbol: "🤯", name: "exploding_head" },
    { symbol: "🤬", name: "cursing" },
    { symbol: "😈", name: "smiling_imp" },
    { symbol: "💀", name: "skull" },
    { symbol: "👀", name: "eyes" },
    { symbol: "👻", name: "ghost" },
    { symbol: "🤖", name: "robot" },
  ];

  console.log('Starting emoji seed...');
  
  for (const emoji of emojis) {
    await prisma.emoji.upsert({
      where: { name: emoji.name },
      update: {},
      create: emoji,
    });
  }

  console.log(`✅ Seeded ${emojis.length} emojis successfully!`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

