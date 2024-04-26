import { Schema, model } from "mongoose";

const tokenSchema = new Schema({

    userID: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]

});

export default model('Token', tokenSchema);