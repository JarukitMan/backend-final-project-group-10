
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; 
import { AppModule } from './../src/app.module';
import { CreateRoomDto } from 'src/rooms/dto/create-room.dto';
import { UpdateRoomDto } from 'src/rooms/dto/update-room.dto';

import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '../src/roles/roles.decorator';

// Mock Redis Store to avoid connectivity issues during tests.
// This ensures we can run E2E tests without needing a separate Redis instance running.
jest.mock('keyv', () => ({
  redisStore: () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }),
}));

describe('RoomsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let createdRoomId: number | null = null;
  let deletedRoomId: number | null = null;
  let uniqueCode: string;
  let seededUsername: string;

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

    // Seed Admin User
    seededUsername = `testadmin_${Date.now()}`;
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Seed a real Admin User in the Test Database.
    // The TermsController requires Role.ADMIN for Create/Update/Delete operations.
    // Since we are running against the app, we need a real user in the DB to login with.
    const user = await prisma.users.create({
      data: {
        name: seededUsername,
        password: hashedPassword,
        role: Role.Admin,
      },
    });

    // Login using the seeded admin credentials.
    // We capture the JWT access_token to use in Authorization headers for subsequent requests.
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: seededUsername, password })
      .expect(201);
  
    accessToken = loginResponse.body.access_token;
    uniqueCode = `TERM_${Date.now()}`;
  });

  afterAll(async () => {
    // Cleanup Code
     if (createdRoomId) {
         try {
             await prisma.rooms.delete({ where: { id: createdRoomId }});
         } catch (e) {}
     }
     // Optionally clean up user too
    try {
    await prisma.users.delete({ where: { name: seededUsername } });
  } catch (e) {}
  await app.close();
  });

  // Test Scenario: CREATE Room
  // authenticated as Admin, should return 201 Created and the new term object.
  it('/rooms (POST) - Create Term', async () => {
    const createDto: CreateRoomDto = {
      name: 'E2E Test Room',
      description: 'A room created during E2E testing',
      capacity: 2,
      price_per_night: 1800.00,
      image_url: '/images/e2e-room.jpg',
      is_active: true,
    };

    const response = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createDto)
        .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('E2E Test Room');
    expect(response.body.capacity).toBe(2);
    expect(parseFloat(response.body.price_per_night)).toBe(1800.00);
    expect(response.body.is_active).toBe(true);    
    createdRoomId = response.body.id;
  });

  // Test Scenario: UNAUTHORIZED Create Room
  // Sending POST without a token should return 403 No User.
  it('/rooms (POST) - Fail Unauthorized', async () => {
    await request(app.getHttpServer())
      .post('/rooms')
      .send({})
      .expect(403);
  });
  // Test Scenario: GET All Rooms
  // Verify (200 OK) that the room we just created exists in the list.
  it('/rooms (GET) - Get All Rooms', async () => {
    const response = await request(app.getHttpServer())
        .get('/rooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    const found = response.body.find((r: any) => r.id === createdRoomId);
    expect(found).toBeDefined();
  });

  // Test Scenario: GET Single Room by ID
  it('/rooms/:id (GET) - Get Single Room', async () => {
    const response = await request(app.getHttpServer())
      .get(`/rooms/${createdRoomId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', createdRoomId);
    expect(response.body.name).toBe('E2E Test Room');
    expect(response.body.capacity).toBe(2);
    expect(parseFloat(response.body.price_per_night)).toBe(1800.00);
    expect(response.body.description).toBe('A room created during E2E testing');      
  });

  // Test Scenario: UPDATE Room
  // Update the room name and verify (200 OK) the response contains the new name.
  it('/rooms/:id (PUT) - Update Room', async () => {
      const updateDto: UpdateRoomDto = { name: 'Updated E2E Room',
      price_per_night: 2200.00,
      capacity: 4, 
    };
      
      const response = await request(app.getHttpServer())
        .patch(`/rooms/${createdRoomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);
      
      expect(response.body.name).toBe('Updated E2E Room');
      expect(parseFloat(response.body.price_per_night)).toBe(2200.00);
      expect(response.body.capacity).toBe(4);
      expect(response.body.id).toBe(createdRoomId);
  });
  
  // Test Scenario: UPDATE Room - Not Found
  // Sending PUT with a non-existent ID should return 404 Not Found.
  it('/rooms/:id (PUT) - Fail Not Found', async () => {
    await request(app.getHttpServer())
      .patch('/rooms/999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Ghost Room' })
      .expect(404);
  });

  // Test Scenario: DELETE Room
  // 1. Delete the room (200 OK).
  it('/rooms/:id (DELETE) - Delete Room', async () => {
    deletedRoomId = createdRoomId;
    createdRoomId = null;
 
    await request(app.getHttpServer())
      .delete(`/rooms/${deletedRoomId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
// Test Scenario: VERIFY Deletion
  // After deletion, a GET on the same ID should return 404 Not Found.
  it('/rooms/:id (GET) - Verify Room Deleted (404)', async () => {
    await request(app.getHttpServer())
      .get(`/rooms/${deletedRoomId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
