import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '../src/roles/roles.decorator';
import { BookingStatus } from '../src/booking/dto/edit-booking.dto';

import * as bcrypt from 'bcrypt';

// Mock Redis Store to avoid connectivity issues during tests.
// This ensures we can run E2E tests without needing a separate Redis instance running.
jest.mock('keyv', () => ({
  redisStore: () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }),
}));

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminAccessToken: string;
  let userAccessToken: string;
  let adminUsername: string;
  let userUsername: string;
  let createdRoomId: number | null = null;
  let createdBookingId: number | null = null;

  beforeAll(async () => {
    // Initialize the full NestJS application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('CACHE_MANAGER')
    .useValue({
      get: () => Promise.resolve(null),
      set: () => Promise.resolve(),
      del: () => Promise.resolve(),
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Clear any existing test data to ensure clean state
    try {
      await prisma.bookings.deleteMany({});
    } catch (e) {}

    // Seed Admin User
    adminUsername = `testadmin_${Date.now()}`;
    const adminPassword = 'admin123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = await prisma.users.create({
      data: {
        name: adminUsername,
        password: hashedAdminPassword,
        role: Role.Admin,
      },
    });

    // Seed Regular User
    userUsername = `testuser_${Date.now()}`;
    const userPassword = 'user123';
    const hashedUserPassword = await bcrypt.hash(userPassword, 12);

    const regularUser = await prisma.users.create({
      data: {
        name: userUsername,
        password: hashedUserPassword,
        role: Role.User,
      },
    });

    // Login as Admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: adminUsername, password: adminPassword })
      .expect(201);

    adminAccessToken = adminLoginResponse.body.access_token;

    // Login as Regular User
    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: userUsername, password: userPassword })
      .expect(201);

    userAccessToken = userLoginResponse.body.access_token;

    // Create a test room for booking tests
    const roomResponse = await request(app.getHttpServer())
      .post('/rooms')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'E2E Test Room',
        description: 'A room for booking E2E tests',
        capacity: 2,
        price_per_night: 1800.00,
        image_url: '/images/e2e-room.jpg',
        is_active: true,
      })
      .expect(201);

    createdRoomId = roomResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup Code
    if (createdBookingId) {
      try {
        await prisma.bookings.delete({ where: { id: createdBookingId } });
      } catch (e) {}
    }
    if (createdRoomId) {
      try {
        await prisma.rooms.delete({ where: { id: createdRoomId } });
      } catch (e) {}
    }
    try {
      await prisma.users.delete({ where: { name: adminUsername } });
    } catch (e) {}
    try {
      await prisma.users.delete({ where: { name: userUsername } });
    } catch (e) {}
    await app.close();
  });

  // Test Scenario: CREATE Booking
  // authenticated as User, should return 201 Created and the new booking object.
  it('/booking/book (POST) - Create Booking', async () => {
    const bookDto = {
      room_id: createdRoomId,
      start_date: '2026-06-01T00:00:00.000Z',
      end_date: '2026-06-05T00:00:00.000Z',
    };

    const response = await request(app.getHttpServer())
      .post('/booking/book')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(bookDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.room_id).toBe(createdRoomId);
    expect(response.body.start_date).toBe('2026-06-01T00:00:00.000Z');
    expect(response.body.end_date).toBe('2026-06-05T00:00:00.000Z');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body.status).toBe(BookingStatus.Pending);

    createdBookingId = response.body.id;
  });

  // Test Scenario: CREATE Booking - UNAUTHORIZED
  // Sending POST without a token should return 403 Forbidden.
  it('/booking/book (POST) - Fail Unauthorized', async () => {
    const bookDto = {
      room_id: createdRoomId,
      start_date: '2026-07-01T00:00:00.000Z',
      end_date: '2026-07-05T00:00:00.000Z',
    };

    await request(app.getHttpServer())
      .post('/booking/book')
      .send(bookDto)
      .expect(403);
  });

  // Test Scenario: CREATE Booking - OVERLAPPING DATES
  // Booking the same room for overlapping dates should return 406 Not Acceptable.
  it('/booking/book (POST) - Fail Overlapping Booking', async () => {
    const bookDto = {
      room_id: createdRoomId,
      start_date: '2026-06-02T00:00:00.000Z', // Overlaps with existing booking (2026-06-01 to 2026-06-05)
      end_date: '2026-06-04T00:00:00.000Z',
    };

    await request(app.getHttpServer())
      .post('/booking/book')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(bookDto)
      .expect(406);
  });

  // Test Scenario: GET My Bookings
  // User should see their own bookings.
  it('/booking/my-bookings (GET) - Get User Bookings', async () => {
    const response = await request(app.getHttpServer())
      .get('/booking/my-bookings')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    const found = response.body.find((b: any) => b.id === createdBookingId);
    expect(found).toBeDefined();
    expect(found.room_id).toBe(createdRoomId);
    expect(found.status).toBe(BookingStatus.Pending);
  });

  // Test Scenario: GET All Bookings (Admin only)
  // Admin should see all bookings in the system.
  it('/booking/all-bookings (GET) - Get All Bookings (Admin)', async () => {
    const response = await request(app.getHttpServer())
      .get('/booking/all-bookings')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const found = response.body.find((b: any) => b.id === createdBookingId);
    expect(found).toBeDefined();
  });

  // Test Scenario: EDIT Booking Status (Admin only)
  // Admin should be able to update booking status.
  it('/booking/edit-booking (POST) - Update Booking Status (Admin)', async () => {
    const editDto = {
      id: createdBookingId,
      status: BookingStatus.Approved,
    };

    const response = await request(app.getHttpServer())
      .post('/booking/edit-booking')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send(editDto)
      .expect(200);

    expect(response.body.id).toBe(createdBookingId);
    expect(response.body.status).toBe(BookingStatus.Approved);
  });

  // Test Scenario: EDIT Booking Status - UNAUTHORIZED
  // Regular user should not be able to edit booking status.
  it('/booking/edit-booking (POST) - Fail Unauthorized (User)', async () => {
    const editDto = {
      id: createdBookingId,
      status: BookingStatus.Cancelled,
    };

    await request(app.getHttpServer())
      .post('/booking/edit-booking')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(editDto)
      .expect(403);
  });

  // Test Scenario: UNBOOK
  // User should be able to cancel their own booking.
  it('/booking/unbook (POST) - Cancel Booking', async () => {
    const unbookDto = {
      room_id: createdRoomId,
    };

    const response = await request(app.getHttpServer())
      .post('/booking/unbook')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(unbookDto)
      .expect(200);

    expect(response.body.id).toBe(createdBookingId);
    expect(response.body.room_id).toBe(createdRoomId);

    // Mark as deleted so cleanup doesn't try to delete it again
    createdBookingId = null;
  });

  // Test Scenario: UNBOOK - NOT FOUND
  // Trying to unbook a non-existent booking should return 404 Not Found.
  it('/booking/unbook (POST) - Fail Booking Not Found', async () => {
    const unbookDto = {
      room_id: 999999, // Non-existent room/booking
    };

    await request(app.getHttpServer())
      .post('/booking/unbook')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(unbookDto)
      .expect(404);
  });

  // Test Scenario: GET My Bookings - After Cancellation
  // User should see empty bookings list after cancelling.
  it('/booking/my-bookings (GET) - Empty After Cancellation', async () => {
    const response = await request(app.getHttpServer())
      .get('/booking/my-bookings')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    // Should be empty or not contain the cancelled booking
    const found = response.body.find((b: any) => b.room_id === createdRoomId);
    expect(found).toBeUndefined();
  });
});