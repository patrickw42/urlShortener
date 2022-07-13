//create schema for url DB in mongoose don't worry about short_url can just use _id of record
const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema({
  full_url: {
    type: String,
    required: true },
  short_url: { type: Number, required: true}
});
//urlSchema will map to the URL collection
module.exports = mongoose.model('URL', urlSchema)
