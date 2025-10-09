import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

if (!uri) throw new Error("Please define MONGODB_URI in .env.local");

const client = new MongoClient(uri, options);
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // @ts-expect-error to avoid global type conflict
  if (!global._mongoClientPromise) {
    // @ts-expect-error to avoid global type conflict
    global._mongoClientPromise = client.connect();
  }
  // @ts-expect-error to avoid global type conflict
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
