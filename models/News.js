import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const newsSchema = new mongoose.Schema({
    title: { 
        type: String,
        required: true 
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
});

newsSchema.plugin(mongoosePaginate);

const News = mongoose.model('News', newsSchema);

export default News;