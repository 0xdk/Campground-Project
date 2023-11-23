let path = require('path');
let mongoose = require('mongoose');
let cities = require('./cities');
let { descriptors, places } = require('./helpers');

const Campground = require('../models/campgroundSchema');
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  console.log('mongoose connection open');
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('database connection');
});
let sample = (array) => array[Math.floor(Math.random() * array.length)];

let seedInsert = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 10; i++) {
    let price = Math.floor(Math.random() * 99) + 29;
    let ran1k = Math.floor(Math.random() * 1000);
    let camp = new Campground({
      location: `${cities[ran1k].city}, ${cities[ran1k].state}`,
      geometry: {
        type: 'Point',
        coordinates: [cities[ran1k].longitude, cities[ran1k].latitude],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Obcaecati ea sunt perferendis ipsa quae non iste est, perspiciatis debitis at itaque quisquam eligendi doloribus dolorem cupiditate qui earum nobis. Autem.',
      price,
      images: [
        {
          url: 'https://res.cloudinary.com/dr29uswhb/image/upload/v1698416641/Camp/ohvlckd3hxp6cbtl5tmm.webp',
          filename: 'Camp/ohvlckd3hxp6cbtl5tmm',
        },
        {
          url: 'https://res.cloudinary.com/dr29uswhb/image/upload/v1698418793/Camp/eipm6nf3votdcoagujep.webp',
          filename: 'Camp/eipm6nf3votdcoagujep',
        },
      ],

      owner: '6534cdf92aec9142bac0374a',
    });

    await camp.save();
  }
};

seedInsert().then(() => {
  mongoose.connection.close();
});
