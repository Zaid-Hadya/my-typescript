import { app, startServer } from "../src/index"; // Ensure this path is correct based on your project structure
import request from 'supertest';
import mongoose from 'mongoose';
import { Server } from 'http';

let server: Server;

describe("Test the Get Endpoint", () => {
  beforeAll(async () => {
    jest.setTimeout(30000); 
    // Establish connection to the database
    await mongoose.connect("mongodb://localhost:27017/MovieStore", {
    
    });
    // Start the server on a different port for testing
    server = startServer(4001);
  });

  afterAll(async () => {
    // Close the server and the DB connection
    await server.close();
    await mongoose.connection.close();
  });

  test("It should give a 200 response.", async () => {
    const res = await request(app).get('/getMovies').send()
    expect(res.statusCode).toBe(200);
  });

//Test Get in case of invalid id
  test("It should give a 400 response.", async () => {
    const res = await request(app).get('/getMovie/:id').send({
      _id: 4
    });
    expect(res.statusCode).toBe(400);
  });


  // //Test the Create endpoint with correct info.
  // test("It should show 201", async () => {
  //   const res = await request(app).post('/createMovie').send({
  //     title: "Movie",
  //     release_date: "2020-02-02",
  //     description: "This is a movie",
  //     image_url: "This is a movie's URL",
  //   });
  //   expect(res.statusCode).toBe(201);
  // });

    //Test the Create endpoint with duplicate title.
  test("It should show 409", async () => {
    const res = await request(app).post('/createMovie').send({
      title: "Movie",
      release_date: "2020-02-02",
      description: "This is a movie",
      image_url: "This is a movie's URL",
    });
    expect(res.statusCode).toBe(409);
  });

//Test Delete in case of invalid id
test("It should give a 404 response.", async () => {
  const res = await request(app).get('/delete/:id').send({
    _id: 10
  });
  expect(res.statusCode).toBe(404);
});

//Test Update in case of invalid id
test("It should give a 404 response.", async () => {
  const res = await request(app).get('/update/:id').send({
    _id: 10
  });
  expect(res.statusCode).toBe(404);
});

});
