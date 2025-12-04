import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

// Helper function to convert RGB string to hex integer
function rgbToHex(rgb: string): number | null {
  const match = rgb.match(/\d+/g);
  if (!match || match.length !== 3) return null;
  const [r, g, b] = match.map(Number);
  return (r << 16) | (g << 8) | b;
}

async function main(): Promise<void> {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.ticketMemberParticipation.deleteMany();
  await prisma.ticketStaffParticipation.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticketLog.deleteMany();
  await prisma.ticketAssignment.deleteMany();
  await prisma.verificationTicket.deleteMany();
  await prisma.eventReportTicket.deleteMany();
  await prisma.staffTalkTicket.deleteMany();
  await prisma.warning.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.modOnCall.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.memberRecord.deleteMany();

  // Create staff members (moderators and helpers)
  console.log("👥 Creating staff member records...");

  // Moderators
  const solii = await prisma.memberRecord.create({
    data: {
      discordId: "927391622885412905",
      discordTag: "solii",
      displayName: "Solii",
      avatarUrl: "https://cdn.discordapp.com/avatars/927391622885412905/5f4a37d668e61f43c53c52d51d2d104d.webp?size=240",
      bannerUrl: "https://cdn.discordapp.com/banners/927391622885412905/6109572c3d714273e89b39c9a92efd98.png?size=640",
      accentColor: rgbToHex("33, 156, 218"),
    },
  });

  const alicen = await prisma.memberRecord.create({
    data: {
      discordId: "526335312448716800",
      discordTag: "alicendromee",
      displayName: "Alicen",
      avatarUrl: "https://cdn.discordapp.com/avatars/526335312448716800/c2f5bbe43ebe0fef305e5721ed8e3a8f.webp?size=240",
      accentColor: rgbToHex("73, 159, 231"),
    },
  });

  const lvna = await prisma.memberRecord.create({
    data: {
      discordId: "151885154405580810",
      discordTag: "lvna",
      displayName: "DJ Lvna",
      avatarUrl: "https://cdn.discordapp.com/avatars/151885154405580810/1e4f2c003bbb1fdad192b564a20204d6.webp?size=128",
      bannerUrl: "https://cdn.discordapp.com/banners/151885154405580810/86e41a139e9977e6540aa82714298296.png?size=1024",
      accentColor: rgbToHex("0, 0, 0"),
    },
  });

  const kinetic = await prisma.memberRecord.create({
    data: {
      discordId: "184687352394809345",
      discordTag: "cdkinetic",
      displayName: "Kinetic",
      avatarUrl:
        "https://cdn.discordapp.com/guilds/734595073920204940/users/184687352394809345/avatars/d077432683b6b0268b5f4f29eb935e64.webp?size=240",
      bannerUrl:
        "https://cdn.discordapp.com/guilds/734595073920204940/users/184687352394809345/banners/4146ca27bb20b4514b6db3bd27c16253.png?size=480",
      accentColor: rgbToHex("13, 145, 209"),
    },
  });

  const echo = await prisma.memberRecord.create({
    data: {
      discordId: "237309118761795584",
      discordTag: "echo1108",
      displayName: "Echo",
      avatarUrl:
        "https://cdn.discordapp.com/guilds/734595073920204940/users/237309118761795584/avatars/cfb9aecbcbe0c87f1f14a8f2637b6727.webp?size=240",
      bannerUrl: "https://cdn.discordapp.com/banners/237309118761795584/4bd35320a982e1f9ad0411306d19625c.png?size=640",
      accentColor: rgbToHex("162, 120, 133"),
    },
  });

  const krenki = await prisma.memberRecord.create({
    data: {
      discordId: "269539285559017483",
      discordTag: "krenki",
      displayName: "Krenki",
      avatarUrl: "https://cdn.discordapp.com/avatars/269539285559017483/77e84989c5f8dce43fad6e638e2886d8.webp?size=128",
      bannerUrl: "https://cdn.discordapp.com/banners/269539285559017483/8a350099803d38b447ee5ae97e919093.png?size=1024",
      accentColor: rgbToHex("192, 28, 30"),
    },
  });

  // Helpers
  const iris = await prisma.memberRecord.create({
    data: {
      discordId: "1091878045331247144",
      discordTag: "irissu_",
      displayName: "Iris",
      avatarUrl: "https://cdn.discordapp.com/avatars/1091878045331247144/a_f079e3e1e46e2ba8a715a0207d9f1a8b.webp?size=240",
      bannerUrl: "https://cdn.discordapp.com/banners/1091878045331247144/a_2e7299e3d2d17380a391eaa09b9a15f1.png?size=640",
      accentColor: rgbToHex("78, 46, 167"),
    },
  });

  const nutsuki = await prisma.memberRecord.create({
    data: {
      discordId: "148610617899614208",
      discordTag: "princemonty",
      displayName: "Nutsuki",
      avatarUrl: "https://cdn.discordapp.com/avatars/148610617899614208/7fdccbfc6cedad88205c97f048f3589e.webp?size=240",
      bannerUrl: "https://cdn.discordapp.com/banners/148610617899614208/cc635821e419a49b87f87e2fe0b9d106.png?size=640",
      accentColor: rgbToHex("217, 82, 235"),
    },
  });

  const clonefan = await prisma.memberRecord.create({
    data: {
      discordId: "785360147244384276",
      discordTag: "clonefan00",
      displayName: "Clone-Zone",
      avatarUrl: "https://cdn.discordapp.com/avatars/785360147244384276/2d4435216c1a94a84f51cdff39128095.webp?size=240",
      accentColor: rgbToHex("255, 0, 0"),
    },
  });

  // Create regular members
  console.log("👥 Creating regular member records...");
  const member1 = await prisma.memberRecord.create({
    data: {
      discordId: "123456789012345678",
      discordTag: "JohnDoe#1234",
      displayName: "JohnDoe",
    },
  });
  const member2 = await prisma.memberRecord.create({
    data: {
      discordId: "234567890123456789",
      discordTag: "JaneSmith#5678",
      displayName: "JaneSmith",
    },
  });
  const member3 = await prisma.memberRecord.create({
    data: {
      discordId: "345678901234567890",
      discordTag: "BobWilson#9012",
      displayName: "BobWilson",
    },
  });
  const member4 = await prisma.memberRecord.create({
    data: {
      discordId: "456789012345678901",
      discordTag: "AliceBrown#3456",
      displayName: "AliceBrown",
    },
  });
  const member5 = await prisma.memberRecord.create({
    data: {
      discordId: "567890123456789012",
      discordTag: "CharlieDavis#7890",
      displayName: "CharlieDavis",
    },
  });

  // Add Maxiee (user's real account)
  const maxiee = await prisma.memberRecord.create({
    data: {
      discordId: "229734830932361216",
      discordTag: "lolmaxz",
      displayName: "Maxiee",
      avatarUrl: "https://cdn.discordapp.com/avatars/229734830932361216/c42c89ae2ca247b8db4c4b11ad8ea047.webp?size=80",
      bannerUrl: "https://cdn.discordapp.com/banners/229734830932361216/c656067034245a85dd6b6828a302b75b.png?size=300",
      accentColor: 0x9549a7,
    },
  });

  // Staff members (moderators + helpers + Maxiee as admin/moderator)
  const staffMembers = [solii, alicen, lvna, kinetic, echo, krenki, iris, nutsuki, clonefan, maxiee];

  // Regular members (do not treat Maxiee as a regular member)
  const members = [member1, member2, member3, member4, member5];

  // Create tickets with more variety
  console.log("🎫 Creating tickets...");
  const guildId = "734595073920204940";
  const tickets = [];

  // Create multiple tickets for better analytics
  for (let i = 0; i < 30; i++) {
    const ticketTypes = ["VERIFICATION_ID", "STAFF_TALK", "EVENT_REPORT", "UNSOLICITED_DM", "FRIEND_REQUEST", "DRAMA", "OTHER"] as const;
    const statuses = ["OPEN", "IN_PROGRESS", "AWAITING_RESPONSE", "CLOSED"] as const;
    const randomMember = members[Math.floor(Math.random() * members.length)];
    const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const randomType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

    const ticket = await prisma.ticket.create({
      data: {
        ticketThreadId: `ticket-${String(i + 1).padStart(3, "0")}`,
        guildId: guildId,
        type: randomType,
        status: randomStatus,
        title: `Ticket ${i + 1}: ${randomType.replace("_", " ")}`,
        openedById: randomMember.id, // MemberRecord ID
        createdAt: createdAt,
        closedAt: randomStatus === "CLOSED" ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        closedBy: randomStatus === "CLOSED" ? randomStaff.discordId : null,
        closeReason: randomStatus === "CLOSED" ? "Resolved successfully" : null,
      },
    });
    tickets.push(ticket);

    // Create assignments for non-open tickets
    if (randomStatus !== "OPEN") {
      await prisma.ticketAssignment.create({
        data: {
          ticketId: ticket.id,
          staffId: randomStaff.discordId,
          assignedAt: createdAt,
        },
      });
    }
  }

  // Create verification tickets
  console.log("🆔 Creating verification tickets...");
  const verificationTickets = tickets.filter((t) => t.type === "VERIFICATION_ID");

  for (const ticket of verificationTickets) {
    const initialVerifier = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const finalVerifier = Math.random() > 0.5 ? staffMembers[Math.floor(Math.random() * staffMembers.length)] : null;

    try {
      await prisma.verificationTicket.create({
        data: {
          ticketId: ticket.id,
          initialVerifierId: initialVerifier.id, // MemberRecord ID
          finalVerifierId: finalVerifier?.id || null, // MemberRecord ID
          idReceivedAt: ticket.createdAt,
          initialVerifiedAt: new Date(ticket.createdAt.getTime() + 24 * 60 * 60 * 1000),
          finalVerifiedAt: finalVerifier ? new Date(ticket.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
          reminderCount: Math.floor(Math.random() * 3),
        },
      });
    } catch (error: unknown) {
      // Skip if verification ticket already exists for this ticket
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        console.log(`   Skipping duplicate verification ticket for ticket ${ticket.id}`);
        continue;
      }
      throw error;
    }
  }

  // Create warnings and moderation actions
  console.log("⚠️ Creating warnings and moderation actions...");
  // Base set of mixed warning types
  for (let i = 0; i < 15; i++) {
    const randomMember = members[Math.floor(Math.random() * members.length)];
    const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const warningTypes = ["WARNING", "INFORMAL_WARNING", "WATCHLIST", "BANNED"] as const;
    const randomType = warningTypes[Math.floor(Math.random() * warningTypes.length)];

    const when = new Date();
    when.setDate(when.getDate() - Math.floor(Math.random() * 60));

    const warning = await prisma.warning.create({
      data: {
        memberId: randomMember.id,
        type: randomType,
        why: `Reason for ${randomType.toLowerCase()}`,
        result: "Action taken",
        when: when,
        loggedBy: randomStaff.discordId,
        isActive: randomType !== "BANNED",
        evidenceUrls: [] as never,
      },
    });

    // Create corresponding moderation action
    const actionTypes = {
      WARNING: "WARNING_ISSUED",
      INFORMAL_WARNING: "INFORMAL_WARNING_ISSUED",
      WATCHLIST: "WATCHLIST_ADDED",
      BANNED: "BAN",
    } as const;

    await prisma.moderationAction.create({
      data: {
        memberId: randomMember.id,
        staffId: randomStaff.discordId,
        actionType: actionTypes[randomType],
        reason: warning.why,
        when: when,
        isActive: warning.isActive,
        evidenceUrls: [] as never,
        warningId: warning.id,
      },
    });
  }

  // Additional informal warnings and watchlist entries to better populate moderation logs
  console.log("⚠️ Creating extra informal warnings and watchlist entries...");
  for (let i = 0; i < 20; i++) {
    const randomMember = members[Math.floor(Math.random() * members.length)];
    const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const warningTypes = ["INFORMAL_WARNING", "INFORMAL_WARNING", "WATCHLIST"] as const;
    const randomType = warningTypes[Math.floor(Math.random() * warningTypes.length)];

    const when = new Date();
    when.setDate(when.getDate() - Math.floor(Math.random() * 60));

    const warning = await prisma.warning.create({
      data: {
        memberId: randomMember.id,
        type: randomType,
        why: `Reason for ${randomType.toLowerCase()}`,
        result: "Action taken",
        when: when,
        loggedBy: randomStaff.discordId,
        isActive: true,
        evidenceUrls: [] as never,
      },
    });

    const actionTypes = {
      INFORMAL_WARNING: "INFORMAL_WARNING_ISSUED",
      WATCHLIST: "WATCHLIST_ADDED",
    } as const;

    await prisma.moderationAction.create({
      data: {
        memberId: randomMember.id,
        staffId: randomStaff.discordId,
        actionType: actionTypes[randomType],
        reason: warning.why,
        when: when,
        isActive: warning.isActive,
        evidenceUrls: [] as never,
        warningId: warning.id,
      },
    });
  }

  // Create additional kicks and bans
  console.log("👢 Creating additional kicks and bans...");
  const moderators = [solii, alicen, lvna, kinetic, echo, krenki]; // Only moderators can kick/ban

  for (let i = 0; i < 20; i++) {
    const randomMember = members[Math.floor(Math.random() * members.length)];
    const randomModerator = moderators[Math.floor(Math.random() * moderators.length)];
    const actionType = Math.random() > 0.5 ? "KICK" : "BAN";

    const when = new Date();
    when.setDate(when.getDate() - Math.floor(Math.random() * 90));

    await prisma.moderationAction.create({
      data: {
        memberId: randomMember.id,
        staffId: randomModerator.discordId,
        actionType: actionType,
        reason: `Reason for ${actionType.toLowerCase()}`,
        when: when,
        duration: actionType === "BAN" ? `${Math.floor(Math.random() * 12) + 1} months` : null,
        isActive: actionType === "BAN" ? Math.random() > 0.3 : false, // Most bans are active
        evidenceUrls: [] as never,
      },
    });
  }

  // Create timeout moderation actions
  console.log("⏱ Creating timeout moderation actions...");
  for (let i = 0; i < 20; i++) {
    const randomMember = members[Math.floor(Math.random() * members.length)];
    const randomModerator = moderators[Math.floor(Math.random() * moderators.length)];

    const when = new Date();
    when.setDate(when.getDate() - Math.floor(Math.random() * 60));

    await prisma.moderationAction.create({
      data: {
        memberId: randomMember.id,
        staffId: randomModerator.discordId,
        actionType: "TIMEOUT",
        reason: "Timeout for testing",
        when: when,
        duration: `${Math.floor(Math.random() * 72) + 1} hours`,
        isActive: Math.random() > 0.4,
        evidenceUrls: [] as never,
      },
    });
  }

  // Create mod on call records
  console.log("📞 Creating mod on call records...");
  const now = new Date();
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() + week * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    await prisma.modOnCall.create({
      data: {
        staffId: randomStaff.discordId,
        weekStart: weekStart,
        weekEnd: weekEnd,
        ticketsClosed: Math.floor(Math.random() * 20) + 5,
        recordsLogged: Math.floor(Math.random() * 15) + 3,
        isActive: week === 0,
      },
    });
  }

  console.log("✅ Database seeding completed!");
  console.log(`   - Created ${staffMembers.length} staff member records`);
  console.log(`   - Created ${members.length} regular member records (including Maxiee)`);
  console.log(`   - Created ${tickets.length} tickets`);
  console.log(`   - Created verification tickets`);
  console.log(`   - Created warnings and moderation actions`);
  console.log(`   - Created mod on call records`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
