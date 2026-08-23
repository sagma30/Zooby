import { MongoClient, Db } from 'mongodb';
import { config } from './env';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(config.database.url);
    await client.connect();
    
    db = client.db();
    
    console.log('✅ Database connected successfully');
    
    // Create indexes
    await createIndexes(db);
    
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function createIndexes(database: Db): Promise<void> {
  try {
    // Users indexes
    await database.collection('users').createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
      { key: { phone: 1 } },
      { key: { role: 1 } },
      { key: { status: 1 } },
    ]);

    // Pets indexes
    await database.collection('pets').createIndexes([
      { key: { petId: 1 }, unique: true },
      { key: { ownerId: 1 } },
      { key: { species: 1 } },
    ]);

    // Health events indexes
    await database.collection('health_events').createIndexes([
      { key: { eventId: 1 }, unique: true },
      { key: { petId: 1 } },
      { key: { ownerId: 1 } },
      { key: { date: 1 } },
      { key: { eventType: 1 } },
      { key: { isUpcoming: 1 } },
    ]);

    // Bookings indexes
    await database.collection('bookings').createIndexes([
      { key: { bookingId: 1 }, unique: true },
      { key: { bookingRef: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { petId: 1 } },
      { key: { providerId: 1 } },
      { key: { vanWorkerId: 1 } },
      { key: { date: 1 } },
      { key: { status: 1 } },
      { key: { paymentStatus: 1 } },
      { key: { createdAt: 1 } },
    ]);

    // Service providers indexes
    await database.collection('service_providers').createIndexes([
      { key: { providerId: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { category: 1 } },
      { key: { city: 1 } },
      { key: { isVerified: 1 } },
      { key: { status: 1 } },
    ]);

    // Van jobs indexes
    await database.collection('van_jobs').createIndexes([
      { key: { jobId: 1 }, unique: true },
      { key: { bookingId: 1 } },
      { key: { vanWorkerId: 1 } },
      { key: { scheduledTime: 1 } },
      { key: { status: 1 } },
      { key: { sequenceOrder: 1 } },
    ]);

    // Adoption animals indexes
    await database.collection('adoption_animals').createIndexes([
      { key: { animalId: 1 }, unique: true },
      { key: { shelterId: 1 } },
      { key: { species: 1 } },
      { key: { location: 1 } },
      { key: { status: 1 } },
      { key: { postedDate: 1 } },
    ]);

    // Adoption applications indexes
    await database.collection('adoption_applications').createIndexes([
      { key: { applicationId: 1 }, unique: true },
      { key: { animalId: 1 } },
      { key: { shelterId: 1 } },
      { key: { applicantId: 1 } },
      { key: { status: 1 } },
      { key: { submittedDate: 1 } },
    ]);

    // Payments indexes
    await database.collection('payments').createIndexes([
      { key: { paymentId: 1 }, unique: true },
      { key: { transactionId: 1 }, unique: true },
      { key: { invoiceNumber: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { providerId: 1 } },
      { key: { bookingId: 1 } },
      { key: { paymentStatus: 1 } },
      { key: { refundStatus: 1 } },
      { key: { createdAt: 1 } },
    ]);

    // Notifications indexes
    await database.collection('notifications').createIndexes([
      { key: { notificationId: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { read: 1 } },
      { key: { type: 1 } },
      { key: { createdAt: 1 } },
    ]);

    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('⚠️  Index creation warning:', error);
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Database connection closed');
  }
}
