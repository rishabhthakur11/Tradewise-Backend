import { Schema, model } from "mongoose";

const tokenSchema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]

});

export default model('Token',tokenSchema,'tokens');