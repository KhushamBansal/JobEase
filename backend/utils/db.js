import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection string:', process.env.MONGO_URI ? 'Found' : 'Missing');
        
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            bufferCommands: false, 
        });
        
        console.log('MongoDB connected successfully');
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('Host:', mongoose.connection.host);
    } catch (error) {
        console.log('MongoDB connection failed:');
        console.log('Error:', error.message);
        
        if (error.message.includes('buffering timed out')) {
            console.log('This usually means your MongoDB Atlas cluster is paused or starting up.');
            console.log('Please check your MongoDB Atlas dashboard and ensure the cluster is running.');
        }
        
    }
}

export default connectDB;