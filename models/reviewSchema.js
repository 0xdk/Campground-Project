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

// let Review = mongoose.model("Review", reviewSchema);
module.exports = mongoose.model('Review', reviewSchema);
