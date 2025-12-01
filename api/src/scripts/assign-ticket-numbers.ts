import prisma from '../lib/prisma';

async function assignTicketNumbers(): Promise<void> {
  console.log('🔢 Assigning ticket numbers to existing tickets...');

  // Get all tickets without ticket numbers, ordered by creation date
  const ticketsWithoutNumbers = await prisma.ticket.findMany({
    where: {
      ticketNumber: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (ticketsWithoutNumbers.length === 0) {
    console.log('✅ All tickets already have ticket numbers!');
    return;
  }

  // Get the highest existing ticket number
  const lastTicket = await prisma.ticket.findFirst({
    where: {
      ticketNumber: {
        not: null,
      },
    },
    orderBy: {
      ticketNumber: 'desc',
    },
    select: {
      ticketNumber: true,
    },
  });

  let nextTicketNumber = (lastTicket?.ticketNumber || 0) + 1;

  // Assign ticket numbers to tickets without them
  for (const ticket of ticketsWithoutNumbers) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { ticketNumber: nextTicketNumber },
    });
    console.log(`  ✓ Assigned #${nextTicketNumber} to ticket ${ticket.id.slice(0, 8)}`);
    nextTicketNumber++;
  }

  console.log(`✅ Assigned ticket numbers to ${ticketsWithoutNumbers.length} tickets!`);
}

assignTicketNumbers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




