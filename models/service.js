import mongoose from 'mongoose';

const serviceVersionSchema = mongoose.Schema({
    detail: String,
    version: String,
    releasedate: Date,
})

const serviceSchema = mongoose.Schema({
    title: String,
    dev: String,
    description: String,
    version: [serviceVersionSchema],
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

var Service = mongoose.model('Service', serviceSchema);
var ServiceVersion = mongoose.model('ServiceVersion', serviceVersionSchema);

export { Service, ServiceVersion };