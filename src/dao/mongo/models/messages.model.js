import mongoose from "mongoose";

const messagesCollection = 'messages';

const messageSchema = new mongoose.Schema({
    user: {type: 'string', required: true},
    message: String
  });
    
export const messageModel = mongoose.model(messagesCollection, messageSchema);
