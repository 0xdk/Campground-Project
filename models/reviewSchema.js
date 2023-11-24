let mongoose = require('mongoose');
let { Schema } = mongoose;

let reviewSchema = new Schema({
  review: {
    type: String,
  },
  rating: {
    type: Number,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Review', reviewSchema);
