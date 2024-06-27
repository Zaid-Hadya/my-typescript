import mongoose from "mongoose";
import express, { Request, Response } from "express";
import cors from "cors";

export const app = express();
app.use(cors());
app.use(express.json());
const port = 4000;

// Connect to MongoDB
export const Connection = mongoose
  .connect("mongodb://localhost:27017/MovieStore")
  .then(() => {
    console.log("Connection has been made...");
  })
  .catch((error) => {
    console.log("Connection error:", error);
  });

// Define the movie schema and model
interface IMovie extends mongoose.Document {
  title: string;
  release_date: string;
  description: string;
  image_url: string;
}

const movieSchema = new mongoose.Schema<IMovie>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    release_date: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

export const MovieModel = mongoose.model<IMovie>("Movies", movieSchema, "movies");

app.post("/createMovie", async (req: Request, res: Response) => {
  try {
    const { title, release_date, description, image_url } = req.body;
    const newMovie = new MovieModel({
      title,
      release_date,
      description,
      image_url,
    });

    await newMovie.save();
    res.status(201).json({ status: "true" });
  } catch (error) {
    res.status(409).json({
      status: "false",
      error: "A movie with this title already exists.",
    });
  }
});

app.get("/getMovies", async (req: Request, res: Response) => {
  const moviesData = await MovieModel.find();
  res.status(200).json(moviesData);
});

app.get("/getMovie/:id", async (req: Request, res: Response) => {
  try {
    const movieId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    const movieData = await MovieModel.findById(new mongoose.Types.ObjectId(movieId));

    if (!movieData) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.status(200).json(movieData);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    const movieId = req.params.id;

    const movie = await MovieModel.findByIdAndDelete(movieId);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/update/:id", async (req: Request, res: Response) => {
  try {
    const movieId = req.params.id;

    const movie = await MovieModel.findByIdAndUpdate(movieId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export a function to start the server
export function startServer(port: number) {
  return app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

if (require.main === module) {
  startServer(port);
}
