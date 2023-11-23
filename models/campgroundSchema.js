let mongoose = require('mongoose');
let Review = require('./reviewSchema');
let Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

// virtual for thumbnail
ImageSchema.virtual('thumb').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

let campgroundSchema = new Schema(
  {
    title: { type: String },
    price: { type: Number },
    images: [ImageSchema],
    description: { type: String },
    location: { type: String },
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  opts
);

campgroundSchema.virtual('properties.popup').get(function () {
  return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
});

// mongoose middleware
campgroundSchema.post('findOneAndDelete', async (data) => {
  if (data) {
    await Review.deleteMany({ _id: { $in: data.reviews } });
  }
});

module.exports = mongoose.model('Campground', campgroundSchema);
