import { app, startServer } from "../src/index";
import request from 'supertest';
import mongoose from 'mongoose';
import { Server } from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MovieModel } from "../src/index";

let server: Server;
let mongod: MongoMemoryServer;

const testData = [{
  "_id": "665462a0dd89506b96ae14b7",
  "title": "movie1",
  "release_date": "2007-10-15",
  "description": "movie1",
  "image_url": "image1"
}, {
  "_id": "665462a0dd89506b96ae14b8",
  "title": "movie2",
  "release_date": "2001-05-11",
  "description": "movie2",
  "image_url": "image2"
}];

describe("Test the Endpoints", () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.disconnect();
    await mongoose.connect(uri);
    server = startServer(4001);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
    server.close();
  });

  afterEach(async () => {
    await MovieModel.deleteMany({})
  });

  test("should return empty array when there is no data", async () => {
    const res = await request(app).get('/getMovies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).toHaveLength(0);
    expect(res.body).toEqual([]);
  });

  test("should return array of movies", async () => {
    await MovieModel.insertMany(testData);
    const res = await request(app).get('/getMovies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).toHaveLength(2);
    expect(res.body).toEqual(testData);
  });

  test("should return movie for given id", async () => {
    await MovieModel.insertMany(testData);
    const res = await request(app).get('/getMovie/665462a0dd89506b96ae14b8');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).toEqual(testData[1]);
  });

  test("should create a new movie and return status true", async () => {
    const res = await request(app).post('/createMovie').send({
      title: "new movie",
      release_date: "2020-02-02",
      description: "This is a new movie",
      image_url: "This is a new movie's URL",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body).toEqual({"status":"true"});
  });

  test("should create a new movie and check movies list", async () => {
    const res = await request(app).post('/createMovie').send({
      title: "new movie",
      release_date: "2020-02-02",
      description: "This is a new movie",
      image_url: "This is a new movie's URL",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body).toEqual({"status":"true"});

    const getRes = await request(app).get('/getMovies');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body).toBeDefined();
    expect(getRes.body).toHaveLength(1);
    expect(getRes.body[0].description).toBe("This is a new movie");
  });



  // Test the Create endpoint with duplicate title.
  test("It should show 409", async () => {
    // First, create the movie
    await request(app).post('/createMovie').send({
      title: "Movie",
      release_date: "2020-02-02",
      description: "This is a movie",
      image_url: "This is a movie's URL",
    });
    // Then, try to create it again
    const res = await request(app).post('/createMovie').send({
      title: "Movie",
      release_date: "2020-02-02",
      description: "This is a movie",
      image_url: "This is a movie's URL",
    });
    expect(res.statusCode).toBe(409);
  });

  // Test Delete in case of invalid id
  test("should delete a movie and check movies list", async () => {
    const res = await request(app).delete('/delete').send({
      
      
    });
    expect(res.statusCode).toBe(404);

    const getRes = await request(app).get('/getMovies');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body).toBeDefined();
    

  });


  test("It should give a 500 response.", async () => {
    const res = await request(app).put('/update').send({
     _id: "665462a0dd89506b96ae14b7",
      title: "Updated Movie"
    });
    expect(res.statusCode).toBe(404);
  });
});
