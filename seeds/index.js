const moongose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');
const campground = require('../models/campground');

moongose.connect('mongodb://localhost:27017/yelp-camp')

const db = moongose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6669b8f009a7065d6a31d07d',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus aperiam ad voluptates quos, quam cupiditate perspiciatis facilis, expedita odio consectetur, at quas placeat. Quidem at, perspiciatis ipsum ab quod perferendis.',
            price: price,
            geometry: {
              type: "Point",
              coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude
                ]
            },
            images : [
                {
                  url: 'https://res.cloudinary.com/dzqxn0oxf/image/upload/v1719239051/YelpCamp/u9iz9yhnevrfvcbenqkj.jpg',
                  filename: 'YelpCamp/u9iz9yhnevrfvcbenqkj',
                },
                {
                  url: 'https://res.cloudinary.com/dzqxn0oxf/image/upload/v1719239047/YelpCamp/wlevy0iujrnci4kwlsqw.jpg',
                  filename: 'YelpCamp/wlevy0iujrnci4kwlsqw',
                }
              ]
        })
        await camp.save();
    }
}

seedDB();