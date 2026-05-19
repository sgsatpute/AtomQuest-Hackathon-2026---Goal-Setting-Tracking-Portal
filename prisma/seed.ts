import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up
  await prisma.escalationLog.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.checkIn.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.user.deleteMany()

  // ── Users ──────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: { name: 'System Admin', role: 'ADMIN' }
  })

  const manager1 = await prisma.user.create({
    data: { name: 'Jane Manager', role: 'MANAGER' }
  })

  const manager2 = await prisma.user.create({
    data: { name: 'Bob Director', role: 'MANAGER' }
  })

  const emp1 = await prisma.user.create({
    data: { name: 'John Employee', role: 'EMPLOYEE', managerId: manager1.id }
  })

  const emp2 = await prisma.user.create({
    data: { name: 'Alice Developer', role: 'EMPLOYEE', managerId: manager1.id }
  })

  const emp3 = await prisma.user.create({
    data: { name: 'Carlos Sales', role: 'EMPLOYEE', managerId: manager2.id }
  })

  // ── Admin assigns Shared KPIs (auto-Locked) ─────────────────
  const sharedKpi1 = await prisma.goal.create({
    data: {
      title: 'Annual Revenue Growth',
      description: 'Org-wide revenue growth target for FY 2026',
      thrustArea: 'Financial',
      uom: 'Percent_Min',
      target: 20,
      weightage: 20,
      status: 'Locked',
      ownerId: emp1.id,
    }
  })

  const sharedKpi2 = await prisma.goal.create({
    data: {
      title: 'Annual Revenue Growth',
      description: 'Org-wide revenue growth target for FY 2026',
      thrustArea: 'Financial',
      uom: 'Percent_Min',
      target: 20,
      weightage: 20,
      status: 'Locked',
      ownerId: emp2.id,
    }
  })

  const sharedKpi3 = await prisma.goal.create({
    data: {
      title: 'Annual Revenue Growth',
      description: 'Org-wide revenue growth target for FY 2026',
      thrustArea: 'Financial',
      uom: 'Percent_Min',
      target: 20,
      weightage: 20,
      status: 'Locked',
      ownerId: emp3.id,
    }
  })

  // ── Employee goals ──────────────────────────────────────────
  const goal1 = await prisma.goal.create({
    data: {
      title: 'Reduce Bug Backlog',
      description: 'Clear P1 and P2 bug backlog to below 10 issues',
      thrustArea: 'Internal Process',
      uom: 'Numeric_Max',
      target: 10,
      weightage: 30,
      status: 'Locked',
      ownerId: emp1.id,
    }
  })

  const goal2 = await prisma.goal.create({
    data: {
      title: 'Complete 3 Certifications',
      description: 'AWS, Kubernetes, and Scrum certifications by year-end',
      thrustArea: 'Learning & Growth',
      uom: 'Numeric_Min',
      target: 3,
      weightage: 25,
      status: 'Locked',
      ownerId: emp1.id,
    }
  })

  const goal3 = await prisma.goal.create({
    data: {
      title: 'Improve CSAT Score',
      description: 'Raise customer satisfaction from 3.8 to 4.5 rating',
      thrustArea: 'Customer',
      uom: 'Numeric_Min',
      target: 4.5,
      weightage: 25,
      status: 'Pending',
      ownerId: emp1.id,
    }
  })

  // Alice's goals
  const goal4 = await prisma.goal.create({
    data: {
      title: 'Deliver Feature Roadmap Q1-Q3',
      description: 'Ship 95% of roadmap items on schedule',
      thrustArea: 'Internal Process',
      uom: 'Percent_Min',
      target: 95,
      weightage: 40,
      status: 'Locked',
      ownerId: emp2.id,
    }
  })

  const goal5 = await prisma.goal.create({
    data: {
      title: 'Code Review Turnaround',
      description: 'Average PR review time under 24 hours',
      thrustArea: 'Internal Process',
      uom: 'Numeric_Max',
      target: 24,
      weightage: 20,
      status: 'Locked',
      ownerId: emp2.id,
    }
  })

  const goal6 = await prisma.goal.create({
    data: {
      title: 'Zero Critical Incidents',
      description: 'No P0 production outages due to code defects',
      thrustArea: 'Customer',
      uom: 'Zero',
      target: 0,
      weightage: 20,
      status: 'Pending',
      ownerId: emp2.id,
    }
  })

  // Carlos's goals
  const goal7 = await prisma.goal.create({
    data: {
      title: 'Close 50 Enterprise Deals',
      description: 'Sign 50 new enterprise customers by December',
      thrustArea: 'Financial',
      uom: 'Numeric_Min',
      target: 50,
      weightage: 35,
      status: 'Locked',
      ownerId: emp3.id,
    }
  })

  const goal8 = await prisma.goal.create({
    data: {
      title: 'Upsell Existing Accounts',
      description: 'Achieve 115% of existing account revenue target',
      thrustArea: 'Financial',
      uom: 'Percent_Min',
      target: 115,
      weightage: 25,
      status: 'Locked',
      ownerId: emp3.id,
    }
  })

  const goal9 = await prisma.goal.create({
    data: {
      title: 'Customer NPS Improvement',
      description: 'Raise NPS from 32 to 50',
      thrustArea: 'Customer',
      uom: 'Numeric_Min',
      target: 50,
      weightage: 20,
      status: 'Draft',
      ownerId: emp3.id,
    }
  })

  // ── Quarterly Check-ins ──────────────────────────────────────
  // John's check-ins on goal1 (Reduce Bug Backlog, target: 10 bugs max)
  const ci1 = await prisma.checkIn.create({
    data: { goalId: goal1.id, quarter: 'Q1', actual: 45, status: 'Not Started', managerComment: 'Needs urgent attention — prioritize sprint cleanup.' }
  })
  const ci2 = await prisma.checkIn.create({
    data: { goalId: goal1.id, quarter: 'Q2', actual: 22, status: 'On Track', managerComment: 'Good improvement! Keep the momentum.' }
  })
  const ci3 = await prisma.checkIn.create({
    data: { goalId: goal1.id, quarter: 'Q3', actual: 8, status: 'Completed' }
  })

  // John's check-ins on goal2 (Certifications, target: 3)
  const ci4 = await prisma.checkIn.create({
    data: { goalId: goal2.id, quarter: 'Q1', actual: 0, status: 'Not Started' }
  })
  const ci5 = await prisma.checkIn.create({
    data: { goalId: goal2.id, quarter: 'Q2', actual: 1, status: 'On Track', managerComment: 'AWS cert done — two more to go.' }
  })
  const ci6 = await prisma.checkIn.create({
    data: { goalId: goal2.id, quarter: 'Q3', actual: 3, status: 'Completed', managerComment: 'Excellent! All 3 certifications completed.' }
  })

  // Alice's check-ins on goal4 (Feature Roadmap, target: 95%)
  const ci7 = await prisma.checkIn.create({
    data: { goalId: goal4.id, quarter: 'Q1', actual: 88, status: 'On Track', managerComment: 'Slightly below target but recoverable.' }
  })
  const ci8 = await prisma.checkIn.create({
    data: { goalId: goal4.id, quarter: 'Q2', actual: 97, status: 'Completed', managerComment: 'Outstanding delivery! Exceeded target.' }
  })

  // Alice's check-ins on goal5 (Code Review Turnaround, target: 24h)
  const ci9 = await prisma.checkIn.create({
    data: { goalId: goal5.id, quarter: 'Q1', actual: 36, status: 'Not Started', managerComment: 'Still above 24h threshold. Needs improvement.' }
  })
  const ci10 = await prisma.checkIn.create({
    data: { goalId: goal5.id, quarter: 'Q2', actual: 18, status: 'Completed', managerComment: 'Below 24h target — great progress!' }
  })

  // Carlos's check-ins on goal7 (Enterprise Deals, target: 50)
  const ci11 = await prisma.checkIn.create({
    data: { goalId: goal7.id, quarter: 'Q1', actual: 9, status: 'On Track' }
  })
  const ci12 = await prisma.checkIn.create({
    data: { goalId: goal7.id, quarter: 'Q2', actual: 23, status: 'On Track', managerComment: 'On pace for yearly target.' }
  })
  const ci13 = await prisma.checkIn.create({
    data: { goalId: goal7.id, quarter: 'Q3', actual: 41, status: 'On Track', managerComment: 'Close to target — push hard in Q4!' }
  })

  // Shared KPI check-in for John
  await prisma.checkIn.create({
    data: { goalId: sharedKpi1.id, quarter: 'Q2', actual: 14, status: 'On Track', managerComment: '14% growth achieved — on track for 20%.' }
  })

  // ── Audit Logs ───────────────────────────────────────────────
  const auditEntries = [
    { action: 'SHARED_KPI_ASSIGNED', userId: admin.id, details: `Admin assigned Shared KPI "Annual Revenue Growth" to 3 user(s)` },
    { action: 'GOAL_SUBMITTED', userId: emp1.id, details: `Employee submitted goal "Reduce Bug Backlog" (Weight: 30%, Area: Internal Process)` },
    { action: 'GOAL_APPROVED', userId: manager1.id, details: `Manager approved goal "Reduce Bug Backlog" for John Employee` },
    { action: 'GOAL_SUBMITTED', userId: emp1.id, details: `Employee submitted goal "Complete 3 Certifications" (Weight: 25%, Area: Learning & Growth)` },
    { action: 'GOAL_APPROVED', userId: manager1.id, details: `Manager approved goal "Complete 3 Certifications" for John Employee` },
    { action: 'GOAL_SUBMITTED', userId: emp1.id, details: `Employee submitted goal "Improve CSAT Score" (Weight: 25%, Area: Customer)` },
    { action: 'CHECKIN_LOGGED', userId: emp1.id, details: `Employee logged Q1 check-in (Actual: 45) for Goal ${goal1.id}` },
    { action: 'MANAGER_COMMENTED', userId: manager1.id, details: `Manager added comment to check-in ${ci1.id}` },
    { action: 'CHECKIN_LOGGED', userId: emp1.id, details: `Employee logged Q2 check-in (Actual: 22) for Goal ${goal1.id}` },
    { action: 'MANAGER_COMMENTED', userId: manager1.id, details: `Manager added comment to check-in ${ci2.id}` },
    { action: 'CHECKIN_LOGGED', userId: emp1.id, details: `Employee logged Q3 check-in (Actual: 8) for Goal ${goal1.id}` },
    { action: 'GOAL_SUBMITTED', userId: emp2.id, details: `Employee submitted goal "Deliver Feature Roadmap Q1-Q3" (Weight: 40%, Area: Internal Process)` },
    { action: 'GOAL_APPROVED', userId: manager1.id, details: `Manager approved goal "Deliver Feature Roadmap Q1-Q3" for Alice Developer` },
    { action: 'CHECKIN_LOGGED', userId: emp2.id, details: `Employee logged Q1 check-in (Actual: 88) for Goal ${goal4.id}` },
    { action: 'CHECKIN_LOGGED', userId: emp3.id, details: `Employee logged Q2 check-in (Actual: 23) for Goal ${goal7.id}` },
  ]

  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry })
  }

  // ── Escalation Logs ──────────────────────────────────────────
  await prisma.escalationLog.create({
    data: {
      ruleTrigger: 'Incomplete Goal Submission',
      targetUser: emp3.name,
      level: 'Employee',
      message: `Carlos Sales has only allocated 80% of their goal weightage. Missing 20%.`,
      resolved: false,
    }
  })

  await prisma.escalationLog.create({
    data: {
      ruleTrigger: 'Manager Approval Delay',
      targetUser: manager1.name,
      level: 'Manager',
      message: `Goal "Improve CSAT Score" submitted by John Employee is pending approval.`,
      resolved: false,
    }
  })

  console.log('✅ Database seeded with rich demo data:')
  console.log(`   Users: Admin, 2 Managers, 3 Employees`)
  console.log(`   Goals: 9 employee goals + 3 shared KPIs = 12 total`)
  console.log(`   Check-ins: 13 quarterly updates with manager feedback`)
  console.log(`   Audit: 15 log entries`)
  console.log(`   Escalations: 2 active flags`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
