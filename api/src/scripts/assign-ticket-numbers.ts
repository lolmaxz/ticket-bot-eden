import prisma from '../lib/prisma';

async function assignTicketNumbers(): Promise<void> {
  console.log('🔢 Assigning ticket numbers to existing tickets...');

  // Get all tickets, ordered by creation date
  // Note: ticketNumber is now auto-increment, so this script is mainly for legacy data
  const allTickets = await prisma.ticket.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      ticketNumber: true,
    },
  });

  // Filter tickets that might need numbers (though auto-increment should handle this)
  const ticketsWithoutNumbers = allTickets.filter(t => !t.ticketNumber);

  if (ticketsWithoutNumbers.length === 0) {
    console.log('✅ All tickets already have ticket numbers!');
    return;
  }

  // Get the highest existing ticket number
  const lastTicket = allTickets
    .filter(t => t.ticketNumber !== null)
    .sort((a, b) => (b.ticketNumber || 0) - (a.ticketNumber || 0))[0];

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




